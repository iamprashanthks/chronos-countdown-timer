import React from 'react';
import { CountdownTimer, ThemeId } from '../types';
import { THEMES } from './ThemeStyles';
import { playUiClick } from '../utils/audio';
import { Plus, ListFilter, Maximize2, Minimize2, Palette, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTimer: CountdownTimer;
  timers: CountdownTimer[];
  isFullscreen: boolean;
  onOpenDrawer: () => void;
  onOpenNewTimer: () => void;
  onToggleFullscreen: () => void;
  onChangeTheme: (themeId: ThemeId) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTimer,
  timers,
  isFullscreen,
  onOpenDrawer,
  onOpenNewTimer,
  onToggleFullscreen,
  onChangeTheme,
}) => {
  const currentTheme = THEMES[activeTimer.theme] || THEMES.amber;

  // Next theme cycler
  const handleCycleTheme = () => {
    playUiClick();
    const themesList = Object.keys(THEMES) as ThemeId[];
    const currentIndex = themesList.indexOf(activeTimer.theme);
    const nextIndex = (currentIndex + 1) % themesList.length;
    onChangeTheme(themesList[nextIndex]);
  };

  return (
    <header className="w-full border-b border-white/10 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xl font-bold tracking-tight text-white font-display-title">
            Chronos
          </span>
        </div>

        {/* Zone 2: Clean Text Navigation Links & Filter Buttons */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => { playUiClick(); onOpenDrawer(); }}
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ListFilter className="w-4 h-4 text-neutral-400" />
            <span>All Timers ({timers.length})</span>
          </button>

          <button
            onClick={handleCycleTheme}
            className="hover:text-white transition-colors flex items-center gap-1.5"
            title={`Current theme: ${currentTheme.name}. Click to switch theme.`}
          >
            <Palette className="w-4 h-4 text-neutral-400" />
            <span>Theme: {currentTheme.name}</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Mobile All Timers button */}
          <button
            onClick={() => { playUiClick(); onOpenDrawer(); }}
            className="md:hidden p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
            title="All Timers"
            aria-label="View all timers"
          >
            <ListFilter className="w-5 h-5" />
          </button>

          <button
            onClick={() => { playUiClick(); onToggleFullscreen(); }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-white/5"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          <button
            onClick={() => { playUiClick(); onOpenNewTimer(); }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Countdown</span>
          </button>
        </div>
      </div>
    </header>
  );
};
