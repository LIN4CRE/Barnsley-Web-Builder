/**
 * Deterministic, offline template generators.
 *
 * Why these exist: the deployed site on GitHub Pages is static, so `/api/*` does
 * not exist there. Rather than showing a dead end, every AI feature falls back to
 * a locally generated template built from the directory record itself.
 *
 * Everything produced here is labelled `source: 'template'` and the UI says so.
 * Templates are derived only from data already in the record — they never invent
 * facts, prices or testimonials, and they explicitly mark placeholders the user
 * must fill in (e.g. "[Your name]").
 */

import type {
  BusinessItem,
  BusinessResearchData,
  PitchProposal,
  WebsiteBuilderPrompt,
} from '@/types';

const SIGN_OFF = '[Your name]';

export function buildPitchTemplate(business: BusinessItem, customNotes = ''): PitchProposal {
  const notes = customNotes.trim();

  return {
    businessId: business.id,
    businessName: business.name,
    headline: `Capture after-hours enquiries for ${business.name} without adding admin`,
    executiveSummary: `${business.name} has built a ${business.rating}★ reputation from ${business.reviewsCount} reviews in ${business.area}, Barnsley, while trading entirely through ${business.onlinePresence.toLowerCase()}. A simple website would let customers check hours, services and availability outside opening times, and would cut the phone interruptions that happen while the team is serving.`,
    lostOpportunities: [
      'Enquiries that arrive outside opening hours go unanswered, because there is nowhere for them to land.',
      `People new to the area searching for ${business.category.toLowerCase()} in Barnsley find competitors who do have a website.`,
      'Routine questions about hours, location and prices take up phone time that could be spent on paying work.',
      business.estimatedLostRevenuePerMonth
        ? `The directory estimates ${business.estimatedLostRevenuePerMonth} in missed opportunity for this record — treat it as a rough figure to sanity-check, not a measured one.`
        : 'Repeat visits depend on customers remembering to call, with no automated reminder or re-booking path.',
    ].filter(Boolean),
    recommendedSolutions: [
      business.recommendedPackage,
      'A fast mobile page with a one-tap call button, a map and clear opening hours.',
      'A short enquiry form that captures the details you would otherwise take over the phone.',
      'A link that asks happy customers to leave a review, so the rating keeps growing.',
    ],
    coldOutreachEmail: `Subject: A quick idea for ${business.name}

Hi there,

I'm based locally in South Yorkshire, and I've been looking at the businesses Barnsley residents recommend most. ${business.name} came up again and again — ${business.reviewsCount} reviews at ${business.rating}★ is genuinely impressive for a ${business.category.toLowerCase().replace('&', 'and')} business.

One thing stood out: there's no website for ${business.name}. That means anyone searching after you've closed, or anyone new to the area, has no way to find your hours or get in touch without picking up the phone during the working day.

I've put together a short, no-obligation mock-up of what a simple site could look like for you. It focuses on three things: making you easy to find, cutting down routine phone calls, and capturing enquiries you currently miss outside opening hours.

Would you be open to me sending it over? It takes about two minutes to look at, and if it's not for you, no hard feelings at all.
${notes ? `\nOne more thing you mentioned: ${notes}\n` : ''}
All the best,
${SIGN_OFF}`,
    phoneCallScript: `"Hello, could I speak with the owner or manager?

...

Hi! I'll keep this quick because I know you're busy. My name is ${SIGN_OFF}, I'm local — based here in South Yorkshire.

I was looking at the most recommended ${business.category.toLowerCase().replace('&', 'and')} businesses in Barnsley and ${business.name} came up with ${business.reviewsCount} reviews at ${business.rating} stars, which is outstanding.

The reason I'm calling: I noticed you don't have a website, so anyone searching for you outside opening hours can't find your hours or get in touch. I've built a short preview of what a simple site could look like for ${business.name} — it wouldn't add any admin for you.

What's the best email address to send it to? I'll send it over and you can look at it whenever you get five minutes. No pressure either way."`,
    projectedRoi:
      'No figure is claimed here — a template cannot estimate returns for a specific business. Work it out from two numbers you already know: roughly how many enquiries you miss outside opening hours each week, and what an average job is worth.',
    source: 'template',
  };
}

