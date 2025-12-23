
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Star className="text-primary w-6 h-6 fill-current" />
              <span className="text-2xl font-heading text-gray-800">MagicTales</span>
            </Link>
            <p className="text-gray-500 mb-6">Empowering children's imagination through AI-powered personalized storytelling.</p>
            <div className="flex space-x-4">
              <Instagram className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer" />
              <Facebook className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="font-heading text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link to="/" className="hover:text-primary transition">Technology</Link></li>
              <li><Link to="/" className="hover:text-primary transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6">Product</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><Link to="/create" className="hover:text-primary transition">Create Story</Link></li>
              <li><Link to="/" className="hover:text-primary transition">Themes</Link></li>
              <li><Link to="/" className="hover:text-primary transition">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg mb-6">Legal</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><Link to="/" className="hover:text-primary transition">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-primary transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© 2024 MagicTales. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-current" />
            <span>for little dreamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
