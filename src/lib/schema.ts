/**
 * Runtime validation for data crossing a trust boundary.
 *
 * Two boundaries matter here:
 *   1. Records arriving from the Gemini API (`/api/ai-scan-area`) — the model
 *      returns free-form JSON that is then rendered and exported.
 *   2. Records the user types into "Add Business".
 *
 * React escapes text on render, so this is not an XSS control; it is a data
 * integrity control. It also keeps the bundle honest: a malformed record used to
 * be spread straight into state and could break sorting or CSV export.
 */

import { BUSINESS_CATEGORIES, ONLINE_PRESENCE_TYPES, OUTREACH_STATUSES } from '@/types';
import type { BusinessItem } from '@/types';

const MAX_TEXT = 2_000;
const MAX_NAME = 120;
const MAX_SERVICES = 12;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function clampText(value: unknown, max = MAX_TEXT): string {
  return asString(value).slice(0, max);
}

function asNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function asStringArray(value: unknown, max = MAX_SERVICES): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => asString(v))
    .filter(Boolean)
    .slice(0, max);
}

/** Coerce an unknown value into a valid `BusinessItem`, or return null. */
export function parseBusinessItem(input: unknown): BusinessItem | null {
  if (input === null || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;

  const name = clampText(raw.name, MAX_NAME);
  if (!name) return null;

  const phone = clampText(raw.phone, 40);
  if (!phone) return null;

  const category = clampText(raw.category, 60);
  const onlinePresence = clampText(raw.onlinePresence, 60);

  return {
    id: clampText(raw.id, 80) || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    category: (BUSINESS_CATEGORIES as readonly string[]).includes(category)
      ? category
      : 'Trades & Home Services',
    area: clampText(raw.area, 80) || 'Barnsley',
    fullAddress: clampText(raw.fullAddress, 200) || 'Barnsley, South Yorkshire',
    postcode: clampText(raw.postcode, 12).toUpperCase(),
    phone,
    email: typeof raw.email === 'string' && raw.email.includes('@') ? raw.email.trim() : undefined,
    rating: asNumber(raw.rating, 4.5, 0, 5),
    reviewsCount: Math.round(asNumber(raw.reviewsCount, 0, 0, 1_000_000)),
    yearsActive: clampText(raw.yearsActive, 40) || undefined,
    statusTag: clampText(raw.statusTag, 40) || 'High Reputation',
    onlinePresence: (ONLINE_PRESENCE_TYPES as readonly string[]).includes(onlinePresence)
      ? onlinePresence
      : 'Phone & Word-of-Mouth',
    primaryServices: asStringArray(raw.primaryServices),
    successProof: clampText(raw.successProof),
    whyNoWebsite: clampText(raw.whyNoWebsite),
    opportunityAngle: clampText(raw.opportunityAngle),
    opportunityScore: Math.round(asNumber(raw.opportunityScore, 75, 0, 100)),
    recommendedPackage: clampText(raw.recommendedPackage, 200),
    estimatedLostRevenuePerMonth: clampText(raw.estimatedLostRevenuePerMonth, 120) || undefined,
  };
}

export function parseBusinessList(input: unknown): BusinessItem[] {
  if (!Array.isArray(input)) return [];
  return input.map(parseBusinessItem).filter((b): b is BusinessItem => b !== null);
}

export function isOutreachStatus(value: unknown): value is BusinessItem['status'] {
  return typeof value === 'string' && (OUTREACH_STATUSES as readonly string[]).includes(value);
}

/** Reject obviously-empty or over-long free text before it is sent to the model. */
export function sanitisePromptInput(value: unknown, maxLength = 400): string {
  return asString(value)
    // eslint-disable-next-line no-control-regex -- control chars are the target here
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}
