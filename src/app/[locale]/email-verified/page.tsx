'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export default function EmailVerified() {
  const { t, tActions } = useCustomTranslations('emailVerified');

  const continueHref = sanitizeHref(t('continueHref'), '/login');
  const secondaryHref = sanitizeHref(t('secondaryLinkHref'), '');
  const secondaryLabel = sanitizeLabel(t('secondaryLinkLabel'), 'secondaryLinkLabel');
  const showSecondaryLink = Boolean(secondaryHref && secondaryLabel);

  return (
    <main className='relative flex min-h-[100vh] w-full items-center justify-center bg-background px-[16rem] py-[64rem] tablet:px-[40rem] tablet:py-[96rem]'>
      <div className='container flex w-full justify-center'>
        <Card
          role='status'
          aria-live='polite'
          className='relative flex w-full max-w-[620rem] flex-col items-center rounded-[32rem] border border-d-black/10 bg-card/90 px-[32rem] py-[48rem] text-center shadow-card backdrop-blur supports-[backdrop-filter]:bg-card/70 tablet:px-[48rem] tablet:py-[64rem]'
        >
          <CardHeader className='flex w-full flex-col items-center gap-y-[24rem] space-y-0 p-0 tablet:gap-y-[32rem]'>
            <span className='flex h-[120rem] w-[120rem] items-center justify-center rounded-full bg-d-mint'>
              <CheckCircle2 aria-hidden='true' className='h-[64rem] w-[64rem] text-d-green' />
              <span className='sr-only'>{t('successIconLabel')}</span>
            </span>
            <CardTitle className='font-poppins text-[40rem] font-semibold leading-[48rem] tracking-[-2rem] text-card-foreground tablet:text-[48rem] tablet:leading-[56rem]'>
              {t('headline')}
            </CardTitle>
            <CardDescription className='mx-auto max-w-[440rem] text-[18rem] leading-[28rem] text-muted-foreground tablet:text-[20rem] tablet:leading-[30rem]'>
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='mt-[32rem] flex w-full flex-col gap-y-[20rem] space-y-0 p-0'>
            <Button
              asChild
              className='h-[56rem] w-full rounded-full text-[18rem] font-semibold leading-none tablet:h-[60rem] tablet:text-[20rem]'
              autoFocus
            >
              <Link href={continueHref}>{tActions('continue')}</Link>
            </Button>
            {showSecondaryLink ? (
              <Link
                href={secondaryHref}
                className='text-center text-[16rem] font-medium leading-[24rem] text-muted-foreground underline-offset-[6rem] transition-colors hover:text-card-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function sanitizeHref(value: string, fallback: string) {
  if (!value || value === 'continueHref' || value === 'secondaryLinkHref' || value.startsWith('emailVerified.')) {
    return fallback;
  }

  return value;
}

function sanitizeLabel(value: string, key: string) {
  if (!value || value === key || value === `emailVerified.${key}`) {
    return '';
  }

  return value;
}
