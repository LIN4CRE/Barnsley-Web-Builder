import React from 'react';
import { Star, PhoneCall, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { BusinessItem } from '../types';

interface MetricsBarProps {
  businesses: BusinessItem[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ businesses }) => {
  const total = businesses.length;
  const avgRating = (
    businesses.reduce((acc, b) => acc + b.rating, 0) / (total || 1)
  ).toFixed(1);

  const highOpportunityCount = businesses.filter((b) => b.opportunityScore >= 90).length;
  const phoneReadyCount = businesses.filter((b) => Boolean(b.phone)).length;
  const totalReviews = businesses.reduce((acc, b) => acc + b.reviewsCount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Identified
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {total}
          </span>
          <span className="text-xs text-slate-500 font-medium">100% no website</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Across 8 Barnsley boroughs</div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Average Reputation
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {avgRating}★
          </span>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            Proven Trust
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-1">{totalReviews.toLocaleString()} verified customer reviews</div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            High Opportunity
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {highOpportunityCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Score 90+/100
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Immediate revenue/automation gain</div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Direct Phone Reach
          </span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {phoneReadyCount} / {total}
          </span>
          <span className="text-xs text-emerald-600 font-medium">100% reachable</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Direct local landlines & mobiles</div>
      </div>
    </div>
  );
};
