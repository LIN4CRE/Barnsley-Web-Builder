/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar } from './components/FilterBar';
import { BusinessCard } from './components/BusinessCard';
import { BusinessTableView } from './components/BusinessTableView';
import { PitchModal } from './components/PitchModal';
import { AiScannerModal } from './components/AiScannerModal';
import { AddBusinessModal } from './components/AddBusinessModal';
import { DeepResearchModal } from './components/DeepResearchModal';
import { BARNSLEY_BUSINESSES } from './data/businesses';
import { BusinessCategory, BusinessItem, FilterOptions, PitchProposal } from './types';
import {
  Building,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Info,
  MapPin,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>(BARNSLEY_BUSINESSES);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    category: 'All',
    area: 'All',
    minRating: 0,
    minOpportunityScore: 0,
    onlinePresence: 'All',
    sortBy: 'score_desc',
  });

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeBusinessForPitch, setActiveBusinessForPitch] = useState<BusinessItem | null>(null);
  const [currentPitch, setCurrentPitch] = useState<PitchProposal | null>(null);
  const [isPitchLoading, setIsPitchLoading] = useState(false);

  // Deep Research & Website Prompt Modal state
  const [activeBusinessForResearch, setActiveBusinessForResearch] = useState<BusinessItem | null>(null);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);

  const handleOpenDeepResearch = (business: BusinessItem) => {
    setActiveBusinessForResearch(business);
    setIsResearchModalOpen(true);
  };

  // Fetch initial businesses from server if reachable
  useEffect(() => {
    fetch('/api/businesses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBusinesses(data.data);
        }
      })
      .catch(() => {
        // Fallback to static verified BARNSLEY_BUSINESSES
      });
  }, []);

  // Unique categories and areas for filters
  const categories = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => set.add(b.category));
    return Array.from(set).sort();
  }, [businesses]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => set.add(b.area));
    return Array.from(set).sort();
  }, [businesses]);

  // Filter & Sort logic
  const filteredBusinesses = useMemo(() => {
    let result = [...businesses];

    // Search query
    if (filters.searchTerm.trim()) {
      const q = filters.searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.fullAddress.toLowerCase().includes(q) ||
          b.postcode.toLowerCase().includes(q) ||
          b.primaryServices.some((s) => s.toLowerCase().includes(q)) ||
          b.opportunityAngle.toLowerCase().includes(q) ||
          b.successProof.toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category !== 'All') {
      result = result.filter((b) => b.category === filters.category);
    }

    // Area
    if (filters.area !== 'All') {
      result = result.filter((b) => b.area === filters.area);
    }

    // Online presence type
    if (filters.onlinePresence !== 'All') {
      result = result.filter((b) => b.onlinePresence === filters.onlinePresence);
    }

    // Rating
    if (filters.minRating > 0) {
      result = result.filter((b) => b.rating >= filters.minRating);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score_desc':
          return b.opportunityScore - a.opportunityScore;
        case 'rating_desc':
          return b.rating !== a.rating ? b.rating - a.rating : b.reviewsCount - a.reviewsCount;
        case 'reviews_desc':
          return b.reviewsCount - a.reviewsCount;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [businesses, filters]);

  // Handle Pitch generation
  const handleOpenPitch = async (business: BusinessItem, customNotes?: string) => {
    setActiveBusinessForPitch(business);
    setIsPitchLoading(true);
    setCurrentPitch(null);

    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          customNotes: customNotes || '',
        }),
      });

      const data = await res.json();
      if (data.success && data.pitch) {
        setCurrentPitch(data.pitch);
      } else {
        // Fallback structured proposal
        setCurrentPitch({
          businessId: business.id,
          businessName: business.name,
          headline: `Capture After-Hours Inquiries & Eliminate Friction for ${business.name}`,
          executiveSummary: `${business.name} has built extraordinary goodwill across Barnsley with an outstanding ${business.rating}★ rating. A focused, modern web presence unlocks after-hours booking and eliminates manual phone tag without disrupting daily trade operations.`,
          lostOpportunities: [
            'Missed customer inquiries after business hours when phones go unanswered',
            'Commuters and out-of-town newcomers in South Yorkshire finding competitors on Google Maps',
            'Manual phone/text tag while serving counter or trade customers during rush periods',
          ],
          recommendedSolutions: [
            business.recommendedPackage,
            'Fast, mobile-friendly landing page with 1-click WhatsApp/Call button and location map',
            'Automated Google review collector & high-resolution project/product portfolio',
          ],
          coldOutreachEmail: `Hi ${business.name} team,

I live locally in South Yorkshire and was recently admiring your phenomenal ${business.rating}-star reputation in ${business.area}.

I noticed you don't currently have an official website, and your customers are either having to ring during busy hours or message on Facebook.

I put together a quick, non-obligation preview of what an automated booking and showcase portal for ${business.name} could look like — helping you capture more bookings while saving you hours on the phone.

Would you be open to taking a 3-minute look at the preview this week?

Best regards,
Local Digital Specialist`,
          phoneCallScript: `"Hi there, is the owner or manager around?
...
Hi! I'll keep this under 45 seconds because I know you're busy running things. My name is [Your Name], I'm based here in South Yorkshire. I was looking through Barnsley's top-rated ${business.category.toLowerCase()} and noticed you have over ${business.reviewsCount} 5-star reviews, which is incredible.

I saw you don't have a dedicated website yet and handle everything by phone. We just built a prototype demo for ${business.name} that could save you hours of phone tag each week. I'd love to just send you the link to look at on your phone whenever you get a break. What's the best email or number to send that to?"`,
          projectedRoi: `Estimated £2,500 - £4,500/mo in captured after-hours bookings and 6-8 hours saved per week in telephone interruptions.`,
        });
      }
    } catch {
      // Fallback
      setCurrentPitch({
        businessId: business.id,
        businessName: business.name,
        headline: `Transform Offline Goodwill into 24/7 Bookings for ${business.name}`,
        executiveSummary: `Leverage ${business.name}'s decades-strong local reputation in Barnsley into an automated online booking and customer funnel.`,
        lostOpportunities: [
          'Uncaptured search traffic from mobile users in Barnsley searching for services after 6 PM',
          'Missed repeat reminders for seasonal maintenance, orders, or appointments',
          'Dependence on third-party algorithms or directory scrapers',
        ],
        recommendedSolutions: [
          business.recommendedPackage,
          'Direct appointment / inquiry engine with zero commissions',
          'Local South Yorkshire SEO optimization',
        ],
        coldOutreachEmail: `Hi ${business.name},\n\nI noticed your stellar reviews across Barnsley. You're losing dozens of after-hours inquiries each week without a website. Would love to show you a 3-minute prototype to help.\n\nBest,\nLocal Specialist`,
        phoneCallScript: `"Hi, calling quickly because I love your work in Barnsley. We built a 3-minute web preview for ${business.name} to save you phone time. Where can I send the link?"`,
        projectedRoi: 'Save 5+ hours of phone coordination weekly and capture after-hours clients.',
      });
    } finally {
      setIsPitchLoading(false);
    }
  };

  // Export CSV functionality
  const handleExportCsv = () => {
    const headers = [
      'Business Name',
      'Sector',
      'Area',
      'Full Address',
      'Postcode',
      'Telephone',
      'Rating',
      'Reviews Count',
      'Status Tag',
      'Current Presence',
      'Opportunity Score (1-100)',
      'Recommended Web Package',
      'Estimated Missed Monthly Revenue',
      'Proof of Success',
      'Why No Website',
      'Pitch Opportunity Angle',
    ];

    const rows = filteredBusinesses.map((b) => [
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.area}"`,
      `"${b.fullAddress.replace(/"/g, '""')}"`,
      `"${b.postcode}"`,
      `"${b.phone}"`,
      b.rating,
      b.reviewsCount,
      `"${b.statusTag}"`,
      `"${b.onlinePresence}"`,
      b.opportunityScore,
      `"${b.recommendedPackage.replace(/"/g, '""')}"`,
      `"${(b.estimatedLostRevenuePerMonth || '').replace(/"/g, '""')}"`,
      `"${b.successProof.replace(/"/g, '""')}"`,
      `"${b.whyNoWebsite.replace(/"/g, '""')}"`,
      `"${b.opportunityAngle.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Barnsley_Offline_Businesses_Prospects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddBusinesses = (newItems: BusinessItem[]) => {
    setBusinesses((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const filtered = newItems.filter((item) => !existingIds.has(item.id));
      return [...filtered, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        totalCount={businesses.length}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barnsley Context Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>South Yorkshire Local Market Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              High-Performing Barnsley Businesses Operating Entirely Offline
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              In Barnsley and surrounding South Yorkshire districts, many of the most reputable butcher shops, MOT garages, tradespeople, and Victorian Arcade boutiques thrive purely on generational word-of-mouth, physical market queues, or Facebook posts. While their diaries are full, they are missing out on after-hours bookings, automated scheduling, and younger online customers.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified high review ratings (4.7★ – 5.0★)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Direct phone & address records included
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Tailored web value propositions ready to pitch
            </span>
          </div>
        </div>

        {/* Metrics Overview */}
        <MetricsBar businesses={businesses} />

        {/* Filters and search */}
        <FilterBar
          filters={filters}
          onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          onReset={() =>
            setFilters({
              searchTerm: '',
              category: 'All',
              area: 'All',
              minRating: 0,
              minOpportunityScore: 0,
              onlinePresence: 'All',
              sortBy: 'score_desc',
            })
          }
          categories={categories}
          areas={areas}
          viewMode={viewMode}
          setViewMode={setViewMode}
          resultsCount={filteredBusinesses.length}
        />

        {/* Listings Display */}
        {filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8 shadow-2xs space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No matching Barnsley businesses found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try relaxing your search terms or filters, or use the <strong>AI Niche Scanner</strong> to discover more candidates in specific Barnsley areas like Penistone, Wombwell, or Hoyland.
            </p>
            <button
              onClick={() =>
                setFilters({
                  searchTerm: '',
                  category: 'All',
                  area: 'All',
                  minRating: 0,
                  minOpportunityScore: 0,
                  onlinePresence: 'All',
                  sortBy: 'score_desc',
                })
              }
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filteredBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onDeepResearch={handleOpenDeepResearch}
                onGeneratePitch={(b) => handleOpenPitch(b)}
                isGeneratingPitch={isPitchLoading && activeBusinessForPitch?.id === business.id}
              />
            ))}
          </div>
        ) : (
          <BusinessTableView
            businesses={filteredBusinesses}
            onDeepResearch={handleOpenDeepResearch}
            onGeneratePitch={(b) => handleOpenPitch(b)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Barnsley Offline Businesses Intelligence</span> • South Yorkshire Borough Directory
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Google GenAI</span>
            <span>•</span>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Scan Suburbs
            </button>
            <span>•</span>
            <button
              onClick={handleExportCsv}
              className="text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
            >
              Export CSV
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PitchModal
        business={activeBusinessForPitch}
        pitch={currentPitch}
        isLoading={isPitchLoading}
        onClose={() => {
          setActiveBusinessForPitch(null);
          setCurrentPitch(null);
        }}
        onRegenerate={(notes) => {
          if (activeBusinessForPitch) {
            handleOpenPitch(activeBusinessForPitch, notes);
          }
        }}
      />

      <AiScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddBusinesses={handleAddBusinesses}
      />

      <AddBusinessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(b) => handleAddBusinesses([b])}
        categories={categories as BusinessCategory[]}
      />

      {/* Deep Research & Autonomous Website Prompt Modal */}
      <DeepResearchModal
        business={activeBusinessForResearch}
        isOpen={isResearchModalOpen}
        onClose={() => {
          setIsResearchModalOpen(false);
          setActiveBusinessForResearch(null);
        }}
      />
    </div>
  );
}
