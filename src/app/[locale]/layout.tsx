import '../globals.css';

import { Inter, Poppins } from 'next/font/google';

import { AosInit } from '@/components/AosInit';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import Providers from './providers';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Studybox | Smart learning with AI',
  description: 'Prepare for the IELTS exam with the power of AI. Get personalized study plans, instant feedback, and smart tools to boost your scores efficiently.',
  openGraph: {
    title: 'Studybox | Smart learning with AI',
    description: 'Prepare for the IELTS exam with the power of AI. Get personalized study plans, instant feedback, and smart tools to boost your scores efficiently.',
    type: 'website',
    url: 'https://studybox.kz',
    // images: ['https://qoople.com/images/img__meta.png'],
  },
  twitter: {
    title: 'Studybox | Smart learning with AI',
    description: 'Prepare for the IELTS exam with the power of AI. Get personalized study plans, instant feedback, and smart tools to boost your scores efficiently.',
    site: 'https://studybox.kz',
    // card: 'summary_large_image',
    // images: ['https://qoople.com/images/img__meta.png'],
  },
};

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
