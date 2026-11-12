import React from 'react';
import { FloraStatus } from '../types';
import { KeyRound, Sparkles } from 'lucide-react';

interface TopNavProps {
  status: FloraStatus | null;
  onOpenDocs: () => void;
  onSelectTab: (tab: 'studio' | 'gallery' | 'models') => void;
  activeTab: 'studio' | 'gallery' | 'models';
}

export const TopNav: React.FC<TopNavProps> = ({
  status,
  onOpenDocs,
  onSelectTab,
  activeTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element brand wordmark */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/60 transition-colors">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="font-display">Lanexa Ai Studio</span>
        </a>

        {/* Zone 2: 4-5 clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onSelectTab('studio')}
            className={`transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
              activeTab === 'studio' ? 'text-emerald-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Studio Generator
          </button>
          <button
            onClick={() => onSelectTab('gallery')}
            className={`transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
              activeTab === 'gallery' ? 'text-emerald-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Galeri & Hasil
          </button>
          <button
            onClick={() => onSelectTab('models')}
            className={`transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
              activeTab === 'models' ? 'text-emerald-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Koleksi Model
          </button>
          <button
            onClick={onOpenDocs}
            className="text-neutral-400 hover:text-neutral-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Panduan API Key
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Pengaturan & Status API Key Lanexa Ai Studio"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {status?.configured ? 'Lanexa Ai Studio Terhubung' : 'Setup API Key'}
            </span>
            <span className={`w-2 h-2 rounded-full ${status?.configured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
