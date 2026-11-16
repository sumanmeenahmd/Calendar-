import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Repeat, Trash2, X } from 'lucide-react';
import {
  CalendarCategory,
  EventDraft,
  RecurrenceFrequency,
} from '../types/calendar';
import { CATEGORY_STYLES, minutesToTime, timeToMinutes } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  initialDraft: EventDraft;
  categories: CalendarCategory[];
  onClose: () => void;
  onSave: (draft: EventDraft) => void;
  onDelete?: (eventId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  initialDraft,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const [draft, setDraft] = useState<EventDraft>(initialDraft);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setDraft(initialDraft);
    setError('');
  }, [initialDraft, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(draft.id);

  const handleStartTimeChange = (newStart: string) => {
    const startMin = timeToMinutes(newStart);
    const endMin = timeToMinutes(draft.endTime);
    const updatedEnd =
      endMin <= startMin ? minutesToTime(Math.min(23 * 60 + 55, startMin + 60)) : draft.endTime;
    setDraft((prev) => ({ ...prev, startTime: newStart, endTime: updatedEnd }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError('Please enter an event title.');
      return;
    }
    if (!draft.allDay && timeToMinutes(draft.endTime) <= timeToMinutes(draft.startTime)) {
      setError('End time must be after start time.');
      return;
    }
    onSave(draft);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2
            id="event-modal-title"
            className="font-display text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {isEditing ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="event-title" className="sr-only">
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              autoFocus
              maxLength={120}
              value={draft.title}
              onChange={(e) => {
                setDraft((p) => ({ ...p, title: e.target.value }));
                if (error) setError('');
              }}
              placeholder="Event title"
              className="font-display w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Date & All-day */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event-date"
                className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                <Calendar className="h-3.5 w-3.5" />
                Date
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={draft.date}
                onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="flex items-end pb-1.5">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.allDay}
                  onChange={(e) => setDraft((p) => ({ ...p, allDay: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                />
                All-day event
              </label>
            </div>
          </div>

          {/* Start & End Time */}
          {!draft.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="event-start-time"
                  className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Start time
                </label>
                <input
                  id="event-start-time"
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="event-end-time"
                  className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  <Clock className="h-3.5 w-3.5" />
                  End time
                </label>
                <input
                  id="event-end-time"
                  type="time"
                  value={draft.endTime}
                  onChange={(e) => {
                    setDraft((p) => ({ ...p, endTime: e.target.value }));
                    if (error) setError('');
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Calendar Category */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Calendar
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const style = CATEGORY_STYLES[cat.color] || CATEGORY_STYLES.blue;
                const active = draft.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, categoryId: cat.id }))}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? `${style.surface} ${style.border} ${style.text}`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-[2px] ${style.swatch}`} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrence */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event-recurrence"
                className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                <Repeat className="h-3.5 w-3.5" />
                Repeat
              </label>
              <select
                id="event-recurrence"
                value={draft.recurrence}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    recurrence: e.target.value as RecurrenceFrequency,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {draft.recurrence !== 'none' && (
              <div>
                <label
                  htmlFor="event-recurrence-end"
                  className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Repeat until (optional)
                </label>
                <input
                  id="event-recurrence-end"
                  type="date"
                  min={draft.date}
                  value={draft.recurrenceEndDate || ''}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, recurrenceEndDate: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="event-location"
              className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              <MapPin className="h-3.5 w-3.5" />
              Location
            </label>
            <input
              id="event-location"
              type="text"
              maxLength={120}
              value={draft.location || ''}
              onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
              placeholder="Add room, address, or meeting link"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="event-notes"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Notes
            </label>
            <textarea
              id="event-notes"
              rows={3}
              maxLength={1000}
              value={draft.notes || ''}
              onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Agenda items, links, or reminders..."
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          {isEditing && onDelete && draft.id ? (
            <button
              type="button"
              onClick={() => {
                onDelete(draft.id!);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
