import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { LoginPageClient } from './_components/LoginPageClient';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata.login' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

interface PageProps {
  params: {
    locale: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function LoginPage({ params, searchParams }: PageProps) {
  return <LoginPageClient locale={params.locale} searchParams={searchParams} />;
}
