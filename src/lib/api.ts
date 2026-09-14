/**
 * API client with explicit, graceful degradation.
 *
 * The app is deployed in two very different environments:
 *   - **Server build** — Express serves `/api/*` with Gemini-backed generation.
 *   - **Static build (GitHub Pages)** — no backend exists at all; `/api/*` returns
 *     a 404 HTML page.
 *
 * Rather than leaving dead buttons in the static build, every call catches
 * failure and falls back to the deterministic templates in `./fallback.ts`,
 * returning `source: 'template'` so the UI can be honest about what the user
 * is looking at.
 */

import { parseBusinessList } from './schema';
import {
  buildPitchTemplate,
  buildResearchTemplate,
  buildWebsitePromptTemplate,
} from './fallback';
import type {
  ApiResult,
  BusinessItem,
  BusinessResearchData,
  Generated,
  PitchProposal,
  WebsiteBuilderPrompt,
} from '@/types';

const REQUEST_TIMEOUT_MS = 45_000;

/** True once a backend has been confirmed reachable, false once confirmed absent. */
let backendAvailable: boolean | null = null;

export function isBackendAvailable(): boolean | null {
  return backendAvailable;
}

export function resetBackendProbe(): void {
  backendAvailable = null;
}

interface JsonEnvelope {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

/**
 * POST JSON and parse a JSON envelope.
 *
 * Distinguishes three failure modes that were previously conflated:
 *   - the request never completed (network / offline)
 *   - the endpoint does not exist (static hosting returns an HTML 404)
 *   - the endpoint existed and reported a business error
 */
async function postJson<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; reason: 'no-backend' | 'error'; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      // Static hosting served an HTML page: there is no backend here.
      return { ok: false, reason: 'no-backend', error: 'No backend available' };
    }

    const json = (await res.json()) as JsonEnvelope;

    if (!res.ok || json.success === false) {
      const message = typeof json.error === 'string' && json.error ? json.error : `Request failed (${res.status})`;
      return { ok: false, reason: res.status === 404 ? 'no-backend' : 'error', error: message };
    }

    return { ok: true, data: json as unknown as T };
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? 'The request timed out. Please try again.'
        : 'Could not reach the server.';
    return { ok: false, reason: 'no-backend', error: message };
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------------------------------------ */
/* Directory                                                           */
/* ------------------------------------------------------------------ */

interface BusinessesResponse extends JsonEnvelope {
  data?: unknown;
}

/**
 * Load the directory. Falls back to the bundled dataset when there is no backend,
 * which is the normal case for the static deployment.
 */
export async function fetchBusinesses(
  bundled: readonly BusinessItem[],
): Promise<{ businesses: BusinessItem[]; fromServer: boolean }> {
  try {
    const res = await fetch('/api/businesses', { headers: { Accept: 'application/json' } });
    const contentType = res.headers.get('content-type') ?? '';

    if (!res.ok || !contentType.includes('application/json')) {
      backendAvailable = false;
      return { businesses: [...bundled], fromServer: false };
    }

    const json = (await res.json()) as BusinessesResponse;
    const parsed = parseBusinessList(json.data);

    if (parsed.length === 0) {
      backendAvailable = false;
      return { businesses: [...bundled], fromServer: false };
    }

    backendAvailable = true;
    return { businesses: parsed, fromServer: true };
  } catch {
    backendAvailable = false;
    return { businesses: [...bundled], fromServer: false };
  }
}

/* ------------------------------------------------------------------ */
/* AI-backed features (all degrade to local templates)                 */
/* ------------------------------------------------------------------ */

interface PitchResponse extends JsonEnvelope {
  pitch?: PitchProposal;
}

/**
 * The whole `business` object is sent, not just its `id`.
 *
 * Previously only the id was sent and the server looked the record up in its own
 * static array — so every business added through "Add Business" or the AI scanner
 * returned "Business not found" and the feature was unusable for those records.
 */
export async function generatePitch(
  business: BusinessItem,
  customNotes = '',
): Promise<Generated<PitchProposal>> {
  const result = await postJson<PitchResponse>('/api/generate-pitch', {
    business,
    businessId: business.id,
    customNotes,
  });

  if (result.ok && result.data.pitch) {
    backendAvailable = true;
    return { data: { ...result.data.pitch, source: 'ai' }, source: 'ai' };
  }

  if (!result.ok && result.reason === 'no-backend') backendAvailable = false;

  return { data: buildPitchTemplate(business, customNotes), source: 'template' };
}

interface ResearchResponse extends JsonEnvelope {
  data?: BusinessResearchData;
}

export async function researchBusiness(
  business: BusinessItem,
): Promise<Generated<BusinessResearchData>> {
  const result = await postJson<ResearchResponse>('/api/research-business', {
    business,
    businessId: business.id,
  });

  if (result.ok && result.data.data) {
    backendAvailable = true;
    return { data: { ...result.data.data, source: 'ai' }, source: 'ai' };
  }

  if (!result.ok && result.reason === 'no-backend') backendAvailable = false;

  return { data: buildResearchTemplate(business), source: 'template' };
}

interface PromptResponse extends JsonEnvelope {
  data?: WebsiteBuilderPrompt;
}

export async function generateWebsitePrompt(
  business: BusinessItem,
  research: BusinessResearchData | null,
  focusArea = '',
): Promise<Generated<WebsiteBuilderPrompt>> {
  const result = await postJson<PromptResponse>('/api/generate-website-prompt', {
    business,
    businessId: business.id,
    researchData: research,
    focusArea,
  });

  if (result.ok && result.data.data) {
    backendAvailable = true;
    return { data: { ...result.data.data, source: 'ai' }, source: 'ai' };
  }

  if (!result.ok && result.reason === 'no-backend') backendAvailable = false;

  return {
    data: buildWebsitePromptTemplate(business, research, focusArea),
    source: 'template',
  };
}

interface ScanResponse extends JsonEnvelope {
  candidates?: unknown;
}

/**
 * Area scanning has no meaningful offline equivalent — inventing "discovered"
 * businesses would be fabrication — so it reports the failure instead.
 */
export async function scanArea(areaOrNiche: string): Promise<ApiResult<BusinessItem[]>> {
  const result = await postJson<ScanResponse>('/api/ai-scan-area', { areaOrNiche });

  if (result.ok) {
    backendAvailable = true;
    const candidates = parseBusinessList(result.data.candidates);
    return { ok: true, data: candidates, source: 'ai' };
  }

  if (result.reason === 'no-backend') {
    backendAvailable = false;
    return {
      ok: false,
      error:
        'The AI scanner needs the server component, which is not available in this deployment. Run the app locally with a Gemini API key to use it — or add prospects manually with “Add Business”.',
    };
  }

  return { ok: false, error: result.error };
}
