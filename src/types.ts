export type ThemeId = 'amber' | 'cyan' | 'emerald' | 'sunset' | 'monochrome' | 'obsidian';

export type DisplaySize = 'standard' | 'large' | 'monumental';

export interface CountdownTimer {
  id: string;
  title: string;
  targetDate: string; // ISO 8601 string: YYYY-MM-DDTHH:mm[:ss]
  startDate?: string; // Optional start time for progress tracking
  description?: string;
  theme: ThemeId;
  category: 'Milestone' | 'Work' | 'Holiday' | 'Personal' | 'Launch' | 'Event';
  showMilliseconds: boolean;
  enableSound: boolean;
  isPinned?: boolean;
  createdAt: string;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalMs: number;
  isFinished: boolean;
  elapsedMs: number; // For past timers
}
