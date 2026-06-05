import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import Error503 from '@/app/[locale]/(public)/Error503/page';
import { getMeCached, getSubscriptionCached, getBalanceCached } from '@/lib/funnel/serverData';
import { resolveFunnelStage } from '@/lib/funnel/resolveStage';
import { pathForStage, screenFromPath } from '@/lib/funnel/paths';
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';
import { UpstreamServiceError } from '@/lib/api/errors';
import type { User } from '@/types/types';
import type { IClientSubscription, IBillingBalance } from '@/types/Billing';

export const dynamic = 'force-dynamic';

export default async function FunnelZoneLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { locale } = params;
  const originalUrl = headers().get('x-sb-original-url') ?? '';
  const nextParam = new URLSearchParams(originalUrl.split('?')[1] ?? '').get('next');
  const incomingNext = sanitizeNextPath(nextParam, locale);

  let me: User | null;
  let subscription: IClientSubscription | null;
  let balance: IBillingBalance | null;
  try {
    [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
  } catch (error) {
    if (error instanceof UpstreamServiceError) return <Error503 />;
    throw error;
  }
  const stage = resolveFunnelStage({ me, subscription, balance });

  if (stage === 'app') redirect(pathForStage('app', locale, incomingNext)); // done → leave funnel
  if (stage === 'unauthenticated') redirect(pathForStage('unauthenticated', locale, incomingNext)); // defensive

  const requested = screenFromPath(originalUrl); // 'onboarding' | 'paywall'
  if (requested !== stage) redirect(pathForStage(stage, locale, incomingNext)); // wrong step → your step

  return <>{children}</>;
}
