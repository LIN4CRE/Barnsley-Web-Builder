import React from 'react';
import { Building2, Sparkles, Download, Plus, MapPin, Search } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  onOpenScanner: () => void;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  onOpenScanner,
  onOpenAddModal,
  onExportCsv,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                  Barnsley Offline Businesses
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {totalCount} Verified Active
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  South Yorkshire, UK
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Curated directory of established, high-reputation Barnsley businesses with loyal customer followings, exceptional reviews, and <strong className="text-slate-700 font-semibold">zero website presence</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              id="header-ai-scan-btn"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              title="Scan Barnsley suburbs or specific trades with Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Niche Scanner</span>
            </button>

            <button
              id="header-add-business-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add Business</span>
            </button>

            <button
              id="header-export-csv-btn"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV Leads</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
