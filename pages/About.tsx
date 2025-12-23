
import React from 'react';
import { Star, Wand2, Shield, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="py-20 bg-softPink">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-heading mb-6">Our Mission</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            MagicTales was founded on a simple belief: every child deserves to see themselves as the hero of a magnificent story. We use cutting-edge AI to bridge the gap between imagination and reality.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <img src="https://picsum.photos/seed/magic/600/600" alt="Magic" className="rounded-[3rem] shadow-xl" />
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-heading text-gray-900 leading-tight">Why Personalized Storytelling Matters</h2>
            <p className="text-gray-600 leading-relaxed">
              Research shows that personalization in children's literature increases engagement, boosts reading comprehension, and strengthens a child's sense of self-worth. When a child sees their own name and likeness in a book, reading becomes an immersive adventure rather than a chore.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <Heart className="text-primary w-8 h-8 mb-3" />
                <h4 className="font-heading mb-1">Boosts Confidence</h4>
                <p className="text-xs text-gray-500">Seeing themselves succeed as heroes.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <Wand2 className="text-secondary w-8 h-8 mb-3" />
                <h4 className="font-heading mb-1">Ignites Creativity</h4>
                <p className="text-xs text-gray-500">Exploring infinite worlds of magic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-heading mb-12">The Technology Behind the Magic</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="text-accent w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading">Large Language Models</h3>
              <p className="text-gray-400 text-sm">We use Gemini 3 to craft rich, coherent, and unique narratives for every single child.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wand2 className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading">Generative Image AI</h3>
              <p className="text-gray-400 text-sm">Gemini 2.5 Flash Image transforms prompts and photos into professional-grade illustrations.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="text-secondary w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading">Privacy First</h3>
              <p className="text-gray-400 text-sm">Your child's photos are never shared. We use them only to generate your specific storybook.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
