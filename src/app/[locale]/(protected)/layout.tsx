import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getMe } from '@/lib/auth/getMe';

type ProtectedLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = params;
  const user = await getMe();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
