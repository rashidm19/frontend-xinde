'use client';

import { useEffect } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthButton, AuthLayout, FormCard } from '@/components/auth';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function EmailVerifiedPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.prefetch(`/${locale}`);
    }, 0);
    return () => clearTimeout(timeout);
  }, [locale, router]);

  return (
    <AuthLayout>
      <FormCard title='You’re all set' subtitle='Thanks for confirming your email. Let’s keep the momentum going.'>
        <div className='flex flex-col items-center gap-[24rem]'>
          <motion.span
            initial={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.06, 1], opacity: 1 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.9, repeat: Infinity, repeatDelay: 2.2 }}
            className='flex size-[72rem] items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_28rem_90rem_-60rem_rgba(16,185,129,0.75)]'
            aria-hidden='true'
          >
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='size-[36rem]'>
              <path strokeLinecap='round' strokeLinejoin='round' d='m4.5 12.75 6 6 9-13.5' />
            </svg>
          </motion.span>

          <p className='text-center text-[15rem] leading-relaxed text-gray-500'>
            Enjoy full access to Studybox. Your dashboard is already prepping gentle nudges to keep you moving.
          </p>

          <div className='flex w-full flex-col gap-[12rem]'>
            <AuthButton type='button' onClick={() => router.push(`/${locale}/login`)}>
              Login now
            </AuthButton>
            <Link
              href={`https://www.studybox.kz/${locale}`}
              className='text-center text-[13rem] font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
            >
              Back to the homepage
            </Link>
          </div>
        </div>
      </FormCard>
    </AuthLayout>
  );
}
