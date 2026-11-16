import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  CalendarCategory,
  CalendarEvent,
  CalendarView,
  CategoryColorKey,
} from '../types/calendar';
import {
  CATEGORY_STYLES,
  addMonths,
  expandEventsForRange,
  getMonthGridDays,
  getWeekdayLabels,
  isSameDay,
  toDateKey,
} from '../utils/dateUtils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  weekStartsOn: 0 | 1;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onToggleCategory: (id: string) => void;
  onAddCategory: (name: string, color: CategoryColorKey) => void;
  onDeleteCategory: (id: string) => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const COLOR_OPTIONS: CategoryColorKey[] = [
  'blue',
  'violet',
  'emerald',
  'amber',
  'rose',
  'cyan',
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  weekStartsOn,
  events,
  categories,
  onToggleCategory,
  onAddCategory,
  onDeleteCategory,
  view,
  onViewChange,
}) => {
  const [miniMonth, setMiniMonth] = useState<Date>(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState<CategoryColorKey>('cyan');

  useEffect(() => {
    setMiniMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const today = new Date();
  const miniDays = useMemo(
    () => getMonthGridDays(miniMonth, weekStartsOn),
    [miniMonth, weekStartsOn]
  );
  const narrowWeekdays = useMemo(
    () => getWeekdayLabels(weekStartsOn, 'narrow'),
    [weekStartsOn]
  );

  const daysWithEvents = useMemo(() => {
    const startKey = toDateKey(miniDays[0]);
    const endKey = toDateKey(miniDays[miniDays.length - 1]);
    const visibleIds = new Set(categories.filter((c) => c.visible).map((c) => c.id));
    const expanded = expandEventsForRange(
      events.filter((e) => visibleIds.has(e.categoryId)),
      startKey,
      endKey
    );
    return new Set(expanded.map((o) => o.occurrenceDate));
  }, [events, categories, miniDays]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of events) {
      map.set(ev.categoryId, (map.get(ev.categoryId) || 0) + 1);
    }
    return map;
  }, [events]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    setAddingCat(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-900/60">
      <div className="space-y-6">
        {/* Mobile View Switcher (visible on <sm) */}
        <div className="sm:hidden">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              View Mode
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-200/70 p-1 dark:bg-slate-800">
            {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  onViewChange(v);
                  onClose();
                }}
                className={`rounded-md py-1.5 text-xs font-medium capitalize transition-colors ${
                  view === v
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Mini Month Calendar */}
        <section aria-label="Mini calendar">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              {miniMonth.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setMiniMonth((m) => addMonths(m, -1))}
                aria-label="Previous mini month"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMiniMonth((m) => addMonths(m, 1))}
                aria-label="Next mini month"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center">
            {narrowWeekdays.map((label, idx) => (
              <div
                key={idx}
                className="py-1 text-[11px] font-medium text-slate-400 dark:text-slate-500"
              >
                {label}
              </div>
            ))}
            {miniDays.map((day) => {
              const key = toDateKey(day);
              const inMonth = day.getMonth() === miniMonth.getMonth();
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);
              const hasEvents = daysWithEvents.has(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSelectDate(day);
                    onClose();
                  }}
                  className={`relative mx-auto my-0.5 flex h-8 w-8 flex-col items-center justify-center rounded-lg text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    isToday
                      ? 'bg-blue-600 font-semibold text-white'
                      : isSelected
                      ? 'bg-slate-200/90 font-semibold text-slate-900 dark:bg-slate-700 dark:text-white'
                      : inMonth
                      ? 'text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
                      : 'text-slate-400 hover:bg-slate-200/40 dark:text-slate-600 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span>{day.getDate()}</span>
                  {hasEvents && (
                    <span
                      className={`mt-0.5 h-0.5 w-2.5 rounded-full ${
                        isToday ? 'bg-blue-200' : 'bg-blue-500 dark:bg-blue-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Calendars / Categories */}
        <section aria-label="Calendars">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Calendars
            </h2>
            <button
              type="button"
              onClick={() => setAddingCat((v) => !v)}
              aria-label="Add calendar"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              {addingCat ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          </div>

          {addingCat && (
            <form
              onSubmit={handleCreateCategory}
              className="mb-3 space-y-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950"
            >
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Calendar name"
                maxLength={32}
                autoFocus
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      aria-label={`Select ${c} color`}
                      className={`h-4 w-4 rounded-[3px] ${CATEGORY_STYLES[c].swatch} ${
                        newCatColor === c
                          ? 'ring-2 ring-slate-900 ring-offset-1 dark:ring-white dark:ring-offset-slate-950'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1">
            {categories.map((cat) => {
              const style = CATEGORY_STYLES[cat.color] || CATEGORY_STYLES.blue;
              const count = categoryCounts.get(cat.id) || 0;
              return (
                <div
                  key={cat.id}
                  className="group flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
                >
                  <button
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                        cat.visible
                          ? `${style.swatch} border-transparent text-white`
                          : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                      }`}
                    >
                      {cat.visible && <Check className="h-3 w-3 stroke-[2.5]" />}
                    </span>
                    <span
                      className={`truncate text-sm ${
                        cat.visible
                          ? 'font-medium text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 tabular-nums dark:text-slate-500">
                      {count}
                    </span>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(cat.id)}
                        aria-label={`Delete ${cat.name} calendar`}
                        className="hidden rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600 group-hover:inline-flex dark:hover:bg-slate-700 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Shortcuts
        </p>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span>New event</span>
            <kbd className="font-mono text-[11px] text-slate-700 dark:text-slate-300">C</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Today</span>
            <kbd className="font-mono text-[11px] text-slate-700 dark:text-slate-300">T</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Month / Week</span>
            <kbd className="font-mono text-[11px] text-slate-700 dark:text-slate-300">M / W</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Day / Agenda</span>
            <kbd className="font-mono text-[11px] text-slate-700 dark:text-slate-300">D / A</kbd>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 lg:block xl:w-[272px]">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
