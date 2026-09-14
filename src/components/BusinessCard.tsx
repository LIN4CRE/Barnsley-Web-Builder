import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Star,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  TrendingUp,
  Globe,
  Share2,
  FileText,
  StickyNote,
  ChevronDown,
  Trash2,
  Save,
} from 'lucide-react';
import { BusinessItem, OutreachStatus } from '../types';

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

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  isSelected = false,
  onToggleSelect,
  onStatusChange,
  onNoteSave,
  onGeneratePitch,
  onDeepResearch,
  isGeneratingPitch,
}) => {
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(business.notes || '');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Sync note from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`barnsley_notes_${business.id}`);
      if (stored !== null) {
        setNoteText(stored);
      } else if (business.notes) {
        setNoteText(business.notes);
      }
    } catch {
      // ignore
    }
  }, [business.id, business.notes]);

  const handleSaveNote = (text: string) => {
    setNoteText(text);
    try {
      localStorage.setItem(`barnsley_notes_${business.id}`, text);
      if (onNoteSave) {
        onNoteSave(business.id, text);
      }
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleClearNote = () => {
    setNoteText('');
    try {
      localStorage.removeItem(`barnsley_notes_${business.id}`);
      if (onNoteSave) {
        onNoteSave(business.id, '');
      }
    } catch {
      // ignore
    }
  };

  const handleCopyLead = () => {
    const text = `Business: ${business.name}
Phone: ${business.phone}
Address: ${business.fullAddress}, ${business.postcode}
Category: ${business.category}
Rating: ${business.rating}★ (${business.reviewsCount} reviews)
Outreach Status: ${business.status || 'Not Contacted'}
Opportunity Angle: ${business.opportunityAngle}
${noteText ? `Private Notes: ${noteText}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: BusinessItem['statusTag']) => {
    switch (status) {
      case 'In-Demand Queues':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'High Reputation':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Community Landmark':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Established 20+ Yrs':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const currentOutreachStatus: OutreachStatus = business.status || 'Not Contacted';

  const getOutreachStatusBadge = (status: OutreachStatus) => {
    switch (status) {
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Lead':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Not Contacted':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300 font-medium';
    }
  };

  return (
    <div
      id={`business-card-${business.id}`}
      className={`bg-white rounded-xl border transition-all p-5 shadow-2xs hover:shadow-xs flex flex-col justify-between ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10' : 'border-slate-200'
      }`}
    >
      <div>
        {/* Top Selection & Outreach Status row */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {onToggleSelect && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(business.id)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-600">Select</span>
              </label>
            )}
          </div>

          {/* Outreach Status Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Status:</span>
            <select
              value={currentOutreachStatus}
              onChange={(e) => onStatusChange && onStatusChange(business.id, e.target.value as OutreachStatus)}
              className={`text-xs px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none transition-colors ${getOutreachStatusBadge(
                currentOutreachStatus
              )}`}
            >
              <option value="Not Contacted">Not Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Lead">Lead</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Top Header info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {business.category}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(
                  business.statusTag
                )}`}
              >
                {business.statusTag}
              </span>
              {business.yearsActive && (
                <span className="text-xs text-slate-600 font-medium">
                  {business.yearsActive}
                </span>
              )}
            </div>

            <button
              onClick={() => onDeepResearch(business)}
              className="text-left group cursor-pointer"
              title="Click to automatically research everything about this business"
            >
              <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <span>{business.name}</span>
                <Sparkles className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
            </button>
          </div>

          {/* Opportunity score badge (also clickable to research) */}
          <button
            onClick={() => onDeepResearch(business)}
            className="text-right shrink-0 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
            title="Click to research and generate website prompt"
          >
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-600">
              Web Opportunity
            </div>
            <div className="flex items-center justify-end gap-1 font-bold text-base text-slate-900">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{business.opportunityScore}</span>
              <span className="text-slate-600 text-xs font-normal">/100</span>
            </div>
          </button>
        </div>

        {/* Location & Rating row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="font-bold text-slate-900">{business.rating}</span>
            <span className="text-slate-600">({business.reviewsCount} reviews)</span>
          </div>

          <div className="flex items-center gap-1 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-medium text-slate-800">{business.area}</span>
            <span className="text-slate-600">({business.postcode})</span>
          </div>

          <div className="inline-flex items-center gap-1 font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            No Website ({business.onlinePresence})
          </div>
        </div>

        {/* Address */}
        <div className="mt-2 text-xs text-slate-700">
          {business.fullAddress}
        </div>

        {/* Services Badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {business.primaryServices.slice(0, 4).map((service, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
            >
              {service}
            </span>
          ))}
          {business.primaryServices.length > 4 && (
            <span className="text-[11px] text-slate-500 px-1 py-0.5">
              +{business.primaryServices.length - 4} more
            </span>
          )}
        </div>

        {/* Proof of Success */}
        <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Success & Standing in Barnsley:</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {business.successProof}
          </p>
        </div>

        {/* The Pitch Opportunity Angle */}
        <div className="mt-2.5 bg-amber-50/60 rounded-lg p-3 border border-amber-200 text-xs">
          <div className="font-semibold text-amber-950 flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Web Value Opportunity:</span>
          </div>
          <p className="text-amber-900 leading-relaxed text-[11px]">
            {business.opportunityAngle}
          </p>
          {business.estimatedLostRevenuePerMonth && (
            <div className="text-[11px] text-amber-800 font-medium pt-0.5">
              Estimated Missed Opportunity: {business.estimatedLostRevenuePerMonth}
            </div>
          )}
        </div>

        {/* Notes Feature Toggle and Drawer */}
        <div className="mt-3">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer transition-colors"
          >
            <StickyNote className={`w-3.5 h-3.5 ${noteText ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
            <span>{showNotes ? 'Hide Private Notes' : noteText ? 'View Private Note' : 'Add Private Note'}</span>
            {noteText && !showNotes && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          {showNotes && (
            <div className="mt-2 p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                  <StickyNote className="w-3 h-3 text-amber-600" />
                  <span>Private Outreach Notes (Saved Locally)</span>
                </span>
                {noteSavedFeedback && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 animate-pulse">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>

              <textarea
                value={noteText}
                onChange={(e) => handleSaveNote(e.target.value)}
                placeholder="Log notes: e.g. Called owner on Monday, asked for John, wants price estimate for 24/7 booking..."
                rows={3}
                className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-sans"
              />

              {/* Quick suggestion tags */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleSaveNote(noteText ? `${noteText} • Called owner` : 'Called owner')}
                    className="px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    + Called owner
                  </button>
                  <button
                    onClick={() => handleSaveNote(noteText ? `${noteText} • Left voicemail` : 'Left voicemail')}
                    className="px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    + Left voicemail
                  </button>
                  <button
                    onClick={() => handleSaveNote(noteText ? `${noteText} • Callback scheduled` : 'Callback scheduled')}
                    className="px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    + Callback
                  </button>
                </div>

                {noteText && (
                  <button
                    onClick={handleClearNote}
                    className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${business.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
            title={`Call ${business.phone}`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{business.phone}</span>
          </a>

          <button
            onClick={handleCopyLead}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Copy business contact details & notes"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${business.name} ${business.fullAddress}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Open on Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id={`btn-research-${business.id}`}
            onClick={() => onDeepResearch(business)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
            title="Automatically research everything about this business and generate a master website prompt"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Research & Prompt</span>
          </button>

          <button
            id={`btn-pitch-${business.id}`}
            onClick={() => onGeneratePitch(business)}
            disabled={isGeneratingPitch}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Generate sales outreach pitch and phone script"
          >
            <span>Outreach Script</span>
          </button>
        </div>
      </div>
    </div>
  );
};
