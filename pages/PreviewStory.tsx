
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Storybook } from '../types';
import { STORYBOOK_PRICE, THEMES } from '../constants';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  CreditCard,
  CheckCircle,
  Wand2,
  Download,
  Loader2,
  FileText,
  BookOpen,
  LayoutGrid,
  Star,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { editIllustration } from '../services/geminiService';
import * as storage from '../services/storageService';
import { generateStorybookPDF, downloadBlob } from '../services/pdfService';
import { savePayment } from '../services/paymentService';

declare const Razorpay: any;

const PreviewStory: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookTopRef = useRef<HTMLDivElement>(null);

  const [book, setBook] = useState<Storybook | null>(null);
  const [integrityError, setIntegrityError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'reader' | 'gallery'>('reader');

  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      try {
        const found = await storage.getBookById(id);
        if (found) {
          // Relaxed check: As long as there are pages, we show the book
          const hasPages = found.pages && found.pages.length > 0;
          if (!hasPages) {
            setIntegrityError(true);
          }
          setBook(found);
        }
      } catch (error) {
        console.error("Failed to load book:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBook();
  }, [id]);

  const handlePageJump = (index: number) => {
    setCurrentPage(index);
    setViewMode('reader');
    setTimeout(() => {
      bookTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDownloadPDF = async () => {
    if (!book || integrityError) return;
    setIsGeneratingPDF(true);
    try {
      const isPaid = book.paymentStatus === 'paid';
      const pdfBlob = await generateStorybookPDF(book, !isPaid);
      const filename = `${book.childName}_${book.theme}_Adventure${!isPaid ? '_Preview' : ''}.pdf`;
      downloadBlob(pdfBlob, filename);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePayment = async () => {
    if (!book || integrityError) return;
    setIsPaymentLoading(true);

    const razorpayKey = 'rzp_test_RuefhfTR9sy1mj';

    const options = {
      key: razorpayKey,
      amount: Math.round(STORYBOOK_PRICE * 100),
      currency: "INR",
      name: "MagicTales AI",
      description: `Premium Storybook: ${book.childName}'s ${book.theme} Adventure`,
      image: "https://img.icons8.com/color/96/000000/star--v1.png",
      handler: async (response: any) => {
        if (response.razorpay_payment_id) {
          try {
            console.log('💳 [Payment] Success! Payment ID:', response.razorpay_payment_id);

            // 1. Save payment details to database
            await savePayment({
              bookId: book.id,
              userId: book.userId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: Math.round(STORYBOOK_PRICE * 100),
              currency: 'INR'
            });
            console.log('✅ [Payment] Payment details saved to database');

            // 2. Update book status to paid
            const updatedBook: Storybook = { ...book, paymentStatus: 'paid' };

            // 3. Generate high-resolution PDF (no watermark)
            console.log('📄 [Payment] Generating high-res PDF...');
            const finalPdfBlob = await generateStorybookPDF(updatedBook, false);

            // 4. Upload PDF and save book
            const pdfUrl = await storage.uploadBookPDF(book.id, finalPdfBlob);
            updatedBook.pdfUrl = pdfUrl;
            await storage.saveBook(updatedBook, pdfUrl);
            console.log('✅ [Payment] Book updated with PDF URL:', pdfUrl);

            // 5. Update UI
            setBook(updatedBook);
            setIsPaymentLoading(false);
            alert(`🎉 Magic Unlocked! Your high-resolution storybook is ready for download.`);
          } catch (error) {
            console.error("❌ [Payment] Post-payment processing failed:", error);
            setIsPaymentLoading(false);
            alert("Payment successful! Your book is being finalized. Please check your dashboard in a moment.");
          }
        }
      },
      prefill: {
        name: book.childName,
        email: "parent@example.com",
      },
      theme: { color: "#FF6B9D" },
      modal: { ondismiss: () => setIsPaymentLoading(false) }
    };

    try {
      const rzp1 = new Razorpay(options);
      rzp1.open();
    } catch (e) {
      setIsPaymentLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!book || !editPrompt || isProcessingEdit || integrityError) return;

    setIsProcessingEdit(true);
    try {
      const currentPageData = book.pages[currentPage];
      if (currentPageData.imageUrl) {
        const newUrl = await editIllustration(currentPageData.imageUrl, editPrompt);
        const updatedPages = [...book.pages];
        updatedPages[currentPage] = { ...currentPageData, imageUrl: newUrl };
        const updatedBook = { ...book, pages: updatedPages };

        await storage.saveBook(updatedBook);
        setBook(updatedBook);
        setEditPrompt("");
      }
    } catch (e) {
      console.error(e);
      alert("The magic ink blurred. Please try a simpler request!");
    } finally {
      setIsProcessingEdit(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="font-heading text-2xl text-slate-800 animate-pulse">Opening the Secret Library...</p>
      </div>
    </div>
  );

  if (!book || integrityError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-lg text-center border border-red-50">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-heading text-slate-900 mb-4">A Magical Ripple!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            This storybook was affected by a magical glitch during generation and is incomplete. Don't worry, you haven't been charged!
          </p>
          <div className="space-y-4">
            <Link to="/create" className="block w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 transition-all">
              Re-cast the Spell
            </Link>
            <Link to="/dashboard" className="block w-full text-gray-400 font-bold py-2 hover:text-gray-600">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen py-12 px-4 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="max-w-7xl mx-auto" ref={bookTopRef}>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center space-x-2 text-primary mb-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-xs font-black uppercase tracking-widest">Masterpiece Created</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading text-slate-900 leading-tight">
              {book.childName}'s <span className="text-primary">{book.theme}</span> Adventure
            </h1>
            <p className="text-gray-500 font-medium mt-1">Personalized for a {book.childAge} year old hero.</p>
          </div>

          <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => setViewMode('reader')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all ${viewMode === 'reader' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-primary'}`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Reader</span>
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all ${viewMode === 'gallery' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-primary'}`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>Gallery</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          <div className="lg:w-2/3">
            {viewMode === 'reader' ? (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-white relative group">
                  <div className="aspect-square relative bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={book.pages[currentPage]?.imageUrl || ''}
                      alt={`Page ${currentPage + 1}`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />

                    {book.paymentStatus === 'pending' && (
                      <>
                        <div className="absolute inset-0 watermark-overlay z-10 opacity-60"></div>
                        <div className="watermark-text select-none">PREVIEW ONLY</div>
                      </>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white z-20">
                      <p className="text-2xl md:text-3xl font-heading leading-relaxed text-center drop-shadow-xl px-4">
                        {book.pages[currentPage]?.text}
                      </p>
                    </div>

                    <div className="absolute inset-y-0 left-0 flex items-center p-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-primary transition-all disabled:opacity-0 shadow-lg"
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center p-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        disabled={currentPage === book.pages.length - 1}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-primary transition-all disabled:opacity-0 shadow-lg"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-10 py-8 bg-white border-t border-gray-50">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="p-4 rounded-full bg-gray-50 text-gray-400 hover:bg-primary hover:text-white disabled:opacity-20 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center">
                      <div className="flex space-x-2.5 mb-3">
                        {book.pages.map((_, i) => (
                          <button
                            key={i}
                            className={`h-2.5 rounded-full transition-all duration-500 ${i === currentPage ? 'w-10 bg-primary shadow-sm' : 'w-2.5 bg-gray-200 hover:bg-primary/20'}`}
                            onClick={() => setCurrentPage(i)}
                          ></button>
                        ))}
                      </div>
                      <div className="text-gray-400 font-black text-xs tracking-[0.2em] uppercase">
                        Exploring Page {currentPage + 1}
                      </div>
                    </div>

                    <button
                      disabled={currentPage === book.pages.length - 1}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="p-4 rounded-full bg-gray-50 text-gray-400 hover:bg-primary hover:text-white disabled:opacity-20 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {book.paymentStatus === 'pending' && (
                  <div className="mt-10 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                      <Sparkles className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                          <Wand2 className="text-primary w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-heading text-2xl text-slate-800">Magical Brush</h3>
                          <p className="text-gray-500 font-medium">Ask our AI artist to adjust this illustration!</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input
                          type="text"
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="E.g. Add a rainbow in the sky..."
                          className="flex-grow px-7 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none text-lg font-medium shadow-inner transition-all placeholder:text-gray-400"
                        />
                        <button
                          onClick={handleEditImage}
                          disabled={isProcessingEdit || !editPrompt}
                          className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-primary/30 hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center space-x-3 active:scale-95 shadow-lg shadow-primary/10"
                        >
                          {isProcessingEdit ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                          <span>Recast</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-500 pb-12">
                {book.pages.map((page, i) => (
                  <div
                    key={i}
                    onClick={() => handlePageJump(i)}
                    className={`group relative aspect-square rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border-8 ${currentPage === i ? 'border-primary ring-8 ring-primary/10 scale-[1.03]' : 'border-white hover:border-primary/50'
                      }`}
                  >
                    <img
                      src={page.imageUrl}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={`Page ${i + 1}`}
                    />
                    <div className="absolute top-5 left-5 z-20">
                      <span className={`px-4 py-2 rounded-2xl text-xs font-black tracking-widest uppercase shadow-lg ${currentPage === i ? 'bg-primary text-white' : 'bg-black/60 text-white backdrop-blur-sm'
                        }`}>
                        Page {i + 1}
                      </span>
                    </div>
                    {book.paymentStatus === 'pending' && (
                      <div className="absolute inset-0 watermark-overlay opacity-40"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-[3rem] shadow-xl p-10 sticky top-24 border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="mb-10">
                <div className="bg-gray-50/80 p-8 rounded-[2.5rem] border border-gray-100 mb-8 group shadow-inner">
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">The Adventure</p>
                  <div className="flex items-center space-x-5">
                    <div className="text-5xl group-hover:rotate-12 transition-transform duration-500 drop-shadow-sm">
                      {THEMES.find(t => t.id === book.theme)?.icon || '📚'}
                    </div>
                    <div>
                      <h4 className="font-heading text-2xl text-slate-800 leading-tight">{book.childName}'s {book.theme}</h4>
                      <p className="text-primary text-[10px] font-black uppercase mt-2 tracking-[0.15em]">Personalized Edition</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 px-4">
                  <div className="flex items-center space-x-4 text-sm font-bold text-gray-600">
                    <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                    <span>10 High-Def Illustrations</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm font-bold text-gray-600">
                    <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                    <span>Unique AI Storyline</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm font-bold text-gray-600">
                    <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                    <span>Instant Digital Access</span>
                  </div>
                </div>
              </div>

              {book.paymentStatus === 'pending' ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-7 border-t border-b border-gray-100 mb-2">
                    <span className="font-heading text-xl text-gray-400">Total Price</span>
                    <span className="font-heading text-4xl text-primary">₹{STORYBOOK_PRICE}</span>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={isPaymentLoading}
                    className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-95"
                  >
                    {isPaymentLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                    <span>Unlock Full Book</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF || isPaymentLoading}
                    className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2 border-2 border-transparent hover:border-gray-200"
                  >
                    {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    <span>Preview PDF</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-green-50 text-green-700 p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-3 mb-4 border border-green-100 shadow-inner">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="font-heading text-2xl text-green-800">Payment Successful!</h4>
                    <p className="text-green-600 text-sm">Your high-resolution storybook is ready</p>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-6 rounded-[2rem] font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 active:scale-95"
                  >
                    {isGeneratingPDF ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                    <span>Download Your Book</span>
                  </button>
                  <p className="text-center text-gray-400 text-sm">
                    High-resolution PDF • No watermarks • Print-ready quality
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStory;
