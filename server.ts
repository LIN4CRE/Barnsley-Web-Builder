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