export function buildResearchTemplate(business: BusinessItem): BusinessResearchData {
  const services = business.primaryServices.length > 0 ? business.primaryServices : ['General enquiry'];

  return {
    businessId: business.id,
    businessName: business.name,
    executiveSummary: `${business.name} is a ${business.category.toLowerCase()} business at ${business.fullAddress}, ${business.area}, Barnsley. It holds ${business.rating}★ from ${business.reviewsCount} reviews and currently trades through ${business.onlinePresence.toLowerCase()}, with no website. That combination — strong reputation, no web presence — is the reason it is in this directory. The notes below are a working brief assembled from the directory record; the sections marked "to confirm" need a phone call or a visit before you rely on them.`,
    brandIdentity: {
      voice: 'Straightforward, warm and local. Plain English, no jargon, no hard sell.',
      vibe: 'Established and dependable rather than flashy. Photography of real work and real premises will outperform stock imagery.',
      targetAudience: `Households and businesses in ${business.area} and the surrounding Barnsley borough, plus commuters and newer residents who search online before they buy locally.`,
      colorScheme: {
        primary: '#0F172A',
        secondary: '#F8FAFC',
        accent: '#B45309',
        rationale:
          'Deep slate reads as established and trustworthy; warm amber is used sparingly for calls to action so they stand out without shouting.',
      },
      typography: {
        heading: 'Outfit',
        body: 'Plus Jakarta Sans',
      },
    },
    operationalProfile: {
      estimatedHours: 'To confirm — call ahead rather than publishing guessed hours.',
      serviceRadius: `${business.area}, Barnsley and the surrounding South Yorkshire borough. Confirm the travel boundary before publishing it.`,
      coreOfferings: services.slice(0, 4).map((title) => ({
        title,
        description: `Describe what a customer actually receives, in one or two plain sentences. Confirm the detail with the owner.`,
        priceGuide: 'To confirm — do not publish a price you have not agreed.',
      })),
    },
    reputationAndSentiment: {
      topPraises: [
        `${business.rating}★ across ${business.reviewsCount} reviews (snapshot taken when this record was added — re-check before quoting it).`,
        business.successProof,
        'Locally established rather than a regional chain.',
      ],
      frictionPointsSolvedByWeb: [
        'Enquiries arriving outside opening hours have nowhere to land.',
        'Routine questions about hours, prices and location consume phone time during the working day.',
        'Newcomers to the area searching online find competitors who do have a website.',
        'Repeat business depends on the customer remembering to call back.',
      ],
      localTrustFactors: [
        'Independent and locally based.',
        'Established trading history in the Barnsley borough.',
        'A published address and landline, so customers can verify the business is real.',
      ],
    },
    localCompetitiveAnalysis: {
      barnsleyCompetitors:
        'To confirm with a local search: check who currently ranks for the obvious searches in this sector and postcode. That exercise takes ten minutes and is more reliable than any assumption in a template.',
      differentiators: [
        'Personal accountability — the person who answers is the person doing the work.',
        'Local knowledge and a reputation built over years in the same community.',
        business.whyNoWebsite,
      ],
    },
    digitalArchitecture: {
      primaryConversionGoal: `A customer can find ${business.name} outside opening hours and make contact without playing phone tag.`,
      keyUserJourneys: [
        'Someone searches on their phone, finds the site, checks hours and taps to call.',
        'Someone finds the site out of hours and sends a short enquiry instead of giving up.',
        'An existing customer checks hours or a service detail without calling.',
        'A happy customer follows a link to leave a review.',
      ],
      requiredIntegrations: [
        'Click-to-call on a real phone number (essential on mobile).',
        'A map and directions to the premises.',
        'A short enquiry form that emails the owner, with an auto-reply setting expectations for a response time.',
      ],
    },
    selfHealingAiRequirements: {
      autonomousAdminFeatures: [
        'Opening hours editable by the owner without a developer.',
        'Holiday and closure notices that can be switched on and off.',
        'Enquiries delivered by email, with a filter for anything urgent.',
      ],
      selfHealingSentinelChecks: [
        'Check weekly that the enquiry form actually delivers — form failures are silent.',
        'If the map fails to load, fall back to a plain text address and a directions link.',
        'Keep the phone number as static text so it never depends on a script.',
      ],
      automatedCustomerSupportScopes: [
        `Answer only factual questions drawn from ${business.name}'s own published details.`,
        'Hand anything involving pricing, availability or a complaint to a human immediately.',
        `Always surface the direct number (${business.phone}) as the escalation route.`,
      ],
    },
    source: 'template',
  };
}

