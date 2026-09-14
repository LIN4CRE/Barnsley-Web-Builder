import { LayoutGrid, Search, SlidersHorizontal, Table, X } from 'lucide-react';
import { ALL, SORT_LABELS } from '@/lib/constants';
import { ONLINE_PRESENCE_TYPES, OUTREACH_STATUSES, SORT_OPTIONS } from '@/types';
import type { FilterOptions, SortOption } from '@/types';

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (updated: Partial<FilterOptions>) => void;
  onReset: () => void;
  categories: readonly string[];
  areas: readonly string[];
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  resultsCount: number;
  hasActiveFilters: boolean;
}

const selectClasses =
  'py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-600';

export function FilterBar({
  filters,
  onChange,
  onReset,
  categories,
  areas,
  viewMode,
  setViewMode,
  resultsCount,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <section
      aria-labelledby="filter-heading"
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs mb-6 space-y-3.5"
    >
      <h2 id="filter-heading" className="sr-only">
        Search and filter the directory
      </h2>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />

          {/* A placeholder is not a label: it disappears as soon as the user types
              and is not reliably announced. WCAG 1.3.1 / 4.1.2. */}
          <label htmlFor="filter-search-input" className="sr-only">
            Search businesses by name, trade, road or postcode
          </label>
          <input
            id="filter-search-input"
            type="search"
            value={filters.searchTerm}
            onChange={(e) => onChange({ searchTerm: e.target.value })}
            placeholder="Search name, trade, road or postcode (e.g. Mapplewell, pork pies, S70)..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all"
          />

          {filters.searchTerm && (
            <button
              type="button"
              onClick={() => onChange({ searchTerm: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div
            role="group"
            aria-label="Choose how results are displayed"
            className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs"
          >
            <button
              type="button"
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              id="view-mode-table"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Prospect Table</span>
            </button>
          </div>

          {/* Announced to screen readers whenever the result set changes. WCAG 4.1.3. */}
          <div className="text-xs text-slate-500 font-medium pl-1" role="status" aria-live="polite">
            <span className="sr-only sm:not-sr-only">Showing </span>
            <strong className="text-slate-800">{resultsCount}</strong>
            <span className="sr-only sm:not-sr-only"> businesses</span>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div
        role="group"
        aria-label="Filter by sector"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none"
      >
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3 h-3" aria-hidden="true" />
          Sector:
        </span>

        {[ALL, ...categories].map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ category: cat })}
              aria-pressed={isActive}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-area-select" className="text-slate-500 font-medium">
            Barnsley area
          </label>
          <select
            id="filter-area-select"
            value={filters.area}
            onChange={(e) => onChange({ area: e.target.value })}
            className={selectClasses}
          >
            <option value={ALL}>All Barnsley areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-presence-select" className="text-slate-500 font-medium">
            Current setup
          </label>
          <select
            id="filter-presence-select"
            value={filters.onlinePresence}
            onChange={(e) => onChange({ onlinePresence: e.target.value })}
            className={selectClasses}
          >
            <option value={ALL}>Any presence type</option>
            {ONLINE_PRESENCE_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-outreach-select" className="text-slate-500 font-medium">
            Outreach stage
          </label>
          <select
            id="filter-outreach-select"
            value={filters.outreachStatus}
            onChange={(e) => onChange({ outreachStatus: e.target.value })}
            className={selectClasses}
          >
            <option value={ALL}>All stages</option>
            {OUTREACH_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-rating-select" className="text-slate-500 font-medium">
            Minimum rating
          </label>
          <select
            id="filter-rating-select"
            value={filters.minRating}
            onChange={(e) => onChange({ minRating: Number(e.target.value) })}
            className={selectClasses}
          >
            <option value={0}>Any rating</option>
            <option value={4.5}>4.5★ and above</option>
            <option value={4.7}>4.7★ and above</option>
            <option value={4.9}>4.9★ and above</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-sort-select" className="text-slate-500 font-medium">
            Sort by
          </label>
          <select
            id="filter-sort-select"
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as SortOption })}
            className={selectClasses}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-700 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors font-medium cursor-pointer border border-red-200"
          >
            <X className="w-3 h-3" aria-hidden="true" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </section>
  );
}
