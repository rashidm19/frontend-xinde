import React from 'react';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' });

// Standalone HSK checkout — override the StudyBox/IELTS app metadata entirely.
// `title.absolute` bypasses the root "%s | Studybox" template; the segment's icon.svg
// overrides the StudyBox favicon. Email/uid travel in the URL → no-referrer + noindex.
export const metadata = {
  title: { absolute: 'HSK Prep' },
  description: 'Complete your HSK Prep purchase — secure one-time payment.',
  applicationName: 'HSK Prep',
  authors: [{ name: 'HSK Prep' }],
  creator: 'HSK Prep',
  publisher: 'HSK Prep',
  keywords: ['HSK', 'HSK Prep', 'Chinese proficiency test', 'HSK exam'],
  referrer: 'no-referrer' as const,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'HSK Prep',
    title: 'HSK Prep',
    description: 'Complete your HSK Prep purchase — secure one-time payment.',
    images: [],
  },
  twitter: {
    card: 'summary',
    title: 'HSK Prep',
    description: 'Complete your HSK Prep purchase — secure one-time payment.',
    images: [],
  },
};

// HSK Prep brand tokens (light + dark). CSS custom properties inherit to the whole
// checkout subtree, so the loader/error screens read like a continuation of hskprep.
const TOKENS = `
.hsk-co{--bg:#fffdf8;--fg:#1a1614;--muted:#6b625a;--accent:#b84e2e;--accent-hover:#9a4026;--sunken:#efe6d9;--err:#c0392b;}
@media (prefers-color-scheme: dark){.hsk-co{--bg:#17130d;--fg:#faf6f0;--muted:#9c9488;--accent:#e8886a;--accent-hover:#f0a086;--sunken:#2a251d;--err:#f0836a;}}
@keyframes hsk-spin{to{transform:rotate(360deg)}}
`;

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`hsk-co ${dmSans.className}`} style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <style dangerouslySetInnerHTML={{ __html: TOKENS }} />
      {children}
    </div>
  );
}
