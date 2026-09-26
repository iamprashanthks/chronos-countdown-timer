import { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  bgClass: string;
  ambientGlow: string;
  digitColor: string;
  glowClass: string;
  unitLabelColor: string;
  cardBg: string;
  cardBorder: string;
  accentBg: string;
  accentText: string;
  ringColor: string;
  progressBarColor: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  amber: {
    id: 'amber',
    name: 'Cosmic Amber',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bgClass: 'bg-[#090806]',
    ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)',
    digitColor: 'text-amber-400',
    glowClass: 'glow-amber',
    unitLabelColor: 'text-amber-500/70',
    cardBg: 'bg-amber-950/20',
    cardBorder: 'border-amber-500/25',
    accentBg: 'bg-amber-500 hover:bg-amber-400 text-neutral-950',
    accentText: 'text-amber-400',
    ringColor: 'focus-visible:ring-amber-500',
    progressBarColor: 'bg-gradient-to-r from-amber-600 to-amber-400',
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    bgClass: 'bg-[#04080e]',
    ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
    digitColor: 'text-cyan-400',
    glowClass: 'glow-cyan',
    unitLabelColor: 'text-cyan-500/70',
    cardBg: 'bg-cyan-950/20',
    cardBorder: 'border-cyan-500/25',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950',
    accentText: 'text-cyan-400',
    ringColor: 'focus-visible:ring-cyan-500',
    progressBarColor: 'bg-gradient-to-r from-cyan-600 to-cyan-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Laser Emerald',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bgClass: 'bg-[#040a06]',
    ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
    digitColor: 'text-emerald-400',
    glowClass: 'glow-emerald',
    unitLabelColor: 'text-emerald-500/70',
    cardBg: 'bg-emerald-950/20',
    cardBorder: 'border-emerald-500/25',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950',
    accentText: 'text-emerald-400',
    ringColor: 'focus-visible:ring-emerald-500',
    progressBarColor: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Rose',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    bgClass: 'bg-[#0c0507]',
    ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(244, 63, 94, 0.12) 0%, transparent 60%)',
    digitColor: 'text-rose-400',
    glowClass: 'glow-rose',
    unitLabelColor: 'text-rose-500/70',
    cardBg: 'bg-rose-950/20',
    cardBorder: 'border-rose-500/25',
    accentBg: 'bg-rose-500 hover:bg-rose-400 text-neutral-950',
    accentText: 'text-rose-400',
    ringColor: 'focus-visible:ring-rose-500',
    progressBarColor: 'bg-gradient-to-r from-rose-600 to-amber-400',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Pure Monochrome',
    badge: 'bg-white/10 text-neutral-200 border-white/20',
    bgClass: 'bg-[#0a0a0a]',
    ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 60%)',
    digitColor: 'text-neutral-100',
    glowClass: 'glow-white',
    unitLabelColor: 'text-neutral-400',
    cardBg: 'bg-neutral-900/60',
    cardBorder: 'border-white/15',
    accentBg: 'bg-neutral-100 hover:bg-white text-neutral-950',
    accentText: 'text-neutral-200',
    ringColor: 'focus-visible:ring-neutral-300',
    progressBarColor: 'bg-gradient-to-r from-neutral-500 to-neutral-200',
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Minimal',
    badge: 'bg-neutral-800/80 text-neutral-300 border-neutral-700/50',
    bgClass: 'bg-[#050505]',
    ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(212, 212, 216, 0.05) 0%, transparent 60%)',
    digitColor: 'text-neutral-200',
    glowClass: '',
    unitLabelColor: 'text-neutral-400',
    cardBg: 'bg-neutral-900/40',
    cardBorder: 'border-neutral-800',
    accentBg: 'bg-neutral-200 hover:bg-white text-neutral-950',
    accentText: 'text-neutral-300',
    ringColor: 'focus-visible:ring-neutral-400',
    progressBarColor: 'bg-neutral-400',
  },
};
