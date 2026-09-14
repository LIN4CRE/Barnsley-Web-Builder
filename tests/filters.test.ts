import { describe, expect, it } from 'vitest';
import { computeMetrics, filterBusinesses, matchesSearch, sortBusinesses } from '@/lib/filters';
import { DEFAULT_FILTERS } from '@/lib/constants';
import type { BusinessItem } from '@/types';

function makeBusiness(overrides: Partial<BusinessItem> = {}): BusinessItem {
  return {
    id: 'test-1',
    name: 'Test Garage',
    category: 'Automotive & Garages',
    area: 'Pogmoor',
    fullAddress: '1 Test Road, Barnsley',
    postcode: 'S75 2EA',
    phone: '01226 000000',
    rating: 4.8,
    reviewsCount: 50,
    statusTag: 'High Reputation',
    onlinePresence: 'Phone & Word-of-Mouth',
    primaryServices: ['MOT Testing', 'Brake Servicing'],
    successProof: 'Well regarded locally.',
    whyNoWebsite: 'Runs on word of mouth.',
    opportunityAngle: 'Online MOT booking.',
    opportunityScore: 90,
    recommendedPackage: 'Booking engine',
    status: 'Not Contacted',
    ...overrides,
  };
}

describe('matchesSearch', () => {
  it('matches on business name, case-insensitively', () => {
    expect(matchesSearch(makeBusiness(), 'GARAGE')).toBe(true);
  });

  it('matches on postcode', () => {
    expect(matchesSearch(makeBusiness(), 's75')).toBe(true);
  });

  it('matches on a service', () => {
    expect(matchesSearch(makeBusiness(), 'brake')).toBe(true);
  });

  it('returns true for a blank search term', () => {
    expect(matchesSearch(makeBusiness(), '   ')).toBe(true);
  });

  it('does not match an unrelated term', () => {
    expect(matchesSearch(makeBusiness(), 'dog grooming')).toBe(false);
  });
});

describe('sortBusinesses', () => {
  const items = [
    makeBusiness({ id: 'a', name: 'Alpha', opportunityScore: 70, rating: 4.9, reviewsCount: 10 }),
    makeBusiness({ id: 'b', name: 'Beta', opportunityScore: 95, rating: 4.7, reviewsCount: 200 }),
    makeBusiness({ id: 'c', name: 'Charlie', opportunityScore: 85, rating: 4.9, reviewsCount: 50 }),
  ];

  it('sorts by opportunity score descending by default', () => {
    expect(sortBusinesses(items, 'score_desc').map((b) => b.id)).toEqual(['b', 'c', 'a']);
  });

  it('breaks rating ties using review count', () => {
    expect(sortBusinesses(items, 'rating_desc').map((b) => b.id)).toEqual(['c', 'a', 'b']);
  });

  it('sorts by review count descending', () => {
    expect(sortBusinesses(items, 'reviews_desc').map((b) => b.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts by name using locale-aware comparison', () => {
    expect(sortBusinesses(items, 'name_asc').map((b) => b.name)).toEqual([
      'Alpha',
      'Beta',
      'Charlie',
    ]);
  });

  it('does not mutate the input array', () => {
    const original = [...items];
    sortBusinesses(items, 'score_desc');
    expect(items).toEqual(original);
  });
});

describe('filterBusinesses', () => {
  const items = [
    makeBusiness({ id: 'a', rating: 4.9, status: 'Lead', area: 'Pogmoor' }),
    makeBusiness({ id: 'b', rating: 4.5, status: 'Not Contacted', area: 'Wombwell' }),
    makeBusiness({ id: 'c', rating: 4.7, status: 'Closed', area: 'Penistone' }),
  ];

  it('filters by outreach stage', () => {
    const result = filterBusinesses(items, { ...DEFAULT_FILTERS, outreachStatus: 'Lead' });
    expect(result.map((b) => b.id)).toEqual(['a']);
  });

  it('applies the minimum rating filter, which was previously ignored', () => {
    const result = filterBusinesses(items, { ...DEFAULT_FILTERS, minRating: 4.7 });
    // All three share the same opportunity score, so the default sort is stable
    // and insertion order is preserved.
    expect(result.map((b) => b.id)).toEqual(['a', 'c']);
  });

  it('filters by area', () => {
    const result = filterBusinesses(items, { ...DEFAULT_FILTERS, area: 'Wombwell' });
    expect(result.map((b) => b.id)).toEqual(['b']);
  });

  it('combines search and category filters', () => {
    const result = filterBusinesses(items, {
      ...DEFAULT_FILTERS,
      category: 'Automotive & Garages',
      searchTerm: 'test',
    });
    expect(result).toHaveLength(3);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterBusinesses(items, { ...DEFAULT_FILTERS, searchTerm: 'zzzz' })).toEqual([]);
  });
});

describe('computeMetrics', () => {
  it('derives every figure from the data rather than hardcoding it', () => {
    const items = [
      makeBusiness({ id: 'a', rating: 5, reviewsCount: 100, opportunityScore: 95, area: 'Pogmoor' }),
      makeBusiness({ id: 'b', rating: 4, reviewsCount: 50, opportunityScore: 80, area: 'Wombwell' }),
    ];

    const metrics = computeMetrics(items);

    expect(metrics.total).toBe(2);
    expect(metrics.averageRating).toBe(4.5);
    expect(metrics.totalReviews).toBe(150);
    expect(metrics.highOpportunityCount).toBe(1);
    expect(metrics.withPhoneCount).toBe(2);
    expect(metrics.distinctAreaCount).toBe(2);
  });

  it('does not divide by zero on an empty list', () => {
    const metrics = computeMetrics([]);
    expect(metrics.total).toBe(0);
    expect(metrics.averageRating).toBe(0);
    expect(Number.isNaN(metrics.averageRating)).toBe(false);
  });

  it('does not count a business with a blank phone as reachable', () => {
    const metrics = computeMetrics([makeBusiness({ phone: '   ' })]);
    expect(metrics.withPhoneCount).toBe(0);
  });
});
