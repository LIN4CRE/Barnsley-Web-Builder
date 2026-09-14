import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { BARNSLEY_BUSINESSES } from "./src/data/businesses";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or safely with User-Agent header
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Get all curated Barnsley businesses
app.get("/api/businesses", (req, res) => {
  try {
    const { category, area, search } = req.query;
    let list = [...BARNSLEY_BUSINESSES];

    if (category && typeof category === "string" && category !== "All") {
      list = list.filter((b) => b.category === category);
    }
    if (area && typeof area === "string" && area !== "All") {
      list = list.filter((b) => b.area === area);
    }
    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.fullAddress.toLowerCase().includes(q) ||
          b.primaryServices.some((s) => s.toLowerCase().includes(q)) ||
          b.opportunityAngle.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      total: list.length,
      data: list,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Server error" });
  }
});

// API: Generate tailored pitch & outreach strategy for a specific business
app.post("/api/generate-pitch", async (req, res) => {
  try {
    const { businessId, customNotes } = req.body;
    const business = BARNSLEY_BUSINESSES.find((b) => b.id === businessId);

    if (!business) {
      return res.status(404).json({ success: false, error: "Business not found" });
    }

    const ai = getGenAI();

    const prompt = `You are a top-tier digital consultant and web agency strategist advising local businesses in Barnsley, South Yorkshire.
Create a highly persuasive, realistic, and tailored web opportunity proposal and outreach pack for the following real Barnsley business that currently HAS NO WEBSITE:

Business Name: ${business.name}
Sector: ${business.category}
Location: ${business.fullAddress} (Barnsley, South Yorkshire, ${business.postcode})
Years Established: ${business.yearsActive || "Established local favorite"}
Current Reputation: ${business.rating} stars (${business.reviewsCount} reviews) - Status: ${business.statusTag}
Current Online Footprint: ${business.onlinePresence}
Why They Have No Website: ${business.whyNoWebsite}
Core Services: ${business.primaryServices.join(", ")}
Initial Opportunity Angle: ${business.opportunityAngle}
Recommended Package: ${business.recommendedPackage}
${customNotes ? `Additional User Notes: ${customNotes}` : ""}

Provide your answer in strict, valid JSON matching this structure (without markdown fences if possible, or clean JSON):
{
  "businessId": "${business.id}",
  "businessName": "${business.name}",
  "headline": "Punchy 1-line headline summarizing why they urgently need a web presence now",
  "executiveSummary": "2-3 sentences explaining their current strong offline standing in Barnsley and exactly how a modern website unlocks scalable growth without adding administrative burden",
  "lostOpportunities": [
    "Specific lost revenue or opportunity item 1 (e.g. after-hours phone calls missed, competitors stealing Google Maps rank)",
    "Specific lost revenue or opportunity item 2",
    "Specific lost revenue or opportunity item 3"
  ],
  "recommendedSolutions": [
    "Actionable feature 1 (e.g. 24/7 online slot reservation / Click & Collect / zero-commission ordering)",
    "Actionable feature 2",
    "Actionable feature 3"
  ],
  "coldOutreachEmail": "A warm, respectful, hyper-local cold outreach email specifically tailored to a Barnsley business owner. It must praise their local reputation first, highlight an exact friction point (e.g. lost phone bookings / commission fees), and offer a no-obligation 10-minute demo.",
  "phoneCallScript": "A realistic, non-salesy 60-second opening script for calling the owner directly, acknowledging how busy they are, referencing their local 5-star reputation, and offering a quick look at a prototype.",
  "projectedRoi": "Estimated financial or operational return within 90 days (e.g. '+£3,000-£5,000/mo extra revenue or 10 hours saved per week in admin')"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback parsing in case of markdown fences
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      pitch: parsedData,
    });
  } catch (error: any) {
    console.error("Pitch generation error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate pitch proposal",
    });
  }
});

// API: AI Deep Scan for additional offline businesses in specific Barnsley areas or niches
app.post("/api/ai-scan-area", async (req, res) => {
  try {
    const { areaOrNiche } = req.body;
    if (!areaOrNiche || typeof areaOrNiche !== "string") {
      return res.status(400).json({ success: false, error: "areaOrNiche is required" });
    }

    const ai = getGenAI();
    const prompt = `You are an expert local business analyst specialized in the Barnsley and South Yorkshire metropolitan borough (including Barnsley town centre, Wombwell, Hoyland, Penistone, Darton, Royston, Grimethorpe, Cudworth, Goldthorpe, Dodworth, Mapplewell, Silkstone, Carlton, Birdwell).

Analyze and identify potential or known high-reputation local businesses in or near "${areaOrNiche}" that typically thrive through offline reputation, word of mouth, or Facebook only, and frequently lack a dedicated website.

Return a JSON array of 3 to 5 realistic business candidate profiles formatted as JSON:
[
  {
    "id": "slug-name",
    "name": "Business Name",
    "category": "Trades & Home Services | Automotive & Garages | Butchers, Bakers & Food | Town Centre & Victorian Arcade | Cafes, Pubs & Hospitality | Pet Care & Grooming | Health & Beauty",
    "area": "Specific Barnsley Suburb/Area",
    "fullAddress": "Realistic full road and locality in Barnsley area",
    "postcode": "S70 / S71 / S72 / S73 / S74 / S75 postcode",
    "phone": "01226 or 07xxx phone number",
    "rating": 4.8,
    "reviewsCount": 65,
    "yearsActive": "10+ Years",
    "statusTag": "High Reputation",
    "onlinePresence": "Facebook Only | Phone & Word-of-Mouth | Market Counter & Footfall | Directory Profile Only",
    "primaryServices": ["Service 1", "Service 2", "Service 3"],
    "successProof": "Specific reason why they are respected and successful in Barnsley",
    "whyNoWebsite": "Why they have managed to thrive without a modern website so far",
    "opportunityAngle": "The biggest missed opportunity and web angle",
    "opportunityScore": 92,
    "recommendedPackage": "Recommended website solution"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    let list = [];
    try {
      list = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      list = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      candidates: list,
    });
  } catch (error: any) {
    console.error("AI Scan error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to scan area",
    });
  }
});

