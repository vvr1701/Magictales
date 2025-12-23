-- MagicTales Database Schema for Supabase (Full Functionality)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Create books table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    child_age INTEGER NOT NULL,
    child_gender TEXT NOT NULL,
    theme TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create book_pages table (for page preview/edit)
CREATE TABLE IF NOT EXISTS public.book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    image_prompt TEXT,
    image_url TEXT,
    UNIQUE(book_id, page_number)
);

-- 3. Create profiles table (optional - for user settings)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    child_name TEXT,
    child_age INTEGER,
    child_gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for books
CREATE POLICY "Users can view own books" ON public.books
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own books" ON public.books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON public.books
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON public.books
    FOR DELETE USING (auth.uid() = user_id);

-- 6. RLS Policies for book_pages
CREATE POLICY "Users can view pages of own books" ON public.book_pages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid())
    );

CREATE POLICY "Users can insert pages to own books" ON public.book_pages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid())
    );

CREATE POLICY "Users can update pages of own books" ON public.book_pages
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid())
    );

CREATE POLICY "Users can delete pages of own books" ON public.book_pages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid())
    );

-- 7. RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Done! 🎉
