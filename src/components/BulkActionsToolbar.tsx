import React from 'react';
import { CheckSquare, Square, Download, Sparkles, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { OutreachStatus } from '../types';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExportSelectedCsv: () => void;
  onOpenBulkPitch: () => void;
  onBulkStatusChange: (status: OutreachStatus) => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onExportSelectedCsv,
  onOpenBulkPitch,
  onBulkStatusChange,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] sm:w-auto">
      <div className="bg-slate-900 text-white rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-indigo-600/30 text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-500/30">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {selectedCount} <span className="font-normal text-slate-300">of {totalCount} selected</span>
            </span>
          </div>

          <button
            onClick={onClearSelection}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={onSelectAll}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer hidden sm:inline"
          >
            Select All
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Batch Update Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1 text-xs border border-slate-700">
            <span className="text-[11px] text-slate-400">Set Status:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onBulkStatusChange(e.target.value as OutreachStatus);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-transparent text-white text-xs font-medium cursor-pointer focus:outline-none"
            >
              <option value="" disabled className="bg-slate-800 text-slate-400">
                Choose...
              </option>
              <option value="Not Contacted" className="bg-slate-800 text-white">
                Not Contacted
              </option>
              <option value="In Progress" className="bg-slate-800 text-white">
                In Progress
              </option>
              <option value="Lead" className="bg-slate-800 text-white">
                Lead
              </option>
              <option value="Closed" className="bg-slate-800 text-white">
                Closed
              </option>
            </select>
          </div>

          {/* Export Selected to CSV */}
          <button
            onClick={onExportSelectedCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Export selected businesses to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>

          {/* Generate Multiple Pitch Documents at once */}
          <button
            onClick={onOpenBulkPitch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            title="Generate custom outreach pitches and scripts for all selected businesses"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Pitch Deck ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
