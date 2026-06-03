import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { getMeCached, getSubscriptionCached, getBalanceCached } from '@/lib/funnel/serverData';
import { resolveFunnelStage } from '@/lib/funnel/resolveStage';
import { pathForStage, screenFromPath } from '@/lib/funnel/paths';
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';

export const dynamic = 'force-dynamic';

export default async function FunnelZoneLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { locale } = params;
  const originalUrl = headers().get('x-sb-original-url') ?? '';
  const nextParam = new URLSearchParams(originalUrl.split('?')[1] ?? '').get('next');
  const incomingNext = sanitizeNextPath(nextParam, locale);

  const [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
  const stage = resolveFunnelStage({ me, subscription, balance });

  if (stage === 'app') redirect(pathForStage('app', locale, incomingNext)); // done → leave funnel
  if (stage === 'unauthenticated') redirect(pathForStage('unauthenticated', locale, incomingNext)); // defensive

  const requested = screenFromPath(originalUrl); // 'onboarding' | 'paywall'
  if (requested !== stage) redirect(pathForStage(stage, locale, incomingNext)); // wrong step → your step

  return <>{children}</>;
}
