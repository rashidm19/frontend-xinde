import { describe, it, expect } from 'vitest';
import { pathForStage, screenFromPath, withNext } from './paths';

describe('pathForStage', () => {
  it('login with next', () => {
    expect(pathForStage('unauthenticated', 'en', '/en/dashboard')).toBe('/en/login?next=%2Fen%2Fdashboard');
  });
  it('onboarding without next', () => {
    expect(pathForStage('onboarding', 'ru', null)).toBe('/ru/onboarding');
  });
  it('paywall with next', () => {
    expect(pathForStage('paywall', 'en', '/en/mock')).toBe('/en/paywall?next=%2Fen%2Fmock');
  });
  it('app uses next when present, else dashboard', () => {
    expect(pathForStage('app', 'en', '/en/notes')).toBe('/en/notes');
    expect(pathForStage('app', 'en', null)).toBe('/en/dashboard');
  });
});

describe('screenFromPath', () => {
  it('reads the funnel screen after the locale prefix, ignoring the query', () => {
    expect(screenFromPath('/ru/paywall?next=%2Fru%2Fdashboard')).toBe('paywall');
    expect(screenFromPath('/en/onboarding?step=2')).toBe('onboarding');
  });
  it('returns null for non-funnel paths', () => {
    expect(screenFromPath('/en/dashboard')).toBeNull();
    expect(screenFromPath('/en')).toBeNull();
    expect(screenFromPath('')).toBeNull();
  });
});

describe('withNext', () => {
  it('appends next, encoding it', () => {
    expect(withNext('/en/login', '/en/a?b=c')).toBe('/en/login?next=%2Fen%2Fa%3Fb%3Dc');
  });
  it('returns path unchanged when next is falsy', () => {
    expect(withNext('/en/login', null)).toBe('/en/login');
  });
});
