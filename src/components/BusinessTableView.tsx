import React from 'react';
import { Star, Phone, Sparkles, ExternalLink, MapPin, StickyNote, Check } from 'lucide-react';
import { BusinessItem, OutreachStatus } from '../types';

interface BusinessTableViewProps {
  businesses: BusinessItem[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onStatusChange?: (id: string, status: OutreachStatus) => void;
  onGeneratePitch: (business: BusinessItem) => void;
  onDeepResearch: (business: BusinessItem) => void;
}

export const BusinessTableView: React.FC<BusinessTableViewProps> = ({
  businesses,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onStatusChange,
  onGeneratePitch,
  onDeepResearch,
}) => {
  const allSelected = businesses.length > 0 && selectedIds.length === businesses.length;

  const getStatusBadge = (status: OutreachStatus) => {
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              {onToggleSelect && (
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    title="Select / Deselect All"
                  />
                </th>
              )}
              <th className="py-3 px-4">Business Name & Sector</th>
              <th className="py-3 px-3">Outreach Status</th>
              <th className="py-3 px-4">Location (Barnsley)</th>
              <th className="py-3 px-4">Reputation & Reviews</th>
              <th className="py-3 px-4">Telephone</th>
              <th className="py-3 px-3">Opportunity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((b) => {
              const isSelected = selectedIds.includes(b.id);
              const currentStatus: OutreachStatus = b.status || 'Not Contacted';

              return (
                <tr
                  key={b.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-indigo-50/20' : ''
                  }`}
                >
                  {onToggleSelect && (
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(b.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  )}
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
                      {b.notes && (
                        <span className="inline-flex items-center gap-0.5 text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                          <StickyNote className="w-2.5 h-2.5 fill-amber-400" /> Note
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Outreach Status Selector */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        onStatusChange && onStatusChange(b.id, e.target.value as OutreachStatus)
                      }
                      className={`text-xs px-2 py-1 rounded-md border cursor-pointer focus:outline-none transition-colors ${getStatusBadge(
                        currentStatus
                      )}`}
                    >
                      <option value="Not Contacted">Not Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Lead">Lead</option>
                      <option value="Closed">Closed</option>
                    </select>
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

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${b.opportunityScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-900">{b.opportunityScore}</span>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
