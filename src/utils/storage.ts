import { CountdownTimer, TimeRemaining } from '../types';

const STORAGE_KEY = 'chronos_countdown_timers_v1';
const ACTIVE_TIMER_KEY = 'chronos_active_timer_id';

export function calculateTimeRemaining(targetDateIso: string): TimeRemaining {
  const target = new Date(targetDateIso).getTime();
  const now = Date.now();
  const difference = target - now;

  if (difference <= 0) {
    const elapsedMs = Math.abs(difference);
    const seconds = Math.floor((elapsedMs / 1000) % 60);
    const minutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
    const hours = Math.floor((elapsedMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const milliseconds = Math.floor((elapsedMs % 1000) / 10);

    return {
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      totalMs: difference,
      isFinished: true,
      elapsedMs,
    };
  }

  const seconds = Math.floor((difference / 1000) % 60);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const milliseconds = Math.floor((difference % 1000) / 10);

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    totalMs: difference,
    isFinished: false,
    elapsedMs: 0,
  };
}

export function getDefaultTimers(): CountdownTimer[] {
  const now = new Date();
  
  // 14 days in the future
  const launchDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  launchDate.setHours(9, 0, 0, 0);

  // New Year 2027
  const newYearDate = new Date(2027, 0, 1, 0, 0, 0, 0);

  // 4 days in the future (Next Keynote)
  const keynoteDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  keynoteDate.setHours(10, 0, 0, 0);

  return [
    {
      id: 'timer-launch',
      title: 'Project Genesis: Public Launch',
      description: 'Global release of the next-generation desktop platform',
      targetDate: launchDate.toISOString(),
      startDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      theme: 'amber',
      category: 'Launch',
      showMilliseconds: true,
      enableSound: true,
      isPinned: true,
      createdAt: now.toISOString(),
    },
    {
      id: 'timer-newyear',
      title: 'New Year 2027 Celebration',
      description: 'Midnight countdown to the brand new year',
      targetDate: newYearDate.toISOString(),
      startDate: new Date(2026, 0, 1).toISOString(),
      theme: 'cyan',
      category: 'Holiday',
      showMilliseconds: false,
      enableSound: true,
      isPinned: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'timer-keynote',
      title: 'Product Keynote & Architecture Demo',
      description: 'Live engineering livestream presentation',
      targetDate: keynoteDate.toISOString(),
      startDate: now.toISOString(),
      theme: 'emerald',
      category: 'Work',
      showMilliseconds: false,
      enableSound: true,
      isPinned: false,
      createdAt: now.toISOString(),
    },
  ];
}

export function loadTimers(): CountdownTimer[] {
  if (typeof window === 'undefined') return getDefaultTimers();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultTimers();
      saveTimers(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getDefaultTimers();
  } catch {
    return getDefaultTimers();
  }
}

export function saveTimers(timers: CountdownTimer[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch (err) {
    console.error('Failed to save timers', err);
  }
}

export function loadActiveTimerId(timers: CountdownTimer[]): string {
  if (typeof window === 'undefined') return timers[0]?.id || '';
  const stored = localStorage.getItem(ACTIVE_TIMER_KEY);
  if (stored && timers.some(t => t.id === stored)) {
    return stored;
  }
  return timers[0]?.id || '';
}

export function saveActiveTimerId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_TIMER_KEY, id);
  } catch {
    // ignore
  }
}

export function formatTargetDisplayDate(targetDateIso: string): string {
  try {
    const d = new Date(targetDateIso);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return targetDateIso;
  }
}

export function getShareUrl(timer: CountdownTimer): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('title', timer.title);
  url.searchParams.set('date', timer.targetDate);
  if (timer.theme) url.searchParams.set('theme', timer.theme);
  return url.toString();
}

export function parseTimerFromUrl(): Partial<CountdownTimer> | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title');
  const date = params.get('date');
  const theme = params.get('theme') as any;

  if (title && date && !isNaN(new Date(date).getTime())) {
    return {
      title,
      targetDate: new Date(date).toISOString(),
      theme: theme || 'amber',
      category: 'Event',
      showMilliseconds: true,
      enableSound: true,
    };
  }
  return null;
}
