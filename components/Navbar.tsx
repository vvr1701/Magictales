
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { BookOpen, LogOut, LayoutDashboard, Star, Home } from 'lucide-react';

interface NavbarProps { user: User | null; onLogout: () => void; }

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Star className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-heading text-gray-800 tracking-tight">MagicTales</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary transition font-medium">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary transition font-medium">About</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={() => { onLogout(); navigate('/'); }}
                  className="text-gray-500 hover:text-red-500 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="bg-secondary text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition shadow-sm">
                Login / Sign Up
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Link to={user ? "/dashboard" : "/auth"} className="text-primary font-bold">Menu</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
