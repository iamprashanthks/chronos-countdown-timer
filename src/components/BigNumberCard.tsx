import React, { memo } from 'react';
import { ThemeConfig } from './ThemeStyles';
import { DisplaySize } from '../types';

interface BigNumberCardProps {
  value: number;
  label: string;
  theme: ThemeConfig;
  size?: DisplaySize;
  isSmall?: boolean; // For milliseconds or secondary units
  padLength?: number;
}

export const BigNumberCard: React.FC<BigNumberCardProps> = memo(({
  value,
  label,
  theme,
  size = 'large',
  isSmall = false,
  padLength = 2,
}) => {
  const formattedValue = String(Math.max(0, value)).padStart(padLength, '0');

  // Desktop responsive font sizing
  const getFontSizeClass = () => {
    if (isSmall) {
      return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
    }
    switch (size) {
      case 'standard':
        return 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl';
      case 'monumental':
        return 'text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem]';
      case 'large':
      default:
        return 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl';
    }
  };

  const getContainerPadding = () => {
    if (isSmall) return 'py-3 sm:py-4 px-3 sm:px-5';
    switch (size) {
      case 'standard':
        return 'py-5 sm:py-7 px-4 sm:px-6 md:px-8';
      case 'monumental':
        return 'py-8 sm:py-12 px-6 sm:px-10 md:px-12';
      case 'large':
      default:
        return 'py-6 sm:py-9 px-5 sm:px-8 md:px-10';
    }
  };

  return (
    <div className="flex flex-col items-center select-none group">
      {/* Giant Digit Card Container */}
      <div
        className={`digit-card relative rounded-2xl flex items-center justify-center transition-all duration-300 ${getContainerPadding()} ${theme.cardBorder}`}
        style={{ minWidth: isSmall ? '5.5rem' : '7.5rem' }}
      >
        {/* Ambient Top Light Sheen */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent pointer-events-none rounded-t-2xl" />

        {/* The Giant Number */}
        <span
          className={`font-mono-num font-bold tracking-tight leading-none tabular-nums transition-transform duration-100 ${getFontSizeClass()} ${theme.digitColor} ${theme.glowClass}`}
          aria-label={`${value} ${label}`}
        >
          {formattedValue}
        </span>

        {/* Subtle screw corner accents for precision industrial instrument feel */}
        <div className="absolute top-2 left-2.5 w-1 h-1 rounded-full bg-white/10" />
        <div className="absolute top-2 right-2.5 w-1 h-1 rounded-full bg-white/10" />
        <div className="absolute bottom-2 left-2.5 w-1 h-1 rounded-full bg-white/10" />
        <div className="absolute bottom-2 right-2.5 w-1 h-1 rounded-full bg-white/10" />
      </div>

      {/* Clean Unit Label */}
      <div className="mt-3 sm:mt-4 flex items-center gap-1.5">
        <span
          className={`text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase font-mono-num ${theme.unitLabelColor}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
});

BigNumberCard.displayName = 'BigNumberCard';
