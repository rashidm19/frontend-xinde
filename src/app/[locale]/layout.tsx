import '../globals.css';

import { Inter, Poppins } from 'next/font/google';

import { AosInit } from '@/components/AosInit';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import Providers from './providers';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poppins' });

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata.home' });
  const ogLocale = params.locale === 'ru' ? 'ru_RU' : 'en_US';

  return {
    metadataBase: new URL('https://studybox.kz'),
    title: {
      template: '%s | Studybox',
      default: t('title'),
    },
    description: t('description'),
    keywords: ['IELTS', 'IELTS preparation', 'IELTS practice', 'AI learning', 'English test', 'IELTS speaking', 'IELTS writing', 'IELTS reading', 'IELTS listening'],
    authors: [{ name: 'Studybox' }],
    creator: 'Studybox',
    publisher: 'Studybox',
    alternates: {
      canonical: '/',
      languages: {
        en: '/en',
        ru: '/ru',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Studybox',
      title: t('title'),
      description: t('description'),
      url: 'https://studybox.kz',
      locale: ogLocale,
      images: [
        {
          url: '/images/og-studybox.png',
          width: 1200,
          height: 630,
          alt: 'Studybox - Smart IELTS Preparation with AI',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/og-studybox.png'],
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const { locale } = params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`body ${inter.className} ${poppins.variable}`}>
        <NextTopLoader height={4} color='#636AFB' initialPosition={0.3} showSpinner={false} />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <AosInit />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
