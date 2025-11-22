import { ANON_ID_STORAGE_KEY } from './constants';
import { IS_NOT_PROD_ENV } from '@/lib/config';

const generateAnonId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 12);
};

export const resolveDistinctId = (userId?: string | number | null): string => {
  if (userId != null) {
    return String(userId);
  }

  if (typeof window === 'undefined') {
    return 'anon:server';
  }

  try {
    const existing = window.localStorage.getItem(ANON_ID_STORAGE_KEY);

    if (existing) {
      return `anon:${existing}`;
    }

    const anon = generateAnonId();
    window.localStorage.setItem(ANON_ID_STORAGE_KEY, anon);
    return `anon:${anon}`;
  } catch (error) {
    if (IS_NOT_PROD_ENV) {
      console.debug('[telemetry] failed to access anon id storage', error);
    }

    return `anon:${generateAnonId()}`;
  }
};
