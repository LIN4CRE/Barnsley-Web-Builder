import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, ChevronDown, ChevronUp, Layers, TrendingUp, CheckCircle } from 'lucide-react';
import { BusinessItem, OutreachStatus } from '../types';

interface MarketAnalyticsChartsProps {
  businesses: BusinessItem[];
}

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#0284c7', '#9333ea', '#e11d48'];
const STATUS_COLORS: Record<OutreachStatus, string> = {
  'Not Contacted': '#94a3b8',
  'In Progress': '#f59e0b',
  'Lead': '#6366f1',
  'Closed': '#10b981',
};

export const MarketAnalyticsCharts: React.FC<MarketAnalyticsChartsProps> = ({ businesses }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'ratings' | 'pipeline'>('categories');

  // Sector distribution data
  const categoryData = useMemo(() => {
    const counts: Record<string, { count: number; totalScore: number }> = {};
    businesses.forEach((b) => {
      if (!counts[b.category]) {
        counts[b.category] = { count: 0, totalScore: 0 };
      }
      counts[b.category].count += 1;
      counts[b.category].totalScore += b.opportunityScore;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      avgOpportunityScore: Math.round(data.totalScore / data.count),
    })).sort((a, b) => b.count - a.count);
  }, [businesses]);

  // Average rating by category
  const ratingData = useMemo(() => {
    const ratings: Record<string, { totalRating: number; count: number; reviews: number }> = {};
    businesses.forEach((b) => {
      if (!ratings[b.category]) {
        ratings[b.category] = { totalRating: 0, count: 0, reviews: 0 };
      }
      ratings[b.category].totalRating += b.rating;
      ratings[b.category].count += 1;
      ratings[b.category].reviews += b.reviewsCount;
    });

    return Object.entries(ratings).map(([category, data]) => ({
      category: category.split('&')[0].trim(), // shorten label for chart axis
      fullCategory: category,
      avgRating: Number((data.totalRating / data.count).toFixed(2)),
      totalReviews: data.reviews,
      count: data.count,
    })).sort((a, b) => b.avgRating - a.avgRating);
  }, [businesses]);

  // Outreach pipeline data
  const pipelineData = useMemo(() => {
    const counts: Record<OutreachStatus, number> = {
      'Not Contacted': 0,
      'In Progress': 0,
      'Lead': 0,
      'Closed': 0,
    };

    businesses.forEach((b) => {
      const status: OutreachStatus = b.status || 'Not Contacted';
      if (counts[status] !== undefined) {
        counts[status] += 1;
      } else {
        counts['Not Contacted'] += 1;
      }
    });

    return (Object.keys(counts) as OutreachStatus[]).map((status) => ({
      name: status,
      value: counts[status],
      color: STATUS_COLORS[status],
    }));
  }, [businesses]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs mb-6 overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Barnsley Market Potential & Opportunity Distribution
            </h3>
            <p className="text-[11px] text-slate-500">
              Visual analytics across {businesses.length} high-reputation offline businesses in South Yorkshire
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'categories'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sector Breakdown
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'ratings'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ratings & Trust
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'pipeline'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Outreach Pipeline
              </button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title={isOpen ? 'Collapse charts' : 'Expand charts'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Charts Body */}
      {isOpen && (
        <div className="p-4 sm:p-6">
          {/* Mobile Tab switcher */}
          <div className="flex sm:hidden items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs mb-4">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-1 rounded-md text-center font-medium ${
                activeTab === 'categories' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Sectors
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`flex-1 py-1 rounded-md text-center font-medium ${
                activeTab === 'ratings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Ratings
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex-1 py-1 rounded-md text-center font-medium ${
                activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Pipeline
            </button>
          </div>

          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Business Count & Average Web Opportunity Score by Sector
                </span>
                <span className="text-[11px] text-slate-500">Highest concentration in Barnsley</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={45}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                              <p className="font-bold">{label}</p>
                              <p className="text-indigo-300">
                                Businesses: <strong className="text-white">{payload[0].value}</strong>
                              </p>
                              {payload[1] && (
                                <p className="text-emerald-300">
                                  Avg Opportunity Score: <strong className="text-white">{payload[1].value}/100</strong>
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar dataKey="count" name="Total Businesses" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgOpportunityScore" name="Avg Opportunity Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Average Google Rating (4.7★ - 5.0★) & Customer Reviews by Sector
                </span>
                <span className="text-[11px] text-slate-500">Demonstrating offline reputation</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis domain={[4.5, 5.0]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                              <p className="font-bold">{data.fullCategory}</p>
                              <p className="text-amber-300">
                                Average Rating: <strong className="text-white">{data.avgRating} ★</strong>
                              </p>
                              <p className="text-slate-300">
                                Total Public Reviews: <strong className="text-white">{data.totalReviews}</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="avgRating" name="Avg Google Rating" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg">
                              <span className="font-semibold">{data.name}:</span> {data.value} businesses
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status breakdown legend and metrics */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Outreach Funnel Progress</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {pipelineData.map((item) => (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Update statuses directly on business cards or using the bulk actions toolbar to advance prospects from &lsquo;Not Contacted&rsquo; into active &lsquo;Leads&rsquo; and &lsquo;Closed&rsquo; contracts.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
