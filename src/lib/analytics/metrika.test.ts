import { describe, it, expect } from 'vitest';
import { buildMetrikaHitUrl } from './metrika';

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
