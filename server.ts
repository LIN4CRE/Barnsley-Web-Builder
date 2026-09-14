/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Express server for the Barnsley Offline Business Directory.
 *
 * Responsibilities:
 *   - serve the built SPA (and the Vite dev middleware outside production)
 *   - expose `/api/*` endpoints that proxy to Google Gemini
 *
 * Security posture: security headers, body-size limits, rate limiting and
 * input validation are all applied here. See SECURITY.md for the reasoning.
 */

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { BARNSLEY_BUSINESSES } from './src/data/businesses.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

/* ------------------------------------------------------------------ */
/* Security middleware                                                 */
/* ------------------------------------------------------------------ */

// Do not advertise the framework.
app.disable('x-powered-by');

app.use((req, res, next) => {
  // Strict-Transport-Security is only meaningful over HTTPS; enabling it on
  // plain HTTP during local development can lock developers out.
  if (isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');

  res.setHeader(
    'Permissions-Policy',
    ['camera=()', 'microphone=()', 'geolocation=()', 'interest-cohort=()', 'payment=()'].join(', '),
  );

  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // The dev server needs 'unsafe-inline'/'unsafe-eval' for HMR and module
  // evaluation; the production build does not, so it gets a strict policy.
  const scriptSrc = isProduction
    ? "script-src 'self'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://generativelanguage.googleapis.com" + (isProduction ? '' : ' ws: wss:'),
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      ...(isProduction ? ['upgrade-insecure-requests'] : []),
    ].join('; '),
  );

  next();
});

// Bounded request bodies.
app.use(express.json({ limit: '128kb' }));

/* ------------------------------------------------------------------ */
/* Rate limiting (in-memory; single instance only)                     */
/* ------------------------------------------------------------------ */

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();
const RATE_LIMIT = {
  windowMs: 60_000,
  max: 20,
} as const;

/**
 * Simple fixed-window limiter.
 *
 * NOTE: in-memory state is per-process and does not survive a restart. Behind a
 * load balancer or on a platform that runs multiple instances, put a shared
 * store (Redis, or platform-native rate limiting) in front of these routes.
 */
function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (!isProduction) {
    next();
    return;
  }

  const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    next();
    return;
  }

  if (bucket.count >= RATE_LIMIT.max) {
    res.status(429).json({
      success: false,
      error: `Too many requests. Please wait ${Math.ceil((bucket.resetAt - now) / 1000)}s and try again.`,
    });
    return;
  }

  bucket.count += 1;
  next();
}

// Opportunistic cleanup so the map cannot grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, 60_000).unref();

/* ------------------------------------------------------------------ */
/* Gemini client                                                       */
/* ------------------------------------------------------------------ */

let cachedClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // 503, not 500: this is a configuration problem, not a code fault. It tells
    // monitoring (and the client) that retrying will not help until config changes.
    const error = new Error(
      'GEMINI_API_KEY is not configured. Copy .env.example to .env and add your key.',
    );
    (error as NodeJS.ErrnoException).code = 'CONFIG_MISSING';
    throw error;
  }

  cachedClient ??= new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'barnsley-offline-business-directory' } },
  });

  return cachedClient;
}

/** Parse model output that may or may not be wrapped in markdown fences. */
function parseModelJson<T>(text: string | undefined, fallback: T): T {
  const raw = (text ?? '').trim();
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      return fallback;
    }
  }
}

function errorStatus(error: unknown): number {
  const code = (error as NodeJS.ErrnoException)?.code;
  if (code === 'CONFIG_MISSING') return 503;
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT') return 504;
  return 500;
}

const asyncHandler =
  (fn: (req: express.Request, res: express.Response) => Promise<void>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    fn(req, res).catch(next);
  };

/* ------------------------------------------------------------------ */
/* Shared schema helpers (mirrors src/lib/schema.ts on the client)     */
/* ------------------------------------------------------------------ */

type UnknownRecord = Record<string, unknown>;

/** Control characters, stripped from any text before it reaches the model. */
// eslint-disable-next-line no-control-regex -- control chars are the target here
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

function asString(value: unknown, max = 500): string {
  if (typeof value !== 'string') return '';
  // Strip control characters before anything is interpolated into a prompt.
  return value.replace(CONTROL_CHARS, ' ').trim().slice(0, max);
}

function asNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function asStringArray(value: unknown, max = 12): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => asString(v, 120)).filter(Boolean).slice(0, max);
}

