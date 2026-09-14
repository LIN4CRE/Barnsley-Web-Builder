export type BusinessCategory =
  | 'Automotive & Garages'
  | 'Butchers, Bakers & Food'
  | 'Trades & Home Services'
  | 'Town Centre & Victorian Arcade'
  | 'Cafes, Pubs & Hospitality'
  | 'Pet Care & Grooming'
  | 'Health & Beauty';

export type OnlinePresenceType =
  | 'Facebook Only'
  | 'Phone & Word-of-Mouth'
  | 'Market Counter & Footfall'
  | 'Directory Profile Only';

export interface BusinessItem {
  id: string;
  name: string;
  category: BusinessCategory;
  area: string;
  fullAddress: string;
  postcode: string;
  phone: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  yearsActive?: string;
  statusTag: 'High Reputation' | 'Community Landmark' | 'In-Demand Queues' | 'Established 20+ Yrs';
  onlinePresence: OnlinePresenceType;
  facebookUrl?: string;
  primaryServices: string[];
  successProof: string;
  whyNoWebsite: string;
  opportunityAngle: string;
  opportunityScore: number; // 1 - 100
  recommendedPackage: string;
  estimatedLostRevenuePerMonth?: string;
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
}

export interface FilterOptions {
  searchTerm: string;
  category: string;
  area: string;
  minRating: number;
  minOpportunityScore: number;
  onlinePresence: string;
  sortBy: 'score_desc' | 'rating_desc' | 'reviews_desc' | 'name_asc';
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
    coreOfferings: Array<{ title: string; description: string; priceGuide?: string }>;
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
}

export interface WebsiteBuilderPrompt {
  businessId: string;
  businessName: string;
  markdownContent: string;
  charCount: number;
  generatedAt: string;
}
