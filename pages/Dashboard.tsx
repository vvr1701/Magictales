
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Storybook } from '../types';
import { Plus, Book, Trash2, Download, Eye, Clock, Star, Loader2 } from 'lucide-react';
import * as storage from '../services/storageService';
import { generateStorybookPDF, downloadBlob } from '../services/pdfService';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Storybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const userBooks = await storage.getBooksByUser(user.id);
        setBooks(userBooks);
        
        // Task 1: Redirect to Home if no books exist
        if (!loading && userBooks.length === 0) {
          navigate('/');
        }
      } catch (error) {
        console.error("Failed to load books:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [user.id, navigate]);

  // Second check once loading is actually done
  useEffect(() => {
    if (!loading && books.length === 0) {
      navigate('/');
    }
  }, [loading, books, navigate]);

  const handleDeleteBook = async (id: string) => {
    if (confirm('Are you sure you want to delete this storybook?')) {
      try {
        await storage.deleteBook(id);
        const updatedBooks = books.filter(b => b.id !== id);
        setBooks(updatedBooks);
        if (updatedBooks.length === 0) {
          navigate('/');
        }
      } catch (error) {
        alert("Failed to delete book.");
      }
    }
  };

  const handleDownload = async (book: Storybook) => {
    if (book.paymentStatus !== 'paid') return;
    setDownloadingId(book.id);
    try {
      const pdfBlob = await generateStorybookPDF(book, false);
      downloadBlob(pdfBlob, `${book.childName}_${book.theme}_Adventure.pdf`);
    } catch (e) {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="p-20 text-center font-heading text-primary animate-pulse">Gathering your stories...</div>;
  }

  // Fallback UI while redirect happens
  if (books.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-4xl font-heading text-gray-900">Welcome, {user.name}!</h1>
          <p className="text-gray-500">Your collection of magical stories awaits.</p>
        </div>
        <Link to="/" className="mt-4 md:mt-0 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-opacity-90 transition shadow-lg flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create New Storybook</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] bg-gray-100 relative">
              <img src={book.pages[0]?.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'} alt={book.childName} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  book.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {book.paymentStatus}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-heading text-gray-900">{book.childName}'s {book.theme}</h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Link 
                  to={`/preview/${book.id}`}
                  className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-100 transition font-bold"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </Link>
                {book.paymentStatus === 'paid' ? (
                  <button 
                    onClick={() => handleDownload(book)}
                    disabled={downloadingId === book.id}
                    className="flex items-center justify-center space-x-2 bg-secondary text-white px-4 py-3 rounded-xl hover:bg-opacity-90 transition font-bold disabled:opacity-50"
                  >
                    {downloadingId === book.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>Download</span>
                  </button>
                ) : (
                  <Link to={`/preview/${book.id}`} className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-3 rounded-xl hover:bg-opacity-90 transition font-bold">
                    <Star className="w-4 h-4" />
                    <span>Buy Now</span>
                  </Link>
                )}
              </div>
              
              <button 
                onClick={() => handleDeleteBook(book.id)}
                className="mt-4 w-full flex items-center justify-center space-x-2 text-gray-400 hover:text-red-500 transition text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Storybook</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