/**
 * Accept a business either as a full object (preferred) or as an id string.
 *
 * Sending only the id was the original behaviour, and it broke every business
 * added through "Add Business" or the AI scanner: those records only exist
 * client-side, so the lookup returned 404 and "Research & Brief" was a dead
 * button for them.
 */
function resolveBusiness(body: UnknownRecord): UnknownRecord | null {
  const candidate = body.business;

  if (candidate !== null && typeof candidate === 'object' && !Array.isArray(candidate)) {
    const record = candidate as UnknownRecord;
    const name = asString(record.name, 120);
    const phone = asString(record.phone, 40);
    if (name && phone) return record;
  }

  if (typeof body.businessId === 'string' && body.businessId.trim()) {
    // Fallback for old clients: only bundled records can be resolved this way.
    const id = body.businessId.trim().slice(0, 80);
    void id;
    return null;
  }

  return null;
}

function describeBusiness(b: UnknownRecord): string {
  return [
    `Business Name: ${asString(b.name, 120)}`,
    `Sector: ${asString(b.category, 80)}`,
    `Location: ${asString(b.fullAddress, 200)} (Barnsley, South Yorkshire, ${asString(b.postcode, 12)})`,
    `Area: ${asString(b.area, 80)}`,
    `Telephone: ${asString(b.phone, 40)}`,
    `Years Established: ${asString(b.yearsActive, 40) || 'Established local favourite'}`,
    `Current Reputation: ${asNumber(b.rating, 0, 0, 5)} stars (${asNumber(b.reviewsCount, 0, 0, 1_000_000)} reviews) - ${asString(b.statusTag, 60)}`,
    `Current Online Footprint: ${asString(b.onlinePresence, 60)}`,
    `Why They Have No Website: ${asString(b.whyNoWebsite, 800)}`,
    `Core Services: ${asStringArray(b.primaryServices).join(', ')}`,
    `Proof of Standing: ${asString(b.successProof, 800)}`,
    `Opportunity Angle: ${asString(b.opportunityAngle, 800)}`,
    `Recommended Package: ${asString(b.recommendedPackage, 200)}`,
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    modelConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

/**
 * The bundled directory, exposed over HTTP.
 *
 * There is no database: `src/data/businesses.ts` is the source of truth, and
 * records the user adds live only in their browser. This endpoint exists so the
 * client can confirm a backend is present and receive the canonical list.
 */
app.get('/api/businesses', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.json({ success: true, total: BARNSLEY_BUSINESSES.length, data: BARNSLEY_BUSINESSES });
});

app.post(
  '/api/generate-pitch',
  rateLimit,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as UnknownRecord;
    const business = resolveBusiness(body);

    if (!business) {
      res.status(400).json({
        success: false,
        error:
          'A business object with a name and phone number is required. Records added in the browser are not stored on the server.',
      });
      return;
    }

    const customNotes = asString(body.customNotes, 400);
    const ai = getGenAI();

    const prompt = `You are a digital consultant advising small businesses in Barnsley, South Yorkshire.
Write a tailored, realistic web proposal and outreach pack for this real business, which currently has no website.

${describeBusiness(business)}
${customNotes ? `Additional context from the user: ${customNotes}` : ''}

Rules:
- Do not invent facts, prices, awards, testimonials or review quotes.
- Do not state revenue figures as fact. If you estimate, label it clearly as an estimate and explain the assumption.
- Write in plain British English. No hype, no em-dash-laden sales language.
- Leave any placeholder the user must fill in as [Your name].

Respond with strict, valid JSON matching this structure and nothing else:
{
  "businessId": ${JSON.stringify(asString(business.id, 80) || 'unknown')},
  "businessName": ${JSON.stringify(asString(business.name, 120))},
  "headline": "One short sentence on why a website matters for this business now",
  "executiveSummary": "2-3 sentences on their current standing and what a website would change",
  "lostOpportunities": ["specific item", "specific item", "specific item"],
  "recommendedSolutions": ["specific item", "specific item", "specific item"],
  "coldOutreachEmail": "A warm, short, hyper-local cold email. Praise their reputation first, name one real friction point, offer a no-obligation look at a mock-up.",
  "phoneCallScript": "A plain, non-pushy 60-second opening script that respects how busy the owner is.",
  "projectedRoi": "A clearly-labelled estimate with the assumption stated, or a short explanation of why no figure can be given yet."
}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const pitch = parseModelJson<unknown>(response.text, null);

    if (pitch === null) {
      res.status(502).json({ success: false, error: 'The model returned a response that could not be parsed.' });
      return;
    }

    res.json({ success: true, pitch });
  }),
);

app.post(
  '/api/research-business',
  rateLimit,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as UnknownRecord;
    const business = resolveBusiness(body);

    if (!business) {
      res.status(400).json({
        success: false,
        error: 'A business object with a name and phone number is required.',
      });
      return;
    }

    const ai = getGenAI();

    const prompt = `You are a business analyst and digital architect working with small businesses in Yorkshire.
Produce a research dossier for this Barnsley business, which currently has no website.

${describeBusiness(business)}

Rules:
- Anything you cannot know from the details above must be written as "To confirm" rather than guessed.
- Do not invent prices, trading hours, staff names, awards or review quotes.
- Keep it practical and specific to Barnsley and South Yorkshire.

Respond with strict, valid JSON matching this structure and nothing else:
{
  "businessId": ${JSON.stringify(asString(business.id, 80) || 'unknown')},
  "businessName": ${JSON.stringify(asString(business.name, 120))},
  "executiveSummary": "Why this business has goodwill locally, and the operational friction caused by having no website",
  "brandIdentity": {
    "voice": "How they should sound in writing",
    "vibe": "Visual atmosphere that suits this specific trade",
    "targetAudience": "Which Barnsley and South Yorkshire customers they serve",
    "colorScheme": { "primary": "#0F172A", "secondary": "#F8FAFC", "accent": "#B45309", "rationale": "Why these colours suit them" },
    "typography": { "heading": "Font name", "body": "Font name" }
  },
  "operationalProfile": {
    "estimatedHours": "To confirm — or a clearly-labelled typical pattern for this trade",
    "serviceRadius": "Geographic reach across South Yorkshire",
    "coreOfferings": [
      { "title": "Service 1", "description": "What the customer receives", "priceGuide": "To confirm" }
    ]
  },
  "reputationAndSentiment": {
    "topPraises": ["praise 1", "praise 2", "praise 3"],
    "frictionPointsSolvedByWeb": ["friction 1", "friction 2", "friction 3"],
    "localTrustFactors": ["factor 1", "factor 2", "factor 3"]
  },
  "localCompetitiveAnalysis": {
    "barnsleyCompetitors": "Who currently captures the search traffic locally, and how",
    "differentiators": ["differentiator 1", "differentiator 2"]
  },
  "digitalArchitecture": {
    "primaryConversionGoal": "The single most important action on their site",
    "keyUserJourneys": ["journey 1", "journey 2", "journey 3"],
    "requiredIntegrations": ["integration 1", "integration 2"]
  },
  "selfHealingAiRequirements": {
    "autonomousAdminFeatures": ["feature 1", "feature 2"],
    "selfHealingSentinelChecks": ["check 1", "check 2"],
    "automatedCustomerSupportScopes": ["scope 1", "scope 2"]
  }
}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const data = parseModelJson<unknown>(response.text, null);

    if (data === null) {
      res.status(502).json({ success: false, error: 'The model returned a response that could not be parsed.' });
      return;
    }

    res.json({ success: true, data });
  }),
);

