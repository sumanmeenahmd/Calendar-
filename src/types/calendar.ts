export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type CategoryColorKey = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';

export interface CalendarCategory {
  id: string;
  name: string;
  color: CategoryColorKey;
  visible: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (start date)
  endDate?: string; // YYYY-MM-DD (optional multi-day end, defaults to date)
  allDay: boolean;
  startTime: string; // HH:mm (24h format, e.g. "09:30")
  endTime: string; // HH:mm (24h format, e.g. "10:30")
  categoryId: string;
  recurrence: RecurrenceFrequency;
  recurrenceEndDate?: string; // YYYY-MM-DD optional
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface ExpandedEventOccurrence extends CalendarEvent {
  occurrenceDate: string; // YYYY-MM-DD of this specific occurrence
  occurrenceKey: string; // unique key for rendering
  isRecurringInstance: boolean;
}

export interface CalendarPreferences {
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  timeFormat: '12h' | '24h';
  defaultView: CalendarView;
}

export interface EventDraft {
  id?: string;
  title: string;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  categoryId: string;
  recurrence: RecurrenceFrequency;
  recurrenceEndDate?: string;
  location?: string;
  notes?: string;
}
