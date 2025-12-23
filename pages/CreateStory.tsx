
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ThemeType, ChildDetails, Storybook, StoryPage, Profile } from '../types';
import { THEMES } from '../constants';
import { Upload, Trash2, ChevronRight, ChevronLeft, Wand2, Sparkles, User as UserIcon, Loader2, ArrowLeft, Key, Zap } from 'lucide-react';
import { generateStoryContent, generateIllustration } from '../services/geminiService';
import * as storage from '../services/storageService';

const WHIMSICAL_MESSAGES = [
  "Consulting the Star Atlas...",
  "Painting with Rainbow Brushes...",
  "Stitching Dreams together...",
  "Whispering to the Magic Ink...",
  "Gathering Moonbeams..."
];

interface CreateStoryProps { user: User; }

const CreateStory: React.FC<CreateStoryProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(WHIMSICAL_MESSAGES[0]);
  const [hasSavedHero, setHasSavedHero] = useState(false);
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [childDetails, setChildDetails] = useState<ChildDetails>({
    name: '', age: 5, gender: 'Adventurer', interests: '', elements: '', dedication: ''
  });
  
  const [theme, setTheme] = useState<ThemeType | null>(location.state?.selectedTheme || null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await storage.getUserProfile(user.id);
        if (profile && profile.child_name) {
          setChildDetails(prev => ({
            ...prev,
            name: profile.child_name || '',
            age: profile.child_age || 5,
            gender: profile.child_gender || 'Adventurer'
          }));
          setHasSavedHero(true);
        }
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setFetchingProfile(false);
      }
    };
    loadProfile();
  }, [user.id]);

  useEffect(() => { if (!theme) navigate('/'); }, [theme]);
  
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(WHIMSICAL_MESSAGES[Math.floor(Math.random() * WHIMSICAL_MESSAGES.length)]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const generateBook = async () => {
    if (!theme) return;

    setLoading(true);
    setProgress(5);

    try {
      const base64Photos = await Promise.all(photos.map(fileToBase64));
      const newBookId = crypto.randomUUID();
      
      const storyPages = await generateStoryContent(childDetails, theme);
      setProgress(20);

      const finalizedPages: StoryPage[] = [];
      
      for (const page of storyPages) {
        setActivePage(page.pageNumber);
        
        // Brief pause for Free Tier API stability
        if (finalizedPages.length > 0) {
          await new Promise(r => setTimeout(r, 2000));
        }

        const base64Image = await generateIllustration(page.imagePrompt, childDetails, theme, base64Photos);
        const publicUrl = await storage.uploadBookImage(newBookId, page.pageNumber, base64Image);
        
        finalizedPages.push({ ...page, imageUrl: publicUrl });
        const pageProgress = 20 + Math.floor((finalizedPages.length / storyPages.length) * 75);
        setProgress(pageProgress);
      }

      const newBook: Storybook = {
        id: newBookId,
        userId: user.id,
        childName: childDetails.name,
        childAge: childDetails.age,
        childGender: childDetails.gender,
        theme: theme,
        pages: finalizedPages,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      await storage.saveBook(newBook);
      setProgress(100);
      setTimeout(() => navigate(`/preview/${newBookId}`), 800);
    } catch (error: any) {
      alert(error.message || "The magic hit a snag. Please try again!");
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-softPink p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md w-full border-4 border-white">
        <div className="relative mb-8">
           <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto" />
           <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="text-accent w-8 h-8 animate-pulse" />
           </div>
        </div>
        <h2 className="text-3xl font-heading mb-2">Creating Page {activePage || 1} of 10</h2>
        <p className="text-gray-500 font-medium italic mb-8 h-6">{loadingMessage}</p>
        
        <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden shadow-inner p-1">
          <div className="bg-primary h-full rounded-full transition-all duration-500 shadow-sm" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="mt-4 text-primary font-black text-sm uppercase tracking-widest">{progress}% Complete</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-500 hover:text-primary transition font-bold group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Change Theme</span>
        </button>
        <div className="flex space-x-2">
          {[1, 2].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full ${step === i ? 'bg-primary w-10' : 'bg-gray-200'} transition-all duration-500`}></div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-8 border-white animate-in zoom-in-95 duration-500">
        {step === 1 ? (
          <div className="p-10 md:p-16 space-y-10">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-heading text-slate-900 mb-4">Meet the Hero</h2>
              <p className="text-gray-500 font-medium">Tell us who will be starring in this adventure.</p>
              
              {hasSavedHero && !fetchingProfile && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-xs font-bold animate-in fade-in slide-in-from-top-2 border border-primary/10 shadow-sm">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Magic Memory: Pre-filled with your saved hero!</span>
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Child's Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Oliver" 
                    value={childDetails.name}
                    onChange={e => setChildDetails({...childDetails, name: e.target.value})}
                    className="w-full p-5 border-2 border-gray-50 rounded-2xl bg-gray-50 text-xl font-heading text-gray-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Age</label>
                    <div className="relative">
                      <select 
                        value={childDetails.age}
                        onChange={e => setChildDetails({...childDetails, age: parseInt(e.target.value)})}
                        className="w-full p-5 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold text-gray-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                      >
                        {[2,3,4,5,6,7,8,9,10].map(a => <option key={a} value={a}>{a} Years Old</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronRight className="w-5 h-5 rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Gender</label>
                    <div className="relative">
                      <select 
                        value={childDetails.gender}
                        onChange={e => setChildDetails({...childDetails, gender: e.target.value})}
                        className="w-full p-5 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold text-gray-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="Boy">Boy</option>
                        <option value="Girl">Girl</option>
                        <option value="Adventurer">Adventurer</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronRight className="w-5 h-5 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Hero's Photos (1-3 required)</label>
                <div className="grid grid-cols-3 gap-3">
                   {photos.map((p, i) => (
                     <div key={i} className="bg-gray-100 rounded-2xl aspect-square overflow-hidden relative group border-2 border-white shadow-md transition-all hover:scale-[1.02]">
                       <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" />
                       <button 
                         onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                         className="absolute top-1.5 right-1.5 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-50"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                   {photos.length < 3 && (
                     <label className="border-4 border-dashed border-gray-100 rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all text-gray-300 hover:text-primary group">
                       <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                       </div>
                       <span className="text-[10px] font-black uppercase mt-3 tracking-widest">Add Photo</span>
                       <input type="file" accept="image/*" hidden onChange={e => e.target.files && setPhotos([...photos, e.target.files[0]])} />
                     </label>
                   )}
                </div>
                <p className="text-[10px] text-gray-400 font-bold italic leading-relaxed text-center px-4">Our AI works best with clear, front-facing photos with good lighting.</p>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)} 
              disabled={!childDetails.name || photos.length < 1} 
              className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center space-x-4 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none mt-4"
            >
              <span>Continue Adventure</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="p-10 md:p-16 space-y-10">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-heading text-slate-900 mb-4">Sprinkle the Magic</h2>
              <p className="text-gray-500 font-medium">Add some details to make the story truly unique.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">What does {childDetails.name} love? (Optional)</label>
                <textarea 
                  placeholder="E.g. space ships, dinosaurs, playing soccer, or their favorite teddy bear named Rufus..." 
                  value={childDetails.interests}
                  onChange={e => setChildDetails({...childDetails, interests: e.target.value})}
                  className="w-full p-6 border-2 border-gray-50 rounded-[2rem] bg-gray-50 h-36 text-lg text-gray-900 font-medium focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none placeholder:text-gray-300 leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">A Special Dedication (Optional)</label>
                <input 
                  type="text" 
                  placeholder="E.g. To our brave little explorer..." 
                  value={childDetails.dedication}
                  onChange={e => setChildDetails({...childDetails, dedication: e.target.value})}
                  className="w-full p-6 border-2 border-gray-50 rounded-2xl bg-gray-50 font-bold text-gray-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-4">
              <button 
                onClick={() => setStep(1)} 
                className="flex-1 bg-gray-50 text-gray-400 py-6 rounded-[2rem] font-black text-xl hover:bg-gray-100 transition-all flex items-center justify-center space-x-4 border-2 border-transparent hover:border-gray-200"
              >
                <ChevronLeft className="w-6 h-6" />
                <span>Go Back</span>
              </button>
              <button 
                onClick={generateBook} 
                className="flex-[2] bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center space-x-4"
              >
                <Sparkles className="w-6 h-6" />
                <span>Begin the Magic</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStory;
