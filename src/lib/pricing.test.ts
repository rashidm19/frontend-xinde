import { describe, it, expect } from 'vitest';
import { monthsInPlan, perMonthPrice, savingsPct } from './pricing';

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
