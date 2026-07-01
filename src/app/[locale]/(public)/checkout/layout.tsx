import React from 'react';

// Email travels in the checkout URL query — don't leak it via Referer (contract §4).
export const metadata = {
  referrer: 'no-referrer' as const,
  // The checkout URL carries uid/email query params — never index it.
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
