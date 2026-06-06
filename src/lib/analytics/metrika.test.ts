import { describe, it, expect } from 'vitest';
import { buildMetrikaHitUrl, shouldSendMetrikaHit } from './metrika';

describe('buildMetrikaHitUrl', () => {
  it('returns the pathname unchanged when there are no params', () => {
    expect(buildMetrikaHitUrl('/en/dashboard', '')).toBe('/en/dashboard');
  });

  it('appends the query string when params exist', () => {
    expect(buildMetrikaHitUrl('/en/practice', 'tab=reading')).toBe('/en/practice?tab=reading');
  });

  it('falls back to "/" when pathname is null', () => {
    expect(buildMetrikaHitUrl(null, '')).toBe('/');
  });

  it('ignores null/undefined params', () => {
    expect(buildMetrikaHitUrl('/en', undefined)).toBe('/en');
    expect(buildMetrikaHitUrl('/en', null)).toBe('/en');
  });
});

describe('shouldSendMetrikaHit', () => {
  it('never sends on the first render (ym init already counted the entry page)', () => {
    expect(shouldSendMetrikaHit(true, null, '/en')).toBe(false);
    expect(shouldSendMetrikaHit(true, '/en', '/en/practice')).toBe(false);
  });

  it('sends when the URL changed after the first render', () => {
    expect(shouldSendMetrikaHit(false, '/en', '/en/practice')).toBe(true);
    expect(shouldSendMetrikaHit(false, null, '/en')).toBe(true);
  });

  it('dedupes identical consecutive URLs (e.g. a searchParams reference change)', () => {
    expect(shouldSendMetrikaHit(false, '/en/practice', '/en/practice')).toBe(false);
  });
});
