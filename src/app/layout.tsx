import './globals.css';

import { Inter, Poppins } from 'next/font/google';

import { AosInit } from '@/components/AosInit';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import Providers from './providers';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`body ${inter.className} ${poppins.variable}`}>
        <NextTopLoader height={4} color='#636AFB' initialPosition={0.3} showSpinner={false} />
        <Providers>
          <AosInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