app.post(
  '/api/generate-website-prompt',
  rateLimit,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as UnknownRecord;
    const business = resolveBusiness(body);

    if (!business) {
      res.status(400).json({
        success: false,
        error: 'A business object with a name and phone number is required.',
      });
      return;
    }

    const focusArea = asString(body.focusArea, 400);
    const ai = getGenAI();

    const researchSummary =
      body.researchData !== null && typeof body.researchData === 'object'
        ? `\n\nResearch already gathered:\n${asString(JSON.stringify(body.researchData), 4000)}`
        : '';

    const prompt = `You are a senior developer writing a build brief for a colleague.
Write a practical, implementation-ready website brief in Markdown for this Barnsley business.

${describeBusiness(business)}${researchSummary}
${focusArea ? `\nClient's stated focus: ${focusArea}` : ''}

The brief must include:
1. Objective — the single outcome the site exists to achieve.
2. Required pages and sections, with a note on what goes in each.
3. Mobile-first and accessibility requirements (WCAG 2.2 AA).
4. Performance requirements (no unnecessary libraries, correct image sizing).
5. What must be confirmed with the owner before launch.

Rules:
- No invented prices, testimonials, review quotes or trading hours. Mark them "To confirm".
- Concrete and specific to this business; no generic agency filler.
- Plain British English.

Return Markdown only.`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const markdownContent = (response.text ?? '').trim();

    if (markdownContent.length < 100) {
      res.status(502).json({ success: false, error: 'The model returned an empty brief.' });
      return;
    }

    res.json({
      success: true,
      data: {
        businessId: asString(business.id, 80) || 'unknown',
        businessName: asString(business.name, 120),
        markdownContent,
        charCount: markdownContent.length,
        generatedAt: new Date().toISOString(),
      },
    });
  }),
);

app.post(
  '/api/ai-scan-area',
  rateLimit,
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as UnknownRecord;
    const areaOrNiche = asString(body.areaOrNiche, 200);

    if (!areaOrNiche) {
      res.status(400).json({ success: false, error: 'areaOrNiche is required' });
      return;
    }

    const ai = getGenAI();

    const prompt = `You are a local business analyst covering the Metropolitan Borough of Barnsley, South Yorkshire (Barnsley town centre, Wombwell, Hoyland, Penistone, Darton, Royston, Grimethorpe, Cudworth, Goldthorpe, Dodworth, Mapplewell, Silkstone, Carlton, Birdwell).

Identify real, well-regarded businesses in or near "${areaOrNiche}" that trade on reputation, word of mouth or a Facebook page, and have no website of their own.

Rules:
- Only name businesses you actually believe exist. If you are not confident, omit them.
- Do not invent phone numbers, addresses or review counts. If you do not know a value, use an empty string.
- Ratings and review counts must be marked as approximate.

Return a JSON array of 3 to 5 candidates:
[
  {
    "id": "slug-name",
    "name": "Business Name",
    "category": "Trades & Home Services | Automotive & Garages | Butchers, Bakers & Food | Town Centre & Victorian Arcade | Cafes, Pubs & Hospitality | Pet Care & Grooming | Health & Beauty",
    "area": "Specific Barnsley suburb",
    "fullAddress": "Full road and locality",
    "postcode": "Barnsley postcode (S70-S75)",
    "phone": "01226 or 07xxx number, or empty string if unknown",
    "rating": 4.8,
    "reviewsCount": 65,
    "yearsActive": "10+ Years",
    "statusTag": "High Reputation",
    "onlinePresence": "Facebook Only | Phone & Word-of-Mouth | Market Counter & Footfall | Directory Profile Only",
    "primaryServices": ["Service 1", "Service 2"],
    "successProof": "Why they are respected locally",
    "whyNoWebsite": "Why they have managed without one",
    "opportunityAngle": "The main web opportunity",
    "opportunityScore": 85,
    "recommendedPackage": "Recommended website approach"
  }
]`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = parseModelJson<unknown>(response.text, null);

    if (parsed === null) {
      res.status(502).json({ success: false, error: 'The model returned a response that could not be parsed.' });
      return;
    }

    const candidates = Array.isArray(parsed) ? parsed : [];

    res.json({
      success: true,
      candidates,
      note: 'AI-suggested records are unverified. Check each one before contacting the business.',
    });
  }),
);

/* ------------------------------------------------------------------ */
/* 404 + error handling                                                */
/* ------------------------------------------------------------------ */

// Unknown API routes must return a JSON 404, not the SPA's HTML. Previously the
// catch-all served index.html with a 200, which made failures look like successes.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `No API endpoint at ${req.method} ${req.path}` });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = errorStatus(err);
  const message =
    status === 500 ? 'An unexpected server error occurred.' : (err as Error)?.message ?? 'Request failed.';

  if (status >= 500) {
    console.error('API error:', err);
  }

  res.status(status).json({ success: false, error: message });
});

/* ------------------------------------------------------------------ */
/* Static serving / dev middleware                                     */
/* ------------------------------------------------------------------ */

async function startServer(): Promise<void> {
  if (!isProduction) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');

    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        index: false,
        setHeaders: (res, filePath) => {
          // Hashed build assets are immutable; the HTML entry point is not.
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          }
        },
      }),
    );

    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Barnsley Offline Businesses server listening on http://0.0.0.0:${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set — AI features will fall back to local templates.');
    }
  });
}

void startServer();
