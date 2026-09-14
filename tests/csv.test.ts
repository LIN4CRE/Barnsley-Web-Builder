import { describe, expect, it } from 'vitest';
import { escapeCsvValue, toCsv, toCsvRow } from '@/lib/csv';
import { sanitiseFilenamePart } from '@/lib/csv';

describe('escapeCsvValue', () => {
  it('wraps values in quotes', () => {
    expect(escapeCsvValue('Crow')).toBe('"Crow"');
  });

  it('doubles embedded quotes (RFC 4180)', () => {
    expect(escapeCsvValue('Crow"s Garage')).toBe('"Crow""s Garage"');
  });

  it('preserves commas inside a quoted field', () => {
    expect(escapeCsvValue('Barnsley, South Yorkshire')).toBe('"Barnsley, South Yorkshire"');
  });

  it('preserves newlines inside a quoted field', () => {
    // The previous data-URI export broke on these.
    expect(escapeCsvValue('line one\nline two')).toBe('"line one\nline two"');
  });

  it('neutralises spreadsheet formula injection', () => {
    expect(escapeCsvValue('=SUM(A1:A9)')).toBe('"\'=SUM(A1:A9)"');
    expect(escapeCsvValue('+1')).toBe('"\'+1"');
    expect(escapeCsvValue('@import')).toBe('"\'@import"');
  });

  it('renders null and undefined as empty quoted fields', () => {
    expect(escapeCsvValue(null)).toBe('""');
    expect(escapeCsvValue(undefined)).toBe('""');
  });

  it('stringifies numbers', () => {
    expect(escapeCsvValue(4.8)).toBe('"4.8"');
  });
});

describe('toCsvRow / toCsv', () => {
  it('joins values with commas', () => {
    expect(toCsvRow(['a', 'b,c', 'd'])).toBe('"a","b,c","d"');
  });

  it('produces a header row followed by data rows', () => {
    const csv = toCsv(['Name', 'Notes'], [['Crow', 'called\nMonday'], ['Barker', '']]);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('"Name","Notes"');
    expect(lines[1]).toBe('"Crow","called\nMonday"');
  });

  it('uses CRLF line endings per RFC 4180', () => {
    expect(toCsv(['A'], [['1']])).toBe('"A"\r\n"1"');
  });
});

describe('sanitiseFilenamePart', () => {
  it('replaces characters unsafe in filenames', () => {
    expect(sanitiseFilenamePart('Crow"s Garage / Barnsley')).toBe('Crow_s_Garage___Barnsley');
  });

  it('caps the length', () => {
    expect(sanitiseFilenamePart('x'.repeat(200)).length).toBe(80);
  });
});
