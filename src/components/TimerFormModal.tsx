import React, { useState, useEffect } from 'react';
import { CountdownTimer, ThemeId } from '../types';
import { THEMES } from './ThemeStyles';
import { playUiClick } from '../utils/audio';
import { CalendarPicker } from './CalendarPicker';
import { X, Sparkles, Check } from 'lucide-react';

interface TimerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timerData: Omit<CountdownTimer, 'id' | 'createdAt'>, existingId?: string) => void;
  initialTimer?: CountdownTimer | null;
}

export const TimerFormModal: React.FC<TimerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTimer,
}) => {
  const isEditing = Boolean(initialTimer);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [theme, setTheme] = useState<ThemeId>('amber');
  const [category, setCategory] = useState<CountdownTimer['category']>('Milestone');
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const [useCustomStart, setUseCustomStart] = useState(false);
  const [startDateStr, setStartDateStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialTimer) {
        setTitle(initialTimer.title);
        setDescription(initialTimer.description || '');
        setTheme(initialTimer.theme);
        setCategory(initialTimer.category);
        setShowMilliseconds(initialTimer.showMilliseconds);
        setEnableSound(initialTimer.enableSound);

        if (initialTimer.startDate) {
          const s = new Date(initialTimer.startDate);
          if (!isNaN(s.getTime())) {
            const y = s.getFullYear();
            const m = String(s.getMonth() + 1).padStart(2, '0');
            const d = String(s.getDate()).padStart(2, '0');
            setStartDateStr(`${y}-${m}-${d}`);
            setUseCustomStart(true);
          }
        } else {
          setUseCustomStart(false);
          setStartDateStr('');
        }

        const target = new Date(initialTimer.targetDate);
        if (!isNaN(target.getTime())) {
          // Format YYYY-MM-DD
          const year = target.getFullYear();
          const month = String(target.getMonth() + 1).padStart(2, '0');
          const day = String(target.getDate()).padStart(2, '0');
          setDateStr(`${year}-${month}-${day}`);

          // Format HH:MM
          const hours = String(target.getHours()).padStart(2, '0');
          const minutes = String(target.getMinutes()).padStart(2, '0');
          setTimeStr(`${hours}:${minutes}`);
        }
      } else {
        // Defaults for new timer: 7 days in future at 09:00 AM
        setTitle('');
        setDescription('');
        setTheme('amber');
        setCategory('Launch');
        setShowMilliseconds(true);
        setEnableSound(true);
        setUseCustomStart(false);
        setStartDateStr('');

        const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const year = future.getFullYear();
        const month = String(future.getMonth() + 1).padStart(2, '0');
        const day = String(future.getDate()).padStart(2, '0');
        setDateStr(`${year}-${month}-${day}`);
        setTimeStr('09:00');
      }
    }
  }, [isOpen, initialTimer]);

  if (!isOpen) return null;

  // Preset offset application
  const applyPreset = (daysOffset: number, hours = 9, minutes = 0) => {
    playUiClick();
    const d = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDateStr(`${year}-${month}-${day}`);
    setTimeStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  };

  const applyPresetHours = (hoursOffset: number) => {
    playUiClick();
    const d = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDateStr(`${year}-${month}-${day}`);
    setTimeStr(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  };

  const applyPresetNewYear = () => {
    playUiClick();
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    setDateStr(`${nextYear}-01-01`);
    setTimeStr('00:00');
    setTitle(`New Year ${nextYear}`);
    setCategory('Holiday');
    setTheme('cyan');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your countdown.');
      return;
    }
    if (!dateStr) {
      setError('Please select a target date.');
      return;
    }

    // Parse date & time string
    const targetIso = `${dateStr}T${timeStr || '00:00'}:00`;
    const targetTimestamp = new Date(targetIso).getTime();

    if (isNaN(targetTimestamp)) {
      setError('Invalid date format. Please check the entered date and time.');
      return;
    }

    let computedStartDate = initialTimer?.startDate || new Date().toISOString();
    if (useCustomStart && startDateStr) {
      const s = new Date(`${startDateStr}T00:00:00`);
      if (!isNaN(s.getTime())) {
        computedStartDate = s.toISOString();
      }
    }

    playUiClick();
    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: new Date(targetIso).toISOString(),
        startDate: computedStartDate,
        theme,
        category,
        showMilliseconds,
        enableSound,
      },
      initialTimer?.id
    );
    onClose();
  };

  const quickTitles = [
    'Product Launch',
    'New Year 2027',
    'Tech Keynote',
    'Vacation Departure',
    'Project Deadline',
    'Birthday Celebration',
  ];

  const categories: CountdownTimer['category'][] = ['Milestone', 'Work', 'Holiday', 'Personal', 'Launch', 'Event', 'Reminder'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-neutral-100 my-8 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display-title text-white">
              {isEditing ? 'Edit Countdown Timer' : 'Create New Countdown'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Set the event title, pick date and time on the calendar, and select your visual theme.
            </p>
          </div>
          <button
            onClick={() => { playUiClick(); onClose(); }}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Event Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next-Gen Product Launch"
              className="w-full px-4 py-3 bg-neutral-950/80 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-base transition-colors"
              autoFocus
            />

            {/* Quick Title Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-xs text-neutral-400 mr-1">Suggestions:</span>
              {quickTitles.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => { playUiClick(); setTitle(t); }}
                  className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/5 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Visual Calendar & Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Select Date & Time <span className="text-amber-400">*</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                Interactive Calendar & Clock
              </span>
            </div>

            <CalendarPicker
              dateStr={dateStr}
              timeStr={timeStr}
              onDateChange={setDateStr}
              onTimeChange={setTimeStr}
              themeId={theme}
            />
          </div>

          {/* Quick Date Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Quick Presets
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => applyPresetHours(1)}
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-white/10 transition-colors"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1, 9, 0)}
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-white/10 transition-colors"
              >
                Tomorrow 9:00 AM
              </button>
              <button
                type="button"
                onClick={() => applyPreset(3, 17, 0)}
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-white/10 transition-colors"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7, 9, 0)}
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-white/10 transition-colors"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30, 9, 0)}
                className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-white/10 transition-colors"
              >
                +30 Days
              </button>
              <button
                type="button"
                onClick={applyPresetNewYear}
                className="px-3 py-1.5 text-xs bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 rounded-lg border border-cyan-500/30 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                New Year 2027
              </button>
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Note / Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Stage livestream demo on YouTube & Twitch"
              className="w-full px-4 py-2.5 bg-neutral-950/80 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => { playUiClick(); setCategory(cat); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    category === cat
                      ? 'bg-white text-neutral-950 border-white font-semibold'
                      : 'bg-neutral-800/80 text-neutral-400 border-white/5 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Visual Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                const conf = THEMES[themeKey];
                const isSelected = theme === themeKey;
                return (
                  <button
                    type="button"
                    key={themeKey}
                    onClick={() => { playUiClick(); setTheme(themeKey); }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${conf.cardBg} ${conf.cardBorder} ring-2 ring-white/20`
                        : 'bg-neutral-950/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-semibold ${conf.digitColor}`}>
                        {conf.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        High Contrast
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar Baseline (Start Date) */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Progress Bar Baseline
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-amber-400">
                <input
                  type="checkbox"
                  checked={useCustomStart}
                  onChange={(e) => {
                    setUseCustomStart(e.target.checked);
                    if (e.target.checked && !startDateStr) {
                      const d = new Date();
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setStartDateStr(`${y}-${m}-${day}`);
                    }
                  }}
                  className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-white/20"
                />
                <span>Set custom project start date</span>
              </label>
            </div>

            {useCustomStart ? (
              <div className="bg-neutral-950/60 border border-white/10 rounded-xl p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-[11px] text-neutral-400 block mb-1">
                      Event or project began on:
                    </span>
                    <input
                      type="date"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono-num focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        setStartDateStr(`${y}-${m}-01`);
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/5 transition-colors"
                    >
                      1st of this month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const y = new Date().getFullYear();
                        setStartDateStr(`${y}-01-01`);
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/5 transition-colors"
                    >
                      Jan 1st
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                  The progress bar calculates: (Now − Start Date) ÷ (Target Date − Start Date) × 100%.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400">
                Progress begins at timer creation time (0%) and advances live until your target date (100%).
              </p>
            )}
          </div>

          {/* Preferences Switches */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMilliseconds}
                onChange={(e) => setShowMilliseconds(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-white/20"
              />
              <span className="text-neutral-300 text-xs">Show Centiseconds / Millis for live thrill</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableSound}
                onChange={(e) => setEnableSound(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-white/20"
              />
              <span className="text-neutral-300 text-xs">Play chime sound when reaching 0</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => { playUiClick(); onClose(); }}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              {isEditing ? 'Update Countdown' : 'Start Countdown'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
