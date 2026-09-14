import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { OUTREACH_STATUSES } from '@/types';
import type { BusinessItem, OutreachStatus } from '@/types';

/**
 * Recharts is ~300 kB of the bundle and is only needed once this panel is on
 * screen, so it is code-split and mounted lazily on intersection.
 */
const ChartPanel = lazy(() => import('./ChartPanel'));

interface MarketAnalyticsChartsProps {
  businesses: readonly BusinessItem[];
}

type Tab = 'categories' | 'ratings' | 'pipeline';

const TABS: readonly { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'categories', label: 'Sectors', icon: BarChart3 },
  { id: 'ratings', label: 'Reputation', icon: TrendingUp },
  { id: 'pipeline', label: 'Outreach pipeline', icon: PieIcon },
];

export function MarketAnalyticsCharts({ businesses }: MarketAnalyticsChartsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('categories');
  const [shouldLoadCharts, setShouldLoadCharts] = useState(false);

  const containerRef = useRef<HTMLElement>(null);

  // Only fetch the charting bundle once the panel is close to the viewport.
  useEffect(() => {
    if (!isOpen || shouldLoadCharts) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadCharts(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoadCharts(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isOpen, shouldLoadCharts]);

  /* ---------------------------------------------------------------- */
  /* Derived data — pure, and also used for the accessible table      */
  /* ---------------------------------------------------------------- */

  const categoryData = useMemo(() => {
    const counts = new Map<string, { count: number; totalScore: number }>();
    businesses.forEach((b) => {
      const entry = counts.get(b.category) ?? { count: 0, totalScore: 0 };
      entry.count += 1;
      entry.totalScore += b.opportunityScore;
      counts.set(b.category, entry);
    });

    return Array.from(counts, ([name, d]) => ({
      name,
      count: d.count,
      avgOpportunityScore: Math.round(d.totalScore / d.count),
    })).sort((a, b) => b.count - a.count);
  }, [businesses]);

  const ratingData = useMemo(() => {
    const ratings = new Map<string, { total: number; count: number; reviews: number }>();
    businesses.forEach((b) => {
      const entry = ratings.get(b.category) ?? { total: 0, count: 0, reviews: 0 };
      entry.total += b.rating;
      entry.count += 1;
      entry.reviews += b.reviewsCount;
      ratings.set(b.category, entry);
    });

    return Array.from(ratings, ([name, d]) => ({
      name,
      avgRating: Math.round((d.total / d.count) * 100) / 100,
      reviews: d.reviews,
    })).sort((a, b) => b.avgRating - a.avgRating);
  }, [businesses]);

  const pipelineData = useMemo(() => {
    const counts = new Map<OutreachStatus, number>(OUTREACH_STATUSES.map((s) => [s, 0]));
    businesses.forEach((b) => {
      const status = b.status ?? 'Not Contacted';
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });

    return OUTREACH_STATUSES.map((status) => ({ name: status, value: counts.get(status) ?? 0 }));
  }, [businesses]);

  /* ---------------------------------------------------------------- */

  return (
    <section
      ref={containerRef}
      aria-labelledby="analytics-heading"
      className="bg-white rounded-xl border border-slate-200 shadow-2xs mb-6 overflow-hidden"
    >
      <h2 id="analytics-heading">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="analytics-panel"
          className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <span className="text-sm font-bold text-slate-900 font-display">Market breakdown</span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">
              Sector spread, reputation and your outreach pipeline
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <span className="hidden sm:inline">{isOpen ? 'Hide' : 'Show'}</span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </span>
        </button>
      </h2>

      <div id="analytics-panel" hidden={!isOpen}>
        <div className="px-4 pb-4">
          <div role="tablist" aria-label="Chart type" className="flex flex-wrap gap-1.5 mb-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`chart-tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`chart-panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`chart-panel-${activeTab}`}
            aria-labelledby={`chart-tab-${activeTab}`}
          >
            {shouldLoadCharts ? (
              <Suspense
                fallback={
                  <div
                    className="h-[280px] w-full rounded-lg bg-slate-100 skeleton"
                    role="status"
                    aria-label="Loading chart"
                  />
                }
              >
                <ChartPanel
                  activeTab={activeTab}
                  categoryData={categoryData}
                  ratingData={ratingData}
                  pipelineData={pipelineData}
                />
              </Suspense>
            ) : (
              <div
                className="h-[280px] w-full rounded-lg bg-slate-100 skeleton"
                role="status"
                aria-label="Loading chart"
              />
            )}

            {/* Charts are inaccessible to screen readers on their own, so the same
                numbers are always published as a real table. WCAG 1.1.1. */}
            <table className="sr-only">
              <caption>
                {activeTab === 'categories' && 'Businesses by sector, with average opportunity score'}
                {activeTab === 'ratings' && 'Average rating and review count by sector'}
                {activeTab === 'pipeline' && 'Businesses by outreach stage'}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Value</th>
                  <th scope="col">Secondary</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'categories'
                  ? categoryData.map((d) => [d.name, `${d.count} businesses`, `${d.avgOpportunityScore}/100`] as const)
                  : activeTab === 'ratings'
                    ? ratingData.map((d) => [d.name, `${d.avgRating}★`, `${d.reviews} reviews`] as const)
                    : pipelineData.map((d) => [d.name, `${d.value} businesses`, ''] as const)
                ).map(([name, value, secondary]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td>{value}</td>
                    <td>{secondary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