export function buildWebsitePromptTemplate(
  business: BusinessItem,
  _research?: BusinessResearchData | null,
  focusArea = '',
): WebsiteBuilderPrompt {
  const services = business.primaryServices.length > 0 ? business.primaryServices : ['General enquiry'];
  const focus = focusArea.trim();

  const markdown = `# Website brief — ${business.name}

**Generated:** ${new Date().toISOString().slice(0, 10)}
**Generated by:** Barnsley Offline Business Directory (offline template — no AI call was made)
**Status:** Working brief. Any field marked *to confirm* must be verified with the owner before it is published.

---

## 1. Business details

| Field | Value |
| --- | --- |
| Business name | ${business.name} |
| Sector | ${business.category} |
| Address | ${business.fullAddress} |
| Postcode | ${business.postcode} |
| Telephone | ${business.phone} |
| Area | ${business.area}, Barnsley |
| Reputation | ${business.rating}★ from ${business.reviewsCount} reviews *(snapshot — re-check)* |
| Current online presence | ${business.onlinePresence} |
| No-website reason | ${business.whyNoWebsite} |

${focus ? `## 2. Client-stated focus\n\n${focus}\n` : ''}
## ${focus ? '3' : '2'}. Objective

The single goal: **a customer can find ${business.name} outside opening hours and make contact without phone tag.**

Everything on the site should support that. Nothing should be added because it looks impressive.

## ${focus ? '4' : '3'}. Services to present

${services.map((s) => `- **${s}** — one or two plain sentences on what the customer receives. *To confirm with owner.*`).join('\n')}

Do **not** publish prices until the owner has confirmed them.

## ${focus ? '5' : '4'}. Required pages and sections

1. **Header** — business name, ${business.rating}★ summary, and a prominent tap-to-call button using ${business.phone}. The call button must be visible without scrolling on mobile.
2. **Hero** — one sentence stating what the business does and the area it covers (${business.area} and the surrounding Barnsley borough).
3. **Services** — as listed above.
4. **Hours and location** — *to confirm*. Include a map plus the address as plain text, so the address survives if the map fails to load.
5. **About** — use the existing reputation: ${business.successProof}
6. **Reviews** — link out to the live review profile rather than copying review text onto the site.
7. **Enquiry form** — name, contact method, and a short message. No more than three fields.
8. **Footer** — address, phone, and a link to leave a review.

## ${focus ? '6' : '5'}. Non-negotiable build requirements

- **Mobile first.** Assume a phone on a mediocre connection.
- **Tap-to-call** is the primary conversion, not the form.
- **Accessible:** semantic headings, visible focus states, labels on every input, text contrast meeting WCAG AA, and touch targets of at least 24×24 px.
- **Fast:** no unnecessary libraries, compressed images with width and height set to avoid layout shift.
- **Owner-editable:** hours and closure notices must be changeable without a developer.
- **No invented content.** No fake testimonials, no fabricated prices, no stock photos of a different business.

## ${focus ? '7' : '6'}. What to confirm before launch

- [ ] Exact opening hours
- [ ] Prices, or a decision to omit them
- [ ] The service area / travel boundary
- [ ] Who receives enquiries, and the response time to promise
- [ ] That the review count quoted (${business.reviewsCount}) is still accurate

---

*This brief was generated offline from directory data. It is a starting point for a conversation with the business owner, not a finished specification.*
`;

  return {
    businessId: business.id,
    businessName: business.name,
    markdownContent: markdown,
    charCount: markdown.length,
    generatedAt: new Date().toISOString(),
    source: 'template',
  };
}
