'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthResendVerificationError, postAuthResendVerification } from '@/api/POST_auth_resend_verification';
import { AuthAlert, AuthButton, AuthLayout, FormCard } from '@/components/auth';
import { cn } from '@/lib/utils';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function EmailConfirmationPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedEmail = window.sessionStorage.getItem('studybox.auth.email');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const resendEmail = async () => {
    if (!email) {
      setServerMessage({ type: 'error', text: 'Enter the email address you registered with.' });
      return;
    }

    try {
      setIsResending(true);
      setServerMessage(null);
      await postAuthResendVerification({ email });
      setServerMessage({ type: 'success', text: 'Confirmation email resent. Please check your inbox.' });
    } catch (error) {
      if (error instanceof AuthResendVerificationError) {
        setServerMessage({ type: 'error', text: error.message || 'Could not resend the email. Try again later.' });
      } else {
        setServerMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <FormCard title='Confirm your email' subtitle='We’ve sent a friendly hello to your inbox. Tap the link inside to finish setting things up.'>
        <div className='flex flex-col gap-[18rem]'>
          <p className='text-[15rem] leading-relaxed text-gray-500'>Didn’t receive anything yet? We can resend it, or you can head to login once the message arrives.</p>

          <div className='flex flex-col gap-[8rem]'>
            <label htmlFor='confirmation-email' className='text-[14rem] font-medium text-gray-700'>
              Email
            </label>
            <div className='relative'>
              <input
                id='confirmation-email'
                type='email'
                value={email}
                readOnly
                aria-readonly='true'
                autoComplete='email'
                className='h-[52rem] w-full cursor-default rounded-[18rem] bg-gray-50 px-[18rem] pr-[44rem] text-[16rem] text-gray-700 outline-none ring-1 ring-inset ring-gray-200'
              />
              <CheckCircle2 className='pointer-events-none absolute right-[18rem] top-1/2 size-[20rem] -translate-y-1/2 text-emerald-500' aria-hidden='true' />
            </div>
          </div>

          <AuthButton type='button' onClick={() => router.push(`/${locale}/login`)}>
            Go to login
          </AuthButton>

          <button
            type='button'
            onClick={resendEmail}
            disabled={isResending}
            className={cn(
              'flex h-[52rem] items-center justify-center gap-[10rem] rounded-[20rem] border border-gray-200 bg-white text-[15rem] font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60'
            )}
            aria-busy={isResending}
          >
            {isResending ? (
              <span className='flex items-center gap-[10rem]'>
                <span className='size-[18rem] animate-spin rounded-full border-[3rem] border-blue-200 border-t-blue-500' aria-hidden='true' />
                Sending...
              </span>
            ) : (
              'Send again'
            )}
          </button>

          {(serverMessage?.type === 'error' || serverMessage?.type === 'success') && (
            <div aria-live='polite' className='min-h-[32rem]'>
              <AnimatePresence>
                {serverMessage ? (
                  <AuthAlert key={serverMessage.text} variant={serverMessage.type === 'error' ? 'error' : 'success'} description={serverMessage.text} />
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>
      </FormCard>
    </AuthLayout>
  );
}
