import { describe, expect, it } from 'vitest';
import { buildPitchTemplate, buildResearchTemplate, buildWebsitePromptTemplate } from '@/lib/fallback';
import type { BusinessItem } from '@/types';

const business: BusinessItem = {
  id: 'crows-garage',
  name: "Crow's Garage",
  category: 'Automotive & Garages',
  area: 'Pogmoor',
  fullAddress: 'Greaves Fold, Pogmoor Road, Barnsley',
  postcode: 'S75 2EA',
  phone: '01226 203351',
  rating: 4.9,
  reviewsCount: 58,
  statusTag: 'High Reputation',
  onlinePresence: 'Directory Profile Only',
  primaryServices: ['MOT Testing', 'Clutch Replacements'],
  successProof: 'Known across Pogmoor as dependable.',
  whyNoWebsite: 'Runs purely on telephone bookings.',
  opportunityAngle: '24/7 online MOT scheduling.',
  opportunityScore: 94,
  recommendedPackage: 'Service Booking Engine',
  estimatedLostRevenuePerMonth: '£3,200 - £4,500',
};

describe('buildPitchTemplate', () => {
  const pitch = buildPitchTemplate(business);

  it('is marked as a template so the UI can label it honestly', () => {
    expect(pitch.source).toBe('template');
  });

  it('derives content from the record rather than inventing it', () => {
    expect(pitch.businessName).toBe("Crow's Garage");
    expect(pitch.executiveSummary).toContain('4.9');
    expect(pitch.executiveSummary).toContain('Pogmoor');
  });

  it('labels revenue figures as directory estimates, not facts', () => {
    expect(pitch.lostOpportunities.join(' ')).toMatch(/rough figure to sanity-check/i);
  });

  it('refuses to invent a return-on-investment number', () => {
    expect(pitch.projectedRoi).toMatch(/No figure is claimed/i);
  });

  it('leaves an explicit placeholder for the sender to fill in', () => {
    expect(pitch.coldOutreachEmail).toContain('[Your name]');
    expect(pitch.phoneCallScript).toContain('[Your name]');
  });

  it('incorporates user notes when provided', () => {
    const withNotes = buildPitchTemplate(business, 'Spoke to John on Monday');
    expect(withNotes.coldOutreachEmail).toContain('Spoke to John on Monday');
  });
});

describe('buildResearchTemplate', () => {
  const research = buildResearchTemplate(business);

  it('marks unknown operational detail as requiring confirmation', () => {
    expect(research.operationalProfile.estimatedHours).toMatch(/to confirm/i);
    expect(research.operationalProfile.coreOfferings[0]?.priceGuide).toMatch(/to confirm/i);
  });

  it('does not invent competitors', () => {
    expect(research.localCompetitiveAnalysis.barnsleyCompetitors).toMatch(/to confirm/i);
  });

  it('returns valid hex colours', () => {
    expect(research.brandIdentity.colorScheme.primary).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

describe('buildWebsitePromptTemplate', () => {
  const prompt = buildWebsitePromptTemplate(business);

  it('produces a non-trivial markdown brief', () => {
    expect(prompt.markdownContent.length).toBeGreaterThan(1000);
    expect(prompt.charCount).toBe(prompt.markdownContent.length);
  });

  it('states that it was generated offline', () => {
    expect(prompt.markdownContent).toMatch(/offline template/i);
  });

  it('includes a pre-launch checklist', () => {
    expect(prompt.markdownContent).toContain('- [ ] Exact opening hours');
  });
});
