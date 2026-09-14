import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { BusinessItem } from '../types';

interface BusinessCardProps {
  business: BusinessItem;
  onGeneratePitch: (business: BusinessItem) => void;
  onDeepResearch: (business: BusinessItem) => void;
  isGeneratingPitch: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onGeneratePitch,
  onDeepResearch,
  isGeneratingPitch,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLead = () => {
    const text = `Business: ${business.name}
Phone: ${business.phone}
Address: ${business.fullAddress}, ${business.postcode}
Category: ${business.category}
Rating: ${business.rating}★ (${business.reviewsCount} reviews)
Opportunity Angle: ${business.opportunityAngle}`;

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

  return (
    <div
      id={`business-card-${business.id}`}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
    >
      <div>
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

        {/* Primary services badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {business.primaryServices.slice(0, 4).map((service, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
            >
              {service}
            </span>
          ))}
          {business.primaryServices.length > 4 && (
            <span className="text-[11px] font-medium text-slate-600 px-1 py-0.5">
              +{business.primaryServices.length - 4} more
            </span>
          )}
        </div>

        {/* Success Proof Box */}
        <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs">
          <div className="flex items-start gap-1.5 text-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-emerald-950">Proven Local Success: </strong>
              <span className="text-emerald-900/90 leading-relaxed">{business.successProof}</span>
            </div>
          </div>
        </div>

        {/* Why No Website & Missed Angle */}
        <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
          <div className="text-slate-600">
            <strong className="text-slate-700 font-semibold">Why No Website: </strong>
            <span>{business.whyNoWebsite}</span>
          </div>

          <div className="text-slate-700 pt-1.5 border-t border-slate-200">
            <strong className="text-slate-900 font-semibold">Website Opportunity Angle: </strong>
            <span className="text-slate-700 font-medium leading-relaxed">{business.opportunityAngle}</span>
          </div>

          {business.estimatedLostRevenuePerMonth && (
            <div className="text-[11px] text-amber-800 font-medium pt-0.5">
              Estimated Missed Opportunity: {business.estimatedLostRevenuePerMonth}
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
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Copy business contact details"
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
