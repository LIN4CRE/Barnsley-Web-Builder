import { useEffect, useId, useRef, useState } from 'react';
import { Copy, Check, Mail, Phone, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { Modal } from './Modal';
import type { BusinessItem, PitchProposal } from '@/types';

interface PitchModalProps {
  business: BusinessItem | null;
  pitch: PitchProposal | null;
  isLoading: boolean;
  source: 'ai' | 'template' | null;
  onClose: () => void;
  onRegenerate: (customNotes: string) => void;
}

type Tab = 'strategy' | 'email' | 'call';

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'strategy', label: 'Strategy' },
  { id: 'email', label: 'Email' },
  { id: 'call', label: 'Phone script' },
];

export function PitchModal({
  business,
  pitch,
  isLoading,
  source,
  onClose,
  onRegenerate,
}: PitchModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('strategy');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedCall, setCopiedCall] = useState(false);
  const [notes, setNotes] = useState('');

  const baseId = useId();
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const isOpen = business !== null;

  // Reset to the strategy tab whenever a different business is opened.
  useEffect(() => {
    if (business) setActiveTab('strategy');
  }, [business?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const copy = async (text: string, kind: 'email' | 'call') => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === 'email') setCopiedEmail(true);
      else setCopiedCall(true);

      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        setCopiedEmail(false);
        setCopiedCall(false);
      }, 2000);
    } catch {
      window.alert('Your browser blocked clipboard access. You can select the text and copy it manually.');
    }
  };

  if (!business) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={business.name}
      description={`${business.area}, Barnsley • ${business.rating}★ (${business.reviewsCount} reviews) • ${business.phone}`}
      className="max-w-2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label htmlFor={`${baseId}-notes`} className="sr-only">
              Add context to tailor the proposal
            </label>
            <input
              id={`${baseId}-notes`}
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: add context (e.g. 'spoke to the owner, they want online booking')"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button
              type="button"
              onClick={() => onRegenerate(notes)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Provenance banner — never present template output as AI output. */}
      {source === 'template' && !isLoading && (
        <div className="mx-5 mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <strong className="font-semibold">Offline template.</strong> No AI service was reachable,
          so this proposal was generated locally from the directory record. It contains no invented
          facts or figures — fill in the bracketed placeholders before sending.
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center" role="status" aria-live="polite">
          <div
            className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-semibold text-slate-800">
            Preparing the outreach proposal…
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Building the summary, email and call script for {business.name}.
          </p>
        </div>
      ) : (
        <>
          <div className="px-5 border-b border-slate-200 bg-white">
            <div role="tablist" aria-label="Proposal sections" className="flex gap-4 text-xs font-semibold">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${id}`}
                  aria-selected={activeTab === id}
                  aria-controls={`${baseId}-panel-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`py-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === id
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {activeTab === 'strategy' && pitch && (
              <div
                role="tabpanel"
                id={`${baseId}-panel-strategy`}
                aria-labelledby={`${baseId}-tab-strategy`}
                className="space-y-4"
              >
                <h3 className="text-base font-bold text-slate-900 font-display">{pitch.headline}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pitch.executiveSummary}</p>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    Where enquiries are being lost
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-5 text-sm text-slate-700">
                    {pitch.lostOpportunities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    What to propose
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-5 text-sm text-slate-700">
                    {pitch.recommendedSolutions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                    Projected return
                  </h4>
                  <p className="text-sm text-slate-700">{pitch.projectedRoi}</p>
                </div>
              </div>
            )}

            {activeTab === 'email' && pitch && (
              <div
                role="tabpanel"
                id={`${baseId}-panel-email`}
                aria-labelledby={`${baseId}-tab-email`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    Cold outreach email
                  </h3>
                  <button
                    type="button"
                    onClick={() => void copy(pitch.coldOutreachEmail, 'email')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">
                  {pitch.coldOutreachEmail}
                </pre>
              </div>
            )}

            {activeTab === 'call' && pitch && (
              <div
                role="tabpanel"
                id={`${baseId}-panel-call`}
                aria-labelledby={`${baseId}-tab-call`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    Phone script
                  </h3>
                  <button
                    type="button"
                    onClick={() => void copy(pitch.phoneCallScript, 'call')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {copiedCall ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">
                  {pitch.phoneCallScript}
                </pre>
                <p className="mt-3 text-[11px] text-slate-500">
                  Calling a business owner out of the blue? Keep it short, and check the
                  Telephone Preference Service rules before running a calling campaign.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {source === 'ai' && !isLoading && (
        <p className="px-5 pb-5 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          Generated by Gemini. Check the figures before you send them to anyone.
        </p>
      )}
    </Modal>
  );
}
