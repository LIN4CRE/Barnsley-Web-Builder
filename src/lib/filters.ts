/**
 * Pure filtering/sorting/derivation logic.
 *
 * Extracted verbatim from `App.tsx` so it can be unit-tested without rendering
 * React, and so the component only owns presentation concerns.
 */

import { ALL, HIGH_OPPORTUNITY_THRESHOLD } from './constants';
import type { BusinessItem, FilterOptions } from '@/types';

export function matchesSearch(business: BusinessItem, rawTerm: string): boolean {
  const q = rawTerm.toLowerCase().trim();
  if (!q) return true;

  return (
    business.name.toLowerCase().includes(q) ||
    business.category.toLowerCase().includes(q) ||
    business.area.toLowerCase().includes(q) ||
    business.fullAddress.toLowerCase().includes(q) ||
    business.postcode.toLowerCase().includes(q) ||
    business.primaryServices.some((s) => s.toLowerCase().includes(q)) ||
    business.opportunityAngle.toLowerCase().includes(q) ||
    business.successProof.toLowerCase().includes(q)
  );
}

export function sortBusinesses(
  businesses: readonly BusinessItem[],
  sortBy: FilterOptions['sortBy'],
): BusinessItem[] {
  const result = [...businesses];

  switch (sortBy) {
    case 'score_desc':
      return result.sort((a, b) => b.opportunityScore - a.opportunityScore);
    case 'rating_desc':
      return result.sort((a, b) =>
        b.rating !== a.rating ? b.rating - a.rating : b.reviewsCount - a.reviewsCount,
      );
    case 'reviews_desc':
      return result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    case 'name_asc':
      return result.sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
    default:
      return result;
  }
}

export function filterBusinesses(
  businesses: readonly BusinessItem[],
  filters: FilterOptions,
): BusinessItem[] {
  const filtered = businesses.filter((b) => {
    if (!matchesSearch(b, filters.searchTerm)) return false;
    if (filters.category !== ALL && b.category !== filters.category) return false;
    if (filters.area !== ALL && b.area !== filters.area) return false;
    if (filters.onlinePresence !== ALL && b.onlinePresence !== filters.onlinePresence) return false;
    if (filters.outreachStatus !== ALL && (b.status ?? 'Not Contacted') !== filters.outreachStatus) {
      return false;
    }
    // `minRating` was exposed in `FilterOptions` but never applied — it is now.
    if (filters.minRating > 0 && b.rating < filters.minRating) return false;
    if (filters.minOpportunityScore > 0 && b.opportunityScore < filters.minOpportunityScore) {
      return false;
    }
    return true;
  });

  return sortBusinesses(filtered, filters.sortBy);
}

export function hasActiveFilters(filters: FilterOptions, defaults: FilterOptions): boolean {
  return (
    filters.searchTerm !== defaults.searchTerm ||
    filters.category !== defaults.category ||
    filters.area !== defaults.area ||
    filters.onlinePresence !== defaults.onlinePresence ||
    filters.outreachStatus !== defaults.outreachStatus ||
    filters.minRating > 0 ||
    filters.minOpportunityScore > 0
  );
}

export function uniqueSorted(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'en-GB'));
}

export function collectCategories(businesses: readonly BusinessItem[]): string[] {
  return uniqueSorted(businesses.map((b) => b.category));
}

export function collectAreas(businesses: readonly BusinessItem[]): string[] {
  return uniqueSorted(businesses.map((b) => b.area));
}

export interface DirectoryMetrics {
  total: number;
  averageRating: number;
  totalReviews: number;
  highOpportunityCount: number;
  withPhoneCount: number;
  distinctAreaCount: number;
}

/**
 * All figures are derived from the current dataset.
 *
 * The previous implementation printed hardcoded strings ("Across 8 Barnsley
 * boroughs", "100% reachable", "100% no website") alongside the real numbers,
 * which became factually wrong as soon as a user imported a record.
 */
export function computeMetrics(businesses: readonly BusinessItem[]): DirectoryMetrics {
  const total = businesses.length;
  const totalReviews = businesses.reduce((acc, b) => acc + b.reviewsCount, 0);
  const ratingSum = businesses.reduce((acc, b) => acc + b.rating, 0);

  return {
    total,
    averageRating: total === 0 ? 0 : Math.round((ratingSum / total) * 10) / 10,
    totalReviews,
    highOpportunityCount: businesses.filter((b) => b.opportunityScore >= HIGH_OPPORTUNITY_THRESHOLD)
      .length,
    withPhoneCount: businesses.filter((b) => b.phone.trim().length > 0).length,
    distinctAreaCount: new Set(businesses.map((b) => b.area)).size,
  };
}

export function countBy<T, K extends string>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, number> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<K, number>,
  );
}
