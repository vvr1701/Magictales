
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ThemeType, Theme } from '../types';
import { THEMES } from '../constants';
import { ChevronLeft, ChevronRight, Sparkles, Tag } from 'lucide-react';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with the "In-Code" stored covers from constants
  const [covers] = useState<Record<ThemeType, string>>({
    [ThemeType.ENCHANTED_FOREST]: THEMES.find(t => t.id === ThemeType.ENCHANTED_FOREST)?.defaultCover || '',
    [ThemeType.MAGIC_CASTLE]: THEMES.find(t => t.id === ThemeType.MAGIC_CASTLE)?.defaultCover || '',
    [ThemeType.SPY_MISSION]: THEMES.find(t => t.id === ThemeType.SPY_MISSION)?.defaultCover || '',
  });

  // CRITICAL: Preserve exact navigation logic
  const handleThemeSelect = (themeId: ThemeType) => {
    const target = user ? "/create" : "/auth";
    navigate(target, { state: { selectedTheme: themeId } });
  };

  // Carousel scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Approximate card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Compressed Hero Section */}
      <section className="relative py-10 bg-gradient-to-br from-softPink via-white to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black text-primary mb-4 uppercase tracking-[0.15em] shadow-sm border border-primary/10">
              ✨ AI-Powered Storybooks
            </span>
            <h1 className="text-4xl md:text-5xl font-heading text-gray-900 leading-tight mb-4">
              Your Child as the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Hero</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Choose an adventure below and watch AI create a personalized storybook with your child as the star.
            </p>
          </div>
        </div>

        {/* Subtle background decorations */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"></div>
      </section>

      {/* Netflix-Style Horizontal Theme Carousel */}
      <section className="py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading text-gray-900">Pick Your Adventure</h2>
              <p className="text-gray-500 text-sm mt-1">3 magical worlds await your hero</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-primary font-semibold text-sm bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                <Sparkles className="w-4 h-4" />
                ₹499 Complete Book
              </span>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Scrollable Cards */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-5 pb-4 px-1"
              style={{ scrollPaddingLeft: '4px', scrollPaddingRight: '4px' }}
            >
              {THEMES.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  coverUrl={covers[theme.id]}
                  onSelect={() => handleThemeSelect(theme.id)}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Features Strip */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎨"
              title="AI Illustrations"
              description="Every page features unique art with your child's likeness"
            />
            <FeatureCard
              icon="📖"
              title="20+ Pages"
              description="A complete story arc with beginning, adventure, and happy ending"
            />
            <FeatureCard
              icon="🔒"
              title="Privacy First"
              description="Photos processed securely and never shared"
            />
          </div>
        </div>
      </section>

      {/* Compact CTA */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-primary to-purple-500 rounded-3xl py-10 px-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-20">
              <Sparkles className="w-32 h-32" />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading mb-3 relative z-10">Ready to Create Magic?</h2>
            <p className="text-white/90 mb-6 relative z-10">Start with a free preview – no payment until you love it.</p>
            <button
              onClick={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-primary px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg relative z-10"
            >
              Choose a Theme Above ↑
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Theme Card Component
interface ThemeCardProps {
  theme: Theme;
  coverUrl: string;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, coverUrl, onSelect }) => {
  return (
    <div
      className="flex-shrink-0 w-72 snap-start cursor-pointer group"
      onClick={onSelect}
    >
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={coverUrl}
            alt={theme.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Age Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
            {theme.ageRange}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          {/* Icon */}
          <div className="absolute bottom-3 left-3 text-3xl drop-shadow-lg group-hover:scale-110 transition-transform">
            {theme.icon}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className="text-lg font-heading text-gray-900 mb-1">{theme.title}</h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{theme.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {theme.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <button
            className="w-full bg-gradient-to-r from-primary to-pink-400 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all group-hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            Create Preview
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="font-heading text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default Home;
