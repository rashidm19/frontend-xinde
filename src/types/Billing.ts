export interface IService {
  name: string;
  id: string;
  mocks_count: number;
  practice_count: number;
  price: number;
}

export interface ISubscriptionPlan {
  id: number;
  name: string;
  price: number;
  interval: string;
  interval_count: number;
  mocks_per_period: number;
  practice_per_period: number;
  trial_days: number;
  is_active: boolean;
  is_period_manual: boolean;
  period_start: string | null;
  period_end: string | null;
  features?: string[];
}
