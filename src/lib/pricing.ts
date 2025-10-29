'use client';

export type NormalizedInterval = 'day' | 'week' | 'month' | 'year';

export const normalizeInterval = (interval?: string): NormalizedInterval => {
  if (!interval) {
    return 'month';
  }

  const normalized = interval.toLowerCase();

  if (normalized === 'day' || normalized === 'week' || normalized === 'month' || normalized === 'year') {
    return normalized;
  }

  return 'month';
};
