
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Star, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured() || !supabase) {
      setError("Supabase is not configured. Please check your environment variables.");
      setLoading(false);
      return;
    }

    try {
      // Use type assertion to bypass environment-specific SupabaseAuthClient type issues
      const auth = (supabase as any).auth;
      
      if (isLogin) {
        const { data, error: authError } = await auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0]
          });
        }
      } else {
        const { data, error: authError } = await auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name }
          }
        });
        if (authError) throw authError;
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: formData.name
          });
          
          alert("Sign up successful! Please check your email for verification if required.");
          onLogin({
            id: data.user.id,
            email: data.user.email!,
            name: formData.name
          });
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-softPink p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white">
        <div className="bg-primary p-10 text-center">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="text-white w-10 h-10 fill-current" />
          </div>
          <h2 className="text-3xl font-heading text-white">
            {isLogin ? 'Welcome Back!' : 'Join the Magic'}
          </h2>
          <p className="text-white/80 mt-2 font-medium">Create stories that inspire imagination.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-opacity-90 transition transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 mt-4"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{isLogin ? 'Login to Library' : 'Create Magic Account'}</span>
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline transition-all"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
