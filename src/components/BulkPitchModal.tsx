import React, { useState } from 'react';
import { X, Sparkles, Download, Copy, Check, FileText, Phone, Mail, ChevronRight, Building, CheckCircle2 } from 'lucide-react';
import { BusinessItem } from '../types';

interface BulkPitchModalProps {
  businesses: BusinessItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const BulkPitchModal: React.FC<BulkPitchModalProps> = ({ businesses, isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeBusinessId, setActiveBusinessId] = useState<string>(businesses[0]?.id || '');

  if (!isOpen || businesses.length === 0) return null;

  const currentBusiness = businesses.find((b) => b.id === activeBusinessId) || businesses[0];

  const generatePitchContentFor = (b: BusinessItem) => {
    return {
      email: `Subject: Quick question regarding ${b.name} (${b.area})

Hi ${b.name} team,

I live locally in South Yorkshire and have been following your outstanding ${b.rating}★ reputation across ${b.area}. With ${b.reviewsCount} customer reviews, it's clear the Barnsley community trusts you.

I noticed that you don't currently have an active website, which means after-hours customers searching for ${b.category.toLowerCase()} in South Yorkshire either can't find direct hours/pricing or end up contacting competitors.

Based on your current trade volume, we estimate you could be losing £${b.estimatedLostRevenuePerMonth || '2,500 - £4,000'} monthly in missed after-hours inquiries.

We have drafted a focused prototype solution:
• ${b.recommendedPackage}
• 1-Click WhatsApp & Mobile Calling integration
• Automated customer booking & inquiry intake

Would you be open to a 3-minute video showing the live preview?

Warm regards,
Barnsley Web Studio
01226 800 000`,

      phoneScript: `"Hello, could I speak with the business owner or manager?
...
Hi! Calling quickly because I love your work in Barnsley. My name is [Your Name] from Barnsley Web Studio. We noticed ${b.name} has one of the highest ratings in town (${b.rating} stars), but no website. We built a 3-minute interactive web preview specifically for ${b.name} to help capture after-hours customers and cut down phone interruptions. Where is the best email or mobile number to send the preview link?"`,
    };
  };

  const handleCopySingle = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllEmails = () => {
    const combined = businesses
      .map((b) => {
        const pitch = generatePitchContentFor(b);
        return `=== ${b.name} (${b.phone}) ===\n${pitch.email}\n\n`;
      })
      .join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleDownloadMarkdownDossier = () => {
    const mdContent = `# Barnsley High-Opportunity Offline Businesses Pitch Dossier
Generated: ${new Date().toLocaleDateString('en-GB')}
Total Businesses: ${businesses.length}

${businesses
  .map((b, i) => {
    const pitch = generatePitchContentFor(b);
    return `## ${i + 1}. ${b.name}
- **Category:** ${b.category}
- **Location:** ${b.area}, ${b.fullAddress} (${b.postcode})
- **Phone:** ${b.phone}
- **Reputation:** ${b.rating}★ (${b.reviewsCount} reviews) - *${b.statusTag}*
- **Current Presence:** ${b.onlinePresence}
- **Web Opportunity Score:** ${b.opportunityScore}/100
- **Estimated Lost Revenue:** ${b.estimatedLostRevenuePerMonth || '£2,500 - £4,000/mo'}
- **Outreach Status:** ${b.status || 'Not Contacted'}
${b.notes ? `- **Private Notes:** ${b.notes}` : ''}

### Success Proof in Barnsley
${b.successProof}

### Web Opportunity Angle
${b.opportunityAngle}

### Recommended Web Solution
${b.recommendedPackage}

### Cold Email Pitch
\`\`\`text
${pitch.email}
\`\`\`

### Phone Call Script (45-sec pitch)
> ${pitch.phoneScript}

---
`;
  })
  .join('\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Barnsley_Batch_Pitch_Dossier_${businesses.length}_Prospects.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activePitch = generatePitchContentFor(currentBusiness);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Batch Outreach Pitch Generator ({businesses.length} Selected)
              </h2>
              <p className="text-xs text-slate-300">
                Custom sales emails, phone scripts, and tailored web proposals for Barnsley prospects
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-700">
            {businesses.length} tailored pitches ready
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyAllEmails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All to Clipboard!' : 'Copy All Emails'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdownDossier}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Batch .MD Dossier</span>
            </button>
          </div>
        </div>

        {/* Main Content Split: Left selector list, Right preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
          {/* Left Column: List of Selected Businesses */}
          <div className="w-full md:w-72 border-r border-slate-200 overflow-y-auto max-h-56 md:max-h-none bg-slate-50/50 p-2 space-y-1">
            {businesses.map((b) => {
              const isSelected = b.id === currentBusiness.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveBusinessId(b.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-semibold text-slate-900">{b.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{b.category} • {b.area}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Business Pitch Dossier */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {currentBusiness.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentBusiness.fullAddress} • {currentBusiness.phone} • {currentBusiness.rating}★ ({currentBusiness.reviewsCount} reviews)
                </p>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Score: {currentBusiness.opportunityScore}/100
              </span>
            </div>

            {/* Email Pitch Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Personalized Cold Email Outreach</span>
                </span>
                <button
                  onClick={() => handleCopySingle(1, activePitch.email)}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 1 ? 'Copied' : 'Copy Email'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                {activePitch.email}
              </pre>
            </div>

            {/* Phone Pitch Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>45-Second Cold Phone Script</span>
                </span>
                <button
                  onClick={() => handleCopySingle(2, activePitch.phoneScript)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 2 ? 'Copied' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-950 italic leading-relaxed">
                {activePitch.phoneScript}
              </div>
            </div>

            {/* Opportunity Context */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold">Tailored Selling Point:</span>
              <p>{currentBusiness.opportunityAngle}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Pitch Deck
          </button>
        </div>
      </div>
    </div>
  );
};
