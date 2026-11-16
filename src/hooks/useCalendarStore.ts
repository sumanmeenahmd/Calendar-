import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PREFERENCES,
  createStarterEvents,
} from '../data/defaultData';
import {
  CalendarCategory,
  CalendarEvent,
  CalendarPreferences,
  CategoryColorKey,
  EventDraft,
} from '../types/calendar';

const STORAGE_KEYS = {
  events: 'daybook_calendar_events_v1',
  categories: 'daybook_calendar_categories_v1',
  preferences: 'daybook_calendar_preferences_v1',
  initialized: 'daybook_calendar_initialized_v1',
};

function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useCalendarStore() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const alreadyInitialized = window.localStorage.getItem(STORAGE_KEYS.initialized);
    if (!alreadyInitialized) {
      const starter = createStarterEvents(new Date());
      try {
        window.localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(starter));
        window.localStorage.setItem(STORAGE_KEYS.initialized, 'true');
      } catch {
        // Ignore storage quota issues
      }
      return starter;
    }
    return safeReadStorage<CalendarEvent[]>(STORAGE_KEYS.events, []);
  });

  const [categories, setCategories] = useState<CalendarCategory[]>(() =>
    safeReadStorage<CalendarCategory[]>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES)
  );

  const [preferences, setPreferences] = useState<CalendarPreferences>(() =>
    safeReadStorage<CalendarPreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES)
  );

  const [lastDeletedEvent, setLastDeletedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
      window.localStorage.setItem(STORAGE_KEYS.initialized, 'true');
    } catch {
      // Ignore storage quota issues
    }
  }, [events]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
    } catch {
      // Ignore storage quota issues
    }
  }, [categories]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
    } catch {
      // Ignore storage quota issues
    }
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]);

  const saveEvent = useCallback((draft: EventDraft) => {
    const cleanTitle = draft.title.trim() || 'Untitled Event';
    if (draft.id) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === draft.id
            ? {
                ...ev,
                title: cleanTitle,
                date: draft.date,
                allDay: draft.allDay,
                startTime: draft.startTime,
                endTime: draft.endTime,
                categoryId: draft.categoryId,
                recurrence: draft.recurrence,
                recurrenceEndDate: draft.recurrenceEndDate || undefined,
                location: draft.location?.trim() || undefined,
                notes: draft.notes?.trim() || undefined,
              }
            : ev
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: cleanTitle,
        date: draft.date,
        allDay: draft.allDay,
        startTime: draft.startTime,
        endTime: draft.endTime,
        categoryId: draft.categoryId,
        recurrence: draft.recurrence,
        recurrenceEndDate: draft.recurrenceEndDate || undefined,
        location: draft.location?.trim() || undefined,
        notes: draft.notes?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  }, []);

  const moveEventDate = useCallback((eventId: string, newDateKey: string, newStartTime?: string, newEndTime?: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          date: newDateKey,
          ...(newStartTime ? { startTime: newStartTime } : {}),
          ...(newEndTime ? { endTime: newEndTime } : {}),
        };
      })
    );
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => {
      const found = prev.find((e) => e.id === eventId) || null;
      if (found) setLastDeletedEvent(found);
      return prev.filter((e) => e.id !== eventId);
    });
  }, []);

  const undoDelete = useCallback(() => {
    if (!lastDeletedEvent) return;
    setEvents((prev) => {
      if (prev.some((e) => e.id === lastDeletedEvent.id)) return prev;
      return [...prev, lastDeletedEvent];
    });
    setLastDeletedEvent(null);
  }, [lastDeletedEvent]);

  const dismissUndo = useCallback(() => {
    setLastDeletedEvent(null);
  }, []);

  const toggleCategoryVisibility = useCallback((categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, visible: !cat.visible } : cat))
    );
  }, []);

  const addCategory = useCallback((name: string, color: CategoryColorKey) => {
    const clean = name.trim();
    if (!clean) return;
    const newCat: CalendarCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: clean,
      color,
      visible: true,
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setCategories((prev) => {
      if (prev.length <= 1) return prev;
      const remaining = prev.filter((c) => c.id !== categoryId);
      const fallbackId = remaining[0].id;
      setEvents((evPrev) =>
        evPrev.map((ev) => (ev.categoryId === categoryId ? { ...ev, categoryId: fallbackId } : ev))
      );
      return remaining;
    });
  }, []);

  const updatePreferences = useCallback((patch: Partial<CalendarPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearAllEvents = useCallback(() => {
    setEvents([]);
    setLastDeletedEvent(null);
  }, []);

  const restoreSampleEvents = useCallback(() => {
    setEvents(createStarterEvents(new Date()));
    setCategories(DEFAULT_CATEGORIES);
    setLastDeletedEvent(null);
  }, []);

  return {
    events,
    categories,
    preferences,
    lastDeletedEvent,
    saveEvent,
    moveEventDate,
    deleteEvent,
    undoDelete,
    dismissUndo,
    toggleCategoryVisibility,
    addCategory,
    deleteCategory,
    updatePreferences,
    clearAllEvents,
    restoreSampleEvents,
  };
}
