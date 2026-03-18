'use client';

import { useState } from 'react';
import { WearLog, ClothingOccasion } from '@moodfit/shared';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function CalendarDay({
  day,
  isToday,
  isCurrentMonth,
  hasLog,
  isSelected,
  onClick,
}: {
  day: number | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  hasLog: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (!day) return <div />;

  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 ${
        isSelected
          ? 'bg-brand-600 text-white'
          : isToday
          ? 'bg-brand-600/20 border border-brand-500/50 text-brand-300'
          : isCurrentMonth
          ? 'text-gray-300 hover:bg-white/10'
          : 'text-gray-600 hover:bg-white/5'
      }`}
    >
      {day}
      {hasLog && (
        <div
          className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
            isSelected ? 'bg-white' : 'bg-brand-400'
          }`}
        />
      )}
    </button>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [wearLogs] = useState<WearLog[]>([]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build calendar grid
  const calendarDays: Array<{
    day: number | null;
    date: Date | null;
    isCurrentMonth: boolean;
  }> = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push({
      day,
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Next month days to fill grid
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      day: d,
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
    });
  }

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function hasLogOnDate(date: Date) {
    return wearLogs.some((log) => isSameDay(new Date(log.wornDate), date));
  }

  function getLogsForDate(date: Date) {
    return wearLogs.filter((log) => isSameDay(new Date(log.wornDate), date));
  }

  const selectedLogs = selectedDate ? getLogsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">👗</span>
            <span className="text-xl font-bold gradient-text">MoodFit</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/wardrobe" className="nav-link">Wardrobe</Link>
            <Link href="/recommend" className="nav-link">AI Stylist</Link>
            <Link href="/calendar" className="nav-link-active">Calendar</Link>
            <Link href="/community" className="nav-link">Community</Link>
          </div>
          <Button variant="primary" size="sm">+ Log Outfit</Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Outfit Calendar</h1>
          <p className="text-gray-400 mt-1">Track and plan your outfits over time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  ←
                </button>
                <h2 className="text-xl font-semibold text-white">
                  {MONTHS[month]} {year}
                </h2>
                <button
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  →
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ day, date, isCurrentMonth }, idx) => (
                  <CalendarDay
                    key={idx}
                    day={day}
                    isToday={date ? isSameDay(date, today) : false}
                    isCurrentMonth={isCurrentMonth}
                    hasLog={date ? hasLogOnDate(date) : false}
                    isSelected={date && selectedDate ? isSameDay(date, selectedDate) : false}
                    onClick={() => date && setSelectedDate(date)}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                  <span>Has outfit log</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-600/20 border border-brand-500/50" />
                  <span>Today</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar: selected day details */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-white mb-1">
                {selectedDate
                  ? selectedDate.toLocaleDateString('en', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Select a day'}
              </h3>

              {selectedLogs.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {selectedLogs.map((log) => (
                    <div key={log.id} className="glass-card p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-sm">
                        <span>👗</span>
                        <span className="text-gray-300">{log.occasion}</span>
                        {log.mood && <span className="text-gray-500">· {log.mood}</span>}
                      </div>
                      {log.notes && (
                        <p className="text-gray-500 text-xs mt-1">{log.notes}</p>
                      )}
                      {log.rating && (
                        <div className="flex gap-0.5 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < log.rating! ? 'text-yellow-400' : 'text-gray-600'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-3xl block mb-2">📅</span>
                  <p className="text-gray-500 text-sm">No outfit logged for this day</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => {}}
                  >
                    + Log an Outfit
                  </Button>
                </div>
              )}
            </Card>

            {/* Monthly stats */}
            <Card className="p-5">
              <h3 className="font-semibold text-white mb-3">{MONTHS[month]} Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Outfits Logged</span>
                  <span className="text-white font-medium">{wearLogs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Unique Items Worn</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Most Common Occasion</span>
                  <span className="text-white font-medium">—</span>
                </div>
              </div>
            </Card>

            <Link href="/recommend">
              <Card className="p-5 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <p className="font-medium text-white text-sm">Plan Ahead</p>
                    <p className="text-gray-500 text-xs">Get AI outfit suggestions for tomorrow</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
