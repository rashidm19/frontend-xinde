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

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'cancelled'
  | 'canceled'
  | 'expired'
  | (string & {});

export interface IClientSubscription {
  id: string | number;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  plan: ISubscriptionPlan | null;
  subscription_plan?: ISubscriptionPlan | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}