// API: In-depth research on a selected Barnsley business
app.post("/api/research-business", async (req, res) => {
  try {
    const { businessId } = req.body;
    const business = BARNSLEY_BUSINESSES.find((b) => b.id === businessId);

    if (!business) {
      return res.status(404).json({ success: false, error: "Business not found" });
    }

    let researchResult;

    try {
      const ai = getGenAI();
      const prompt = `You are an elite business analyst and digital transformation architect specializing in Yorkshire small businesses and local commerce.
Conduct an exhaustive, forensic deep-dive research analysis on the following real Barnsley business that currently operates without a website:

Business Name: ${business.name}
Category: ${business.category}
Location: ${business.fullAddress}, Barnsley, South Yorkshire (${business.postcode})
Area/Borough: ${business.area}
Phone: ${business.phone}
Reputation: ${business.rating}★ (${business.reviewsCount} reviews) - ${business.statusTag}
Online Footprint: ${business.onlinePresence}
Why They Have No Website: ${business.whyNoWebsite}
Primary Services: ${business.primaryServices.join(", ")}
Success Proof: ${business.successProof}
Opportunity Angle: ${business.opportunityAngle}
Recommended Package: ${business.recommendedPackage}

Synthesize a complete business dossier in strict JSON format conforming to this structure:
{
  "businessId": "${business.id}",
  "businessName": "${business.name}",
  "executiveSummary": "Deep analysis of why this business has built exceptional goodwill in Barnsley and the operational friction it currently suffers from having no website.",
  "brandIdentity": {
    "voice": "Authentic, reliable Yorkshire tone (e.g. friendly, honest, craftsmanship-focused, unpretentious)",
    "vibe": "Visual aesthetic and atmosphere suitable for this exact business",
    "targetAudience": "Specific Barnsley and South Yorkshire demographic breakdown (homeowners, families, local commuters, trade professionals)",
    "colorScheme": {
      "primary": "Hex color code e.g. #0F172A",
      "secondary": "Hex color code e.g. #F8FAFC",
      "accent": "Hex color code e.g. #D97706",
      "rationale": "Why these colors embody their trade and heritage"
    },
    "typography": {
      "heading": "Recommended display font name",
      "body": "Recommended body font name"
    }
  },
  "operationalProfile": {
    "estimatedHours": "Realistic operational hours for this trade in Barnsley (e.g. Mon-Fri 08:00 - 17:30, Sat 08:00 - 13:00, Sun Closed)",
    "serviceRadius": "Geographic reach across South Yorkshire (e.g. Barnsley central, Penistone, Dearne Valley, Wakefield border, Rotherham border)",
    "coreOfferings": [
      {
        "title": "Service 1",
        "description": "Specific deliverable and customer expectation",
        "priceGuide": "Realistic UK / Yorkshire price estimate e.g. '£45 - £65' or 'From £120' or 'Free Quote'"
      },
      {
        "title": "Service 2",
        "description": "Specific deliverable",
        "priceGuide": "Realistic price estimate"
      },
      {
        "title": "Service 3",
        "description": "Specific deliverable",
        "priceGuide": "Realistic price estimate"
      },
      {
        "title": "Service 4",
        "description": "Specific deliverable",
        "priceGuide": "Realistic price estimate"
      }
    ]
  },
  "reputationAndSentiment": {
    "topPraises": [
      "Frequent positive praise point 1 from real Barnsley customers (e.g. honesty, never overcharging, warm banter)",
      "Frequent positive praise point 2",
      "Frequent positive praise point 3"
    ],
    "frictionPointsSolvedByWeb": [
      "Operational headache 1 (e.g. phones constantly ringing while under a vehicle or serving counter queues)",
      "Operational headache 2 (e.g. having to manually write down address details or orders on paper pads)",
      "Operational headache 3 (e.g. customers asking if they are open or what prices are)"
    ],
    "localTrustFactors": [
      "Trust badge 1 (e.g. Over ${business.reviewsCount} Google reviews, 4.8★+ rating)",
      "Trust badge 2 (e.g. Barnsley family-run / Master craftsman status)",
      "Trust badge 3 (e.g. Fixed price guarantee / Fully insured)"
    ]
  },
  "localCompetitiveAnalysis": {
    "barnsleyCompetitors": "Analysis of corporate chains or regional competitors in South Yorkshire who currently capture organic search traffic",
    "differentiators": [
      "Key reason why locals prefer this business over impersonal chains 1",
      "Key reason 2",
      "Key reason 3"
    ]
  },
  "digitalArchitecture": {
    "primaryConversionGoal": "The single most important user action on their site (e.g. 'Instant MOT slot reservation', 'Same-day Click & Collect meat hamper order', 'Fast 60-second photo quote request')",
    "keyUserJourneys": [
      "Customer journey 1 from Google search to confirmed booking",
      "Customer journey 2 for repeat Barnsley patrons",
      "Customer journey 3 for after-hours emergency or custom inquiry"
    ],
    "requiredIntegrations": [
      "Integration 1 (e.g. Direct WhatsApp Click-to-Chat)",
      "Integration 2 (e.g. Interactive Google Map with Barnsley travel times)",
      "Integration 3 (e.g. Zero-commission booking/order store with SMS confirmation)"
    ]
  },
  "selfHealingAiRequirements": {
    "autonomousAdminFeatures": [
      "Owner can text/voice an AI copilot to update opening hours, prices, or announce holidays without touching code",
      "AI automatically sorts and ranks customer inquiries, detecting urgent jobs vs general queries",
      "Automated SMS/Email reminders sent to customers to reduce no-shows by 95%"
    ],
    "selfHealingSentinelChecks": [
      "Automatic failover to offline cached hours & direct phone links if any external booking API goes down",
      "Automated daily sanity ping checking broken image links, form submission latency, and database responsiveness",
      "Self-contained state persistence that preserves booking drafts even if user refreshes or loses connection",
      "Auto-logging and plain-English error explanation for the owner with 1-click self-repair triggers"
    ],
    "automatedCustomerSupportScopes": [
      "24/7 AI Receptionist trained specifically on ${business.name}'s services, Barnsley service boundaries, and pricing rules",
      "Graceful escalation to direct phone call (${business.phone}) for complex or out-of-scope requests"
    ]
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const responseText = response.text || "{}";
      try {
        researchResult = JSON.parse(responseText);
      } catch {
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        researchResult = JSON.parse(cleaned);
      }
    } catch (aiErr) {
      console.warn("Gemini API call fallback for research:", aiErr);
      // High-quality structured fallback based on curated business data
      researchResult = {
        businessId: business.id,
        businessName: business.name,
        executiveSummary: `${business.name} is one of Barnsley's most respected ${business.category.toLowerCase()} providers, located at ${business.fullAddress}. While maintaining a stellar ${business.rating}★ rating from ${business.reviewsCount} verified reviews, it operates entirely offline through ${business.onlinePresence}. The owner's time is heavily consumed by manual telephone management and physical queues.`,
        brandIdentity: {
          voice: "Warm, grounded, honest Yorkshire tone — straightforward, reliable, and deeply proud of quality workmanship.",
          vibe: "Clean, dependable, community-rooted craftsmanship.",
          targetAudience: "Local residents, families, and vehicle/homeowners in Barnsley and surrounding South Yorkshire districts.",
          colorScheme: {
            primary: "#0F172A",
            secondary: "#F8FAFC",
            accent: "#059669",
            rationale: "Deep authoritative slate paired with crisp off-white and trust-inspiring emerald green."
          },
          typography: {
            heading: "Plus Jakarta Sans",
            body: "Inter"
          }
        },
        operationalProfile: {
          estimatedHours: "Monday - Friday: 08:30 - 17:30 | Saturday: 08:30 - 13:00 | Sunday: Closed",
          serviceRadius: "Barnsley Metropolitan Borough, Dearne Valley, and surrounding South Yorkshire communities within 15 miles.",
          coreOfferings: business.primaryServices.map((s, idx) => ({
            title: s,
            description: `Professional, reliable ${s.toLowerCase()} delivered with local Yorkshire expertise and transparent pricing.`,
            priceGuide: idx === 0 ? "Competitive Local Rate" : "Free Honest Quote"
          }))
        },
        reputationAndSentiment: {
          topPraises: [
            "Tremendous honesty and never recommends unnecessary work or overpriced extras",
            "Friendly, approachable local team who treat customers like neighbors",
            "Flawless workmanship that has earned repeat business for years"
          ],
          frictionPointsSolvedByWeb: [
            "Customer calls go to voicemail or ring out during peak work hours",
            "Lack of instant online slot reservation or quote estimates after 6 PM",
            "New residents in Barnsley finding inferior regional competitors on Google Maps"
          ],
          localTrustFactors: [
            `Over ${business.reviewsCount} verified customer reviews with ${business.rating}★ rating`,
            `Established local favorite in ${business.area}, Barnsley`,
            "100% transparent pricing with direct telephone support"
          ]
        },
        localCompetitiveAnalysis: {
          barnsleyCompetitors: "Corporate regional chains that dominate paid Google ads but lack authentic local goodwill and personal care.",
          differentiators: [
            "Personalized, accountable service from real local specialists",
            "Decades of word-of-mouth trust and community recommendations",
            "Significantly fairer pricing without hidden corporate franchise fees"
          ]
        },
        digitalArchitecture: {
          primaryConversionGoal: `Instant 24/7 direct inquiry and service reservation for ${business.name}`,
          keyUserJourneys: [
            "Mobile user finds site -> Checks 5-star Barnsley reviews -> Taps 1-click booking/quote -> Receives instant confirmation",
            "Emergency caller -> Taps direct telephone button or sends WhatsApp message -> Owner receives structured alert",
            "Repeat customer -> Checks current opening hours and service catalog -> Places request without phone tag"
          ],
          requiredIntegrations: [
            "Direct 1-Click WhatsApp & Call integration",
            "Interactive Google Maps directions module with Barnsley postcode locator",
            "Automated booking inquiry management system with instant email/SMS notifications"
          ]
        },
        selfHealingAiRequirements: {
          autonomousAdminFeatures: [
            "Owner conversational Copilot: update prices, hours, or holiday closures by typing natural language messages",
            "Automated inquiry triaging: tags high-priority jobs and organizes the daily schedule",
            "Automated client follow-up: sends post-service satisfaction surveys and collects Google reviews"
          ],
          selfHealingSentinelChecks: [
            "Automatic graceful degradation: if an external API is down, fallback smoothly to local forms and telephone links",
            "Continuous heartbeat monitoring: automated sanity checks on form validation, layout rendering, and assets",
            "Self-contained persistent storage: customer drafts and bookings remain safe even during accidental browser refreshes",
            "Automatic diagnostic logging: detects client-side glitches and applies self-repair scripts"
          ],
          automatedCustomerSupportScopes: [
            `24/7 AI Receptionist trained on ${business.name}'s exact offerings, Barnsley service zone, and pricing guidelines`,
            `Direct seamless handoff to phone (${business.phone}) for complex inquiries`
          ]
        }
      };
    }

    res.json({
      success: true,
      data: researchResult,
    });
  } catch (error: any) {
    console.error("Research business error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to research business" });
  }
});

