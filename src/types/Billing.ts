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
  currency: string;
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
  /** Launch-offer discount (%) applied to `price` while the user's offer window is open. 0/undefined = none. */
  launch_discount_pct?: number;
}

/** Per-user, server-authoritative launch-offer window (see GET /billing/offer). */
export interface ILaunchOffer {
  active: boolean;
  /** ISO timestamp the offer closes at; null when inactive. The countdown binds to this. */
  expiresAt: string | null;
  discountPct: number;
}

export interface IBillingBalance {
  tenge_balance: number;
  mock_balance: number;
  practice_balance: number;
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
