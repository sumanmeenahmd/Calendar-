import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { AgendaView } from './components/AgendaView';
import { EventModal } from './components/EventModal';
import { MonthView } from './components/MonthView';
import { Sidebar } from './components/Sidebar';
import { TimeGridView } from './components/TimeGridView';
import { TopBar } from './components/TopBar';
import { useCalendarStore } from './hooks/useCalendarStore';
import {
  CalendarEvent,
  CalendarView,
  EventDraft,
  ExpandedEventOccurrence,
} from './types/calendar';
import {
  addDays,
  addMonths,
  exportEventsToICS,
  parseDateKey,
  toDateKey,
} from './utils/dateUtils';

export default function App() {
  const {
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
  } = useCalendarStore();

  const [view, setView] = useState<CalendarView>(() => preferences.defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDraft, setModalDraft] = useState<EventDraft>(() => ({
    title: '',
    date: toDateKey(new Date()),
    allDay: false,
    startTime: '09:00',
    endTime: '10:00',
    categoryId: categories[0]?.id || 'work',
    recurrence: 'none',
  }));

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const openNewEventModal = useCallback(
    (
      dateKey?: string,
      startTime = '09:00',
      endTime = '10:00',
      allDay = false
    ) => {
      setModalDraft({
        title: '',
        date: dateKey || toDateKey(selectedDate),
        allDay,
        startTime,
        endTime,
        categoryId: categories[0]?.id || 'work',
        recurrence: 'none',
        recurrenceEndDate: '',
        location: '',
        notes: '',
      });
      setModalOpen(true);
    },
    [selectedDate, categories]
  );

  const openEditEventModal = useCallback(
    (occ: ExpandedEventOccurrence) => {
      const base = events.find((e) => e.id === occ.id) || occ;
      setModalDraft({
        id: base.id,
        title: base.title,
        date: base.date,
        allDay: base.allDay,
        startTime: base.startTime,
        endTime: base.endTime,
        categoryId: base.categoryId,
        recurrence: base.recurrence,
        recurrenceEndDate: base.recurrenceEndDate || '',
        location: base.location || '',
        notes: base.notes || '',
      });
      setModalOpen(true);
    },
    [events]
  );

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      if (direction === 'today') {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
        return;
      }
      const delta = direction === 'next' ? 1 : -1;
      setCurrentDate((prev) => {
        if (view === 'month') return addMonths(prev, delta);
        if (view === 'week') return addDays(prev, delta * 7);
        if (view === 'day') return addDays(prev, delta);
        return addDays(prev, delta * 14);
      });
    },
    [view]
  );

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  }, []);

  const handleSelectSearchResult = useCallback(
    (ev: CalendarEvent) => {
      const d = parseDateKey(ev.date);
      setSelectedDate(d);
      setCurrentDate(d);
      setModalDraft({
        id: ev.id,
        title: ev.title,
        date: ev.date,
        allDay: ev.allDay,
        startTime: ev.startTime,
        endTime: ev.endTime,
        categoryId: ev.categoryId,
        recurrence: ev.recurrence,
        recurrenceEndDate: ev.recurrenceEndDate || '',
        location: ev.location || '',
        notes: ev.notes || '',
      });
      setModalOpen(true);
    },
    []
  );

  const handleExportICS = useCallback(() => {
    const icsContent = exportEventsToICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daybook-calendar-${toDateKey(new Date())}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [events]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 't') {
        e.preventDefault();
        handleNavigate('today');
      } else if (key === 'm') {
        e.preventDefault();
        setView('month');
      } else if (key === 'w') {
        e.preventDefault();
        setView('week');
      } else if (key === 'd') {
        e.preventDefault();
        setView('day');
      } else if (key === 'a') {
        e.preventDefault();
        setView('agenda');
      } else if (key === 'c') {
        e.preventDefault();
        openNewEventModal();
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, handleNavigate, openNewEventModal]);

  // Auto-dismiss Undo Delete toast
  useEffect(() => {
    if (!lastDeletedEvent) return;
    const timer = window.setTimeout(() => {
      dismissUndo();
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [lastDeletedEvent, dismissUndo]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopBar
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onOpenNewEvent={() => openNewEventModal()}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        events={events}
        categories={categories}
        onSelectSearchResult={handleSelectSearchResult}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        onExportICS={handleExportICS}
        onClearAllEvents={clearAllEvents}
        onRestoreSamples={restoreSampleEvents}
        searchInputRef={searchInputRef}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          weekStartsOn={preferences.weekStartsOn}
          events={events}
          categories={categories}
          onToggleCategory={toggleCategoryVisibility}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          view={view}
          onViewChange={setView}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              selectedDate={selectedDate}
              weekStartsOn={preferences.weekStartsOn}
              timeFormat={preferences.timeFormat}
              events={events}
              categories={categories}
              onSelectDate={setSelectedDate}
              onCreateEventOnDate={(dateKey) => openNewEventModal(dateKey)}
              onEditEvent={openEditEventModal}
              onMoveEventDate={(eventId, newDateKey) =>
                moveEventDate(eventId, newDateKey)
              }
            />
          )}

          {(view === 'week' || view === 'day') && (
            <TimeGridView
              mode={view}
              currentDate={currentDate}
              weekStartsOn={preferences.weekStartsOn}
              timeFormat={preferences.timeFormat}
              events={events}
              categories={categories}
              onSelectDate={setSelectedDate}
              onCreateEventAtSlot={(dateKey, start, end, allDay) =>
                openNewEventModal(dateKey, start, end, allDay)
              }
              onEditEvent={openEditEventModal}
              onMoveEvent={moveEventDate}
            />
          )}

          {view === 'agenda' && (
            <AgendaView
              currentDate={currentDate}
              timeFormat={preferences.timeFormat}
              events={events}
              categories={categories}
              searchQuery={searchQuery}
              onEditEvent={openEditEventModal}
              onCreateEvent={() => openNewEventModal()}
            />
          )}
        </main>
      </div>

      <EventModal
        isOpen={modalOpen}
        initialDraft={modalDraft}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />

      {/* Undo Delete Toast */}
      {lastDeletedEvent && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <span className="max-w-52 truncate">
            Deleted &ldquo;{lastDeletedEvent.title}&rdquo;
          </span>
          <button
            type="button"
            onClick={undoDelete}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            <RotateCcw className="h-3 w-3" />
            Undo
          </button>
          <button
            type="button"
            onClick={dismissUndo}
            aria-label="Dismiss notification"
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
