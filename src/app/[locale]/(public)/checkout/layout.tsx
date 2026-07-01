import React from 'react';

// Email travels in the checkout URL query — don't leak it via Referer (contract §4).
export const metadata = {
  referrer: 'no-referrer' as const,
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
