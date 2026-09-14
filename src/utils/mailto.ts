/**
 * Utilities for formatting web-intent mailto links with pre-populated pitch content
 */

export interface ParsedEmailPitch {
  subject: string;
  body: string;
}

/**
 * Extracts subject line and body from generated pitch email text.
 * Handles cases where the AI or template generated "Subject: ..." at the start,
 * or defaults to a professional local partnership subject line.
 */
export function parseEmailPitch(rawEmail: string, businessName: string = 'Your Business', area: string = 'Barnsley'): ParsedEmailPitch {
  if (!rawEmail || !rawEmail.trim()) {
    return {
      subject: `Web Proposal & Prototype for ${businessName} (${area})`,
      body: '',
    };
  }

  const cleanRaw = rawEmail.trim();

  // Match lines like "Subject: ... " at the beginning
  const subjectMatch = cleanRaw.match(/^Subject:\s*([^\n\r]+)(?:[\r\n]+([\s\S]*))?$/i);

  if (subjectMatch) {
    const extractedSubject = subjectMatch[1].trim();
    const extractedBody = (subjectMatch[2] || '').trim();
    return {
      subject: extractedSubject,
      body: extractedBody,
    };
  }

  // If no explicit Subject: line was output, fallback to high-conversion default subject
  return {
    subject: `Digital Opportunity & Prototype for ${businessName} (${area})`,
    body: cleanRaw,
  };
}

/**
 * Builds a RFC-compliant mailto: URI with pre-populated recipient, subject, and body.
 * Formats newlines as CRLF (\r\n) before encoding to guarantee proper line break preservation
 * across desktop and web email clients (Gmail, Outlook, Apple Mail, Thunderbird).
 */
export function buildMailtoUrl({
  to = '',
  subject = '',
  body = '',
}: {
  to?: string;
  subject: string;
  body: string;
}): string {
  const params: string[] = [];

  if (subject.trim()) {
    params.push(`subject=${encodeURIComponent(subject.trim())}`);
  }

  if (body.trim()) {
    // Normalize newlines to \r\n for universal mail client compatibility
    const normalizedBody = body.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    params.push(`body=${encodeURIComponent(normalizedBody)}`);
  }

  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  const cleanTo = to.trim() ? encodeURIComponent(to.trim()) : '';

  return `mailto:${cleanTo}${queryString}`;
}
