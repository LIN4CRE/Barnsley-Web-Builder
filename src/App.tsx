/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Search, Sparkles } from 'lucide-react';

import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { MarketAnalyticsCharts } from './components/MarketAnalyticsCharts';
import { FilterBar } from './components/FilterBar';
import { BusinessCard } from './components/BusinessCard';
import { BusinessTableView } from './components/BusinessTableView';
import { PitchModal } from './components/PitchModal';
import { AiScannerModal } from './components/AiScannerModal';
import { AddBusinessModal } from './components/AddBusinessModal';
import { DeepResearchModal } from './components/DeepResearchModal';
import { BulkActionsToolbar } from './components/BulkActionsToolbar';
import { LiveRegion } from './components/Modal';

import { useBusinesses } from './hooks/useBusinesses';
import { generatePitch, isBackendAvailable, resetBackendProbe } from './lib/api';
import { DEFAULT_FILTERS, STORAGE_KEYS } from './lib/constants';
import { downloadTextFile, timestampedFilename, toCsv } from './lib/csv';
import { collectAreas, collectCategories, computeMetrics, filterBusinesses, hasActiveFilters } from './lib/filters';
import { loadValue, saveValue } from './lib/storage';
import type { BusinessItem, FilterOptions, OutreachStatus, PitchProposal } from './types';

const BulkPitchModal = lazy(() =>
  import('./components/BulkPitchModal').then((m) => ({ default: m.BulkPitchModal })),
);

const CSV_HEADERS = [
  'Business Name',
  'Sector',
  'Outreach Stage',
  'Area',
  'Full Address',
  'Postcode',
  'Telephone',
  'Rating',
  'Reviews Count',
  'Status Tag',
  'Current Presence',
  'Opportunity Score (1-100)',
  'Recommended Package',
  'Estimated Missed Monthly Revenue',
  'Private Notes',
  'Proof of Success',
  'Why No Website',
  'Pitch Opportunity Angle',
] as const;

type ViewMode = 'grid' | 'table';

