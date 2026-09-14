import { PhoneCall, Star, TrendingUp, Zap } from 'lucide-react';
import type { DirectoryMetrics } from '@/lib/filters';
import { HIGH_OPPORTUNITY_THRESHOLD } from '@/lib/constants';

interface MetricsBarProps {
  metrics: DirectoryMetrics;
}

interface MetricCardProps {
  label: string;
  value: string;
  suffix?: string;
  footnote: string;
  icon: React.ReactNode;
  iconClassName: string;
}

function MetricCard({ label, value, suffix, footnote, icon, iconClassName }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconClassName}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {suffix && <span className="text-xs text-slate-500 font-medium">{suffix}</span>}
      </div>

      <div className="text-xs text-slate-500 mt-1">{footnote}</div>
    </div>
  );
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  const { total, averageRating, totalReviews, highOpportunityCount, withPhoneCount, distinctAreaCount } =
    metrics;

  return (
    <section aria-labelledby="metrics-heading" className="mb-6">
      <h2 id="metrics-heading" className="sr-only">
        Directory summary
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="In directory"
          value={String(total)}
          suffix="no website"
          footnote={`Across ${distinctAreaCount} Barnsley ${distinctAreaCount === 1 ? 'area' : 'areas'}`}
          icon={<TrendingUp className="w-4 h-4" />}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <MetricCard
          label="Average rating"
          value={total === 0 ? '—' : `${averageRating.toFixed(1)}★`}
          suffix="public reviews"
          footnote={`${totalReviews.toLocaleString('en-GB')} reviews across the list`}
          icon={<Star className="w-4 h-4 fill-amber-400 text-amber-500" />}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <MetricCard
          label="High opportunity"
          value={String(highOpportunityCount)}
          suffix={`Score ${HIGH_OPPORTUNITY_THRESHOLD}+/100`}
          footnote="Scored from the directory criteria"
          icon={<Zap className="w-4 h-4" />}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <MetricCard
          label="Phone contact"
          value={`${withPhoneCount} / ${total}`}
          suffix="have a number"
          footnote="Direct landlines and mobiles where recorded"
          icon={<PhoneCall className="w-4 h-4" />}
          iconClassName="bg-purple-50 text-purple-600"
        />
      </div>
    </section>
  );
}
