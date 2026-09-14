import { ExternalLink, MapPin, Phone, Sparkles, Star, StickyNote } from 'lucide-react';
import { OUTREACH_STATUS_CLASSES } from '@/lib/constants';
import { OUTREACH_STATUSES } from '@/types';
import type { BusinessItem, OutreachStatus } from '@/types';

interface BusinessTableViewProps {
  businesses: readonly BusinessItem[];
  selectedIds: readonly string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onStatusChange: (id: string, status: OutreachStatus) => void;
  onGeneratePitch: (business: BusinessItem) => void;
  onDeepResearch: (business: BusinessItem) => void;
}

export function BusinessTableView({
  businesses,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onStatusChange,
  onGeneratePitch,
  onDeepResearch,
}: BusinessTableViewProps) {
  const allSelected =
    businesses.length > 0 && businesses.every((b) => selectedIds.includes(b.id));

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <caption className="sr-only">
            Barnsley businesses without a website, with outreach stage and actions
          </caption>

          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              {/* `scope="col"` was missing, so screen readers could not associate
                  cells with their headings. */}
              <th scope="col" className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  aria-label="Select all listed businesses"
                />
              </th>
              <th scope="col" className="py-3 px-4">Business name &amp; sector</th>
              <th scope="col" className="py-3 px-3">Outreach stage</th>
              <th scope="col" className="py-3 px-4">Location</th>
              <th scope="col" className="py-3 px-4">Reputation</th>
              <th scope="col" className="py-3 px-4">Telephone</th>
              <th scope="col" className="py-3 px-3">Opportunity</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {businesses.map((b) => {
              const isSelected = selectedIds.includes(b.id);
              const currentStatus: OutreachStatus = b.status ?? 'Not Contacted';
              const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${b.name} ${b.fullAddress}`,
              )}`;

              return (
                <tr
                  key={b.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(b.id)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                      aria-label={`Select ${b.name}`}
                    />
                  </td>

                  <th scope="row" className="py-3.5 px-4 font-normal">
                    <button
                      type="button"
                      onClick={() => onDeepResearch(b)}
                      className="text-left font-bold text-slate-900 text-sm hover:text-brand-700 transition-colors flex items-center gap-1 cursor-pointer rounded"
                    >
                      <span>{b.name}</span>
                      <Sparkles className="w-3 h-3 text-amber-500" aria-hidden="true" />
                      <span className="sr-only">Research and brief for {b.name}</span>
                    </button>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span>{b.category}</span>
                      <span aria-hidden="true">•</span>
                      <span className="text-emerald-700 font-medium">{b.statusTag}</span>
                      {b.notes && (
                        <span className="inline-flex items-center gap-0.5 text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                          <StickyNote className="w-2.5 h-2.5 fill-amber-400" aria-hidden="true" />
                          Note
                        </span>
                      )}
                    </div>
                  </th>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <label htmlFor={`table-status-${b.id}`} className="sr-only">
                      Outreach stage for {b.name}
                    </label>
                    <select
                      id={`table-status-${b.id}`}
                      value={currentStatus}
                      onChange={(e) => onStatusChange(b.id, e.target.value as OutreachStatus)}
                      className={`text-xs px-2 py-1.5 rounded-md border cursor-pointer focus:outline-none transition-colors ${OUTREACH_STATUS_CLASSES[currentStatus]}`}
                    >
                      {OUTREACH_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      <span>{b.area}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{b.postcode}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                      <span>{b.rating}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{b.reviewsCount} reviews</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <a
                      href={`tel:${b.phone.replace(/\s+/g, '')}`}
                      className="font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 rounded"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      <span>{b.phone}</span>
                      <span className="sr-only">— call {b.name}</span>
                    </a>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {/* The bar is decorative; the numeric value is exposed as text. */}
                      <div
                        className="w-10 bg-slate-100 rounded-full h-2 overflow-hidden"
                        aria-hidden="true"
                      >
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${b.opportunityScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900">
                        {b.opportunityScore}
                        <span className="sr-only"> out of 100</span>
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        id={`btn-table-research-${b.id}`}
                        onClick={() => onDeepResearch(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" aria-hidden="true" />
                        <span>Research</span>
                        <span className="sr-only">{b.name}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onGeneratePitch(b)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      >
                        <span>Script</span>
                        <span className="sr-only">for {b.name}</span>
                      </button>

                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="sr-only">
                          Open {b.name} on Google Maps (new tab)
                        </span>
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
}