export default function App() {
  const {
    businesses,
    dataSource,
    addBusinesses,
    updateStatus,
    bulkUpdateStatus,
    updateNote,
    customCount,
  } = useBusinesses();

  const [viewMode, setViewMode] = useState<ViewMode>(
    () => loadValue<ViewMode>(STORAGE_KEYS.viewMode, 'grid'),
  );

  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkPitchOpen, setIsBulkPitchOpen] = useState(false);

  const [activePitchBusiness, setActivePitchBusiness] = useState<BusinessItem | null>(null);
  const [currentPitch, setCurrentPitch] = useState<PitchProposal | null>(null);
  const [isPitchLoading, setIsPitchLoading] = useState(false);
  const [pitchSource, setPitchSource] = useState<'ai' | 'template' | null>(null);

  const [activeResearchBusiness, setActiveResearchBusiness] = useState<BusinessItem | null>(null);
  const [isResearchOpen, setIsResearchOpen] = useState(false);

  const [announcement, setAnnouncement] = useState('');
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  /* ---- Backend availability is only known after the first request settles ---- */
  useEffect(() => {
    if (dataSource !== 'loading') {
      setBackendUnavailable(isBackendAvailable() === false);
    }
  }, [dataSource]);

  useEffect(() => {
    resetBackendProbe();
  }, []);

  useEffect(() => {
    saveValue(STORAGE_KEYS.viewMode, viewMode);
  }, [viewMode]);

  /* ---------------------------- Derived data ---------------------------- */

  const categories = useMemo(() => collectCategories(businesses), [businesses]);
  const areas = useMemo(() => collectAreas(businesses), [businesses]);
  const metrics = useMemo(() => computeMetrics(businesses), [businesses]);
  const filtered = useMemo(() => filterBusinesses(businesses, filters), [businesses, filters]);
  const filtersActive = useMemo(() => hasActiveFilters(filters, DEFAULT_FILTERS), [filters]);

  const selectedBusinesses = useMemo(
    () => businesses.filter((b) => selectedIds.includes(b.id)),
    [businesses, selectedIds],
  );

  /* ------------------------------ Handlers ------------------------------ */

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(filtered.map((b) => b.id));
    setAnnouncement(`Selected all ${filtered.length} businesses.`);
  }, [filtered]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setAnnouncement('Selection cleared.');
  }, []);

  const handleStatusChange = useCallback(
    (id: string, status: OutreachStatus) => updateStatus(id, status),
    [updateStatus],
  );

  const handleBulkStatusChange = useCallback(
    (status: OutreachStatus) => {
      bulkUpdateStatus(selectedIds, status);
      setAnnouncement(`Set ${selectedIds.length} businesses to ${status}.`);
    },
    [bulkUpdateStatus, selectedIds],
  );

  const handleNoteSave = useCallback(
    (id: string, note: string) => updateNote(id, note),
    [updateNote],
  );

  const handleFilterChange = useCallback((updated: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setAnnouncement('Filters cleared.');
  }, []);

  /* ------------------------------- Export ------------------------------- */

  const handleExportCsv = useCallback(
    (onlySelected: boolean) => {
      const target = onlySelected && selectedIds.length > 0 ? selectedBusinesses : filtered;

      if (target.length === 0) {
        setAnnouncement('Nothing to export.');
        return;
      }

      const rows = target.map((b) => [
        b.name,
        b.category,
        b.status ?? 'Not Contacted',
        b.area,
        b.fullAddress,
        b.postcode,
        b.phone,
        b.rating,
        b.reviewsCount,
        b.statusTag,
        b.onlinePresence,
        b.opportunityScore,
        b.recommendedPackage,
        b.estimatedLostRevenuePerMonth ?? '',
        b.notes ?? '',
        b.successProof,
        b.whyNoWebsite,
        b.opportunityAngle,
      ]);

      const csv = toCsv(CSV_HEADERS, rows);
      const filename = onlySelected
        ? timestampedFilename(`barnsley_selected_${target.length}_businesses`, 'csv')
        : timestampedFilename('barnsley_offline_businesses_prospects', 'csv');

      downloadTextFile(filename, csv, 'text/csv');
      setAnnouncement(`Exported ${target.length} businesses to CSV.`);
    },
    [filtered, selectedBusinesses, selectedIds],
  );

  /* -------------------------------- Pitch -------------------------------- */

  const handleOpenPitch = useCallback(
    async (business: BusinessItem, customNotes = '') => {
      setActivePitchBusiness(business);
      setIsPitchLoading(true);
      setCurrentPitch(null);

      const result = await generatePitch(business, customNotes);

      setIsPitchLoading(false);
      setCurrentPitch(result.data);
      setPitchSource(result.source);
      setBackendUnavailable(result.source === 'template');
    },
    [],
  );

  /* ------------------------------ Research ------------------------------- */

  const handleOpenResearch = useCallback((business: BusinessItem) => {
    setActiveResearchBusiness(business);
    setIsResearchOpen(true);
  }, []);

  /* ------------------------------- Adding -------------------------------- */

  const handleAddBusinesses = useCallback(
    (items: readonly BusinessItem[]) => {
      const added = addBusinesses(items);
      setAnnouncement(
        added === 0
          ? 'Those businesses are already in the directory.'
          : `${added} business${added === 1 ? '' : 'es'} added.`,
      );
      return added;
    },
    [addBusinesses],
  );

  /* -------------------------------- Render ------------------------------- */

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-24">
      <LiveRegion message={announcement} />

      <Header
        totalCount={businesses.length}
        customCount={customCount}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCsv={() => handleExportCsv(false)}
        backendUnavailable={backendUnavailable}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 outline-none"
      >
        {/* Context banner */}
        <section
          aria-labelledby="context-heading"
          className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl space-y-2">
            <p className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold m-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              South Yorkshire local market research
            </p>

            <h2
              id="context-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display"
            >
              Established Barnsley businesses trading entirely offline
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed m-0">
              Across Barnsley and the surrounding South Yorkshire districts, plenty of
              well-regarded butchers, garages, tradespeople and market traders still run on
              word-of-mouth, footfall and a Facebook page. Their diaries are full — but they
              miss after-hours enquiries, and younger customers who search before they buy
              never find them.
            </p>
          </div>

          <ul className="relative mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 list-none p-0">
            {[
              'Public review ratings recorded for every entry',
              'Direct phone and address details where available',
              'Outreach stage and private notes tracked locally',
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <MetricsBar metrics={metrics} />

        <MarketAnalyticsCharts businesses={businesses} />

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          categories={categories}
          areas={areas}
          viewMode={viewMode}
          setViewMode={setViewMode}
          resultsCount={filtered.length}
          hasActiveFilters={filtersActive}
        />

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8 shadow-2xs space-y-3">
            <div
              className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400"
              aria-hidden="true"
            >
              <Search className="w-6 h-6" />
            </div>

            <h2 className="text-base font-bold text-slate-800 m-0">
              {businesses.length === 0
                ? 'Loading the directory…'
                : 'No businesses match those filters'}
            </h2>

            <p className="text-sm text-slate-500 max-w-md mx-auto m-0">
              {businesses.length === 0
                ? 'Reading the bundled directory data.'
                : 'Try widening your search, or add a business you already know about.'}
            </p>

            {businesses.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Add a business
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                isSelected={selectedIds.includes(business.id)}
                onToggleSelect={handleToggleSelect}
                onStatusChange={handleStatusChange}
                onNoteSave={handleNoteSave}
                onDeepResearch={handleOpenResearch}
                onGeneratePitch={(b) => void handleOpenPitch(b)}
                isGeneratingPitch={isPitchLoading && activePitchBusiness?.id === business.id}
              />
            ))}
          </div>
        ) : (
          <BusinessTableView
            businesses={filtered}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onStatusChange={handleStatusChange}
            onDeepResearch={handleOpenResearch}
            onGeneratePitch={(b) => void handleOpenPitch(b)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="m-0">
              <span className="font-semibold text-slate-700">
                Barnsley Offline Businesses Directory
              </span>{' '}
              • Barnsley &amp; South Yorkshire
            </p>

            <nav aria-label="Footer links">
              <ul className="flex items-center gap-3 list-none p-0 m-0">
                <li>
                  <a
                    href="https://github.com/LIN4CRE/Barnsley-Web-Builder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-700 hover:text-brand-800 font-medium"
                  >
                    Source &amp; docs
                  </a>
                </li>
                <li aria-hidden="true">•</li>
                <li>
                  <button
                    type="button"
                    onClick={() => void handleExportCsv(false)}
                    className="text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Export all CSV
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <p className="m-0 text-[11px] leading-relaxed max-w-3xl">
            Directory entries are research notes compiled from publicly available information.
            Ratings and review counts are a snapshot taken when each entry was added and can
            change. Check details directly with a business before contacting it. Outreach status
            and notes are stored only in your browser.
          </p>
        </div>
      </footer>

      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        totalCount={filtered.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onExportSelectedCsv={() => handleExportCsv(true)}
        onOpenBulkPitch={() => setIsBulkPitchOpen(true)}
        onBulkStatusChange={handleBulkStatusChange}
      />

      {/* Modals */}
      <PitchModal
        business={activePitchBusiness}
        pitch={currentPitch}
        isLoading={isPitchLoading}
        source={pitchSource}
        onClose={() => {
          setActivePitchBusiness(null);
          setCurrentPitch(null);
        }}
        onRegenerate={(notes) => {
          if (activePitchBusiness) void handleOpenPitch(activePitchBusiness, notes);
        }}
      />

      <AiScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddBusinesses={handleAddBusinesses}
        backendUnavailable={backendUnavailable}
      />

      <AddBusinessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(b) => {
          void handleAddBusinesses([b]);
        }}
      />

      <DeepResearchModal
        business={activeResearchBusiness}
        isOpen={isResearchOpen}
        onClose={() => {
          setIsResearchOpen(false);
          setActiveResearchBusiness(null);
        }}
      />

      {isBulkPitchOpen && (
        <Suspense fallback={null}>
          <BulkPitchModal
            businesses={selectedBusinesses}
            isOpen={isBulkPitchOpen}
            onClose={() => setIsBulkPitchOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
