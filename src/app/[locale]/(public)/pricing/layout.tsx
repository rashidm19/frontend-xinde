import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { dehydrate, QueryClient } from '@tanstack/react-query';

import HydrateOnly from '@/app/_providers/HydrateOnly';
import { getPlans } from '@/lib/subscription/getPlans';

type Props = { params: { locale: string } };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata.pricing' });
  return { title: t('title'), description: t('description') };
}

export default async function PricingLayout({ children }: { children: ReactNode }) {
  const plans = await getPlans();
  if (!plans) return <>{children}</>;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: ['/billing/subscriptions/plans'], queryFn: async () => plans });
  return <HydrateOnly state={dehydrate(queryClient)}>{children}</HydrateOnly>;
}
