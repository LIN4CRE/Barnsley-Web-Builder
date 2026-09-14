import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Download,
  FileText,
  Layers,
  MapPin,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Zap,
} from 'lucide-react';
import { Modal } from './Modal';
import { generateWebsitePrompt, researchBusiness } from '@/lib/api';
import { downloadTextFile, sanitiseFilenamePart } from '@/lib/csv';
import type { BusinessItem, BusinessResearchData, WebsiteBuilderPrompt } from '@/types';

interface DeepResearchModalProps {
  business: BusinessItem | null;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'dossier' | 'prompt';

export function DeepResearchModal({ business, isOpen, onClose }: DeepResearchModalProps) {
  const [researchData, setResearchData] = useState<BusinessResearchData | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [researchStep, setResearchStep] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('dossier');

  const [promptData, setPromptData] = useState<WebsiteBuilderPrompt | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [focusArea, setFocusArea] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMounted = useRef(true);
  const intervalRef = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // The original implementation only cleared this interval on the success and
      // error paths, so closing the modal mid-request left it running forever and
      // called setState on an unmounted component.
      if (intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
      if (copyTimer.current !== undefined) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const runDeepResearch = useCallback(async (target: BusinessItem) => {
    setIsResearching(true);
    setResearchStep(1);
    setErrorMessage(null);

    if (intervalRef.current !== undefined) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setResearchStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1400);

    try {
      // Always resolves: falls back to a local template when no AI service is
      // reachable. The only realistic failure is an unexpected throw.
      const result = await researchBusiness(target);
      if (!isMounted.current) return;

      setResearchData(result.data);
      setResearchStep(4);
    } catch (err) {
      if (isMounted.current) {
        setErrorMessage(err instanceof Error ? err.message : 'Research failed unexpectedly.');
      }
    } finally {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      if (isMounted.current) setIsResearching(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !business) return;

    setResearchData(null);
    setPromptData(null);
    setErrorMessage(null);
    setFocusArea('');
    setActiveTab('dossier');
    void runDeepResearch(business);
  }, [isOpen, business, runDeepResearch]);

  const handleGeneratePrompt = async (customFocus?: string) => {
    if (!business) return;

    setIsGeneratingPrompt(true);
    setErrorMessage(null);

    try {
      const result = await generateWebsitePrompt(business, researchData, customFocus ?? focusArea);
      if (!isMounted.current) return;

      setPromptData(result.data);
      setActiveTab('prompt');
    } catch (err) {
      if (isMounted.current) {
        setErrorMessage(err instanceof Error ? err.message : 'Could not build the brief.');
      }
    } finally {
      if (isMounted.current) setIsGeneratingPrompt(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!promptData?.markdownContent) return;
    try {
      await navigator.clipboard.writeText(promptData.markdownContent);
      setCopied(true);
      if (copyTimer.current !== undefined) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.alert('Your browser blocked clipboard access. Use the download button instead.');
    }
  };

  const handleDownloadMarkdown = () => {
    if (!promptData?.markdownContent || !business) return;
    const filename = `website-brief_${sanitiseFilenamePart(business.name)}.md`;
    downloadTextFile(filename, promptData.markdownContent, 'text/markdown');
  };

  if (!business) return null;

  const source = promptData?.source ?? researchData?.source ?? null;
  const progressLabels = [
    'Reading the directory record',
    'Assessing reputation signals',
    'Mapping the local competitive picture',
    'Drafting the website brief',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={business.name}
      description={`${business.area}, Barnsley (${business.postcode}) • ${business.rating}★ from ${business.reviewsCount} reviews • ${business.phone}`}
      className="max-w-4xl"
      hideHeader
    >
      {/* Custom header */}
      <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950 uppercase tracking-wider text-[10px]">
              Website brief builder
            </span>
            <span className="hidden sm:inline text-slate-500" aria-hidden="true">
              •
            </span>
            <span className="text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" aria-hidden="true" />
              {business.area}, Barnsley ({business.postcode})
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display mt-1.5">
            {business.name}
          </h2>

          <p className="text-xs text-slate-300 mt-1">
            <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              {business.rating}
            </span>{' '}
            <span className="text-slate-400">({business.reviewsCount} reviews)</span> •{' '}
            {business.phone} • {business.fullAddress}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors self-end sm:self-center"
          aria-label={`Close research for ${business.name}`}
        >
          <span aria-hidden="true" className="block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </span>
        </button>
      </div>

      {/* Controls */}
      <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div role="tablist" aria-label="Research sections" className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dossier'}
            aria-controls="research-panel-dossier"
            id="research-tab-dossier"
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'dossier'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <span>1. Research dossier</span>
            {researchData && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'prompt'}
            aria-controls="research-panel-prompt"
            id="research-tab-prompt"
            onClick={() => setActiveTab('prompt')}
            disabled={!promptData}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'prompt'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>2. Website brief (.md)</span>
            {promptData && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
                Ready
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!promptData ? (
            <button
              type="button"
              onClick={() => void handleGeneratePrompt()}
              disabled={isResearching || isGeneratingPrompt}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>{isGeneratingPrompt ? 'Building brief…' : 'Generate website brief'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void handleCopyPrompt()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-300" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Download .md</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => void runDeepResearch(business)}
            disabled={isResearching}
            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Re-run research"
          >
            <RefreshCw className={`w-4 h-4 ${isResearching ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {source === 'template' && !isResearching && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong className="font-semibold">Offline template.</strong> No AI service was
            reachable, so this dossier was assembled locally from the directory record. Anything
            marked <em>“to confirm”</em> needs a phone call or a visit before you rely on it.
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isResearching && (
          <div className="py-10" role="status" aria-live="polite">
            <ol className="space-y-3 max-w-md mx-auto list-none p-0">
              {progressLabels.map((label, index) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      index < researchStep
                        ? 'bg-emerald-600 text-white'
                        : index === researchStep
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-hidden="true"
                  >
                    {index < researchStep ? '✓' : index + 1}
                  </span>
                  <span className={index <= researchStep ? 'text-slate-800' : 'text-slate-400'}>
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {!isResearching && activeTab === 'dossier' && researchData && (
          <div
            role="tabpanel"
            id="research-panel-dossier"
            aria-labelledby="research-tab-dossier"
            className="space-y-5"
          >
            <p className="text-sm text-slate-700 leading-relaxed">{researchData.executiveSummary}</p>

            <section aria-labelledby="rd-brand">
              <h3
                id="rd-brand"
                className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                Brand identity
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <dt className="font-semibold text-slate-700">Voice</dt>
                  <dd className="text-slate-600 mt-0.5">{researchData.brandIdentity.voice}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <dt className="font-semibold text-slate-700">Audience</dt>
                  <dd className="text-slate-600 mt-0.5">{researchData.brandIdentity.targetAudience}</dd>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 sm:col-span-2">
                  <dt className="font-semibold text-slate-700">Palette</dt>
                  <dd className="text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                    {(
                      [
                        ['Primary', researchData.brandIdentity.colorScheme.primary],
                        ['Secondary', researchData.brandIdentity.colorScheme.secondary],
                        ['Accent', researchData.brandIdentity.colorScheme.accent],
                      ] as const
                    ).map(([label, colour]) => (
                      <span key={label} className="inline-flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded border border-slate-300 inline-block"
                          style={{ backgroundColor: colour }}
                          aria-hidden="true"
                        />
                        {label} <code className="text-[11px]">{colour}</code>
                      </span>
                    ))}
                  </dd>
                  <dd className="text-slate-500 mt-1.5 text-[11px]">
                    {researchData.brandIdentity.colorScheme.rationale}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="rd-reputation">
              <h3
                id="rd-reputation"
                className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5" aria-hidden="true" />
                Reputation
              </h3>
              <ul className="space-y-1.5 list-disc pl-5 text-sm text-slate-700">
                {researchData.reputationAndSentiment.topPraises.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="rd-friction">
              <h3
                id="rd-friction"
                className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                Friction a website would remove
              </h3>
              <ul className="space-y-1.5 list-disc pl-5 text-sm text-slate-700">
                {researchData.reputationAndSentiment.frictionPointsSolvedByWeb.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section aria-labelledby="rd-offerings" className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <h3
                  id="rd-offerings"
                  className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  Core offerings
                </h3>
                <ul className="space-y-2 list-none p-0">
                  {researchData.operationalProfile.coreOfferings.map((offering) => (
                    <li key={offering.title} className="text-xs">
                      <span className="font-semibold text-slate-800">{offering.title}</span>
                      {offering.priceGuide && (
                        <span className="text-slate-500"> — {offering.priceGuide}</span>
                      )}
                      <p className="text-slate-600 mt-0.5 mb-0">{offering.description}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="rd-journeys" className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <h3
                  id="rd-journeys"
                  className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                  Key user journeys
                </h3>
                <ol className="space-y-1.5 list-decimal pl-5 text-xs text-slate-700">
                  {researchData.digitalArchitecture.keyUserJourneys.map((journey) => (
                    <li key={journey}>{journey}</li>
                  ))}
                </ol>
                <p className="text-[11px] text-slate-500 mt-2 mb-0">
                  <strong className="text-slate-700">Primary goal: </strong>
                  {researchData.digitalArchitecture.primaryConversionGoal}
                </p>
              </section>
            </div>

            <section aria-labelledby="rd-sentinel" className="bg-slate-900 text-white rounded-lg p-4">
              <h3
                id="rd-sentinel"
                className="text-xs font-bold uppercase tracking-wide text-amber-300 mb-2 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Reliability requirements
              </h3>
              <ul className="space-y-1.5 list-disc pl-5 text-xs text-slate-300">
                {researchData.selfHealingAiRequirements.selfHealingSentinelChecks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-300 mt-3 mb-0 flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
                {researchData.selfHealingAiRequirements.automatedCustomerSupportScopes[0] ?? ''}
              </p>
            </section>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
              {source === 'ai'
                ? 'Generated by Gemini — check the detail before sending it anywhere.'
                : 'Assembled offline from the directory record.'}
            </div>
          </div>
        )}

        {!isResearching && activeTab === 'prompt' && promptData && (
          <div role="tabpanel" id="research-panel-prompt" aria-labelledby="research-tab-prompt">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                Website brief ({promptData.charCount.toLocaleString('en-GB')} characters)
              </h3>
              <span className="text-[11px] text-slate-400">
                Generated {new Date(promptData.generatedAt).toLocaleString('en-GB')}
              </span>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-[45vh] overflow-y-auto">
              {promptData.markdownContent}
            </pre>
          </div>
        )}

        {!isResearching && !researchData && !errorMessage && activeTab === 'prompt' && (
          <div className="py-12 text-center text-slate-500 text-sm">
            <Target className="w-8 h-8 mx-auto mb-2 text-slate-300" aria-hidden="true" />
            Generate the website brief to see it here.
          </div>
        )}
      </div>
    </Modal>
  );
}
