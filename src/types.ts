/**
 * Shared domain types.
 *
 * These mirror the JSON contracts exchanged with the Express API in `server.ts`.
 * Keep this file in sync with `src/lib/schema.ts` (runtime validation).
 */

export const BUSINESS_CATEGORIES = [
  'Automotive & Garages',
  'Butchers, Bakers & Food',
  'Trades & Home Services',
  'Town Centre & Victorian Arcade',
  'Cafes, Pubs & Hospitality',
  'Pet Care & Grooming',
  'Health & Beauty',
] as const;

export const ONLINE_PRESENCE_TYPES = [
  'Facebook Only',
  'Phone & Word-of-Mouth',
  'Market Counter & Footfall',
  'Directory Profile Only',
] as const;

export const OUTREACH_STATUSES = ['Not Contacted', 'In Progress', 'Lead', 'Closed'] as const;

export const STATUS_TAGS = [
  'High Reputation',
  'Community Landmark',
  'In-Demand Queues',
  'Established 20+ Yrs',
] as const;

export const SORT_OPTIONS = ['score_desc', 'rating_desc', 'reviews_desc', 'name_asc'] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];
export type OnlinePresenceType = (typeof ONLINE_PRESENCE_TYPES)[number];
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];
export type StatusTag = (typeof STATUS_TAGS)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface BusinessItem {
  id: string;
  name: string;
  category: string;
  area: string;
  fullAddress: string;
  postcode: string;
  phone: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  yearsActive?: string;
  statusTag: string;
  onlinePresence: string;
  facebookUrl?: string;
  primaryServices: string[];
  successProof: string;
  whyNoWebsite: string;
  opportunityAngle: string;
  opportunityScore: number; // 1 - 100
  recommendedPackage: string;
  estimatedLostRevenuePerMonth?: string;
  status?: OutreachStatus;
  notes?: string;
  /** True for records the user added or imported, which only exist client-side. */
  isUserAdded?: boolean;
  /** ISO timestamp of when a user-added record was created. */
  addedAt?: string;
}

export interface PitchProposal {
  businessId: string;
  businessName: string;
  headline: string;
  executiveSummary: string;
  lostOpportunities: string[];
  recommendedSolutions: string[];
  coldOutreachEmail: string;
  phoneCallScript: string;
  projectedRoi: string;
  /** How this proposal was produced — surfaced in the UI so claims stay honest. */
  source?: 'ai' | 'template';
}

export interface FilterOptions {
  searchTerm: string;
  category: string;
  area: string;
  minRating: number;
  minOpportunityScore: number;
  onlinePresence: string;
  outreachStatus: string;
  sortBy: SortOption;
}

export interface BusinessResearchData {
  businessId: string;
  businessName: string;
  executiveSummary: string;
  brandIdentity: {
    voice: string;
    vibe: string;
    targetAudience: string;
    colorScheme: { primary: string; secondary: string; accent: string; rationale: string };
    typography: { heading: string; body: string };
  };
  operationalProfile: {
    estimatedHours: string;
    serviceRadius: string;
    coreOfferings: { title: string; description: string; priceGuide?: string }[];
  };
  reputationAndSentiment: {
    topPraises: string[];
    frictionPointsSolvedByWeb: string[];
    localTrustFactors: string[];
  };
  localCompetitiveAnalysis: {
    barnsleyCompetitors: string;
    differentiators: string[];
  };
  digitalArchitecture: {
    primaryConversionGoal: string;
    keyUserJourneys: string[];
    requiredIntegrations: string[];
  };
  selfHealingAiRequirements: {
    autonomousAdminFeatures: string[];
    selfHealingSentinelChecks: string[];
    automatedCustomerSupportScopes: string[];
  };
  source?: 'ai' | 'template';
}

export interface WebsiteBuilderPrompt {
  businessId: string;
  businessName: string;
  markdownContent: string;
  charCount: number;
  generatedAt: string;
  source?: 'ai' | 'template';
}

/** Discriminated result returned by the API layer, so callers cannot ignore failures. */
export type ApiResult<T> =
  | { ok: true; data: T; source: 'ai' | 'template' }
  | { ok: false; error: string };

/**
 * Result of a generation call that is guaranteed to succeed because it falls
 * back to a local template when the AI service is unavailable.
 *
 * `source` records which path produced it, so the UI can be honest about it.
 */
export interface Generated<T> {
  data: T;
  source: 'ai' | 'template';
}

/** Provenance of the currently loaded directory data. */
export type DataSource = 'loading' | 'server' | 'bundled' | 'cache';
