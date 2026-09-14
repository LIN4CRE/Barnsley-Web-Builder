import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Phone,
  Mail,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { BusinessItem, PitchProposal } from '../types';

interface PitchModalProps {
  business: BusinessItem | null;
  pitch: PitchProposal | null;
  isLoading: boolean;
  onClose: () => void;
  onRegenerate: (customNotes?: string) => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({
  business,
  pitch,
  isLoading,
  onClose,
  onRegenerate,
}) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'email' | 'call'>('strategy');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedCall, setCopiedCall] = useState(false);
  const [notes, setNotes] = useState('');

  if (!business) return null;

  const handleCopyEmail = () => {
    if (pitch?.coldOutreachEmail) {
      navigator.clipboard.writeText(pitch.coldOutreachEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyCall = () => {
    if (pitch?.phoneCallScript) {
      navigator.clipboard.writeText(pitch.phoneCallScript);
      setCopiedCall(true);
      setTimeout(() => setCopiedCall(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                AI Web Pitch & Outreach Pack
              </span>
              <span>•</span>
              <span>{business.area}, Barnsley</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">
              {business.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {business.rating}★ ({business.reviewsCount} reviews) • Direct phone: {business.phone}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'strategy'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Opportunity & Strategy</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'email'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Cold Outreach Email</span>
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'call'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>60-Sec Phone Script</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm text-slate-700">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-semibold text-slate-800">
                Generating tailored digital proposal for {business.name}...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Analyzing Barnsley local market dynamics, missed revenue opportunities, and high-conversion outreach copy.
              </p>
            </div>
          ) : pitch ? (
            <>
              {activeTab === 'strategy' && (
                <div className="space-y-4">
                  {/* Headline */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xs">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                      Core Value Proposition
                    </span>
                    <h3 className="text-base font-bold mt-1 text-white leading-snug">
                      "{pitch.headline}"
                    </h3>
                  </div>

                  {/* Summary */}
                  <div className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block font-semibold mb-1">
                      Executive Diagnosis:
                    </strong>
                    {pitch.executiveSummary}
                  </div>

                  {/* Opportunities lost vs Solutions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Current Revenue Leaks</span>
                      </div>
                      <ul className="space-y-1.5 text-rose-950/90 list-disc list-inside">
                        {pitch.lostOpportunities.map((item, idx) => (
                          <li key={idx} className="leading-tight">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Recommended Digital Solutions</span>
                      </div>
                      <ul className="space-y-1.5 text-emerald-950/90 list-disc list-inside">
                        {pitch.recommendedSolutions.map((item, idx) => (
                          <li key={idx} className="leading-tight">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Projected ROI */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-amber-800 font-semibold block">
                        Estimated 90-Day Impact:
                      </span>
                      <span className="text-amber-950 font-bold">{pitch.projectedRoi}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold shrink-0">
                      High Conv. Pitch
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Tailored Cold Outreach Email (Barnsley Tone)
                    </span>
                    <button
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? 'Copied to Clipboard' : 'Copy Email'}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed select-all">
                    {pitch.coldOutreachEmail}
                  </div>
                </div>
              )}

              {activeTab === 'call' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      60-Second Direct Phone Call Script
                    </span>
                    <button
                      onClick={handleCopyCall}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      {copiedCall ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCall ? 'Copied Script' : 'Copy Script'}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
                    {pitch.phoneCallScript}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                    <strong>Direct Call Tip:</strong> Call outside rush hours (e.g. 10:30am - 11:30am or 2:30pm - 3:30pm). Mention that you are local to South Yorkshire and saw their exceptional reviews.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center text-slate-500 text-sm">
              Click below to generate an AI proposal for this business.
            </div>
          )}
        </div>

        {/* Modal Footer with Regeneration input */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add custom angle (e.g. focus on Click & Collect or £250/mo retainer)..."
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onRegenerate(notes)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refining...' : 'Regenerate / Refine Pitch'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
