import { describe, expect, it } from 'vitest';
import { parseBusinessItem, parseBusinessList, sanitisePromptInput } from '@/lib/schema';

describe('parseBusinessItem', () => {
  it('accepts a well-formed record', () => {
    const result = parseBusinessItem({
      id: 'test',
      name: 'Test Butchers',
      phone: '01226 111222',
      category: 'Butchers, Bakers & Food',
      rating: 4.8,
      reviewsCount: 40,
      primaryServices: ['Pork pies', 'Sausages'],
    });

    expect(result).not.toBeNull();
    expect(result?.name).toBe('Test Butchers');
    expect(result?.category).toBe('Butchers, Bakers & Food');
  });

  it('rejects a record with no name', () => {
    expect(parseBusinessItem({ phone: '01226 111222' })).toBeNull();
  });

  it('rejects a record with no phone number', () => {
    expect(parseBusinessItem({ name: 'No Phone Ltd' })).toBeNull();
  });

  it('rejects non-objects', () => {
    expect(parseBusinessItem(null)).toBeNull();
    expect(parseBusinessItem('a string')).toBeNull();
    expect(parseBusinessItem(42)).toBeNull();
  });

  it('falls back to a known category when the model invents one', () => {
    const result = parseBusinessItem({ name: 'X', phone: '1', category: 'Spaceship Repair' });
    expect(result?.category).toBe('Trades & Home Services');
  });

  it('clamps a rating into 0-5', () => {
    expect(parseBusinessItem({ name: 'X', phone: '1', rating: 99 })?.rating).toBe(5);
    expect(parseBusinessItem({ name: 'X', phone: '1', rating: -3 })?.rating).toBe(0);
  });

  it('replaces a non-numeric rating instead of producing NaN', () => {
    expect(parseBusinessItem({ name: 'X', phone: '1', rating: 'excellent' })?.rating).toBe(4.5);
  });

  it('clamps the opportunity score into 0-100', () => {
    expect(parseBusinessItem({ name: 'X', phone: '1', opportunityScore: 5000 })?.opportunityScore).toBe(100);
  });

  it('strips non-string entries from services', () => {
    const result = parseBusinessItem({
      name: 'X',
      phone: '1',
      primaryServices: ['Real', 42, null, 'Also real'],
    });
    expect(result?.primaryServices).toEqual(['Real', 'Also real']);
  });

  it('generates an id when one is missing', () => {
    expect(parseBusinessItem({ name: 'X', phone: '1' })?.id).toMatch(/^custom-/);
  });

  it('upper-cases postcodes', () => {
    expect(parseBusinessItem({ name: 'X', phone: '1', postcode: 's70 1gw' })?.postcode).toBe('S70 1GW');
  });

  it('drops an email that is not an email address', () => {
    expect(parseBusinessItem({ name: 'X', phone: '1', email: 'not-an-email' })?.email).toBeUndefined();
    expect(parseBusinessItem({ name: 'X', phone: '1', email: 'a@b.com' })?.email).toBe('a@b.com');
  });
});

describe('parseBusinessList', () => {
  it('drops malformed entries and keeps valid ones', () => {
    const list = parseBusinessList([
      { name: 'Good', phone: '1' },
      { phone: '2' },
      'not an object',
      { name: 'Also good', phone: '3' },
    ]);
    expect(list).toHaveLength(2);
  });

  it('returns an empty array for non-array input', () => {
    expect(parseBusinessList(null)).toEqual([]);
    expect(parseBusinessList({})).toEqual([]);
  });
});

describe('sanitisePromptInput', () => {
  it('strips control characters before the text reaches the model', () => {
    expect(sanitisePromptInput('hello\u0000world')).toBe('hello world');
  });

  it('collapses whitespace', () => {
    expect(sanitisePromptInput('  lots   of    space  ')).toBe('lots of space');
  });

  it('enforces a maximum length', () => {
    expect(sanitisePromptInput('x'.repeat(1000), 10)).toHaveLength(10);
  });
});
