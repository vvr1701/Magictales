
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LogPanel, LogToggleButton } from './components/LogPanel';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import CreateStory from './pages/CreateStory';
import PreviewStory from './pages/PreviewStory';
import GenerationFeed from './pages/GenerationFeed';
import About from './pages/About';
import { User } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

// Dynamic basename: /apps/zelavo for Shopify production, / for local dev
const basename = import.meta.env.PROD ? '/apps/zelavo' : '/';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured() || !supabase) {
          setLoading(false);
          return;
        }

        // 1. Check current session on mount
        // Use type assertion to bypass environment-specific SupabaseAuthClient type issues
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0]
          });
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      // Use type assertion to bypass environment-specific SupabaseAuthClient type issues for onAuthStateChange
      const { data } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0]
          });
        } else {
          setUser(null);
        }
      });
      subscription = data.subscription;
    }

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      // Use type assertion to bypass environment-specific SupabaseAuthClient type issues for signOut
      await (supabase.auth as any).signOut();
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-softPink">
        <div className="flex flex-col items-center">
          <div className="animate-bounce text-primary text-5xl font-heading mb-4">MagicTales</div>
          <div className="text-gray-500 font-medium animate-pulse">Consulting the storybook elves...</div>
        </div>
      </div>
    );
  }

  // TESTING: Mock user to bypass auth
  const testUser = { id: 'test-user-123', email: 'test@test.com', name: 'Test User' };
  const effectiveUser = user || testUser; // Use test user if not logged in

  return (
    <BrowserRouter basename={basename}>
      <div className="flex flex-col min-h-screen">
        <Navbar user={effectiveUser} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={effectiveUser} />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={!user ? <Auth onLogin={(u) => setUser(u)} /> : <Navigate to="/" />} />
            {/* TESTING: Removed auth guards for testing */}
            <Route path="/dashboard" element={<Dashboard user={effectiveUser} />} />
            <Route path="/create" element={<CreateStory user={effectiveUser} />} />
            <Route path="/generating/:jobId" element={<GenerationFeed />} />
            <Route path="/preview/:id" element={<PreviewStory />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
