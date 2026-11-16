import React, { useState } from 'react';
import { Download, RotateCcw, Trash2 } from 'lucide-react';
import { CalendarPreferences, CalendarView } from '../types/calendar';

interface PreferencesPopoverProps {
  preferences: CalendarPreferences;
  onUpdatePreferences: (patch: Partial<CalendarPreferences>) => void;
  onExportICS: () => void;
  onClearAllEvents: () => void;
  onRestoreSamples: () => void;
}

export const PreferencesPopover: React.FC<PreferencesPopoverProps> = ({
  preferences,
  onUpdatePreferences,
  onExportICS,
  onClearAllEvents,
  onRestoreSamples,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="absolute right-0 top-11 z-40 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
        Calendar Preferences
      </h2>

      <div className="mt-4 space-y-4">
        {/* Week Starts On */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Week starts on
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onUpdatePreferences({ weekStartsOn: 1 })}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                preferences.weekStartsOn === 1
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Monday
            </button>
            <button
              type="button"
              onClick={() => onUpdatePreferences({ weekStartsOn: 0 })}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                preferences.weekStartsOn === 0
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Sunday
            </button>
          </div>
        </div>

        {/* Time Format */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Time format
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onUpdatePreferences({ timeFormat: '12h' })}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                preferences.timeFormat === '12h'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              12-hour
            </button>
            <button
              type="button"
              onClick={() => onUpdatePreferences({ timeFormat: '24h' })}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                preferences.timeFormat === '24h'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              24-hour
            </button>
          </div>
        </div>

        {/* Default View */}
        <div>
          <label
            htmlFor="pref-default-view"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Default startup view
          </label>
          <select
            id="pref-default-view"
            value={preferences.defaultView}
            onChange={(e) =>
              onUpdatePreferences({ defaultView: e.target.value as CalendarView })
            }
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
            <option value="agenda">Agenda</option>
          </select>
        </div>

        <div className="border-t border-slate-200 pt-3 dark:border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={onExportICS}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export calendar (.ics)
          </button>

          <button
            type="button"
            onClick={onRestoreSamples}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            Restore sample events
          </button>

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all events
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2 dark:border-rose-900 dark:bg-rose-950/40">
              <span className="text-xs font-medium text-rose-800 dark:text-rose-200">
                Delete all?
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onClearAllEvents}
                  className="rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
