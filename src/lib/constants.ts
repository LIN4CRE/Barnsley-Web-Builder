import { BUSINESS_CATEGORIES, type OUTREACH_STATUSES, type SORT_OPTIONS } from '@/types';
import type { FilterOptions } from '@/types';

export const ALL = 'All';

export const DEFAULT_FILTERS: FilterOptions = {
  searchTerm: '',
  category: ALL,
  area: ALL,
  minRating: 0,
  minOpportunityScore: 0,
  onlinePresence: ALL,
  outreachStatus: ALL,
  sortBy: 'score_desc',
};

export const SORT_LABELS: Record<(typeof SORT_OPTIONS)[number], string> = {
  score_desc: 'Opportunity Score (Highest)',
  rating_desc: 'Review Rating (Highest)',
  reviews_desc: 'Review Count (Most)',
  name_asc: 'Business Name (A–Z)',
};

export const OUTREACH_STATUS_LABELS: Record<(typeof OUTREACH_STATUSES)[number], string> = {
  'Not Contacted': 'Not Contacted',
  'In Progress': 'In Progress',
  Lead: 'Lead',
  Closed: 'Closed',
};

/** Tailwind classes for each outreach stage. Kept in one place so the badge is consistent. */
export const OUTREACH_STATUS_CLASSES: Record<(typeof OUTREACH_STATUSES)[number], string> = {
  Closed: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  Lead: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold',
  'In Progress': 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
  'Not Contacted': 'bg-slate-100 text-slate-600 border-slate-300 font-medium',
};

export const STATUS_TAG_CLASSES: Record<string, string> = {
  'In-Demand Queues': 'bg-amber-50 text-amber-800 border-amber-200',
  'High Reputation': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Community Landmark': 'bg-blue-50 text-blue-800 border-blue-200',
  'Established 20+ Yrs': 'bg-purple-50 text-purple-800 border-purple-200',
};

export const STATUS_TAG_FALLBACK_CLASS = 'bg-slate-100 text-slate-700 border-slate-200';

export const STATUS_TAG_CLASSES_WITH_FALLBACK: Record<string, string> = new Proxy(
  STATUS_TAG_CLASSES,
  {
    get: (target, prop: string) => target[prop] ?? STATUS_TAG_FALLBACK_CLASS,
  },
);

export const DEFAULT_CATEGORIES: readonly string[] = BUSINESS_CATEGORIES;

/** localStorage keys — namespaced and versioned so a schema change cannot corrupt state. */
export const STORAGE_KEYS = {
  statuses: 'barnsley:v1:statuses',
  notesPrefix: 'barnsley:v1:notes:',
  customBusinesses: 'barnsley:v1:custom-businesses',
  viewMode: 'barnsley:v1:view-mode',
} as const;

/** The previous, unversioned keys written by the original implementation. */
export const LEGACY_STORAGE_KEYS = {
  statuses: 'barnsley_business_statuses',
  notesPrefix: 'barnsley_notes_',
} as const;

export const HIGH_OPPORTUNITY_THRESHOLD = 90;

/** Barnsley postcode areas, used to sanity-check imported records. */
export const BARNSLEY_POSTCODE_PREFIXES = ['S70', 'S71', 'S72', 'S73', 'S74', 'S75'] as const;
