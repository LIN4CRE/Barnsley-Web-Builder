import { useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, FileText } from 'lucide-react';
import { Modal } from './Modal';
import { downloadTextFile, sanitiseFilenamePart, timestampedFilename } from '@/lib/csv';
import type { BusinessItem } from '@/types';

interface BulkPitchModalProps {
  businesses: readonly BusinessItem[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bulk outreach templates are always generated locally — they are deterministic
 * and identical for every user, so there is no reason to spend an AI call on
 * each one. The copy is deliberately cautious about figures.
 */
function buildEmail(b: BusinessItem): string {
  return `Subject: A quick idea for ${b.name}

Hi there,

I'm based locally in South Yorkshire and have been looking at the businesses Barnsley residents recommend most. ${b.name} came up repeatedly — ${b.reviewsCount} reviews at ${b.rating}★ is a strong reputation.

I noticed ${b.name} doesn't currently have a website. That means anyone searching after you've closed, or anyone new to the area, has no way to find your hours or get in touch without calling during the working day.

I've put together a short, no-obligation mock-up of what a simple site could look like — focused on making you easy to find, cutting down routine phone calls, and capturing enquiries you currently miss outside opening hours.

Would you be open to me sending it over? Two minutes to look at, and no hard feelings if it isn't for you.

All the best,
[Your name]`;
}

function buildPhoneScript(b: BusinessItem): string {
  return `"Hello, could I speak with the owner or manager?

...

Hi! I'll keep this quick because I know you're busy. My name is [Your name], I'm local — based here in South Yorkshire.

I was looking at the most recommended businesses in ${b.area} and ${b.name} came up with ${b.reviewsCount} reviews at ${b.rating} stars, which is outstanding.

The reason I'm calling: I noticed you don't have a website, so anyone searching for you outside opening hours can't find your hours or get in touch. I've built a short preview of what a simple site could look like for ${b.name} — it wouldn't add any admin for you.

What's the best email address to send it to? I'll send it over and you can look whenever you get five minutes."`;
}

export function BulkPitchModal({ businesses, isOpen, onClose }: BulkPitchModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const entries = useMemo(
    () =>
      businesses.map((b) => ({
        business: b,
        email: buildEmail(b),
        phoneScript: buildPhoneScript(b),
      })),
    [businesses],
  );

  const activeEntry = entries.find((e) => e.business.id === activeId) ?? entries[0];

  if (!isOpen || entries.length === 0 || !activeEntry) return null;

  const afterCopy = (fn: () => void) => {
    fn();
    clearTimers();
    timers.current.push(
      window.setTimeout(() => {
        setCopiedIndex(null);
        setCopiedAll(false);
      }, 2200),
    );
  };

  const copy = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      afterCopy(onSuccess);
    } catch {
      window.alert('Your browser blocked clipboard access. Use the download button instead.');
    }
  };

  const handleDownload = () => {
    const body = entries
      .map(
        ({ business, email, phoneScript }, i) =>
          `## ${i + 1}. ${business.name}\n` +
          `- Sector: ${business.category}\n` +
          `- Location: ${business.area}, ${business.fullAddress} (${business.postcode})\n` +
          `- Phone: ${business.phone}\n` +
          `- Reputation: ${business.rating}★ (${business.reviewsCount} reviews)\n` +
          `- Opportunity score: ${business.opportunityScore}/100\n\n` +
          `### Email\n\n\`\`\`\n${email}\n\`\`\`\n\n` +
          `### Phone script\n\n\`\`\`\n${phoneScript}\n\`\`\`\n`,
      )
      .join('\n---\n\n');

    const header =
      `# Barnsley outreach pack\n\n` +
      `Generated: ${new Date().toLocaleString('en-GB')}\n` +
      `Businesses: ${entries.length}\n\n` +
      `These are offline templates built from directory data. Replace [Your name] and check every ` +
      `detail against the business before sending.\n\n---\n\n`;

    const name =
      entries.length === 1
        ? `outreach_${sanitiseFilenamePart(entries[0]!.business.name)}.md`
        : timestampedFilename(`barnsley_outreach_pack_${entries.length}`, 'md');

    downloadTextFile(name, header + body, 'text/markdown');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Outreach pack — ${entries.length} business${entries.length === 1 ? '' : 'es'}`}
      description="Offline templates built from directory data. Check each one and replace [Your name] before sending."
      className="max-w-3xl"
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => void copy(entries.map((e) => `=== ${e.business.name} ===\n${e.email}`).join('\n\n'), () => setCopiedAll(true))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Copied all</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy all emails</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download .md</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row">
        {/* Business list */}
        <nav
          aria-label="Businesses in this outreach pack"
          className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 max-h-48 sm:max-h-[50vh] overflow-y-auto"
        >
          <ul className="list-none p-0 m-0">
            {entries.map((entry, index) => (
              <li key={entry.business.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(entry.business.id)}
                  aria-current={entry.business.id === activeEntry.business.id}
                  className={`w-full text-left px-3 py-2.5 text-xs border-b border-slate-100 transition-colors cursor-pointer ${
                    entry.business.id === activeEntry.business.id
                      ? 'bg-brand-50 text-brand-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block truncate">{entry.business.name}</span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {index + 1}. {entry.business.area} • {entry.business.rating}★
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 p-5 space-y-4 min-w-0">
          {(['email', 'phoneScript'] as const).map((kind) => {
            const index = entries.findIndex((e) => e.business.id === activeEntry.business.id);
            const text = activeEntry[kind];
            const label = kind === 'email' ? 'Email' : 'Phone script';

            return (
              <section key={kind} aria-labelledby={`bulk-${kind}-heading`}>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3
                    id={`bulk-${kind}-heading`}
                    className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    {label}
                  </h3>
                  <button
                    type="button"
                    onClick={() => void copy(text, () => setCopiedIndex(index))}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed max-h-64 overflow-y-auto">
                  {text}
                </pre>
              </section>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
