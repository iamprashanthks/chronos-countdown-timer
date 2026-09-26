import React, { useState, useMemo, useEffect } from 'react';
import { ThemeId } from '../types';
import { THEMES } from './ThemeStyles';
import { playUiClick } from '../utils/audio';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';

interface CalendarPickerProps {
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm or HH:mm:ss
  onDateChange: (dateStr: string) => void;
  onTimeChange: (timeStr: string) => void;
  themeId?: ThemeId;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  dateStr,
  timeStr,
  onDateChange,
  onTimeChange,
  themeId = 'amber',
}) => {
  const currentTheme = THEMES[themeId] || THEMES.amber;

  // Parse incoming date or fallback to today
  const selectedDate = useMemo(() => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [dateStr]);

  // Current viewing month and year for calendar navigation
  const [viewYear, setViewYear] = useState<number>(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => selectedDate.getMonth()); // 0-indexed

  // Synchronize view month/year if incoming date changes
  useEffect(() => {
    if (dateStr) {
      const [y, m] = dateStr.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [dateStr]);

  // Parse hours & minutes
  const { hour12, minute, isPm, hour24 } = useMemo(() => {
    const parts = (timeStr || '09:00').split(':');
    const h24 = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    const pm = h24 >= 12;
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return {
      hour12: h12,
      minute: m,
      isPm: pm,
      hour24: h24,
    };
  }, [timeStr]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Navigate month
  const prevMonth = () => {
    playUiClick();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    playUiClick();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    playUiClick();
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    const yStr = today.getFullYear();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  // Generate Calendar Matrix (42 cells: 6 weeks x 7 days)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      monthOffset: -1 | 0 | 1;
      fullDateStr: string;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    const selY = selectedDate.getFullYear();
    const selM = selectedDate.getMonth();
    const selD = selectedDate.getDate();

    // 1. Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const fDate = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        monthOffset: -1,
        fullDateStr: fDate,
        isToday: prevY === todayY && prevM === todayM && day === todayD,
        isSelected: prevY === selY && prevM === selM && day === selD,
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const fDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        monthOffset: 0,
        fullDateStr: fDate,
        isToday: viewYear === todayY && viewMonth === todayM && day === todayD,
        isSelected: viewYear === selY && viewMonth === selM && day === selD,
      });
    }

    // 3. Next month leading days
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const fDate = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        monthOffset: 1,
        fullDateStr: fDate,
        isToday: nextY === todayY && nextM === todayM && day === todayD,
        isSelected: nextY === selY && nextM === selM && day === selD,
      });
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate]);

  // Handle day click
  const handleSelectDay = (cell: typeof calendarCells[0]) => {
    playUiClick();
    onDateChange(cell.fullDateStr);
    if (cell.monthOffset === -1) {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else if (cell.monthOffset === 1) {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    }
  };

  // Time modifiers
  const updateTime = (newH24: number, newMin: number) => {
    const hClamped = Math.max(0, Math.min(23, newH24));
    const mClamped = Math.max(0, Math.min(59, newMin));
    onTimeChange(`${String(hClamped).padStart(2, '0')}:${String(mClamped).padStart(2, '0')}`);
  };

  const handleHourChange = (newH12: number) => {
    playUiClick();
    let h24 = newH12 % 12;
    if (isPm) h24 += 12;
    updateTime(h24, minute);
  };

  const handleMinuteChange = (newMin: number) => {
    playUiClick();
    updateTime(hour24, newMin);
  };

  const toggleAmPm = (pm: boolean) => {
    playUiClick();
    let h24 = hour12 % 12;
    if (pm) h24 += 12;
    updateTime(h24, minute);
  };

  // Relative time estimate preview
  const previewInfo = useMemo(() => {
    try {
      const d = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
      if (isNaN(d.getTime())) return { formatted: '', relative: '' };
      
      const formatted = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);

      const diffMs = d.getTime() - Date.now();
      let relative = '';
      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diffMs / (1000 * 60)) % 60);
        if (days > 0) {
          relative = `In ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (hours > 0) {
          relative = `In ${hours} hour${hours > 1 ? 's' : ''}, ${mins} min`;
        } else {
          relative = `In ${mins} minute${mins > 1 ? 's' : ''}`;
        }
      } else {
        relative = 'Date is in the past';
      }

      return { formatted, relative };
    } catch {
      return { formatted: `${dateStr} ${timeStr}`, relative: '' };
    }
  }, [dateStr, timeStr]);

  return (
    <div className="w-full bg-neutral-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-6 shadow-xl">
      {/* Left Column: Visual Month Calendar Grid */}
      <div className="flex-1 min-w-[270px]">
        {/* Calendar Month & Year Navigation Header with direct dropdown selection */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {/* Direct Month dropdown */}
            <select
              value={viewMonth}
              onChange={(e) => {
                playUiClick();
                setViewMonth(Number(e.target.value));
              }}
              className="bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {monthNames.map((name, i) => (
                <option key={name} value={i} className="bg-neutral-900 text-white">
                  {name}
                </option>
              ))}
            </select>

            {/* Direct Year dropdown */}
            <select
              value={viewYear}
              onChange={(e) => {
                playUiClick();
                setViewYear(Number(e.target.value));
              }}
              className="bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-mono-num"
            >
              {Array.from({ length: 15 }, (_, i) => 2026 + i).map((y) => (
                <option key={y} value={y} className="bg-neutral-900 text-white">
                  {y}
                </option>
              ))}
            </select>

            {/* Today jump */}
            <button
              type="button"
              onClick={jumpToToday}
              className="text-[11px] font-medium px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors border border-white/5"
            >
              Today
            </button>
          </div>

          {/* Stepper arrow buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {dayNames.map((day, idx) => (
            <div
              key={day}
              className={`text-[11px] font-semibold uppercase py-1 ${
                idx === 0 || idx === 6 ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarCells.map((cell, idx) => {
            const isCurrentMonth = cell.monthOffset === 0;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectDay(cell)}
                className={`relative h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-mono-num font-medium flex flex-col items-center justify-center transition-all ${
                  cell.isSelected
                    ? `${currentTheme.accentBg} font-bold shadow-lg scale-105 z-10`
                    : isCurrentMonth
                    ? 'text-neutral-200 hover:bg-white/10'
                    : 'text-neutral-600 hover:bg-white/5'
                }`}
              >
                <span>{cell.dayNumber}</span>
                {/* Indicator dot for Today */}
                {cell.isToday && !cell.isSelected && (
                  <span className={`w-1 h-1 rounded-full ${currentTheme.accentText} mt-0.5`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-white/10" />

      {/* Right Column: Interactive Time Picker & Quick Time Presets */}
      <div className="w-full md:w-64 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-300">
            <Clock className={`w-3.5 h-3.5 ${currentTheme.digitColor}`} />
            <span>Target Time</span>
          </div>

          {/* Interactive Digital Clock Input & Stepper */}
          <div className="bg-neutral-900/90 border border-white/10 rounded-xl p-3 flex items-center justify-between mb-4">
            {/* Hour select / step */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase mb-1">Hour</span>
              <select
                value={hour12}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                className="bg-neutral-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-base font-bold font-mono-num text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h} className="bg-neutral-900 text-white">
                    {String(h).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xl font-bold text-white/40 pb-1">:</span>

            {/* Minute select / step */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase mb-1">Minute</span>
              <select
                value={minute}
                onChange={(e) => handleMinuteChange(Number(e.target.value))}
                className="bg-neutral-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-base font-bold font-mono-num text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {Array.from({ length: 60 }, (_, m) => (
                  <option key={m} value={m} className="bg-neutral-900 text-white">
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            {/* AM/PM toggle */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase mb-1">Period</span>
              <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => toggleAmPm(false)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    !isPm ? `${currentTheme.accentBg}` : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => toggleAmPm(true)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    isPm ? `${currentTheme.accentBg}` : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick Minute Jumps */}
          <div className="mb-4">
            <span className="text-[11px] text-neutral-400 block mb-1.5">Quick Minutes:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 15, 30, 45].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => handleMinuteChange(m)}
                  className={`py-1 text-xs font-mono-num rounded-lg border transition-colors ${
                    minute === m
                      ? 'bg-white/15 text-white border-white/30 font-bold'
                      : 'bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  :{String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Time of Day Shortcuts */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5">Quick Times:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateTime(9, 0)}
                className="px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/5 transition-colors text-left"
              >
                09:00 AM (Morning)
              </button>
              <button
                type="button"
                onClick={() => updateTime(12, 0)}
                className="px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/5 transition-colors text-left"
              >
                12:00 PM (Noon)
              </button>
              <button
                type="button"
                onClick={() => updateTime(18, 0)}
                className="px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/5 transition-colors text-left"
              >
                06:00 PM (Evening)
              </button>
              <button
                type="button"
                onClick={() => updateTime(23, 59)}
                className="px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg border border-white/5 transition-colors text-left"
              >
                11:59 PM (Midnight)
              </button>
            </div>
          </div>
        </div>

        {/* Selected Date & Time Live Summary Card */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target:</span>
            </span>
            {previewInfo.relative && (
              <span className={`text-[11px] font-medium ${previewInfo.relative.includes('past') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {previewInfo.relative}
              </span>
            )}
          </div>
          <div className="text-xs font-mono-num font-semibold text-white bg-neutral-900 px-3 py-2 rounded-xl border border-white/10">
            {previewInfo.formatted || `${dateStr} ${timeStr}`}
          </div>
        </div>
      </div>
    </div>
  );
};
