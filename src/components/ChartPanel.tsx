/**
 * Charting panel — the only module that imports Recharts, so it can be
 * code-split away from the initial bundle.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { OUTREACH_STATUSES } from '@/types';
import type { OutreachStatus } from '@/types';

const CATEGORY_COLOURS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#0284c7', '#9333ea', '#e11d48'];

const STATUS_COLOURS: Record<OutreachStatus, string> = {
  'Not Contacted': '#94a3b8',
  'In Progress': '#f59e0b',
  Lead: '#6366f1',
  Closed: '#10b981',
};

const AXIS_TICK = { fontSize: 11, fill: '#475569' } as const;

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
} as const;

export interface ChartPanelProps {
  activeTab: 'categories' | 'ratings' | 'pipeline';
  categoryData: readonly { name: string; count: number; avgOpportunityScore: number }[];
  ratingData: readonly { name: string; avgRating: number; reviews: number }[];
  pipelineData: readonly { name: string; value: number }[];
}

export default function ChartPanel({
  activeTab,
  categoryData,
  ratingData,
  pipelineData,
}: ChartPanelProps) {
  return (
    <div className="h-[280px] w-full">
      {activeTab === 'categories' && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...categoryData]} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={AXIS_TICK} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={AXIS_TICK} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: unknown, name: unknown): [string, string] =>
                name === 'count'
                  ? [`${String(value)} businesses`, 'Businesses']
                  : [`${String(value)}/100`, 'Avg. score']
              }
            />
            <Bar dataKey="count" name="count" radius={[4, 4, 0, 0]}>
              {categoryData.map((entry, index) => (
                <Cell key={entry.name} fill={CATEGORY_COLOURS[index % CATEGORY_COLOURS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {activeTab === 'ratings' && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...ratingData]} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={AXIS_TICK} interval={0} angle={-20} textAnchor="end" height={60} />
            {/* Ratings cluster in a narrow band; starting the axis at 4 exaggerates
                the differences, so it starts at zero. */}
            <YAxis tick={AXIS_TICK} domain={[0, 5]} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: unknown): [string, string] => [`${String(value)}★`, 'Average rating']}
            />
            <Bar dataKey="avgRating" name="avgRating" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {activeTab === 'pipeline' && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[...pipelineData]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, value }: { name?: string; value?: number }) =>
                `${name ?? ''}: ${value ?? 0}`
              }
              labelLine={false}
            >
              {pipelineData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    STATUS_COLOURS[(OUTREACH_STATUSES as readonly string[]).includes(entry.name)
                      ? (entry.name as OutreachStatus)
                      : 'Not Contacted']
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: unknown): [string, string] => [
                `${String(value)} businesses`,
                'Count',
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
