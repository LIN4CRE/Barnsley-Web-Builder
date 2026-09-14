import React from 'react';
import { Search, LayoutGrid, Table, SlidersHorizontal, X } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (updated: Partial<FilterOptions>) => void;
  onReset: () => void;
  categories: string[];
  areas: string[];
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  resultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  categories,
  areas,
  viewMode,
  setViewMode,
  resultsCount,
}) => {
  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.category !== 'All' ||
    filters.area !== 'All' ||
    filters.onlinePresence !== 'All' ||
    filters.minRating > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs mb-6 space-y-3.5">
      {/* Search and View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="filter-search-input"
            type="text"
            value={filters.searchTerm}
            onChange={(e) => onChange({ searchTerm: e.target.value })}
            placeholder="Search business name, trade, road, or postcode (e.g. Mapplewell, pork pies, S70)..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all"
          />
          {filters.searchTerm && (
            <button
              onClick={() => onChange({ searchTerm: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              id="view-mode-table"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Prospect Table</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium pl-1">
            Showing <strong className="text-slate-800">{resultsCount}</strong> businesses
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3 h-3" /> Sector:
        </span>
        {['All', ...categories].map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange({ category: cat })}
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

      {/* Secondary dropdown filters */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-area-select" className="text-slate-500 font-medium">
            Barnsley Suburb:
          </label>
          <select
            id="filter-area-select"
            value={filters.area}
            onChange={(e) => onChange({ area: e.target.value })}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="All">All Barnsley Districts</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-presence-select" className="text-slate-500 font-medium">
            Current Setup:
          </label>
          <select
            id="filter-presence-select"
            value={filters.onlinePresence}
            onChange={(e) => onChange({ onlinePresence: e.target.value })}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="All">Any Presence Type</option>
            <option value="Facebook Only">Facebook Only</option>
            <option value="Phone & Word-of-Mouth">Phone & Word-of-Mouth</option>
            <option value="Market Counter & Footfall">Market Counter & Footfall</option>
            <option value="Directory Profile Only">Directory Profile Only</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-sort-select" className="text-slate-500 font-medium">
            Sort by:
          </label>
          <select
            id="filter-sort-select"
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as any })}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="score_desc">Opportunity Score (Highest)</option>
            <option value="rating_desc">Review Rating (Highest)</option>
            <option value="reviews_desc">Review Count (Most)</option>
            <option value="name_asc">Business Name (A-Z)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors font-medium cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
