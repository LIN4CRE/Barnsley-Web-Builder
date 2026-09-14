import React from 'react';
import { Star, Phone, Sparkles, ExternalLink, MapPin } from 'lucide-react';
import { BusinessItem } from '../types';

interface BusinessTableViewProps {
  businesses: BusinessItem[];
  onGeneratePitch: (business: BusinessItem) => void;
  onDeepResearch: (business: BusinessItem) => void;
}

export const BusinessTableView: React.FC<BusinessTableViewProps> = ({
  businesses,
  onGeneratePitch,
  onDeepResearch,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Business Name & Sector</th>
              <th className="py-3 px-4">Location (Barnsley)</th>
              <th className="py-3 px-4">Reputation & Reviews</th>
              <th className="py-3 px-4">Telephone</th>
              <th className="py-3 px-4">Current Presence</th>
              <th className="py-3 px-4">Opportunity Score</th>
              <th className="py-3 px-4">Recommended Solution</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onDeepResearch(b)}
                    className="text-left font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Click to automatically research everything about this business"
                  >
                    <span>{b.name}</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </button>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{b.category}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">{b.statusTag}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-medium text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{b.area}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{b.postcode}</div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{b.rating}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{b.reviewsCount} reviews</div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <a
                    href={`tel:${b.phone}`}
                    className="font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{b.phone}</span>
                  </a>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                    No site ({b.onlinePresence})
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${b.opportunityScore}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-900">{b.opportunityScore}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="line-clamp-2 text-slate-600 text-[11px] leading-tight">
                    {b.recommendedPackage}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      id={`btn-table-research-${b.id}`}
                      onClick={() => onDeepResearch(b)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-2xs"
                      title="Automatically research everything and generate prompt"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Research & Prompt</span>
                    </button>
                    <button
                      onClick={() => onGeneratePitch(b)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      title="Outreach pitch"
                    >
                      <span>Script</span>
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${b.name} ${b.fullAddress}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
