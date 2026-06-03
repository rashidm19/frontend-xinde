import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { getMeCached, getSubscriptionCached, getBalanceCached } from '@/lib/funnel/serverData';
import { resolveFunnelStage } from '@/lib/funnel/resolveStage';
import { pathForStage } from '@/lib/funnel/paths';
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';

export const dynamic = 'force-dynamic';

export default async function AppZoneLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { locale } = params;
  const originalUrl = headers().get('x-sb-original-url');

  const [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
  const stage = resolveFunnelStage({ me, subscription, balance });

  if (stage !== 'app') {
    redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));
  }

  return <>{children}</>;
}