// API: Generate the Master Production Prompt for Building the Website (with Self-Healing AI & Autonomous Maintenance)
app.post("/api/generate-website-prompt", async (req, res) => {
  try {
    const { businessId, researchData, focusArea } = req.body;
    const business = BARNSLEY_BUSINESSES.find((b) => b.id === businessId);

    if (!business) {
      return res.status(404).json({ success: false, error: "Business not found" });
    }

    let markdownPrompt: string = "";

    try {
      const ai = getGenAI();
      const prompt = `You are the Principal Solutions Architect and Prompt Engineer at an elite web engineering studio.
You are generating the definitive, exhaustive, production-grade AI System Prompt that will be given to an AI coder (or IDE agent) to build a PERFECT, FULLY AUTONOMOUS, SELF-MAINTAINING web application for the following real Barnsley business:

Business Details:
- Name: ${business.name}
- Category: ${business.category}
- Address: ${business.fullAddress}, Barnsley, South Yorkshire (${business.postcode})
- Telephone: ${business.phone}
- Rating: ${business.rating}★ (${business.reviewsCount} reviews)
- Status: ${business.statusTag}
- Current Setup: ${business.onlinePresence} (No website)
- Recommended Solution: ${business.recommendedPackage}
${focusArea ? `- Special Focus: ${focusArea}` : ""}

Research Insights:
${researchData ? JSON.stringify(researchData, null, 2) : "High reputation local Yorkshire business needing 24/7 booking, quote generator, review wall, and self-healing AI"}

CRITICAL USER SPECIFICATION:
"The file or text copied will have everything needed to build the perfect website for that business with built-in ai to help manage and fix any issues. Needs to be able to maintain and on it's self once hosted."

Generate an exhaustive, impeccably structured MARKDOWN prompt document (.MD) that includes:
1. Master Mission Statement & Role Directive for the AI Developer
2. Complete Business Context & Local Barnsley Trust Architecture
3. Full User Journey & Feature Specifications:
   - Sticky conversion header with 1-click calling (${business.phone}) and WhatsApp
   - Hero section with Barnsley-centric value proposition and social proof
   - Interactive Live Booking / Quote Estimator widget tailored to ${business.category}
   - Transparent Service & Pricing breakdown
   - Real Customer Reviews Wall (showcasing the ${business.rating}★ rating and ${business.reviewsCount} reviews)
   - Interactive Location & Travel Time Map for Barnsley and South Yorkshire
4. Built-In Autonomous AI Management Copilot (For the Business Owner):
   - Natural language admin chat assistant: owner can say "I'm closed this bank holiday Monday" or "Add a 10% seasonal discount" or "Raise tyre puncture repair to £25", and the AI updates the site state immediately without editing code.
   - Lead summarizer & smart triage: ranks urgent job requests.
5. Built-In Autonomous Self-Healing & Site Maintenance Sentinel (For 100% Host-and-Forget Reliability):
   - Automated Heartbeat & Health Check system running periodically.
   - Auto-Failover & Graceful Degradation: If any external API (Maps, email, payments) fails, the site automatically switches to offline cached modes and direct phone links without throwing error screens.
   - Self-Repairing State & Auto-Correction: validates local storage schemas, repairs corrupted drafts, clears stalled buffers, and logs diagnostic health reports in human language.
   - Error Boundary Sentinel that captures runtime exceptions and renders friendly fallback recovery buttons.
6. Technical Architecture & Component Tree:
   - Full stack recommendations (React 19 + TypeScript + Tailwind CSS + Express / Serverless APIs)
   - State management, Local DB schema, and API route declarations.
7. Step-by-Step Implementation Roadmap for the coder.

Format as pure, ready-to-run Markdown (.MD). Do not wrap the entire output in triple backticks if possible, or provide clean markdown text so it can be saved directly as a .MD file.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      markdownPrompt = response.text || "";
    } catch (aiErr) {
      console.warn("Gemini API call fallback for prompt:", aiErr);
    }

    // If Gemini didn't return text or failed, generate a pristine, comprehensive deterministic master prompt
    if (!markdownPrompt || markdownPrompt.trim().length < 100) {
      const research = researchData || {};
      const brandVoice = research?.brandIdentity?.voice || "Warm, honest, trustworthy Yorkshire tone";
      const primaryColor = research?.brandIdentity?.colorScheme?.primary || "#0F172A";
      const accentColor = research?.brandIdentity?.colorScheme?.accent || "#059669";
      const hours = research?.operationalProfile?.estimatedHours || "Mon-Fri: 08:30 - 17:30 | Sat: 08:30 - 13:00";

      markdownPrompt = `# System Prompt: Build Autonomous, Self-Healing Web Application for ${business.name} (Barnsley, South Yorkshire)

## 1. Executive Directive & Role
You are the Lead Full-Stack Architect tasked with building a production-ready, high-converting, and **autonomous self-healing web application** for **${business.name}**, an established local pillar in ${business.area}, Barnsley, South Yorkshire.

### Core Business Identity
- **Business Name:** ${business.name}
- **Sector:** ${business.category}
- **Physical Address:** ${business.fullAddress}, Barnsley, South Yorkshire, ${business.postcode}
- **Direct Telephone:** ${business.phone}
- **Verified Reputation:** ${business.rating}★ (${business.reviewsCount} Google Reviews)
- **Current Offline Status:** ${business.onlinePresence} (Zero existing website)
- **Primary Mission:** Eliminate manual telephone tag, capture 24/7 after-hours bookings, and showcase five-star local craftsmanship.

---

## 2. Mandatory Architectural Constraint: Autonomous Self-Healing & Self-Maintenance
The application **MUST be self-sustaining once hosted**, requiring zero technical maintenance from the business owner.

### A. Autonomous Owner AI Copilot
Implement an integrated conversational AI control center accessible by the owner (/admin/copilot):
- **Natural Language Site Control:** The owner can update opening hours, holiday closures, service descriptions, and pricing simply by typing or speaking natural language (e.g., *"We're closed this Friday for Easter"*, *"Change MOT price to £45"*). The AI parses intent, updates application state, and persists it.
- **Smart Lead Triaging:** Incoming inquiries are automatically categorized by urgency (e.g., "URGENT: Vehicle broken down" vs "General price inquiry") with SMS/email notifications.
- **Automated Customer Follow-Up:** Generates follow-up review collection links 24 hours after service completion.

### B. Autonomous Self-Healing Sentinel System
Implement a background Sentinel module (\`src/services/healthSentinel.ts\`):
1. **Continuous Heartbeat Health Check:** Runs health audits every 60 seconds testing:
   - Form submission handlers & validation rules
   - Local storage schema integrity
   - External integration latency (Google Maps, telephone links)
   - Asset and image availability
2. **Graceful Auto-Failover (No Downtime):**
   - If external APIs fail or are rate-limited, automatically fall back to cached local coordinates and direct \`tel:${business.phone}\` call triggers.
   - If form submission fails, silently stash the user's booking in secure local offline storage and alert the user with a reassuring local confirmation while queuing background retry.
3. **Self-Repair Engine:**
   - Detects corrupted state or stalled buffers, purges bad state, re-seeds default business metadata, and logs an incident report in plain English for the owner.
4. **Resilient Error Boundary:**
   - Wraps all dynamic widgets in visual recovery boundaries with 1-click self-recovery and direct emergency phone access.

---

## 3. Visual & UI/UX Design System
- **Theme Palette:**
  - Primary Base: \`${primaryColor}\` (Deep trustworthy slate)
  - Accent / CTA: \`${accentColor}\` (Vibrant emerald/amber conversion highlight)
  - Surface: Warm off-white (\`#F8FAFC\`)
- **Typography:**
  - Display / Headings: Plus Jakarta Sans (bold, modern, friendly)
  - Body: Inter (legible, high contrast)
- **Brand Voice:** ${brandVoice} — Authentic Yorkshire warmth, unpretentious professionalism, zero generic corporate jargon.

---

## 4. Key User Journeys & Core Features

### 1. Sticky Local Conversion Header
- Business logo, ${business.rating}★ badge, live "Open Now" / "Closed" indicator based on Barnsley local time.
- Prominent high-contrast **"Call ${business.phone}"** and **"Book Service Online"** buttons.

### 2. High-Impact Hero Section
- Bold headline emphasizing local trust: *"Barnsley's Trusted ${business.category} Specialists"*.
- Trust indicators: *"Over ${business.reviewsCount} 5-Star Reviews"*, *"Family Run & Locally Owned"*, *"Transparent Pricing"*.
- Direct quick-action widget (Instant Quote / Slot Checker).

### 3. Interactive Service & Price Estimator
- Tailored for ${business.category}:
${business.primaryServices.map((s) => `  - **${s}**: Interactive selection with estimated pricing, duration, and instant slot request.`).join("\n")}
- Instant quote calculation that updates dynamically without page reloads.

### 4. 24/7 Booking & Reservation Engine
- 3-step streamlined booking:
  1. Select Service & Vehicle/Property details
  2. Pick preferred date & morning/afternoon slot
  3. Enter Name, Barnsley postcode, and Phone number
- Instant confirmation screen with WhatsApp notification link.

### 5. Verified Customer Reviews & Yorkshire Social Proof
- Dynamic review carousel showcasing real customer praise points.
- Highlight badges: *"Honest Advice"*, *"Fair Pricing"*, *"Never Overcharges"*.
- Direct link for happy clients to leave a new Google review.

### 6. Interactive Barnsley Location & Coverage Map
- Shows exact premises at **${business.fullAddress} (${business.postcode})**.
- Turn-by-turn directions button linking to Google Maps / Apple Maps.
- Service territory coverage chips (Barnsley Centre, Pogmoor, Mapplewell, Wombwell, Penistone, Hoyland, Royston, Darton).

---

## 5. Technical Stack & Implementation Blueprint

### Recommended Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend:** Node.js Express API / Serverless routes
- **Database & Persistence:** Cloud Firestore or self-contained resilient LocalStorage state with sync
- **AI Integration:** Google GenAI (@google/genai) with model \`gemini-3.8-flash\`
- **Hosting Port:** 3000 (bind to 0.0.0.0)

### Key Files to Create
1. \`src/types.ts\` - Data models for Services, Bookings, AI Audit Logs, Health Metrics.
2. \`src/data/businessConfig.ts\` - Master source of truth for ${business.name} contact info, hours, and catalog.
3. \`src/services/healthSentinel.ts\` - Self-healing monitor, auto-failover, and error recovery.
4. \`src/services/aiCopilot.ts\` - Owner assistant for natural language price/hours modifications.
5. \`src/components/BookingWidget.tsx\` - 24/7 interactive booking portal.
6. \`src/components/QuoteCalculator.tsx\` - Dynamic price estimator.
7. \`src/components/AdminCopilotModal.tsx\` - Owner's AI control panel.
8. \`src/components/ReviewWall.tsx\` - Social proof engine.

---

## 6. Execution Instructions
Now implement this web application step-by-step. Ensure all code is cleanly typed, mobile-responsive, and contains zero placeholder stubs. Deliver an experience that the owner of **${business.name}** can launch immediately and trust to operate autonomously.`;
    }

    res.json({
      success: true,
      data: {
        businessId: business.id,
        businessName: business.name,
        markdownContent: markdownPrompt.trim(),
        charCount: markdownPrompt.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Generate prompt error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to generate website prompt" });
  }
});


// Setup Vite middleware for development, and static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Barnsley Offline Businesses Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
