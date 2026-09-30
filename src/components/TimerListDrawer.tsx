import React, { useState } from 'react';
import { CountdownTimer } from '../types';
import { calculateTimeRemaining, formatTargetDisplayDate } from '../utils/storage';
import { THEMES } from './ThemeStyles';
import { playUiClick } from '../utils/audio';
import { X, Plus, Trash2, Copy, Check, Clock, Calendar, Star, Sparkles } from 'lucide-react';

interface TimerListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  timers: CountdownTimer[];
  activeTimerId: string;
  onSelectTimer: (id: string) => void;
  onNewTimer: () => void;
  onDeleteTimer: (id: string) => void;
  onDuplicateTimer: (timer: CountdownTimer) => void;
  onTogglePin: (id: string) => void;
}

export const TimerListDrawer: React.FC<TimerListDrawerProps> = ({
  isOpen,
  onClose,
  timers,
  activeTimerId,
  onSelectTimer,
  onNewTimer,
  onDeleteTimer,
  onDuplicateTimer,
  onTogglePin,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = ['all', 'Milestone', 'Work', 'Holiday', 'Personal', 'Launch', 'Event', 'Reminder'];

  const filteredTimers = timers.filter((t) => {
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-xl h-full bg-neutral-900 border-l border-white/10 p-6 flex flex-col shadow-2xl text-neutral-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-display-title text-white">
              All Countdowns
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {timers.length} saved {timers.length === 1 ? 'countdown' : 'countdowns'} in local storage
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { playUiClick(); onNewTimer(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={() => { playUiClick(); onClose(); }}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter categories & search */}
        <div className="pt-4 pb-2 space-y-3">
          <input
            type="text"
            placeholder="Search countdowns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 bg-neutral-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { playUiClick(); setFilterCategory(cat); }}
                className={`px-3 py-1 text-xs rounded-lg capitalize whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-white text-neutral-950 font-semibold'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timers list */}
        <div className="flex-1 overflow-y-auto pt-2 space-y-3 pr-1">
          {filteredTimers.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-sm">
              No countdowns match your filter.
            </div>
          ) : (
            filteredTimers.map((timer) => {
              const theme = THEMES[timer.theme] || THEMES.amber;
              const remaining = calculateTimeRemaining(timer.targetDate);
              const isActive = timer.id === activeTimerId;

              return (
                <div
                  key={timer.id}
                  onClick={() => { playUiClick(); onSelectTimer(timer.id); onClose(); }}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                    isActive
                      ? `${theme.cardBg} ${theme.cardBorder} ring-1 ring-white/30`
                      : 'bg-neutral-950/60 border-white/5 hover:border-white/20 hover:bg-neutral-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-mono-num font-semibold px-2 py-0.5 rounded border ${theme.badge}`}>
                          {timer.category}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Active On Screen
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                        {timer.title}
                      </h3>

                      {timer.description && (
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {timer.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400 font-mono-num">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTargetDisplayDate(timer.targetDate)}</span>
                      </div>
                    </div>

                    {/* Live quick countdown indicator */}
                    <div className="text-right">
                      {remaining.isFinished ? (
                        <div className="text-xs text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-950/30 border border-emerald-500/20">
                          Reached
                        </div>
                      ) : (
                        <div className="text-sm font-bold font-mono-num text-white">
                          <span className={theme.digitColor}>{remaining.days}d</span> {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions bar on hover */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playUiClick();
                        onTogglePin(timer.id);
                      }}
                      className={`flex items-center gap-1 ${
                        timer.isPinned ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                      title={timer.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{timer.isPinned ? 'Pinned' : 'Pin'}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playUiClick();
                          onDuplicateTimer(timer);
                        }}
                        className="text-neutral-400 hover:text-white flex items-center gap-1"
                        title="Duplicate timer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playUiClick();
                          onDeleteTimer(timer.id);
                        }}
                        className="text-neutral-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title={`Delete ${timer.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
