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

interface PricingPlanLike {
  price: number;
  interval?: string;
  interval_count: number;
}

// Number of months a plan's period spans (for per-month math).
export const monthsInPlan = (interval: string | undefined, count: number): number => {
  const c = count > 0 ? count : 1;
  switch (normalizeInterval(interval)) {
    case 'year':
      return c * 12;
    case 'week':
      return Math.max(1, Math.round((c * 7) / 30));
    case 'day':
      return Math.max(1, Math.round(c / 30));
    case 'month':
    default:
      return c;
  }
};

// Rounded per-month price in the plan's currency units.
export const perMonthPrice = (plan: PricingPlanLike): number => Math.round(plan.price / monthsInPlan(plan.interval, plan.interval_count));

// Savings vs the priciest per-month plan (the 1-month plan), 0..100. 0 for the baseline.
export const savingsPct = (plan: PricingPlanLike, plans: PricingPlanLike[]): number => {
  const baseline = Math.max(...plans.map(perMonthPrice));
  if (!baseline) return 0;
  return Math.round((1 - perMonthPrice(plan) / baseline) * 100);
};

// Value type MUST match next-intl's t (see src/hooks/useCustomTranslations.ts:3).
// `Record<string, unknown>` is NOT assignable from next-intl's t and fails `npm run build` (TS2322).
type Translator = (key: string, values?: Record<string, string | number | Date>) => string;

// Count-aware period noun via i18n ICU plural keys (relative to the 'pricesModal' namespace).
export const formatPeriod = (interval: string | undefined, count: number, t: Translator): string =>
  t(`billing.per.${normalizeInterval(interval)}`, { count: count > 0 ? count : 1 });
