import React, { useEffect, useState } from 'react';
import { Logo } from './Logo.tsx';
import { QuotaBadge } from './QuotaDisplay.tsx';
import { Image, Video, History, BarChart3, Home, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'photo' | 'video' | 'history' | 'status';
  onSelectTab: (tab: 'home' | 'photo' | 'video' | 'history' | 'status') => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, historyCount }) => {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/video-pipeline-info')
      .then((res) => {
        if (res.ok) setApiOnline(true);
        else setApiOnline(false);
      })
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <>
      {/* Top Header for Desktop & Tablet */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 cursor-pointer" onClick={() => onSelectTab('home')}>
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onSelectTab('home')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => onSelectTab('photo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'photo'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Photo Enhancer</span>
            </button>

            <button
              onClick={() => onSelectTab('video')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'video'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Enhancer</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === 'history'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat</span>
              {historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-sky-500 text-white rounded-full font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('status')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'status'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistik</span>
            </button>
          </nav>

          {/* Quick Action & Health Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <QuotaBadge compact />

            <button
              onClick={() => onSelectTab('status')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200/80 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              title="Periksa kesehatan 3 API AI & Statistik"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOnline === null
                    ? 'bg-amber-400 animate-ping'
                    : apiOnline
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-600">3 AI Engine</span>
            </button>

            <button
              onClick={() => onSelectTab('photo')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold text-sm shadow-sm shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tingkatkan Sekarang</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Wink App inspired) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'home' ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        <button
          onClick={() => onSelectTab('photo')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'photo' ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <Image className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Photo</span>
        </button>

        <button
          onClick={() => onSelectTab('video')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'video' ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <Video className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Video</span>
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
            activeTab === 'history' ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Riwayat</span>
          {historyCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 flex items-center justify-center text-[9px] bg-sky-500 text-white rounded-full font-bold">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('status')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeTab === 'status' ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Statistik</span>
        </button>
      </nav>
    </>
  );
};
