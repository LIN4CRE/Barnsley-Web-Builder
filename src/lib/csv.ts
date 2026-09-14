/**
 * RFC 4180-compliant CSV generation and download.
 *
 * Replaces the previous `data:text/csv;charset=utf-8,` + `encodeURI()` approach,
 * which was broken in three separate ways:
 *   1. `encodeURI` leaves `#`, `&`, `+` and `=` unescaped, so any of those
 *      characters in a business name or note corrupted the payload.
 *   2. `data:` URIs hit browser URL-length limits, so large exports silently
 *      failed on bigger lists.
 *   3. Fields containing newlines (private notes commonly do) produced
 *      structurally invalid CSV.
 */

/** Escape a single value for CSV: quote it, and double any embedded quotes. */
/** Stringify any value without ever producing "[object Object]". */
function stringify(value: unknown): string {
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
    case 'boolean':
    case 'bigint':
      return String(value);
    case 'object':
      return value === null ? '' : (JSON.stringify(value) ?? '');
    default:
      return '';
  }
}

export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = stringify(value);
  // Guard against CSV/formula injection when the file is opened in a spreadsheet.
  const guarded = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export function toCsvRow(values: readonly unknown[]): string {
  return values.map(escapeCsvValue).join(',');
}

export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [toCsvRow(headers), ...rows.map(toCsvRow)].join('\r\n');
}

/**
 * Trigger a file download from a string.
 *
 * Uses a Blob URL (no length limit) and always revokes it to avoid leaking memory.
 * The UTF-8 BOM is prepended so Excel detects the encoding correctly.
 */
export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([`\uFEFF${contents}`], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoking synchronously can cancel the download in Safari; one frame is enough.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function timestampedFilename(prefix: string, extension: string): string {
  const iso = new Date().toISOString().slice(0, 10);
  return `${prefix}_${iso}.${extension}`;
}

/** Strip characters that are unsafe in filenames across Windows/macOS/Linux. */
export function sanitiseFilenamePart(value: string): string {
  return value.replace(/[^\w\-. ]+/g, '_').replace(/\s+/g, '_').slice(0, 80);
}
