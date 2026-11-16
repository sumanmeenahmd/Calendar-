import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Plus,
  Search,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import {
  CalendarCategory,
  CalendarEvent,
  CalendarPreferences,
  CalendarView,
} from '../types/calendar';
import {
  CATEGORY_STYLES,
  formatTimeRange,
  parseDateKey,
} from '../utils/dateUtils';
import { PreferencesPopover } from './PreferencesPopover';

interface TopBarProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onOpenNewEvent: () => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectSearchResult: (event: CalendarEvent) => void;
  preferences: CalendarPreferences;
  onUpdatePreferences: (patch: Partial<CalendarPreferences>) => void;
  onExportICS: () => void;
  onClearAllEvents: () => void;
  onRestoreSamples: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

function getPeriodTitle(
  currentDate: Date,
  view: CalendarView,
  weekStartsOn: 0 | 1
): string {
  if (view === 'month') {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (view === 'day') {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (view === 'agenda') {
    return `Agenda · ${currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })}`;
  }
  // Week view
  const start = new Date(currentDate);
  const diff = (currentDate.getDay() - weekStartsOn + 7) % 7;
  start.setDate(currentDate.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onOpenNewEvent,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  events,
  categories,
  onSelectSearchResult,
  preferences,
  onUpdatePreferences,
  onExportICS,
  onClearAllEvents,
  onRestoreSamples,
  searchInputRef,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const prefsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (prefsRef.current && !prefsRef.current.contains(e.target as Node)) {
        setPrefsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchMatches = trimmedQuery
    ? events
        .filter((ev) => {
          const hay = `${ev.title} ${ev.location || ''} ${ev.notes || ''}`.toLowerCase();
          return hay.includes(trimmedQuery);
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8)
    : [];

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const views: { id: CalendarView; label: string }[] = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
      {/* Left Zone: Mobile menu, Brand, Today & Date navigation */}
      <div className="flex min-w-0 items-center gap-3 lg:gap-5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle calendar sidebar"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="font-display shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Daybook
        </span>

        <div className="hidden h-5 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onNavigate('today')}
            className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Today
          </button>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onNavigate('prev')}
              aria-label="Previous period"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('next')}
              aria-label="Next period"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h1 className="font-display truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg">
          {getPeriodTitle(currentDate, view, preferences.weekStartsOn)}
        </h1>
      </div>

      {/* Center/Right Zone: View Switcher + Search + Utilities + CTA */}
      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        {/* Search Input with Instant Results Dropdown */}
        <div ref={searchBoxRef} className="relative hidden md:block">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search events..."
              aria-label="Search events"
              className="h-9 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-7 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950 lg:w-60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {searchFocused && trimmedQuery.length > 0 && (
            <div className="absolute right-0 top-11 z-40 w-80 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              {searchMatches.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No events matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {searchMatches.map((ev) => {
                    const cat = categoryMap.get(ev.categoryId);
                    const style = CATEGORY_STYLES[cat?.color || 'blue'];
                    const formattedDate = parseDateKey(ev.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          onSelectSearchResult(ev);
                          setSearchFocused(false);
                        }}
                        className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-[2px] ${style.swatch}`} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {ev.title}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                            <span>{formattedDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {formatTimeRange(
                                ev.startTime,
                                ev.endTime,
                                ev.allDay,
                                preferences.timeFormat
                              )}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Switcher Segmented Control */}
        <div
          role="tablist"
          aria-label="Calendar view"
          className="hidden items-center gap-0.5 rounded-lg bg-slate-100 p-1 dark:bg-slate-900 sm:flex"
        >
          {views.map((v) => {
            const active = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onViewChange(v.id)}
                className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Preferences Popover */}
        <div ref={prefsRef} className="relative">
          <button
            type="button"
            onClick={() => setPrefsOpen((o) => !o)}
            aria-label="Calendar preferences"
            aria-expanded={prefsOpen}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {prefsOpen && (
            <PreferencesPopover
              preferences={preferences}
              onUpdatePreferences={onUpdatePreferences}
              onExportICS={() => {
                onExportICS();
                setPrefsOpen(false);
              }}
              onClearAllEvents={() => {
                onClearAllEvents();
                setPrefsOpen(false);
              }}
              onRestoreSamples={() => {
                onRestoreSamples();
                setPrefsOpen(false);
              }}
            />
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() =>
            onUpdatePreferences({
              theme: preferences.theme === 'dark' ? 'light' : 'dark',
            })
          }
          aria-label={preferences.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {preferences.theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onOpenNewEvent}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Event</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
};
