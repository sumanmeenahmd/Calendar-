import {
  CalendarEvent,
  CategoryColorKey,
  ExpandedEventOccurrence,
} from '../types/calendar';

export const CATEGORY_STYLES: Record<
  CategoryColorKey,
  {
    label: string;
    swatch: string;
    surface: string;
    border: string;
    text: string;
    subtext: string;
    hover: string;
  }
> = {
  blue: {
    label: 'Cobalt',
    swatch: 'bg-blue-600 dark:bg-blue-500',
    surface: 'bg-blue-50/90 dark:bg-blue-950/50',
    border: 'border-blue-200/90 dark:border-blue-800/70',
    text: 'text-blue-950 dark:text-blue-100',
    subtext: 'text-blue-700 dark:text-blue-300',
    hover: 'hover:bg-blue-100/80 dark:hover:bg-blue-900/50',
  },
  emerald: {
    label: 'Emerald',
    swatch: 'bg-emerald-600 dark:bg-emerald-500',
    surface: 'bg-emerald-50/90 dark:bg-emerald-950/50',
    border: 'border-emerald-200/90 dark:border-emerald-800/70',
    text: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-700 dark:text-emerald-300',
    hover: 'hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50',
  },
  amber: {
    label: 'Amber',
    swatch: 'bg-amber-600 dark:bg-amber-500',
    surface: 'bg-amber-50/90 dark:bg-amber-950/45',
    border: 'border-amber-200/90 dark:border-amber-800/70',
    text: 'text-amber-950 dark:text-amber-100',
    subtext: 'text-amber-800 dark:text-amber-300',
    hover: 'hover:bg-amber-100/80 dark:hover:bg-amber-900/50',
  },
  rose: {
    label: 'Crimson',
    swatch: 'bg-rose-600 dark:bg-rose-500',
    surface: 'bg-rose-50/90 dark:bg-rose-950/50',
    border: 'border-rose-200/90 dark:border-rose-800/70',
    text: 'text-rose-950 dark:text-rose-100',
    subtext: 'text-rose-700 dark:text-rose-300',
    hover: 'hover:bg-rose-100/80 dark:hover:bg-rose-900/50',
  },
  violet: {
    label: 'Violet',
    swatch: 'bg-violet-600 dark:bg-violet-500',
    surface: 'bg-violet-50/90 dark:bg-violet-950/50',
    border: 'border-violet-200/90 dark:border-violet-800/70',
    text: 'text-violet-950 dark:text-violet-100',
    subtext: 'text-violet-700 dark:text-violet-300',
    hover: 'hover:bg-violet-100/80 dark:hover:bg-violet-900/50',
  },
  cyan: {
    label: 'Teal',
    swatch: 'bg-cyan-600 dark:bg-cyan-500',
    surface: 'bg-cyan-50/90 dark:bg-cyan-950/50',
    border: 'border-cyan-200/90 dark:border-cyan-800/70',
    text: 'text-cyan-950 dark:text-cyan-100',
    subtext: 'text-cyan-700 dark:text-cyan-300',
    hover: 'hover:bg-cyan-100/80 dark:hover:bg-cyan-900/50',
  },
};

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const targetMonth = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const maxDaysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const clampedDay = Math.min(date.getDate(), maxDaysInMonth);
  return new Date(targetYear, normalizedMonth, clampedDay);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getMonthGridDays(anchorDate: Date, weekStartsOn: 0 | 1): Date[] {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstOfMonth.getDay(); // 0..6
  const offset = (firstDayOfWeek - weekStartsOn + 7) % 7;
  const gridStart = new Date(year, month, 1 - offset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }
  return days;
}

export function getWeekDays(anchorDate: Date, weekStartsOn: 0 | 1): Date[] {
  const dayOfWeek = anchorDate.getDay();
  const offset = (dayOfWeek - weekStartsOn + 7) % 7;
  const weekStart = addDays(anchorDate, -offset);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekStart, i));
  }
  return days;
}

