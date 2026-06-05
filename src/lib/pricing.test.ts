import { describe, it, expect } from 'vitest';
import { discountedPrice, monthsInPlan, perMonthPrice, savingsPct } from './pricing';

const plans = [
  { price: 8990, interval: 'month', interval_count: 1 },
  { price: 14990, interval: 'month', interval_count: 3 },
  { price: 39990, interval: 'year', interval_count: 1 },
];

describe('monthsInPlan', () => {
  it('months and years', () => {
    expect(monthsInPlan('month', 1)).toBe(1);
    expect(monthsInPlan('month', 3)).toBe(3);
    expect(monthsInPlan('year', 1)).toBe(12);
  });
});

describe('perMonthPrice', () => {
  it('rounds to whole KZT', () => {
    expect(perMonthPrice(plans[0])).toBe(8990);
    expect(perMonthPrice(plans[1])).toBe(4997); // 14990/3 = 4996.67
    expect(perMonthPrice(plans[2])).toBe(3333); // 39990/12 = 3332.5
  });
});

describe('savingsPct', () => {
  it('0 for the monthly baseline, positive for longer terms', () => {
    expect(savingsPct(plans[0], plans)).toBe(0);
    expect(savingsPct(plans[1], plans)).toBe(44);
    expect(savingsPct(plans[2], plans)).toBe(63);
  });
});

describe('discountedPrice', () => {
  it('applies the launch discount (whole KZT at the seeded -20%)', () => {
    expect(discountedPrice(8990, 20)).toBe(7192);
    expect(discountedPrice(14990, 20)).toBe(11992);
    expect(discountedPrice(39990, 20)).toBe(31992);
  });

  it('returns the full price at 0% and clamps out-of-range input', () => {
    expect(discountedPrice(8990, 0)).toBe(8990);
    expect(discountedPrice(1000, 100)).toBe(0);
    expect(discountedPrice(1000, 150)).toBe(0); // clamped to 100
  });

  it('mirrors the server tiyn-floor exactly for non-divisible discounts (displayed == charged)', () => {
    // server: floor(price_tiyn * (100 - pct) / 100) / 100, price_tiyn = kzt * 100
    expect(discountedPrice(8990, 6)).toBe(8450.6); // 899000*94//100 = 845060 tiyn
    expect(discountedPrice(39990, 15)).toBe(33991.5); // 3999000*85//100 = 3399150 tiyn
    const serverPrice = (kzt: number, pct: number) => Math.floor((kzt * 100 * (100 - pct)) / 100) / 100;
    for (const kzt of [8990, 14990, 39990, 1234]) {
      for (const pct of [0, 6, 15, 20, 33, 50]) {
        expect(discountedPrice(kzt, pct)).toBe(serverPrice(kzt, pct));
      }
    }
  });
});
