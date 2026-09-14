import React, { useState } from 'react';
import { Sparkles, X, MapPin, Search, Plus, Check, AlertCircle } from 'lucide-react';
import { BusinessItem } from '../types';

interface AiScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBusinesses: (newItems: BusinessItem[]) => void;
}

export const AiScannerModal: React.FC<AiScannerModalProps> = ({
  isOpen,
  onClose,
  onAddBusinesses,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BusinessItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const quickPresets = [
    'Penistone & Rural West Barnsley Trades',
    'Wombwell & Dearne Valley Mechanics',
    'Royston & Carlton Local Cafes & Bakers',
    'Darton & Mapplewell Home Improvement',
    'Barnsley Dog Groomers & Pet Care',
  ];

  const handleScan = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-scan-area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaOrNiche: searchQuery }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.candidates)) {
        setResults(data.candidates);
      } else {
        setError(data.error || 'Failed to scan area');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error scanning area');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingle = (item: BusinessItem) => {
    onAddBusinesses([item]);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleAddAll = () => {
    const toAdd = results.filter((item) => !addedIds[item.id]);
    if (toAdd.length > 0) {
      onAddBusinesses(toAdd);
      const newMap: Record<string, boolean> = { ...addedIds };
      toAdd.forEach((item) => {
        newMap[item.id] = true;
      });
      setAddedIds(newMap);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Gemini AI Discovery Scanner</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">
              Scan Barnsley Sub-Areas & Trades
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Probe specific Barnsley townships (e.g. Wombwell, Penistone, Hoyland, Royston) or trades to uncover established businesses operating without a website.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search controls */}
        <div className="p-5 border-b border-slate-200 bg-white space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan(query);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Barnsley district or trade (e.g. 'Penistone roofers' or 'Wombwell mechanics')..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Scanning...' : 'Deep Scan'}</span>
            </button>
          </form>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 font-medium">Quick suggestions:</span>
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  handleScan(preset);
                }}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-800">
                Scanning Barnsley and South Yorkshire directory records...
              </p>
              <p className="text-xs text-slate-500">
                Cross-referencing reviews, offline trade reputation, and web domain absence.
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Found {results.length} offline business candidates:
                </span>
                <button
                  onClick={handleAddAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Import All to Main Directory</span>
                </button>
              </div>

              {results.map((item) => {
                const isAdded = addedIds[item.id];
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-slate-900 font-display">
                          {item.name}
                        </strong>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                          {item.category}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {item.rating}★ ({item.reviewsCount} reviews)
                        </span>
                      </div>

                      <div className="text-slate-600">
                        <span className="font-medium text-slate-700">{item.area}</span> •{' '}
                        <span>{item.fullAddress}</span> • Tel: {item.phone}
                      </div>

                      <p className="text-slate-500 leading-snug">
                        <strong className="text-slate-700">Angle: </strong>
                        {item.opportunityAngle}
                      </p>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleAddSingle(item)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-2xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Added to List</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                            <span>Add to Directory</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && results.length === 0 && !error && (
            <div className="py-12 text-center text-slate-400 text-xs">
              Use the search bar above or click one of the quick suggestions to scan Barnsley's outer villages and specialized trades.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
