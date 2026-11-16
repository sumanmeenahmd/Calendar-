import { CalendarCategory, CalendarEvent, CalendarPreferences } from '../types/calendar';
import { addDays, toDateKey } from '../utils/dateUtils';

export const DEFAULT_CATEGORIES: CalendarCategory[] = [
  { id: 'work', name: 'Work', color: 'blue', visible: true },
  { id: 'focus', name: 'Deep Focus', color: 'violet', visible: true },
  { id: 'personal', name: 'Personal', color: 'emerald', visible: true },
  { id: 'deadlines', name: 'Deadlines', color: 'rose', visible: true },
  { id: 'health', name: 'Health & Fitness', color: 'amber', visible: true },
];

export const DEFAULT_PREFERENCES: CalendarPreferences = {
  theme: 'light',
  weekStartsOn: 1,
  timeFormat: '12h',
  defaultView: 'month',
};

export function createStarterEvents(anchorDate: Date = new Date()): CalendarEvent[] {
  const today = toDateKey(anchorDate);
  const tomorrow = toDateKey(addDays(anchorDate, 1));
  const plus2 = toDateKey(addDays(anchorDate, 2));
  const plus3 = toDateKey(addDays(anchorDate, 3));
  const plus5 = toDateKey(addDays(anchorDate, 5));
  const minus1 = toDateKey(addDays(anchorDate, -1));
  const minus2 = toDateKey(addDays(anchorDate, -2));

  const nowIso = new Date().toISOString();

  return [
    {
      id: 'starter-1',
      title: 'Weekly Planning & Review',
      date: today,
      allDay: false,
      startTime: '09:30',
      endTime: '10:30',
      categoryId: 'work',
      recurrence: 'weekly',
      location: 'Desk / Studio',
      notes: 'Review key priorities, clear inbox, and lock focus blocks for the week.',
      createdAt: nowIso,
    },
    {
      id: 'starter-2',
      title: 'Deep Focus: Product Roadmap',
      date: today,
      allDay: false,
      startTime: '14:00',
      endTime: '16:00',
      categoryId: 'focus',
      recurrence: 'none',
      location: 'Quiet Room',
      notes: 'No notifications. Draft Q4 architecture milestones.',
      createdAt: nowIso,
    },
    {
      id: 'starter-3',
      title: 'Evening Run',
      date: tomorrow,
      allDay: false,
      startTime: '18:00',
      endTime: '19:00',
      categoryId: 'health',
      recurrence: 'none',
      location: 'City Park Loop',
      notes: '5km steady pace.',
      createdAt: nowIso,
    },
    {
      id: 'starter-4',
      title: 'Design Critique & Sync',
      date: tomorrow,
      allDay: false,
      startTime: '11:00',
      endTime: '12:00',
      categoryId: 'work',
      recurrence: 'none',
      location: 'Meet Room B',
      createdAt: nowIso,
    },
    {
      id: 'starter-5',
      title: 'Morning Standup',
      date: plus2,
      allDay: false,
      startTime: '09:00',
      endTime: '09:30',
      categoryId: 'work',
      recurrence: 'none',
      createdAt: nowIso,
    },
    {
      id: 'starter-6',
      title: 'Project Proposal Submission',
      date: plus3,
      allDay: true,
      startTime: '09:00',
      endTime: '17:00',
      categoryId: 'deadlines',
      recurrence: 'none',
      notes: 'Final PDF upload before 5 PM.',
      createdAt: nowIso,
    },
    {
      id: 'starter-7',
      title: 'Dinner with Family',
      date: plus5,
      allDay: false,
      startTime: '19:30',
      endTime: '21:30',
      categoryId: 'personal',
      recurrence: 'none',
      location: 'Home',
      createdAt: nowIso,
    },
    {
      id: 'starter-8',
      title: 'Grocery & Errands',
      date: minus1,
      allDay: false,
      startTime: '17:00',
      endTime: '18:00',
      categoryId: 'personal',
      recurrence: 'none',
      createdAt: nowIso,
    },
    {
      id: 'starter-9',
      title: 'Strength Training',
      date: minus2,
      allDay: false,
      startTime: '07:30',
      endTime: '08:30',
      categoryId: 'health',
      recurrence: 'weekly',
      location: 'Neighborhood Gym',
      createdAt: nowIso,
    },
  ];
}
