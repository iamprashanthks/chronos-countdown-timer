/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CountdownTimer, DisplaySize, ThemeId } from './types';
import { 
  loadTimers, 
  saveTimers, 
  loadActiveTimerId, 
  saveActiveTimerId,
  parseTimerFromUrl 
} from './utils/storage';
import { THEMES } from './components/ThemeStyles';
import { TopNav } from './components/TopNav';
import { CountdownDisplay } from './components/CountdownDisplay';
import { TimerFormModal } from './components/TimerFormModal';
import { TimerListDrawer } from './components/TimerListDrawer';
import { playUiClick, playCompletionChime } from './utils/audio';
import { fireConfetti } from './utils/confetti';
import { Minimize2, Sparkles, Check } from 'lucide-react';

export default function App() {
  const [timers, setTimers] = useState<CountdownTimer[]>(() => loadTimers());
  const [activeTimerId, setActiveTimerId] = useState<string>(() => loadActiveTimerId(timers));
  const [displaySize, setDisplaySize] = useState<DisplaySize>('large');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingTimer, setEditingTimer] = useState<CountdownTimer | null>(null);
  const [urlImportToast, setUrlImportToast] = useState<string | null>(null);

  // Active Timer Object
  const activeTimer = useMemo(() => {
    return timers.find((t) => t.id === activeTimerId) || timers[0] || null;
  }, [timers, activeTimerId]);

  // Persist timers when modified
  useEffect(() => {
    saveTimers(timers);
  }, [timers]);

  // Persist active timer id
  useEffect(() => {
    if (activeTimerId) {
      saveActiveTimerId(activeTimerId);
    }
  }, [activeTimerId]);

  // Handle URL parameters on initial mount
  useEffect(() => {
    const urlTimer = parseTimerFromUrl();
    if (urlTimer && urlTimer.title && urlTimer.targetDate) {
      const newTimer: CountdownTimer = {
        id: `timer-shared-${Date.now()}`,
        title: urlTimer.title,
        targetDate: urlTimer.targetDate,
        startDate: new Date().toISOString(),
        theme: urlTimer.theme || 'amber',
        category: 'Event',
        showMilliseconds: true,
        enableSound: true,
        createdAt: new Date().toISOString(),
      };

      setTimers((prev) => {
        // Check if identical already exists
        const exists = prev.find((t) => t.title === newTimer.title && t.targetDate === newTimer.targetDate);
        if (exists) {
          setActiveTimerId(exists.id);
          return prev;
        }
        return [newTimer, ...prev];
      });
      setActiveTimerId(newTimer.id);
      setUrlImportToast(`Loaded shared countdown: "${urlTimer.title}"`);
      setTimeout(() => setUrlImportToast(null), 4000);
    }
  }, []);

  // Listen to fullscreen changes from browser (e.g. Esc key pressed)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle native browser fullscreen
  const toggleFullscreen = useCallback(() => {
    playUiClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fallback for environments with strict iframe fullscreen policies
        setIsFullscreen((prev) => !prev);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  // Keyboard shortcuts handler for desktop power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTimer(null);
        setIsModalOpen(true);
      } else if (e.key === 'e' || e.key === 'E') {
        if (activeTimer) {
          e.preventDefault();
          setEditingTimer(activeTimer);
          setIsModalOpen(true);
        }
      } else if (e.key === 'ArrowRight') {
        handleNextTimer();
      } else if (e.key === 'ArrowLeft') {
        handlePrevTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, activeTimer, timers]);

  // Next / Previous Timer Cycling
  const handleNextTimer = useCallback(() => {
    if (timers.length <= 1) return;
    const currentIndex = timers.findIndex((t) => t.id === activeTimerId);
    const nextIndex = (currentIndex + 1) % timers.length;
    setActiveTimerId(timers[nextIndex].id);
  }, [timers, activeTimerId]);

  const handlePrevTimer = useCallback(() => {
    if (timers.length <= 1) return;
    const currentIndex = timers.findIndex((t) => t.id === activeTimerId);
    const prevIndex = (currentIndex - 1 + timers.length) % timers.length;
    setActiveTimerId(timers[prevIndex].id);
  }, [timers, activeTimerId]);

  // Create or Update Timer
  const handleSaveTimer = useCallback((
    timerData: Omit<CountdownTimer, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTimers((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...timerData } : t))
      );
      setActiveTimerId(existingId);
    } else {
      const newTimer: CountdownTimer = {
        ...timerData,
        id: `timer-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTimers((prev) => [newTimer, ...prev]);
      setActiveTimerId(newTimer.id);
    }
  }, []);

  // Update in-place properties (e.g. toggle milliseconds or chime)
  const handleUpdateTimer = useCallback((updated: CountdownTimer) => {
    setTimers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  // Delete Timer
  const handleDeleteTimer = useCallback((id: string) => {
    setTimers((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      saveTimers(remaining);
      if (activeTimerId === id) {
        const nextId = remaining.length > 0 ? remaining[0].id : '';
        setActiveTimerId(nextId);
        saveActiveTimerId(nextId);
      }
      return remaining;
    });
  }, [activeTimerId]);

  // Duplicate Timer
  const handleDuplicateTimer = useCallback((timer: CountdownTimer) => {
    const duplicated: CountdownTimer = {
      ...timer,
      id: `timer-${Date.now()}`,
      title: `${timer.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setTimers((prev) => [duplicated, ...prev]);
    setActiveTimerId(duplicated.id);
  }, []);

  // Toggle Pin
  const handleTogglePin = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  }, []);

  // Quick switch theme of active timer
  const handleChangeTheme = useCallback((themeId: ThemeId) => {
    if (!activeTimer) return;
    handleUpdateTimer({
      ...activeTimer,
      theme: themeId,
    });
  }, [activeTimer, handleUpdateTimer]);

  const activeTheme = activeTimer ? THEMES[activeTimer.theme] || THEMES.amber : THEMES.amber;

  return (
    <div 
      className={`min-h-screen text-neutral-100 flex flex-col relative transition-colors duration-700 selection:bg-white/20 ${activeTheme.bgClass}`}
      style={{
        backgroundImage: activeTheme.ambientGlow,
      }}
    >
      {/* Background subtle noise/grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" 
        aria-hidden="true" 
      />

      {/* Top Bar (Hidden in Fullscreen for clean display wall mode) */}
      {!isFullscreen && activeTimer && (
        <TopNav
          activeTimer={activeTimer}
          timers={timers}
          isFullscreen={isFullscreen}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenNewTimer={() => {
            setEditingTimer(null);
            setIsModalOpen(true);
          }}
          onToggleFullscreen={toggleFullscreen}
          onChangeTheme={handleChangeTheme}
        />
      )}

      {/* Shared URL import feedback toast */}
      {urlImportToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-white/20 text-neutral-100 text-xs sm:text-sm font-medium shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{urlImportToast}</span>
        </div>
      )}

      {/* Floating Exit Fullscreen Button when in Fullscreen */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs backdrop-blur-md transition-all shadow-xl"
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
        {activeTimer ? (
          <CountdownDisplay
            timer={activeTimer}
            displaySize={displaySize}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onChangeDisplaySize={setDisplaySize}
            onEdit={() => {
              setEditingTimer(activeTimer);
              setIsModalOpen(true);
            }}
            onNextTimer={timers.length > 1 ? handleNextTimer : undefined}
            onPrevTimer={timers.length > 1 ? handlePrevTimer : undefined}
            totalTimersCount={timers.length}
            onUpdateTimer={handleUpdateTimer}
          />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold font-display-title">No Timers Available</h2>
            <p className="text-neutral-400 text-sm mt-2">Create your first countdown to get started.</p>
            <button
              onClick={() => {
                setEditingTimer(null);
                setIsModalOpen(true);
              }}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors"
            >
              + Create Countdown
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Timer Modal */}
      <TimerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTimer}
        initialTimer={editingTimer}
      />

      {/* Timers List Drawer */}
      <TimerListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        timers={timers}
        activeTimerId={activeTimerId}
        onSelectTimer={setActiveTimerId}
        onNewTimer={() => {
          setIsDrawerOpen(false);
          setEditingTimer(null);
          setIsModalOpen(true);
        }}
        onDeleteTimer={handleDeleteTimer}
        onDuplicateTimer={handleDuplicateTimer}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}
