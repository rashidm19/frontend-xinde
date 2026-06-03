import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata.onboarding' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
