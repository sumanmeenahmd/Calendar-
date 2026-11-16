import React, { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Plus, Repeat } from 'lucide-react';
import {
  CalendarCategory,
  CalendarEvent,
  ExpandedEventOccurrence,
} from '../types/calendar';
import {
  CATEGORY_STYLES,
  addDays,
  expandEventsForRange,
  formatTimeRange,
  isSameDay,
  parseDateKey,
  toDateKey,
} from '../utils/dateUtils';

interface AgendaViewProps {
  currentDate: Date;
  timeFormat: '12h' | '24h';
  events: CalendarEvent[];
  categories: CalendarCategory[];
  searchQuery: string;
  onEditEvent: (occurrence: ExpandedEventOccurrence) => void;
  onCreateEvent: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  currentDate,
  timeFormat,
  events,
  categories,
  searchQuery,
  onEditEvent,
  onCreateEvent,
}) => {
  const [windowDays, setWindowDays] = useState(30);
  const today = new Date();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const groupedDays = useMemo(() => {
    const startKey = toDateKey(currentDate);
    const endKey = toDateKey(addDays(currentDate, windowDays));
    const visibleCatIds = new Set(
      categories.filter((c) => c.visible).map((c) => c.id)
    );
    const trimmed = searchQuery.trim().toLowerCase();

    const filtered = events.filter((e) => {
      if (!visibleCatIds.has(e.categoryId)) return false;
      if (!trimmed) return true;
      const hay = `${e.title} ${e.location || ''} ${e.notes || ''}`.toLowerCase();
      return hay.includes(trimmed);
    });

    const expanded = expandEventsForRange(filtered, startKey, endKey);

    const groups: { dateKey: string; dateObj: Date; items: ExpandedEventOccurrence[] }[] =
      [];
    let currentGroup: (typeof groups)[number] | null = null;

    for (const occ of expanded) {
      if (!currentGroup || currentGroup.dateKey !== occ.occurrenceDate) {
        currentGroup = {
          dateKey: occ.occurrenceDate,
          dateObj: parseDateKey(occ.occurrenceDate),
          items: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.items.push(occ);
    }

    return groups;
  }, [currentDate, windowDays, events, categories, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Upcoming Schedule
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 tabular-nums dark:text-slate-400">
              Showing {windowDays} days from{' '}
              {currentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setWindowDays((d) => d + 30)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Load +30 days
          </button>
        </div>

        {groupedDays.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/30">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="font-display mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              {searchQuery.trim()
                ? 'No matching events found'
                : 'Nothing scheduled in this window'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery.trim()
                ? 'Try adjusting your search query or enabling hidden calendars in the sidebar.'
                : 'Add an event or extend the date window to review upcoming plans.'}
            </p>
            <button
              type="button"
              onClick={onCreateEvent}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedDays.map((group) => {
              const isToday = isSameDay(group.dateObj, today);
              const isTomorrow = isSameDay(group.dateObj, addDays(today, 1));
              const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : null;

              return (
                <section key={group.dateKey} aria-label={group.dateKey}>
                  <div className="mb-2 flex items-baseline gap-2.5">
                    <h3
                      className={`font-display text-sm font-semibold ${
                        isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {group.dateObj.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    {dayLabel && (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        · {dayLabel}
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
                    {group.items.map((occ) => {
                      const cat = categoryMap.get(occ.categoryId);
                      const style = CATEGORY_STYLES[cat?.color || 'blue'];

                      return (
                        <button
                          key={occ.occurrenceKey}
                          type="button"
                          onClick={() => onEditEvent(occ)}
                          className="flex w-full flex-col gap-2 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:gap-5"
                        >
                          {/* Time column */}
                          <div className="font-mono w-40 shrink-0 text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
                            {formatTimeRange(
                              occ.startTime,
                              occ.endTime,
                              occ.allDay,
                              timeFormat
                            )}
                          </div>

                          {/* Event Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 shrink-0 rounded-[2px] ${style.swatch}`}
                              />
                              <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {occ.title}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <span>{cat?.name || 'Calendar'}</span>
                              {occ.location && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {occ.location}
                                  </span>
                                </>
                              )}
                              {occ.recurrence !== 'none' && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="inline-flex items-center gap-1 capitalize">
                                    <Repeat className="h-3 w-3" />
                                    {occ.recurrence}
                                  </span>
                                </>
                              )}
                            </div>

                            {occ.notes && (
                              <p className="mt-1.5 line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
                                {occ.notes}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
