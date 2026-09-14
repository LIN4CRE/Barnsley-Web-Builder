import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  RefreshCw,
  Cpu,
  TrendingUp,
  MapPin,
  Star,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Code2,
  Phone,
  MessageSquare,
  Activity,
  Zap,
} from 'lucide-react';
import { BusinessItem, BusinessResearchData, WebsiteBuilderPrompt } from '../types';

interface DeepResearchModalProps {
  business: BusinessItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeepResearchModal: React.FC<DeepResearchModalProps> = ({
  business,
  isOpen,
  onClose,
}) => {
  const [researchData, setResearchData] = useState<BusinessResearchData | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [researchStep, setResearchStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'dossier' | 'prompt'>('dossier');

  const [promptData, setPromptData] = useState<WebsiteBuilderPrompt | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [focusArea, setFocusArea] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger research automatically when modal opens with a business
  useEffect(() => {
    if (isOpen && business) {
      setResearchData(null);
      setPromptData(null);
      setErrorMessage(null);
      setActiveTab('dossier');
      runDeepResearch(business.id);
    }
  }, [isOpen, business?.id]);

  const runDeepResearch = async (businessId: string) => {
    setIsResearching(true);
    setResearchStep(1);
    setErrorMessage(null);

    // Simulated progress steps while awaiting API
    const interval = setInterval(() => {
      setResearchStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch('/api/research-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      const json = await res.json();
      clearInterval(interval);

      if (json.success && json.data) {
        setResearchData(json.data);
        setResearchStep(4);
      } else {
        setErrorMessage(json.error || 'Failed to complete research on this business.');
      }
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err?.message || 'Network error during research.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleGeneratePrompt = async (customFocus?: string) => {
    if (!business) return;
    setIsGeneratingPrompt(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-website-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          researchData,
          focusArea: customFocus || focusArea,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setPromptData(json.data);
        setActiveTab('prompt');
      } else {
        setErrorMessage(json.error || 'Failed to generate website prompt.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error generating prompt.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!promptData?.markdownContent) return;
    navigator.clipboard.writeText(promptData.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!promptData?.markdownContent || !business) return;
    const sanitizedName = business.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Website_Prompt_${sanitizedName}_Barnsley.md`;

    const blob = new Blob([promptData.markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !business) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] transition-all">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950 uppercase tracking-wider text-[10px]">
                Autonomous Web Architect
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {business.area}, Barnsley ({business.postcode})
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-semibold">100% Offline Business</span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                {business.name}
              </h2>
              <div className="flex items-center gap-1 text-xs bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-amber-300 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{business.rating}</span>
                <span className="text-slate-400 font-normal">({business.reviewsCount} reviews)</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Tel: <strong className="text-white">{business.phone}</strong> • {business.fullAddress}
            </p>
          </div>

          <button
            id="close-deep-research-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors self-end sm:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Control Bar */}
        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'dossier'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>1. Research Dossier</span>
              {researchData && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('prompt')}
              disabled={!promptData}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'prompt'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>2. Master Website Prompt (.MD)</span>
              {promptData && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800">
                  Ready
                </span>
              )}
            </button>
          </div>

          {/* Action buttons (Generate, Copy, Download) */}
          <div className="flex items-center gap-2 flex-wrap">
            {!promptData ? (
              <button
                id="btn-generate-ai-prompt"
                onClick={() => handleGeneratePrompt()}
                disabled={isResearching || isGeneratingPrompt}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isGeneratingPrompt
                    ? 'Synthesizing Master Prompt...'
                    : 'Generate Website Builder Prompt'}
                </span>
              </button>
            ) : (
              <>
                <button
                  id="btn-copy-prompt"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors shadow-2xs cursor-pointer"
                  title="Copy full markdown prompt to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-300" />
                      <span>Copy Prompt Text</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-download-md"
                  onClick={handleDownloadMarkdown}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
                  title="Download .MD file to disk"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download .MD File</span>
                </button>

                <button
                  onClick={() => handleGeneratePrompt()}
                  disabled={isGeneratingPrompt}
                  className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Regenerate prompt with Gemini AI"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isGeneratingPrompt ? 'animate-spin' : ''}`}
                  />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-700 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Research In-Progress Visualizer */}
          {isResearching && (
            <div className="py-12 px-4 max-w-lg mx-auto text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Conducting Deep Research on {business.name}...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesizing Barnsley local market footprint, reviews, and autonomous self-healing architecture.
                </p>
              </div>

              {/* Step indicator */}
              <div className="space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div
                  className={`flex items-center gap-2.5 ${
                    researchStep >= 1 ? 'text-indigo-900 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${researchStep >= 1 ? 'text-indigo-600' : 'text-slate-300'}`}
                  />
                  <span>1. Extracting service catalog, address records & review reputation</span>
                </div>
                <div
                  className={`flex items-center gap-2.5 ${
                    researchStep >= 2 ? 'text-indigo-900 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${researchStep >= 2 ? 'text-indigo-600' : 'text-slate-300'}`}
                  />
                  <span>2. Analyzing customer sentiment & friction points in South Yorkshire</span>
                </div>
                <div
                  className={`flex items-center gap-2.5 ${
                    researchStep >= 3 ? 'text-indigo-900 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${researchStep >= 3 ? 'text-indigo-600' : 'text-slate-300'}`}
                  />
                  <span>3. Formulating competitive advantage vs regional chains</span>
                </div>
                <div
                  className={`flex items-center gap-2.5 ${
                    researchStep >= 4 ? 'text-indigo-900 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${researchStep >= 4 ? 'text-indigo-600' : 'text-slate-300'}`}
                  />
                  <span>4. Architecting host-and-forget self-healing Sentinel AI system</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: RESEARCH DOSSIER */}
          {!isResearching && activeTab === 'dossier' && researchData && (
            <div className="space-y-5 text-xs">
              {/* Ready to generate prompt banner */}
              {!promptData && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-emerald-900 font-bold text-sm block">
                      Research Complete: Full Blueprint Ready
                    </span>
                    <span className="text-emerald-800 text-xs">
                      Click below to generate the complete Master Markdown Prompt (.MD) with built-in self-healing AI.
                    </span>
                  </div>
                  <button
                    onClick={() => handleGeneratePrompt()}
                    disabled={isGeneratingPrompt}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {isGeneratingPrompt ? 'Generating...' : 'Generate Website Prompt (.MD)'}
                    </span>
                  </button>
                </div>
              )}

              {/* Executive Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-slate-900 font-bold text-sm block font-display">
                  Executive Research Diagnosis
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {researchData.executiveSummary}
                </p>
              </div>

              {/* Brand & Yorkshire Voice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Brand Identity & Yorkshire Voice</span>
                  </span>
                  <div className="text-slate-600 space-y-1 leading-relaxed">
                    <p>
                      <strong className="text-slate-800">Voice Tone: </strong>
                      {researchData.brandIdentity.voice}
                    </p>
                    <p>
                      <strong className="text-slate-800">Target Audience: </strong>
                      {researchData.brandIdentity.targetAudience}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-slate-800 font-semibold">Palette:</span>
                      <span
                        className="inline-block w-4 h-4 rounded border border-slate-300"
                        style={{ backgroundColor: researchData.brandIdentity.colorScheme.primary }}
                        title="Primary"
                      ></span>
                      <span
                        className="inline-block w-4 h-4 rounded border border-slate-300"
                        style={{ backgroundColor: researchData.brandIdentity.colorScheme.accent }}
                        title="Accent"
                      ></span>
                      <span className="text-slate-500 text-[11px]">
                        ({researchData.brandIdentity.colorScheme.rationale})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Operational Territory & Availability</span>
                  </span>
                  <div className="text-slate-600 space-y-1.5 leading-relaxed">
                    <p>
                      <strong className="text-slate-800">Typical Trade Hours: </strong>
                      {researchData.operationalProfile.estimatedHours}
                    </p>
                    <p>
                      <strong className="text-slate-800">Barnsley Coverage Radius: </strong>
                      {researchData.operationalProfile.serviceRadius}
                    </p>
                    <p>
                      <strong className="text-slate-800">Primary Conversion Goal: </strong>
                      <span className="text-emerald-700 font-semibold">
                        {researchData.digitalArchitecture.primaryConversionGoal}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Offerings & Price Guide */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Researched Services & Yorkshire Pricing Guide</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {researchData.operationalProfile.coreOfferings.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{item.title}</span>
                        {item.priceGuide && (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                            {item.priceGuide}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-snug">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Praise vs Operational Friction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real Customer Praise Points</span>
                  </span>
                  <ul className="space-y-1.5 text-emerald-900/90 list-disc list-inside">
                    {researchData.reputationAndSentiment.topPraises.map((praise, idx) => (
                      <li key={idx} className="leading-snug">
                        {praise}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-xl space-y-2">
                  <span className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Offline Headaches Solved by Website</span>
                  </span>
                  <ul className="space-y-1.5 text-rose-900/90 list-disc list-inside">
                    {researchData.reputationAndSentiment.frictionPointsSolvedByWeb.map(
                      (friction, idx) => (
                        <li key={idx} className="leading-snug">
                          {friction}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Built-in Autonomous AI & Self-Healing Architecture (CRITICAL REQUIREMENT) */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    <div>
                      <span className="font-bold text-indigo-950 text-sm block">
                        Autonomous Self-Healing & Maintenance AI Architecture
                      </span>
                      <span className="text-indigo-700 text-xs">
                        Zero-maintenance hosting: monitors errors, auto-fixes glitches, and provides conversational owner control.
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-bold text-[10px] uppercase">
                    Host & Forget
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white border border-indigo-100 rounded-lg space-y-1.5 shadow-2xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Owner Conversational Copilot</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                      {researchData.selfHealingAiRequirements.autonomousAdminFeatures.map(
                        (feat, idx) => (
                          <li key={idx}>{feat}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="p-3 bg-white border border-indigo-100 rounded-lg space-y-1.5 shadow-2xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Self-Healing Sentinel Engine</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                      {researchData.selfHealingAiRequirements.selfHealingSentinelChecks.map(
                        (check, idx) => (
                          <li key={idx}>{check}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER WEBSITE PROMPT (.MD) */}
          {activeTab === 'prompt' && promptData && (
            <div className="space-y-4">
              {/* Header toolbar for prompt */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-xl">
                <div>
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Complete Production Master Prompt</span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {promptData.charCount.toLocaleString()} characters • Formatted as ready-to-save
                    Markdown (.MD)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .MD</span>
                  </button>
                </div>
              </div>

              {/* Prompt Text Preview with Syntax Styling */}
              <div className="p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap select-all">
                {promptData.markdownContent}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>How to use this Master Prompt:</strong> Copy this prompt directly into
                  AI Studio, Cursor, Claude, or any AI coding environment. It will instruct the AI
                  to construct the complete website with the built-in owner AI copilot and
                  self-healing Sentinel system to maintain itself autonomously once hosted.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-500 font-medium shrink-0">Custom Focus:</span>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g. Include online deposits, or prioritize WhatsApp inquiries..."
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => handleGeneratePrompt(focusArea)}
              disabled={isResearching || isGeneratingPrompt}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isGeneratingPrompt ? 'Generating...' : 'Generate AI Prompt'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
