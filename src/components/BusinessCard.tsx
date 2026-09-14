import { useEffect, useId, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MapPin,
  Phone,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { OUTREACH_STATUS_CLASSES, STATUS_TAG_CLASSES_WITH_FALLBACK } from '@/lib/constants';
import { OUTREACH_STATUSES } from '@/types';
import type { BusinessItem, OutreachStatus } from '@/types';

interface BusinessCardProps {
  business: BusinessItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onStatusChange?: (id: string, status: OutreachStatus) => void;
  onNoteSave?: (id: string, note: string) => void;
  onGeneratePitch: (business: BusinessItem) => void;
  onDeepResearch: (business: BusinessItem) => void;
  isGeneratingPitch: boolean;
}

const NOTE_SUGGESTIONS = ['Called owner', 'Left voicemail', 'Callback scheduled'] as const;

export function BusinessCard({
  business,
  isSelected = false,
  onToggleSelect,
  onStatusChange,
  onNoteSave,
  onGeneratePitch,
  onDeepResearch,
  isGeneratingPitch,
}: BusinessCardProps) {
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(business.notes ?? '');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  const copyTimer = useRef<number | undefined>(undefined);
  const saveTimer = useRef<number | undefined>(undefined);

  const selectId = useId();
  const notesId = useId();
  const headingId = useId();

  /* Clear pending timers on unmount so we never set state after teardown. */
  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    },
    [],
  );

  /* Keep the local draft in step when the record changes underneath us. */
  useEffect(() => {
    setNoteText(business.notes ?? '');
  }, [business.notes]);

  const handleSaveNote = (text: string) => {
    setNoteText(text);
    onNoteSave?.(business.id, text);

    setNoteSavedFeedback(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setNoteSavedFeedback(false), 1500);
  };

  const handleClearNote = () => {
    setNoteText('');
    onNoteSave?.(business.id, '');
  };

  const handleCopyLead = async () => {
    const text = [
      `Business: ${business.name}`,
      `Phone: ${business.phone}`,
      `Address: ${business.fullAddress}, ${business.postcode}`,
      `Category: ${business.category}`,
      `Rating: ${business.rating}★ (${business.reviewsCount} reviews)`,
      `Outreach stage: ${business.status ?? 'Not Contacted'}`,
      `Opportunity: ${business.opportunityAngle}`,
      noteText ? `Private notes: ${noteText}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied (permissions, insecure context).
      window.alert('Your browser blocked clipboard access. The details are on the card above.');
    }
  };

  const currentOutreachStatus: OutreachStatus = business.status ?? 'Not Contacted';
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${business.name} ${business.fullAddress}`,
  )}`;

  return (
    <article
      id={`business-card-${business.id}`}
      aria-labelledby={headingId}
      className={`bg-white rounded-xl border transition-all p-5 shadow-2xs hover:shadow-xs flex flex-col justify-between ${
        isSelected ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/30' : 'border-slate-200'
      }`}
    >
      <div>
        {/* Selection + outreach stage */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          {onToggleSelect ? (
            <label
              htmlFor={selectId}
              className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-slate-600"
            >
              <input
                id={selectId}
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(business.id)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span>Select {business.name}</span>
            </label>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5">
            <label htmlFor={`status-${business.id}`} className="text-[10px] uppercase font-semibold text-slate-400">
              Stage
            </label>
            <select
              id={`status-${business.id}`}
              value={currentOutreachStatus}
              onChange={(e) => onStatusChange?.(business.id, e.target.value as OutreachStatus)}
              className={`text-xs px-2 py-1 rounded-md border cursor-pointer focus:outline-none transition-colors ${OUTREACH_STATUS_CLASSES[currentOutreachStatus]}`}
            >
              {OUTREACH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title block */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {business.category}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_TAG_CLASSES_WITH_FALLBACK[business.statusTag]}`}
              >
                {business.statusTag}
              </span>
              {business.yearsActive && (
                <span className="text-xs text-slate-600 font-medium">{business.yearsActive}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDeepResearch(business)}
              className="text-left group cursor-pointer rounded"
            >
              <h3
                id={headingId}
                className="text-lg font-bold text-slate-900 tracking-tight font-display group-hover:text-brand-700 transition-colors flex items-center gap-1.5"
              >
                <span>{business.name}</span>
                <Sparkles
                  className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
              </h3>
              <span className="sr-only">Open research and website brief for {business.name}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDeepResearch(business)}
            className="text-right shrink-0 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-600">
              Web opportunity
            </span>
            <span className="flex items-center justify-end gap-1 font-bold text-base text-slate-900">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>{business.opportunityScore}</span>
              <span className="text-slate-500 text-xs font-normal">/100</span>
            </span>
            <span className="sr-only">Research {business.name}</span>
          </button>
        </div>

        {/* Location, rating, presence */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" aria-hidden="true" />
            {business.rating}
            <span className="font-normal text-slate-500">({business.reviewsCount} reviews)</span>
          </span>

          <span className="inline-flex items-center gap-1 font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" aria-hidden="true" />
            No website ({business.onlinePresence})
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-700 flex items-start gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {business.fullAddress}, {business.area} {business.postcode}
          </span>
        </p>

        {/* Services */}
        {business.primaryServices.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5 list-none p-0">
            {business.primaryServices.slice(0, 4).map((service) => (
              <li
                key={service}
                className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
              >
                {service}
              </li>
            ))}
            {business.primaryServices.length > 4 && (
              <li className="text-[11px] text-slate-500 px-1 py-0.5">
                +{business.primaryServices.length - 4} more
              </li>
            )}
          </ul>
        )}

        {/* Proof */}
        <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            Standing in Barnsley
          </h4>
          <p className="text-slate-600 leading-relaxed text-[11px] m-0">{business.successProof}</p>
        </div>

        {/* Opportunity */}
        <div className="mt-2.5 bg-amber-50/60 rounded-lg p-3 border border-amber-200 text-xs">
          <h4 className="font-semibold text-amber-950 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
            Web opportunity
          </h4>
          <p className="text-amber-900 leading-relaxed text-[11px] m-0">{business.opportunityAngle}</p>
          {business.estimatedLostRevenuePerMonth && (
            <p className="text-[11px] text-amber-800 font-medium pt-1 mb-0">
              Directory estimate only: {business.estimatedLostRevenuePerMonth}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            aria-expanded={showNotes}
            aria-controls={notesId}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer transition-colors rounded"
          >
            <StickyNote
              className={`w-3.5 h-3.5 ${noteText ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`}
              aria-hidden="true"
            />
            <span>{showNotes ? 'Hide private notes' : noteText ? 'View private note' : 'Add private note'}</span>
            {noteText && !showNotes && (
              <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
            )}
          </button>

          <div id={notesId} hidden={!showNotes} className="mt-2 p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                <StickyNote className="w-3 h-3 text-amber-600" aria-hidden="true" />
                Private notes (saved in this browser only)
              </span>
              <span role="status" aria-live="polite">
                {noteSavedFeedback && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" aria-hidden="true" /> Saved
                  </span>
                )}
              </span>
            </div>

            <label htmlFor={`note-${business.id}`} className="sr-only">
              Private notes about {business.name}
            </label>
            <textarea
              id={`note-${business.id}`}
              value={noteText}
              onChange={(e) => handleSaveNote(e.target.value)}
              placeholder="e.g. Called Monday, spoke to John, asked for a price on 24/7 booking…"
              rows={3}
              className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-sans"
            />

            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
              <div className="flex flex-wrap gap-1">
                {NOTE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      handleSaveNote(noteText ? `${noteText} • ${suggestion}` : suggestion)
                    }
                    className="px-1.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>

              {noteText && (
                <button
                  type="button"
                  onClick={handleClearNote}
                  className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer px-1 py-1 rounded"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                  <span>Clear</span>
                  <span className="sr-only">notes for {business.name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${business.phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{business.phone}</span>
            <span className="sr-only">— call {business.name}</span>
          </a>

          <button
            type="button"
            onClick={() => void handleCopyLead()}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Copy business contact details and notes"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span className="sr-only">
              {copied ? 'Copied to clipboard' : `Copy contact details for ${business.name}`}
            </span>
          </button>

          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Open on Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">
              Open {business.name} on Google Maps (opens in a new tab)
            </span>
          </a>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            id={`btn-research-${business.id}`}
            onClick={() => onDeepResearch(business)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span>Research &amp; Brief</span>
            <span className="sr-only">for {business.name}</span>
          </button>

          <button
            type="button"
            id={`btn-pitch-${business.id}`}
            onClick={() => onGeneratePitch(business)}
            aria-busy={isGeneratingPitch}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <span>{isGeneratingPitch ? 'Preparing…' : 'Outreach Script'}</span>
            <span className="sr-only">for {business.name}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