export function getWeekdayLabels(weekStartsOn: 0 | 1, format: 'short' | 'narrow' = 'short'): string[] {
  const shortLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const narrowLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const base = format === 'short' ? shortLabels : narrowLabels;
  if (weekStartsOn === 1) {
    return [...base.slice(1), base[0]];
  }
  return base;
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTimeDisplay(timeStr: string, format: '12h' | '24h'): string {
  if (format === '24h') return timeStr;
  const [hRaw, mRaw] = timeStr.split(':').map(Number);
  const h = hRaw || 0;
  const m = mRaw || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  if (m === 0) return `${hour12} ${period}`;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(
  startTime: string,
  endTime: string,
  allDay: boolean,
  format: '12h' | '24h'
): string {
  if (allDay) return 'All day';
  return `${formatTimeDisplay(startTime, format)} – ${formatTimeDisplay(endTime, format)}`;
}

export function formatHourLabel(hour: number, format: '12h' | '24h'): string {
  if (format === '24h') {
    return `${String(hour).padStart(2, '0')}:00`;
  }
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export function expandEventsForRange(
  events: CalendarEvent[],
  rangeStartKey: string,
  rangeEndKey: string
): ExpandedEventOccurrence[] {
  const occurrences: ExpandedEventOccurrence[] = [];
  const rangeStart = parseDateKey(rangeStartKey);
  const rangeEnd = parseDateKey(rangeEndKey);

  for (const event of events) {
    const eventStart = parseDateKey(event.date);

    if (event.recurrence === 'none') {
      if (event.date >= rangeStartKey && event.date <= rangeEndKey) {
        occurrences.push({
          ...event,
          occurrenceDate: event.date,
          occurrenceKey: `${event.id}_${event.date}`,
          isRecurringInstance: false,
        });
      }
      continue;
    }

    if (eventStart > rangeEnd) continue;

    const recurrenceCap = event.recurrenceEndDate
      ? parseDateKey(event.recurrenceEndDate)
      : rangeEnd;
    const effectiveEnd = recurrenceCap < rangeEnd ? recurrenceCap : rangeEnd;

    if (effectiveEnd < rangeStart) continue;

    let cursor = new Date(eventStart);
    let safety = 0;
    const maxIterations = 800;

    while (cursor <= effectiveEnd && safety < maxIterations) {
      safety++;
      const cursorKey = toDateKey(cursor);
      if (cursorKey >= rangeStartKey && cursorKey <= rangeEndKey) {
        occurrences.push({
          ...event,
          occurrenceDate: cursorKey,
          occurrenceKey: `${event.id}_${cursorKey}`,
          isRecurringInstance: cursorKey !== event.date,
        });
      }

      if (event.recurrence === 'daily') {
        cursor = addDays(cursor, 1);
      } else if (event.recurrence === 'weekly') {
        cursor = addDays(cursor, 7);
      } else if (event.recurrence === 'monthly') {
        const nextMonthIndex =
          (cursor.getFullYear() - eventStart.getFullYear()) * 12 +
          (cursor.getMonth() - eventStart.getMonth()) +
          1;
        const targetYear =
          eventStart.getFullYear() + Math.floor((eventStart.getMonth() + nextMonthIndex) / 12);
        const targetMonth = (eventStart.getMonth() + nextMonthIndex) % 12;
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        cursor = new Date(targetYear, targetMonth, Math.min(eventStart.getDate(), daysInMonth));
      } else if (event.recurrence === 'yearly') {
        const targetYear = cursor.getFullYear() + 1;
        const targetMonth = eventStart.getMonth();
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        cursor = new Date(targetYear, targetMonth, Math.min(eventStart.getDate(), daysInMonth));
      }
    }
  }

  return occurrences.sort((a, b) => {
    if (a.occurrenceDate !== b.occurrenceDate) {
      return a.occurrenceDate.localeCompare(b.occurrenceDate);
    }
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    return a.startTime.localeCompare(b.startTime);
  });
}

export interface PositionedEvent {
  occurrence: ExpandedEventOccurrence;
  topPx: number;
  heightPx: number;
  columnIndex: number;
  totalColumns: number;
}

export function layoutOverlappingEvents(
  dayEvents: ExpandedEventOccurrence[],
  hourHeightPx: number
): PositionedEvent[] {
  const timed = dayEvents
    .filter((e) => !e.allDay)
    .map((e) => {
      const startMin = timeToMinutes(e.startTime);
      const endMin = Math.max(startMin + 25, timeToMinutes(e.endTime));
      return {
        occurrence: e,
        startMin,
        endMin,
      };
    })
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  if (timed.length === 0) return [];

  // Group into connected overlapping clusters
  const clusters: (typeof timed)[] = [];
  let currentCluster: typeof timed = [];
  let clusterEnd = -1;

  for (const item of timed) {
    if (currentCluster.length === 0 || item.startMin < clusterEnd) {
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.endMin);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = item.endMin;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const positioned: PositionedEvent[] = [];

  for (const cluster of clusters) {
    const columnsEnd: number[] = [];
    const assignments: { item: (typeof timed)[number]; col: number }[] = [];

    for (const item of cluster) {
      let assignedCol = -1;
      for (let c = 0; c < columnsEnd.length; c++) {
        if (columnsEnd[c] <= item.startMin) {
          assignedCol = c;
          columnsEnd[c] = item.endMin;
          break;
        }
      }
      if (assignedCol === -1) {
        assignedCol = columnsEnd.length;
        columnsEnd.push(item.endMin);
      }
      assignments.push({ item, col: assignedCol });
    }

    const totalCols = columnsEnd.length;
    for (const { item, col } of assignments) {
      const topPx = (item.startMin / 60) * hourHeightPx;
      const durationMin = Math.max(30, item.endMin - item.startMin);
      const heightPx = (durationMin / 60) * hourHeightPx;
      positioned.push({
        occurrence: item.occurrence,
        topPx,
        heightPx,
        columnIndex: col,
        totalColumns: totalCols,
      });
    }
  }

  return positioned;
}

export function exportEventsToICS(events: CalendarEvent[]): string {
  const escapeICS = (val: string) =>
    val.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Daybook Calendar//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const ev of events) {
    const dateCompact = ev.date.replace(/-/g, '');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@daybook.local`);
    if (ev.allDay) {
      const nextDay = toDateKey(addDays(parseDateKey(ev.date), 1)).replace(/-/g, '');
      lines.push(`DTSTART;VALUE=DATE:${dateCompact}`);
      lines.push(`DTEND;VALUE=DATE:${nextDay}`);
    } else {
      const startCompact = `${dateCompact}T${ev.startTime.replace(':', '')}00`;
      const endCompact = `${dateCompact}T${ev.endTime.replace(':', '')}00`;
      lines.push(`DTSTART:${startCompact}`);
      lines.push(`DTEND:${endCompact}`);
    }
    if (ev.recurrence !== 'none') {
      const rruleMap: Record<string, string> = {
        daily: 'DAILY',
        weekly: 'WEEKLY',
        monthly: 'MONTHLY',
        yearly: 'YEARLY',
      };
      let rrule = `RRULE:FREQ=${rruleMap[ev.recurrence]}`;
      if (ev.recurrenceEndDate) {
        rrule += `;UNTIL=${ev.recurrenceEndDate.replace(/-/g, '')}T235959Z`;
      }
      lines.push(rrule);
    }
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.location) lines.push(`LOCATION:${escapeICS(ev.location)}`);
    if (ev.notes) lines.push(`DESCRIPTION:${escapeICS(ev.notes)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
