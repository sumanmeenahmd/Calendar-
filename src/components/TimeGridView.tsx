import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, MapPin, Plus, Repeat } from 'lucide-react';
import {
  CalendarCategory,
  CalendarEvent,
  ExpandedEventOccurrence,
} from '../types/calendar';
import {
  CATEGORY_STYLES,
  expandEventsForRange,
  formatHourLabel,
  formatTimeRange,
  getWeekDays,
  isSameDay,
  layoutOverlappingEvents,
  minutesToTime,
  timeToMinutes,
  toDateKey,
} from '../utils/dateUtils';

interface TimeGridViewProps {
  mode: 'week' | 'day';
  currentDate: Date;
  weekStartsOn: 0 | 1;
  timeFormat: '12h' | '24h';
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectDate: (date: Date) => void;
  onCreateEventAtSlot: (dateKey: string, startTime: string, endTime: string, allDay?: boolean) => void;
  onEditEvent: (occurrence: ExpandedEventOccurrence) => void;
  onMoveEvent: (eventId: string, newDateKey: string, startTime?: string, endTime?: string) => void;
}

const HOUR_HEIGHT = 60; // 1px per minute
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const TimeGridView: React.FC<TimeGridViewProps> = ({
  mode,
  currentDate,
  weekStartsOn,
  timeFormat,
  events,
  categories,
  onSelectDate,
  onCreateEventAtSlot,
  onEditEvent,
  onMoveEvent,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      // Auto-scroll to 07:30 on mount or mode switch
      scrollRef.current.scrollTop = 7.5 * HOUR_HEIGHT;
    }
  }, [mode]);

  const days = useMemo(() => {
    if (mode === 'day') return [currentDate];
    return getWeekDays(currentDate, weekStartsOn);
  }, [mode, currentDate, weekStartsOn]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const occurrencesByDay = useMemo(() => {
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

  const hasAnyAllDay = useMemo(() => {
    for (const day of days) {
      const list = occurrencesByDay.get(toDateKey(day)) || [];
      if (list.some((e) => e.allDay)) return true;
    }
    return false;
  }, [days, occurrencesByDay]);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTopPx = (nowMinutes / 60) * HOUR_HEIGHT;

  // Day view side summary list
  const singleDayEvents =
    mode === 'day' ? occurrencesByDay.get(toDateKey(currentDate)) || [] : [];

  return (
    <div className="flex h-full flex-1 overflow-hidden bg-white dark:bg-slate-950">
      {/* Main Time Grid Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Sticky Column Headers */}
        <div className="shrink-0 border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex">
            {/* Time gutter spacer */}
            <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 sm:w-20" />

            <div
              className={`grid flex-1 ${
                mode === 'week' ? 'grid-cols-7' : 'grid-cols-1'
              }`}
            >
              {days.map((day) => {
                const key = toDateKey(day);
                const isToday = isSameDay(day, now);
                return (
                  <div
                    key={key}
                    onClick={() => onSelectDate(day)}
                    className="flex cursor-pointer items-center justify-center gap-2 border-r border-slate-200 px-2 py-2.5 last:border-r-0 dark:border-slate-800"
                  >
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-sm font-semibold tabular-nums ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All-Day Row */}
          {hasAnyAllDay && (
            <div className="flex border-t border-slate-200 dark:border-slate-800">
              <div className="flex w-16 shrink-0 items-center justify-end border-r border-slate-200 pr-2 text-[11px] font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:w-20">
                All day
              </div>
              <div
                className={`grid flex-1 ${
                  mode === 'week' ? 'grid-cols-7' : 'grid-cols-1'
                }`}
              >
                {days.map((day) => {
                  const key = toDateKey(day);
                  const allDayEvents = (occurrencesByDay.get(key) || []).filter(
                    (e) => e.allDay
                  );
                  return (
                    <div
                      key={key}
                      onClick={() => onCreateEventAtSlot(key, '09:00', '10:00', true)}
                      className="min-h-8 space-y-1 border-r border-slate-200 p-1 last:border-r-0 dark:border-slate-800"
                    >
                      {allDayEvents.map((occ) => {
                        const cat = categoryMap.get(occ.categoryId);
                        const style = CATEGORY_STYLES[cat?.color || 'blue'];
                        return (
                          <button
                            key={occ.occurrenceKey}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEvent(occ);
                            }}
                            className={`flex w-full items-center gap-1.5 rounded border px-1.5 py-0.5 text-left text-[11px] font-medium ${style.surface} ${style.border} ${style.text} ${style.hover}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-[2px] ${style.swatch}`}
                            />
                            <span className="truncate">{occ.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable 24-Hour Grid */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
          <div
            className="relative flex"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* Left Hour Labels */}
            <div className="w-16 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:w-20">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="relative pr-2 text-right"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  {hour > 0 && (
                    <span className="font-mono relative -top-2 text-[11px] text-slate-400 tabular-nums dark:text-slate-500">
                      {formatHourLabel(hour, timeFormat)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            <div
              className={`relative grid flex-1 ${
                mode === 'week' ? 'grid-cols-7' : 'grid-cols-1'
              }`}
            >
              {days.map((day) => {
                const dateKey = toDateKey(day);
                const isToday = isSameDay(day, now);
                const dayEvents = occurrencesByDay.get(dateKey) || [];
                const positioned = layoutOverlappingEvents(dayEvents, HOUR_HEIGHT);

                return (
                  <div
                    key={dateKey}
                    className="relative border-r border-slate-200 last:border-r-0 dark:border-slate-800"
                  >
                    {/* Hourly Clickable Slots */}
                    {HOURS.map((hour) => {
                      const startStr = `${String(hour).padStart(2, '0')}:00`;
                      const endStr = `${String(Math.min(23, hour + 1)).padStart(
                        2,
                        '0'
                      )}:${hour === 23 ? '59' : '00'}`;
                      return (
                        <div
                          key={hour}
                          onClick={() =>
                            onCreateEventAtSlot(dateKey, startStr, endStr, false)
                          }
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const payload = e.dataTransfer.getData('application/json');
                            if (!payload) return;
                            try {
                              const { eventId, durationMinutes } = JSON.parse(payload) as {
                                eventId: string;
                                durationMinutes: number;
                              };
                              const newStartMin = hour * 60;
                              const newEndMin = Math.min(
                                23 * 60 + 59,
                                newStartMin + Math.max(30, durationMinutes)
                              );
                              onMoveEvent(
                                eventId,
                                dateKey,
                                minutesToTime(newStartMin),
                                minutesToTime(newEndMin)
                              );
                            } catch {
                              // Ignore malformed drag payload
                            }
                          }}
                          className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40 dark:border-slate-800/70 dark:hover:bg-blue-950/20"
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        />
                      );
                    })}

                    {/* Current Time Line */}
                    {isToday && (
                      <div
                        className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                        style={{ top: `${nowTopPx}px` }}
                      >
                        <span className="-ml-1 h-2 w-2 rounded-[2px] bg-blue-600 dark:bg-blue-500" />
                        <div className="h-[2px] flex-1 bg-blue-600 dark:bg-blue-500" />
                      </div>
                    )}

                    {/* Timed Events */}
                    {positioned.map((item) => {
                      const { occurrence: occ, topPx, heightPx, columnIndex, totalColumns } =
                        item;
                      const cat = categoryMap.get(occ.categoryId);
                      const style = CATEGORY_STYLES[cat?.color || 'blue'];
                      const widthPct = 100 / totalColumns;
                      const leftPct = columnIndex * widthPct;
                      const durationMinutes =
                        timeToMinutes(occ.endTime) - timeToMinutes(occ.startTime);

                      return (
                        <button
                          key={occ.occurrenceKey}
                          type="button"
                          draggable={occ.recurrence === 'none'}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.setData(
                              'application/json',
                              JSON.stringify({ eventId: occ.id, durationMinutes })
                            );
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditEvent(occ);
                          }}
                          style={{
                            top: `${topPx + 1}px`,
                            height: `${Math.max(26, heightPx - 2)}px`,
                            left: `calc(${leftPct}% + 2px)`,
                            width: `calc(${widthPct}% - 4px)`,
                          }}
                          className={`absolute z-10 flex flex-col overflow-hidden rounded-md border px-2 py-1 text-left transition-colors ${style.surface} ${style.border} ${style.text} ${style.hover}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-[2px] ${style.swatch}`}
                            />
                            <span className="truncate text-xs font-semibold leading-tight">
                              {occ.title}
                            </span>
                            {occ.recurrence !== 'none' && (
                              <Repeat className={`h-3 w-3 shrink-0 opacity-70 ${style.subtext}`} />
                            )}
                          </div>
                          {heightPx >= 42 && (
                            <span
                              className={`mt-0.5 truncate font-mono text-[10px] tabular-nums ${style.subtext}`}
                            >
                              {formatTimeRange(
                                occ.startTime,
                                occ.endTime,
                                occ.allDay,
                                timeFormat
                              )}
                            </span>
                          )}
                          {heightPx >= 64 && occ.location && (
                            <span
                              className={`mt-0.5 truncate text-[11px] opacity-85 ${style.subtext}`}
                            >
                              {occ.location}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Day View Side Summary Inspector */}
      {mode === 'day' && (
        <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40 xl:flex">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Day Schedule
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                {singleDayEvents.length}{' '}
                {singleDayEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onCreateEventAtSlot(toDateKey(currentDate), '09:00', '10:00', false)
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
            {singleDayEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-6 text-center dark:border-slate-800 dark:bg-slate-950/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Clear schedule
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Click any time slot on the timeline to block focus time or meetings.
                </p>
              </div>
            ) : (
              singleDayEvents.map((occ) => {
                const cat = categoryMap.get(occ.categoryId);
                const style = CATEGORY_STYLES[cat?.color || 'blue'];
                return (
                  <button
                    key={occ.occurrenceKey}
                    type="button"
                    onClick={() => onEditEvent(occ)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-[2px] ${style.swatch}`} />
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {occ.title}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {formatTimeRange(
                          occ.startTime,
                          occ.endTime,
                          occ.allDay,
                          timeFormat
                        )}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{cat?.name || 'Calendar'}</span>
                    </div>

                    {occ.location && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{occ.location}</span>
                      </div>
                    )}

                    {occ.notes && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {occ.notes}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
