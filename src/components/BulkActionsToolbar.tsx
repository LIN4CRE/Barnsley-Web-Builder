import { CheckSquare, Download, Sparkles } from 'lucide-react';
import { OUTREACH_STATUSES } from '@/types';
import type { OutreachStatus } from '@/types';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onExportSelectedCsv: () => void;
  onOpenBulkPitch: () => void;
  onBulkStatusChange: (status: OutreachStatus) => void;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onExportSelectedCsv,
  onOpenBulkPitch,
  onBulkStatusChange,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    // The toolbar is announced as a region so keyboard and screen-reader users
    // are told it appeared, rather than it silently covering the bottom of the page.
    <div
      role="region"
      aria-label="Bulk actions for selected businesses"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] sm:w-auto"
    >
      <div className="bg-slate-900 text-white rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center gap-1.5 bg-indigo-600/30 text-indigo-200 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-indigo-500/30"
            role="status"
            aria-live="polite"
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-300" aria-hidden="true" />
            <span>
              {selectedCount} <span className="font-normal text-slate-300">of {totalCount} selected</span>
            </span>
          </span>

          <button
            type="button"
            onClick={onClearSelection}
            className="text-slate-300 hover:text-white text-xs underline cursor-pointer px-1 py-1"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onSelectAll}
            className="text-slate-300 hover:text-white text-xs underline cursor-pointer hidden sm:inline px-1 py-1"
          >
            Select all
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1 text-xs border border-slate-700">
            <label htmlFor="bulk-status-select" className="text-[11px] text-slate-300">
              Set stage
            </label>
            <select
              id="bulk-status-select"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onBulkStatusChange(e.target.value as OutreachStatus);
                  e.target.value = '';
                }
              }}
              className="bg-transparent text-white text-xs font-medium cursor-pointer focus:outline-none"
            >
              <option value="" disabled className="bg-slate-800 text-slate-400">
                Choose…
              </option>
              {OUTREACH_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-slate-800 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onExportSelectedCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenBulkPitch}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span>Outreach pack ({selectedCount})</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClearSelection}
        className="sr-only focus:not-sr-only"
      >
        Clear selection
      </button>
    </div>
  );
}
