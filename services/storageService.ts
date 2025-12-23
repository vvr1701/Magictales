
import { Storybook, ThemeType, StoryPage, Profile } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const DB_NAME = 'MagicTalesDB';
const STORE_BOOKS = 'books';
const STORE_PAGES = 'book_pages';
const DB_VERSION = 3;

let dbPromise: Promise<IDBDatabase> | null = null;

const openLocalDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => { dbPromise = null; reject('IndexedDB error'); };
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_PAGES)) db.createObjectStore(STORE_PAGES, { keyPath: 'id' });
    };
  });
  return dbPromise;
};

/**
 * Fetches the user profile including saved child details
 */
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
};

/**
 * Updates the user profile (Saved Hero)
 */
export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) return;
  await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
};

/**
 * Uploads the final PDF to Supabase Storage
 */
export const uploadBookPDF = async (bookId: string, pdfBlob: Blob): Promise<string> => {
  if (!isSupabaseConfigured() || !supabase) throw new Error("Supabase not configured");

  const fileName = `${bookId}/final_storybook.pdf`;

  const { data, error } = await supabase.storage
    .from('app_storage')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('app_storage')
    .getPublicUrl(fileName);

  return publicUrl;
};

/**
 * Uploads a base64 image to Supabase Storage and returns the public URL
 * This allows users to preview and edit individual pages
 */
export const uploadBookImage = async (bookId: string, pageNumber: number, base64Data: string): Promise<string> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.log(`📸 [Storage] Supabase not configured, keeping image as base64`);
    return base64Data;
  }

  try {
    console.log(`📸 [Storage] Uploading page ${pageNumber} image to Supabase...`);

    const base64Content = base64Data.split(',')[1] || base64Data;
    const buffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    const fileName = `${bookId}/page_${pageNumber}.png`;

    const { data, error } = await supabase.storage
      .from('app_storage')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error(`❌ [Storage] Upload failed:`, error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('app_storage')
      .getPublicUrl(fileName);

    console.log(`✅ [Storage] Page ${pageNumber} uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error("❌ [Storage] Upload failed, falling back to base64:", err);
    return base64Data;
  }
};

export const saveBook = async (book: Storybook, pdfUrl?: string): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    console.log(`📚 [Storage] Saving book: ${book.id}`);

    // 1. Save Book Metadata
    const { error: bookError } = await supabase
      .from('books')
      .upsert({
        id: book.id,
        user_id: book.userId,
        child_name: book.childName,
        child_age: book.childAge,
        child_gender: book.childGender,
        theme: book.theme,
        payment_status: book.paymentStatus,
        pdf_url: pdfUrl || null,
        created_at: book.createdAt
      });

    if (bookError) {
      console.error(`❌ [Storage] Book save failed:`, bookError);
      throw new Error(`Book save failed: ${bookError.message}`);
    }
    console.log(`✅ [Storage] Book metadata saved`);

    // 2. Save Pages (for preview/edit functionality)
    if (book.pages && book.pages.length > 0) {
      console.log(`📚 [Storage] Saving ${book.pages.length} pages...`);

      const pagesToInsert = book.pages.map(p => ({
        book_id: book.id,
        page_number: p.pageNumber,
        text: p.text,
        image_prompt: p.imagePrompt,
        image_url: p.imageUrl
      }));

      const { error: pagesError } = await supabase
        .from('book_pages')
        .upsert(pagesToInsert, { onConflict: 'book_id,page_number' });

      if (pagesError) {
        console.warn('⚠️ [Storage] Pages save failed:', pagesError.message);
      } else {
        console.log(`✅ [Storage] ${book.pages.length} pages saved`);
      }
    }

    // 3. Auto-update user's "Last Hero" in profile
    try {
      await updateUserProfile(book.userId, {
        child_name: book.childName,
        child_age: book.childAge,
        child_gender: book.childGender
      });
    } catch (e) {
      console.warn('Profile update skipped:', e);
    }

  } else {
    // Fallback to local IndexedDB
    console.log(`📚 [Storage] Saving to local IndexedDB: ${book.id}`);
    const db = await openLocalDB();
    const tx = db.transaction([STORE_BOOKS, STORE_PAGES], 'readwrite');
    tx.objectStore(STORE_BOOKS).put({ ...book, pages: undefined });
    book.pages.forEach(p => tx.objectStore(STORE_PAGES).put({ ...p, bookId: book.id }));
  }
};

export const getBooksByUser = async (userId: string): Promise<Storybook[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        childName: row.child_name,
        childAge: row.child_age,
        childGender: row.child_gender,
        theme: row.theme as ThemeType,
        paymentStatus: row.payment_status,
        createdAt: row.created_at,
        pdfUrl: row.pdf_url,
        pages: (row.book_pages || []).sort((a: any, b: any) => a.page_number - b.page_number).map((p: any) => ({
          pageNumber: p.page_number,
          text: p.text,
          imagePrompt: p.image_prompt,
          imageUrl: p.image_url
        }))
      }));
    }
  }
  return [];
};

export const getBookById = async (id: string): Promise<Storybook | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('books')
      .select('*, book_pages(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        userId: data.user_id,
        childName: data.child_name,
        childAge: data.child_age,
        childGender: data.child_gender,
        theme: data.theme as ThemeType,
        paymentStatus: data.payment_status,
        createdAt: data.created_at,
        pdfUrl: data.pdf_url,
        pages: (data.book_pages || []).sort((a: any, b: any) => a.page_number - b.page_number).map((p: any) => ({
          pageNumber: p.page_number,
          text: p.text,
          imagePrompt: p.image_prompt,
          imageUrl: p.image_url
        }))
      };
    }
  }
  return null;
};

export const deleteBook = async (id: string): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    // Delete all files from storage (images + PDF)
    try {
      const { data: files } = await supabase.storage.from('app_storage').list(id);
      if (files && files.length > 0) {
        await supabase.storage.from('app_storage').remove(files.map(f => `${id}/${f.name}`));
        console.log(`🗑️ [Storage] Deleted ${files.length} files for book ${id}`);
      }
    } catch (e) {
      console.warn("Storage cleanup failed:", e);
    }

    // Delete book record (pages will cascade delete)
    await supabase.from('books').delete().eq('id', id);
    console.log(`🗑️ [Storage] Deleted book record ${id}`);
  }
};
