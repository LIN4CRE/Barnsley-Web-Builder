import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, MapPin, Plus, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { scanArea } from '@/lib/api';
import { parseBusinessList } from '@/lib/schema';
import type { BusinessItem } from '@/types';

interface AiScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBusinesses: (items: readonly BusinessItem[]) => number;
  backendUnavailable: boolean;
}

const QUICK_PRESETS = [
  'Penistone & Rural West Barnsley trades',
  'Wombwell & Dearne Valley mechanics',
  'Royston & Carlton cafes and bakers',
  'Darton & Mapplewell home improvement',
  'Barnsley dog groomers and pet care',
] as const;

export function AiScannerModal({
  isOpen,
  onClose,
  onAddBusinesses,
  backendUnavailable,
}: AiScannerModalProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BusinessItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<ReadonlySet<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleScan = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnnouncement('Scanning…');

    const result = await scanArea(searchQuery);

    // Guard against setting state after the modal has closed.
    if (!isMounted.current) return;

    setIsLoading(false);

    if (result.ok) {
      const candidates = parseBusinessList(result.data);
      setResults(candidates);
      setAnnouncement(
        candidates.length === 0
          ? 'No candidates returned for that search.'
          : `${candidates.length} candidates found.`,
      );
      if (candidates.length === 0) {
        setError('No candidates came back for that search. Try a different area or trade.');
      }
    } else {
      setResults([]);
      setError(result.error);
      setAnnouncement('Scan failed.');
    }
  };

  const handleAddSingle = (item: BusinessItem) => {
    if (onAddBusinesses([item]) > 0) {
      setAddedIds((prev) => new Set(prev).add(item.id));
      setAnnouncement(`${item.name} added to the directory.`);
    }
  };

  const handleAddAll = () => {
    const toAdd = results.filter((item) => !addedIds.has(item.id));
    if (toAdd.length === 0) return;

    const added = onAddBusinesses(toAdd);
    setAddedIds((prev) => {
      const next = new Set(prev);
      toAdd.forEach((item) => next.add(item.id));
      return next;
    });
    setAnnouncement(`${added} businesses added to the directory.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI niche scanner"
      description="Ask for a Barnsley area or trade and review the candidates before importing them."
      className="max-w-2xl"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
          >
            Close scanner
          </button>
        </div>
      }
    >
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <div className="p-5 border-b border-slate-200 bg-white space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleScan(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <MapPin
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="scanner-query" className="sr-only">
              Barnsley district or trade to scan
            </label>
            <input
              id="scanner-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Penistone roofers, Wombwell mechanics"
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim() || backendUnavailable}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
            <span>{isLoading ? 'Scanning…' : 'Deep scan'}</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
          <span className="text-slate-500 font-medium">Quick suggestions:</span>
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setQuery(preset);
                void handleScan(preset);
              }}
              disabled={isLoading || backendUnavailable}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-3">
        {backendUnavailable && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong className="font-semibold">Scanner unavailable.</strong> This deployment has no
            server component, so the AI scanner cannot run. Run the app locally with a Gemini API
            key, or add prospects manually with <strong>Add Business</strong>.
          </div>
        )}

        {error && !backendUnavailable && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && (
          <div className="py-12 text-center space-y-3" role="status" aria-live="polite">
            <div
              className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-slate-800">Scanning Barnsley…</p>
            <p className="text-xs text-slate-500">
              Asking the model for candidates. This usually takes 10–20 seconds.
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-800">
                {results.length} candidate{results.length === 1 ? '' : 's'} found
              </span>
              <button
                type="button"
                onClick={handleAddAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Import all to the directory</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 -mt-1">
              AI-suggested records are unverified. Check each one before you contact anyone.
            </p>

            <ul className="space-y-3 list-none p-0">
              {results.map((item) => {
                const isAdded = addedIds.has(item.id);
                return (
                  <li
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
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

                      <p className="text-slate-600 m-0">
                        <span className="font-medium text-slate-700">{item.area}</span> •{' '}
                        {item.fullAddress} • Tel: {item.phone}
                      </p>

                      <p className="text-slate-500 leading-snug m-0">
                        <strong className="text-slate-700">Angle: </strong>
                        {item.opportunityAngle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSingle(item)}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 self-end sm:self-center ${
                        isAdded
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-2xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                          <span>Add to directory</span>
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!isLoading && results.length === 0 && !error && !backendUnavailable && (
          <div className="py-12 text-center text-slate-400 text-xs">
            Search for a Barnsley village or trade above to find candidates.
          </div>
        )}
      </div>
    </Modal>
  );
}
