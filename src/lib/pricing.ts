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
  if (!baseline || !Number.isFinite(baseline)) return 0; // empty plans -> Math.max() is -Infinity
  return Math.round((1 - perMonthPrice(plan) / baseline) * 100);
};

// Live (payable) price while a launch-offer window is open: the full `plan.price`
// minus `discountPct`. The full price is shown struck-through. Mirrors the server's
// integer math EXACTLY (payments/views.py `_launch_adjusted_price`): the server
// floors in tiyn (price × 100), so we do the same and convert back to KZT. At the
// seeded −20% this is a whole number; other percentages may carry ≤2 decimals — and
// those decimals equal what EPay actually charges, so displayed always == charged.
export const discountedPrice = (fullPrice: number, discountPct: number): number => {
  const pct = Math.min(Math.max(discountPct, 0), 100);
  const tiyn = Math.round(fullPrice * 100);
  return Math.floor((tiyn * (100 - pct)) / 100) / 100;
};

// Value type MUST match next-intl's t (see src/hooks/useCustomTranslations.ts:3).
// `Record<string, unknown>` is NOT assignable from next-intl's t and fails `npm run build` (TS2322).
type Translator = (key: string, values?: Record<string, string | number | Date>) => string;

// Count-aware period noun via i18n ICU plural keys (relative to the 'pricesModal' namespace).
export const formatPeriod = (interval: string | undefined, count: number, t: Translator): string =>
  t(`billing.per.${normalizeInterval(interval)}`, { count: count > 0 ? count : 1 });
