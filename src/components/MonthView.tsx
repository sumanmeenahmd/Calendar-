import React, { useMemo, useState } from 'react';
import { Plus, Repeat, X } from 'lucide-react';
import {
  CalendarCategory,
  CalendarEvent,
  ExpandedEventOccurrence,
} from '../types/calendar';
import {
  CATEGORY_STYLES,
  expandEventsForRange,
  formatTimeDisplay,
  formatTimeRange,
  getMonthGridDays,
  getWeekdayLabels,
  isSameDay,
  parseDateKey,
  toDateKey,
} from '../utils/dateUtils';

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  weekStartsOn: 0 | 1;
  timeFormat: '12h' | '24h';
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectDate: (date: Date) => void;
  onCreateEventOnDate: (dateKey: string) => void;
  onEditEvent: (occurrence: ExpandedEventOccurrence) => void;
  onMoveEventDate: (eventId: string, newDateKey: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  selectedDate,
  weekStartsOn,
  timeFormat,
  events,
  categories,
  onSelectDate,
  onCreateEventOnDate,
  onEditEvent,
  onMoveEventDate,
}) => {
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);
  const [overflowDayKey, setOverflowDayKey] = useState<string | null>(null);

  const today = new Date();
  const days = useMemo(
    () => getMonthGridDays(currentDate, weekStartsOn),
    [currentDate, weekStartsOn]
  );
  const weekdayLabels = useMemo(
    () => getWeekdayLabels(weekStartsOn, 'short'),
    [weekStartsOn]
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const eventsByDay = useMemo(() => {
    const startKey = toDateKey(days[0]);
    const endKey = toDateKey(days[days.length - 1]);
    const visibleCatIds = new Set(
      categories.filter((c) => c.visible).map((c) => c.id)
    );
    const filtered = events.filter((e) => visibleCatIds.has(e.categoryId));
    const expanded = expandEventsForRange(filtered, startKey, endKey);

    const map = new Map<string, ExpandedEventOccurrence[]>();
    for (const occ of expanded) {
      const list = map.get(occ.occurrenceDate) || [];
      list.push(occ);
      map.set(occ.occurrenceDate, list);
    }
    return map;
  }, [days, events, categories]);

  const overflowEvents = overflowDayKey ? eventsByDay.get(overflowDayKey) || [] : [];

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="border-r border-slate-200 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 last:border-r-0 dark:border-slate-800 dark:text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 6-Week Grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden">
        {days.map((day, index) => {
          const dateKey = toDateKey(day);
          const inCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const dayEvents = eventsByDay.get(dateKey) || [];
          const visibleEvents = dayEvents.slice(0, 3);
          const hiddenCount = dayEvents.length - visibleEvents.length;
          const isDragTarget = dragOverDateKey === dateKey;
          const isLastRow = index >= 35;

          return (
            <div
              key={dateKey}
              onClick={() => {
                onSelectDate(day);
                onCreateEventOnDate(dateKey);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverDateKey !== dateKey) setDragOverDateKey(dateKey);
              }}
              onDragLeave={() => {
                if (dragOverDateKey === dateKey) setDragOverDateKey(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverDateKey(null);
                const eventId = e.dataTransfer.getData('text/plain');
                if (eventId) {
                  onMoveEventDate(eventId, dateKey);
                }
              }}
              className={`group relative flex min-h-0 cursor-pointer flex-col border-r border-slate-200 p-1.5 transition-colors last:border-r-0 dark:border-slate-800 sm:p-2 ${
                !isLastRow ? 'border-b border-slate-200 dark:border-slate-800' : ''
              } ${
                isDragTarget
                  ? 'bg-blue-50/80 dark:bg-blue-950/40'
                  : !inCurrentMonth
                  ? 'bg-slate-50/50 dark:bg-slate-900/30'
                  : isSelected
                  ? 'bg-slate-50/80 dark:bg-slate-900/50'
                  : 'bg-white hover:bg-slate-50/60 dark:bg-slate-950 dark:hover:bg-slate-900/40'
              }`}
            >
              {/* Day Number Header */}
              <div className="mb-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(day);
                  }}
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-medium tabular-nums transition-colors ${
                    isToday
                      ? 'bg-blue-600 font-semibold text-white'
                      : inCurrentMonth
                      ? 'text-slate-800 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-800'
                      : 'text-slate-400 hover:bg-slate-200/50 dark:text-slate-600 dark:hover:bg-slate-800'
                  }`}
                >
                  {day.getDate() === 1
                    ? `${day.toLocaleDateString('en-US', { month: 'short' })} 1`
                    : day.getDate()}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(day);
                    onCreateEventOnDate(dateKey);
                  }}
                  aria-label={`Add event on ${dateKey}`}
                  className="hidden h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 group-hover:inline-flex dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Events Stack */}
              <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                {visibleEvents.map((occ) => {
                  const cat = categoryMap.get(occ.categoryId);
                  const style = CATEGORY_STYLES[cat?.color || 'blue'];
                  return (
                    <button
                      key={occ.occurrenceKey}
                      type="button"
                      draggable={occ.recurrence === 'none'}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData('text/plain', occ.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(occ);
                      }}
                      className={`flex w-full items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors ${style.surface} ${style.border} ${style.text} ${style.hover}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-[2px] ${style.swatch}`}
                      />
                      {!occ.allDay && (
                        <span
                          className={`hidden shrink-0 font-mono text-[10px] tabular-nums xl:inline ${style.subtext}`}
                        >
                          {formatTimeDisplay(occ.startTime, timeFormat)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {occ.title}
                      </span>
                      {occ.recurrence !== 'none' && (
                        <Repeat className={`h-2.5 w-2.5 shrink-0 opacity-70 ${style.subtext}`} />
                      )}
                    </button>
                  );
                })}

                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOverflowDayKey(dateKey);
                    }}
                    className="w-full rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-slate-500 tabular-nums transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    +{hiddenCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Overflow Modal / Popover */}
      {overflowDayKey && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-950/30"
            onClick={() => setOverflowDayKey(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                {parseDateKey(overflowDayKey).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <button
                type="button"
                onClick={() => setOverflowDayKey(null)}
                aria-label="Close day list"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {overflowEvents.map((occ) => {
                const cat = categoryMap.get(occ.categoryId);
                const style = CATEGORY_STYLES[cat?.color || 'blue'];
                return (
                  <button
                    key={occ.occurrenceKey}
                    type="button"
                    onClick={() => {
                      setOverflowDayKey(null);
                      onEditEvent(occ);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${style.surface} ${style.border} ${style.text} ${style.hover}`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-[2px] ${style.swatch}`} />
                      <span className="truncate font-medium">{occ.title}</span>
                    </div>
                    <span className={`shrink-0 font-mono text-[11px] tabular-nums ${style.subtext}`}>
                      {formatTimeRange(occ.startTime, occ.endTime, occ.allDay, timeFormat)}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const key = overflowDayKey;
                setOverflowDayKey(null);
                onCreateEventOnDate(key);
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add event to this day
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
