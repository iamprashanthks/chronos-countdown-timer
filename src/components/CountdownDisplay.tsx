import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { CountdownTimer, DisplaySize } from '../types';
import { THEMES } from './ThemeStyles';
import { BigNumberCard } from './BigNumberCard';
import { calculateTimeRemaining, formatTargetDisplayDate, getShareUrl } from '../utils/storage';
import { playCompletionChime, playTickSound, playUiClick } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Share2, 
  Edit3, 
  Sparkles, 
  Check, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sliders
} from 'lucide-react';

interface CountdownDisplayProps {
  timer: CountdownTimer;
  displaySize: DisplaySize;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onChangeDisplaySize: (size: DisplaySize) => void;
  onEdit: () => void;
  onNextTimer?: () => void;
  onPrevTimer?: () => void;
  totalTimersCount?: number;
  onUpdateTimer: (updated: CountdownTimer) => void;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  timer,
  displaySize,
  isFullscreen,
  onToggleFullscreen,
  onChangeDisplaySize,
  onEdit,
  onNextTimer,
  onPrevTimer,
  totalTimersCount = 1,
  onUpdateTimer,
}) => {
  const theme = THEMES[timer.theme] || THEMES.amber;
  const [time, setTime] = useState(() => calculateTimeRemaining(timer.targetDate));
  const [copiedShare, setCopiedShare] = useState(false);
  const [audioTickEnabled, setAudioTickEnabled] = useState(false);
  const hasFinishedRef = useRef(false);
  const prevSecondsRef = useRef(time.seconds);

  // Live timer interval loop
  useEffect(() => {
    // Initial compute
    const initial = calculateTimeRemaining(timer.targetDate);
    setTime(initial);
    hasFinishedRef.current = initial.isFinished;

    const intervalRate = timer.showMilliseconds ? 33 : 200; // 30fps for ms, 5hz for normal

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(timer.targetDate);
      setTime(remaining);

      // Play soft tick on second change if user enabled audio tick
      if (audioTickEnabled && remaining.seconds !== prevSecondsRef.current && !remaining.isFinished) {
        playTickSound();
      }
      prevSecondsRef.current = remaining.seconds;

      // Detect moment of completion
      if (remaining.isFinished && !hasFinishedRef.current) {
        hasFinishedRef.current = true;
        if (timer.enableSound) {
          playCompletionChime();
        }
        fireConfetti(0.5, 0.4);
      }
    }, intervalRate);

    return () => clearInterval(interval);
  }, [timer.targetDate, timer.showMilliseconds, timer.enableSound, audioTickEnabled]);

  // Handle Share link copy
  const handleShare = useCallback(() => {
    playUiClick();
    const url = getShareUrl(timer);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    }
  }, [timer]);

  // Trigger celebration manually
  const triggerCelebration = useCallback(() => {
    playUiClick();
    playCompletionChime();
    fireConfetti(0.5, 0.45);
  }, []);

  // Toggle Milliseconds
  const toggleMilliseconds = useCallback(() => {
    playUiClick();
    onUpdateTimer({
      ...timer,
      showMilliseconds: !timer.showMilliseconds,
    });
  }, [timer, onUpdateTimer]);

  // Toggle chime sound
  const toggleSound = useCallback(() => {
    playUiClick();
    onUpdateTimer({
      ...timer,
      enableSound: !timer.enableSound,
    });
  }, [timer, onUpdateTimer]);

  // Calculate real progress percentage and live metrics
  const progressMetrics = useMemo(() => {
    // If no explicit startDate, use createdAt or fall back to 1 hour before target
    const startStr = timer.startDate || timer.createdAt;
    const start = new Date(startStr).getTime();
    const target = new Date(timer.targetDate).getTime();
    const now = Date.now();
    const total = target - start;

    if (total <= 0 || isNaN(total)) {
      return null;
    }

    const elapsed = Math.max(0, now - start);
    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));

    // Format start date label
    const startDateFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(start));

    // Calculate human elapsed & total
    const elapsedDays = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const elapsedHours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
    const elapsedMins = Math.floor((elapsed / (1000 * 60)) % 60);
    const elapsedSecs = Math.floor((elapsed / 1000) % 60);

    let elapsedLabel = '';
    if (elapsedDays > 0) {
      elapsedLabel = `${elapsedDays}d ${elapsedHours}h elapsed`;
    } else if (elapsedHours > 0) {
      elapsedLabel = `${elapsedHours}h ${elapsedMins}m elapsed`;
    } else if (elapsedMins > 0) {
      elapsedLabel = `${elapsedMins}m ${elapsedSecs}s elapsed`;
    } else {
      elapsedLabel = `${elapsedSecs}s elapsed (just started)`;
    }

    const totalDays = (total / (1000 * 60 * 60 * 24)).toFixed(1);

    return {
      percent,
      startDateFormatted,
      elapsedLabel,
      totalDays,
      startMs: start,
      targetMs: target,
      nowMs: now,
    };
  }, [timer.startDate, timer.createdAt, timer.targetDate, time]); // Re-evaluates on each time tick!

  return (
    <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header metadata & title */}
      <div className="w-full text-center mb-8 sm:mb-12">
        {/* Category & Status Bar */}
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border bg-neutral-900/60 backdrop-blur-md mb-4 text-xs font-medium text-neutral-400 border-white/10">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            {timer.category}
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            {formatTargetDisplayDate(timer.targetDate)}
          </span>
          {time.isFinished && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Event Reached
              </span>
            </>
          )}
        </div>

        {/* Big Display Title */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display-title max-w-4xl mx-auto leading-[1.1] transition-all"
        >
          {timer.title}
        </h1>

        {timer.description && (
          <p className="mt-3 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto font-normal">
            {timer.description}
          </p>
        )}
      </div>

      {/* Finished Celebration Banner */}
      {time.isFinished && (
        <div className="w-full max-w-2xl mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            <span>The target time has arrived!</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Time elapsed since event: {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
          </p>
        </div>
      )}

      {/* Main Countdown Display Blocks */}
      <div className="w-full flex items-center justify-center">
        {/* Previous timer button for desktop navigation */}
        {totalTimersCount > 1 && onPrevTimer && (
          <button
            onClick={() => { playUiClick(); onPrevTimer(); }}
            title="Previous Timer"
            className="hidden xl:flex items-center justify-center p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 transition-all mr-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Big Numbers Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <BigNumberCard
            value={time.days}
            label="Days"
            theme={theme}
            size={displaySize}
            padLength={2}
          />

          {/* Separator colon */}
          <div className="hidden sm:flex flex-col gap-3 py-6 self-center text-white/30 font-bold text-3xl md:text-5xl font-mono-num">
            <span>:</span>
          </div>

          <BigNumberCard
            value={time.hours}
            label="Hours"
            theme={theme}
            size={displaySize}
            padLength={2}
          />

          <div className="hidden sm:flex flex-col gap-3 py-6 self-center text-white/30 font-bold text-3xl md:text-5xl font-mono-num">
            <span>:</span>
          </div>

          <BigNumberCard
            value={time.minutes}
            label="Minutes"
            theme={theme}
            size={displaySize}
            padLength={2}
          />

          <div className="hidden sm:flex flex-col gap-3 py-6 self-center text-white/30 font-bold text-3xl md:text-5xl font-mono-num">
            <span>:</span>
          </div>

          <BigNumberCard
            value={time.seconds}
            label="Seconds"
            theme={theme}
            size={displaySize}
            padLength={2}
          />

          {/* Optional Milliseconds display for live precision speed */}
          {timer.showMilliseconds && (
            <>
              <div className="hidden md:flex flex-col gap-3 py-6 self-center text-white/30 font-bold text-2xl md:text-4xl font-mono-num">
                <span>.</span>
              </div>
              <BigNumberCard
                value={time.milliseconds}
                label="Centiseconds"
                theme={theme}
                size={displaySize}
                isSmall={true}
                padLength={2}
              />
            </>
          )}
        </div>

        {/* Next timer button for desktop navigation */}
        {totalTimersCount > 1 && onNextTimer && (
          <button
            onClick={() => { playUiClick(); onNextTimer(); }}
            title="Next Timer"
            className="hidden xl:flex items-center justify-center p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-white/10 transition-all ml-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Real Live Progress Bar with Exact Math & Transparency */}
      {progressMetrics !== null && (
        <div className="w-full max-w-3xl mt-8 sm:mt-10 px-4">
          <div className="flex flex-wrap items-center justify-between text-xs font-mono-num text-neutral-400 mb-2 gap-2">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Started {progressMetrics.startDateFormatted}</span>
              <span className="text-white/20">·</span>
              <span className="text-neutral-400">{progressMetrics.elapsedLabel}</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                {progressMetrics.percent.toFixed(3)}%
              </span>
              <span className="text-neutral-500 text-[11px]">
                ({progressMetrics.totalDays}d total)
              </span>
            </div>
          </div>

          {/* Real Animated Progress Bar Track */}
          <div className="relative w-full h-2 sm:h-2.5 bg-neutral-900/90 rounded-full overflow-hidden border border-white/10 p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${theme.progressBarColor} relative`}
              style={{ width: `${Math.max(0.5, progressMetrics.percent)}%` }}
            >
              {/* Subtle trailing light pulse at current progress position */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[1px]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1.5 px-0.5">
            <span>0% (Start)</span>
            <span className="text-neutral-400">
              {time.isFinished ? 'Completed 100%' : `${progressMetrics.percent.toFixed(1)}% of timeline elapsed`}
            </span>
            <span>100% (Target)</span>
          </div>
        </div>
      )}

      {/* Desktop Toolbar Controls */}
      <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2 bg-neutral-900/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
        {/* Edit Button */}
        <button
          onClick={() => { playUiClick(); onEdit(); }}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="Edit title, date, or theme"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        {/* Milliseconds toggle */}
        <button
          onClick={toggleMilliseconds}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl transition-colors ${
            timer.showMilliseconds
              ? 'bg-white/15 text-white'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
          title="Toggle high-speed centiseconds"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Millis {timer.showMilliseconds ? 'ON' : 'OFF'}</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl transition-colors ${
            timer.enableSound
              ? 'bg-white/15 text-white'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
          title="Toggle completion sound"
        >
          {timer.enableSound ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>Chime</span>
        </button>

        {/* Audio tick toggle */}
        <button
          onClick={() => { playUiClick(); setAudioTickEnabled(prev => !prev); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl transition-colors ${
            audioTickEnabled
              ? 'bg-white/15 text-amber-400'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
          }`}
          title="Toggle sound tick on every second"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Tick {audioTickEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Display Size Switcher */}
        <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/5">
          <button
            onClick={() => { playUiClick(); onChangeDisplaySize('standard'); }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              displaySize === 'standard' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
            }`}
            title="Standard display"
          >
            Medium
          </button>
          <button
            onClick={() => { playUiClick(); onChangeDisplaySize('large'); }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              displaySize === 'large' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
            }`}
            title="Large desktop display"
          >
            Large
          </button>
          <button
            onClick={() => { playUiClick(); onChangeDisplaySize('monumental'); }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              displaySize === 'monumental' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
            }`}
            title="Monumental giant display"
          >
            Huge
          </button>
        </div>

        {/* Share link button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="Copy shareable link"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
        </button>

        {/* Celebrate button */}
        <button
          onClick={triggerCelebration}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-colors"
          title="Launch celebration confetti & chime"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Celebrate</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={() => { playUiClick(); onToggleFullscreen(); }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Keyboard shortcuts helper for desktop users */}
      <div className="mt-4 text-center">
        <p className="text-[11px] font-mono-num text-neutral-400 tracking-wide">
          Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">F</kbd> for Fullscreen · <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">N</kbd> New Timer · <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">E</kbd> Edit
        </p>
      </div>
    </div>
  );
};
