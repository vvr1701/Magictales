
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ThemeType } from '../types';
import { THEMES } from '../constants';
import { ArrowRight, Star, Wand2, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();

  // Initialize with the "In-Code" stored covers from constants
  // Fix: Removed broken custom cover loading logic that relied on non-existent storage methods
  const [covers] = useState<Record<ThemeType, string>>({
    [ThemeType.ADVENTURE]: THEMES.find(t => t.id === ThemeType.ADVENTURE)?.defaultCover || '',
    [ThemeType.SPACE]: THEMES.find(t => t.id === ThemeType.SPACE)?.defaultCover || '',
    [ThemeType.UNDERWATER]: THEMES.find(t => t.id === ThemeType.UNDERWATER)?.defaultCover || '',
    [ThemeType.FAIRY_TALE]: THEMES.find(t => t.id === ThemeType.FAIRY_TALE)?.defaultCover || '',
    [ThemeType.DINOSAUR]: THEMES.find(t => t.id === ThemeType.DINOSAUR)?.defaultCover || '',
  });

  const handleThemeSelect = (themeId: ThemeType) => {
    const target = user ? "/create" : "/auth";
    navigate(target, { state: { selectedTheme: themeId } });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-softPink overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block bg-white px-4 py-1 rounded-full text-xs font-black text-primary mb-6 uppercase tracking-[0.2em] shadow-sm">
              The Adventure Begins Here
            </span>
            <h1 className="text-5xl md:text-7xl font-heading text-gray-900 leading-tight mb-8">
              Create a Magical <span className="text-primary">Storybook</span> Starring Your Child
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              Choose a magical world below and watch our AI turn your child into the hero of their very own professional illustration-filled book.
            </p>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]"></div>
      </section>

      {/* Theme Selection Grid */}
      <section id="themes" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-heading text-gray-900">Step 1: Pick an Adventure</h2>
            <p className="text-gray-500 mt-2">Which world will your little hero explore today?</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-primary font-bold bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Sparkles className="w-5 h-5" />
            <span>₹499 All-Inclusive</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className="group relative cursor-pointer overflow-hidden rounded-[3rem] bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-4 border-white"
            >
              <div className="aspect-[4/5] relative bg-gray-50">
                <img
                  src={covers[theme.id]}
                  alt={theme.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute top-6 left-6">
                  <span className="text-5xl filter drop-shadow-md group-hover:rotate-12 transition-transform duration-500 block">
                    {theme.icon}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-3xl font-heading mb-2">{theme.title}</h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-6 line-clamp-2">
                    {theme.description}
                  </p>
                  <div className="flex items-center space-x-2 font-black text-xs tracking-widest uppercase bg-white/20 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/30 group-hover:bg-primary group-hover:border-primary transition-colors">
                    <span>Start Quest</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="hidden lg:flex flex-col items-center justify-center p-12 rounded-[3rem] border-4 border-dashed border-gray-100 bg-gray-50/50 text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-3xl">✨</div>
            <h3 className="text-2xl font-heading text-gray-400">More Worlds Coming Soon</h3>
            <p className="text-gray-400 text-sm">Our wizards are busy dreaming up new galaxies and enchanted realms.</p>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-6">
              <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg rotate-3 bg-white p-3">
                <img src="https://images.unsplash.com/photo-1512413316925-fd4793431999?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-[1.5rem]" alt="Sample 1" />
              </div>
              <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg -rotate-3 bg-white p-3 mt-12">
                <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-[1.5rem]" alt="Sample 2" />
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-heading text-gray-900 mb-8 leading-tight">Advanced AI for Personalization</h2>
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm text-primary">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading text-xl mb-1">Unique Narratives</h4>
                  <p className="text-gray-600">Every story is written from scratch. No two adventures are ever the same.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm text-secondary">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="font-heading text-xl mb-1">Character Likeness</h4>
                  <p className="text-gray-600">Upload photos and our AI integrates your child's features into every beautiful illustration.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm text-green-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading text-xl mb-1">Private & Safe</h4>
                  <p className="text-gray-600">We respect your privacy. Photos are processed securely and only for your custom book.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center bg-primary rounded-[3rem] py-16 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-32 h-32" />
          </div>
          <h2 className="text-4xl md:text-5xl font-heading mb-6 relative z-10">Start the Magic Today</h2>
          <p className="text-xl mb-10 opacity-90 relative z-10">Every childhood deserves a story where they are the hero.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-100 transition shadow-lg inline-block relative z-10"
          >
            Pick Your Theme Above
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
