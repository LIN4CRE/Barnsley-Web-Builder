import { Building2, Download, MapPin, Plus, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  customCount: number;
  onOpenScanner: () => void;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
  /** True when no backend was reachable, so the AI scanner cannot work. */
  backendUnavailable: boolean;
}

export function Header({
  totalCount,
  customCount,
  onOpenScanner,
  onOpenAddModal,
  onExportCsv,
  backendUnavailable,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm"
              aria-hidden="true"
            >
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                  Barnsley Offline Businesses
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" aria-hidden="true" />
                  {totalCount} in directory
                </span>
                {customCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {customCount} added by you
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  <MapPin className="w-3 h-3 text-slate-500" aria-hidden="true" />
                  South Yorkshire, UK
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                A working list of established Barnsley businesses with strong local reputations and{' '}
                <strong className="text-slate-700 font-semibold">no website of their own</strong>.
                Entries are research notes compiled from public information — re-check details
                before you contact anyone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              id="header-ai-scan-btn"
              onClick={onOpenScanner}
              disabled={backendUnavailable}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                backendUnavailable
                  ? 'The AI scanner needs the server component, which is not running in this deployment'
                  : 'Scan Barnsley suburbs or specific trades'
              }
            >
              <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>AI Niche Scanner</span>
            </button>

            <button
              type="button"
              id="header-add-business-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Add Business</span>
            </button>

            <button
              type="button"
              id="header-export-csv-btn"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Export CSV Leads</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
