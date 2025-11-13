'use client';

import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as NProgress from 'nprogress';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

import { AuthLoginError, postAuthLogin } from '@/api/POST_auth_login';
import { GoogleLoginError, postAuthLoginGoogle } from '@/api/POST_auth_login_google';
import { AuthAlert, AuthButton, AuthInput, AuthLayout, CaptchaGate, FormCard, OAuthButtons, PasswordInput } from '@/components/auth';
import { ONBOARDING_STORAGE_KEY } from '@/components/onboarding';
import { useCaptcha, type CaptchaExecutionResult } from '@/hooks/useCaptcha';
import { fetchProfileOnce, resetProfile } from '@/stores/profileStore';
import { persistAuthToken } from '@/lib/auth/session';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface PageProps {
  params: {
    locale: string;
  };
}

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  invalid_audience: 'Google sign-in isn’t configured correctly. Please try another method.',
  google_payload_incomplete: 'Google didn’t return the expected data. Please try again.',
  invalid_token: 'Your Google session expired. Try signing in again.',
  email_not_verified: 'Verify your Google email before continuing.',
  USER_ALREADY_LINKED: 'This Google account is already connected to another profile.',
  google_service_unavailable: 'Google is temporarily unavailable. Please try again later.',
  google_prompt_blocked: 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
  default: 'We couldn’t complete Google sign-in. Please try again or use email and password.',
};

export default function LoginPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleProcessing, setGoogleProcessing] = useState(false);
  const [captchaMessage, setCaptchaMessage] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const captcha = useCaptcha({ action: 'auth_login', locale });
  const tCaptcha = useTranslations('auth.captcha');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resolveGoogleError = useMemo(() => {
    return (key: string | undefined) => {
      if (!key) return GOOGLE_ERROR_MESSAGES.default;
      return GOOGLE_ERROR_MESSAGES[key] ?? GOOGLE_ERROR_MESSAGES.default;
    };
  }, []);

  useEffect(() => {
    router.prefetch(`/${locale}/onboarding`);
    router.prefetch(`/${locale}/profile`);
  }, [locale, router]);

  const navigateAfterAuth = async () => {
    NProgress.start();

    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to reset onboarding state', error);
      }
    }

    let nextRoute = `/${locale}/onboarding`;

    try {
      const profile = await fetchProfileOnce();
      if (profile?.onboarding_completed) {
        nextRoute = `/${locale}/profile`;
      }
    } catch (error) {
      console.error('Failed to load profile after login', error);
    }

    window.setTimeout(
      () => {
        router.push(nextRoute);
        window.setTimeout(() => {
          NProgress.done();
        }, 400);
      },
      prefersReducedMotion ? 100 : 220
    );
  };

  const handleGoogleCredential = async (credential: string) => {
    setGoogleProcessing(true);
    setGoogleError(null);
    setServerMessage(null);
    setCaptchaMessage(null);

    let captchaResult: CaptchaExecutionResult | null = null;

    if (captcha.enabled) {
      try {
        captchaResult = await captcha.execute({ action: 'auth_login_google' });
      } catch (error) {
        setCaptchaMessage(tCaptcha('errors.unavailable'));
        captcha.requireChallenge('network');
        setGoogleProcessing(false);
        return;
      }

      if (!captchaResult || !captcha.provider) {
        setCaptchaMessage(tCaptcha('errors.unavailable'));
        captcha.requireChallenge('manual');
        setGoogleProcessing(false);
        return;
      }
    }

    try {
      const result = await postAuthLoginGoogle({
        token: credential,
        ...(captcha.enabled && captchaResult && captcha.provider
          ? {
              captchaToken: captchaResult.token,
              captchaProvider: captcha.provider,
              captchaMode: captchaResult.mode,
            }
          : {}),
      });
      localStorage.setItem('token', result.token);
      await persistAuthToken(result.token);
      resetProfile();
      captcha.handleBackendResult(true);
      navigateAfterAuth();
    } catch (error) {
      let handledByCaptcha = false;

      if (error instanceof GoogleLoginError) {
        switch (error.code) {
          case 'captcha_low_score':
            setCaptchaMessage(tCaptcha('server.lowScore'));
            captcha.handleBackendResult(false, 'low_score');
            handledByCaptcha = true;
            break;
          case 'captcha_required':
          case 'captcha_failed':
          case 'captcha_timeout':
            setCaptchaMessage(tCaptcha('server.challenge'));
            captcha.handleBackendResult(false, 'backend');
            handledByCaptcha = true;
            break;
          case 'captcha_unavailable':
            setCaptchaMessage(tCaptcha('errors.unavailable'));
            captcha.handleBackendResult(false, 'network');
            captcha.requireChallenge('network');
            handledByCaptcha = true;
            break;
          default:
            setGoogleError(resolveGoogleError(error.code));
        }
      } else {
        setGoogleError(GOOGLE_ERROR_MESSAGES.default);
      }

      if (!handledByCaptcha) {
        captcha.handleBackendResult(false);
      }
    } finally {
      setGoogleProcessing(false);
    }
  };

  const handleGoogleInitError = (errorKey: string) => {
    setGoogleError(resolveGoogleError(errorKey));
  };

  const onSubmit = async (values: LoginSchema) => {
    setServerMessage(null);
    setGoogleError(null);
    setCaptchaMessage(null);

    let captchaResult: CaptchaExecutionResult | null = null;

    if (captcha.enabled) {
      try {
        captchaResult = await captcha.execute({ action: 'auth_login' });
      } catch (error) {
        setCaptchaMessage(tCaptcha('errors.unavailable'));
        captcha.requireChallenge('network');
        return;
      }

      if (!captchaResult || !captcha.provider) {
        setCaptchaMessage(tCaptcha('errors.unavailable'));
        captcha.requireChallenge('manual');
        return;
      }
    }

    try {
      const result = await postAuthLogin({
        ...values,
        ...(captcha.enabled && captchaResult && captcha.provider
          ? {
              captchaToken: captchaResult.token,
              captchaProvider: captcha.provider,
              captchaMode: captchaResult.mode,
            }
          : {}),
      });
      localStorage.setItem('token', result.token);
      await persistAuthToken(result.token);
      resetProfile();
      captcha.handleBackendResult(true);
      navigateAfterAuth();
    } catch (error) {
      if (error instanceof AuthLoginError) {
        if (error.code === 'captcha_low_score') {
          captcha.handleBackendResult(false, 'low_score');
          setCaptchaMessage(tCaptcha('server.lowScore'));
          return;
        }

        if (error.code === 'captcha_unavailable') {
          captcha.handleBackendResult(false, 'network');
          captcha.requireChallenge('network');
          setCaptchaMessage(tCaptcha('errors.unavailable'));
          return;
        }

        if (error.code === 'captcha_required' || error.code === 'captcha_failed' || error.code === 'captcha_timeout') {
          captcha.handleBackendResult(false, 'backend');
          setCaptchaMessage(tCaptcha('server.challenge'));
          return;
        }

        if (error.code && error.code.startsWith('captcha')) {
          captcha.handleBackendResult(false, 'backend');
          setCaptchaMessage(tCaptcha('server.challenge'));
          return;
        }

        if (error.code === 'account_locked') {
          captcha.handleBackendResult(false, 'backend');
          setServerMessage({ type: 'error', text: 'Your account is temporarily locked. Please try again later.' });
          return;
        }

        if (error.status === 404) {
          captcha.handleBackendResult(false);
          setError('email', { message: 'We couldn’t find an account with that email.' });
          return;
        }

        if (error.status === 401) {
          captcha.handleBackendResult(false);
          setError('password', { message: 'Incorrect password. Try again or reset it.' });
          return;
        }
      }

      captcha.handleBackendResult(false);
      setServerMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    }
  };

  const formVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <AuthLayout>
      <FormCard title='Welcome back' subtitle='Sign in to continue with lessons that remember how you like to learn.'>
        <motion.form
          className='flex flex-col gap-[16rem]'
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
          variants={prefersReducedMotion ? undefined : formVariants}
        >
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <OAuthButtons
              onGoogleCredential={handleGoogleCredential}
              onGoogleError={handleGoogleInitError}
              disabled={isSubmitting || googleProcessing}
              processing={googleProcessing}
            />
          </motion.div>

          <motion.div className='relative flex items-center' variants={prefersReducedMotion ? undefined : itemVariants}>
            <span className='h-[1rem] flex-1 bg-gray-200' />
            <span className='px-[12rem] text-[12rem] text-gray-400'>or use email</span>
            <span className='h-[1rem] flex-1 bg-gray-200' />
          </motion.div>

          <motion.div className='flex flex-col gap-[12rem]' variants={prefersReducedMotion ? undefined : itemVariants}>
            <AuthInput label='Email' type='email' autoComplete='email' error={errors.email?.message} {...register('email')} />
            <PasswordInput label='Password' autoComplete='current-password' error={errors.password?.message} {...register('password')} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <div className='flex items-center justify-between text-[13rem] text-gray-500'>
              <Link
                href={`/${locale}/password-recovery`}
                className='font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
              >
                Forgot password?
              </Link>
            </div>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <AuthButton type='submit' loading={isSubmitting}>
              Sign in
            </AuthButton>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <CaptchaGate controller={captcha} />
          </motion.div>

          {(serverMessage?.type === 'error' || !!googleError || !!captchaMessage) && (
            <motion.div variants={prefersReducedMotion ? undefined : itemVariants} aria-live='polite' className='flex flex-col gap-[10rem]'>
              <AnimatePresence>
                {serverMessage?.type === 'error' ? <AuthAlert key={serverMessage.text} variant='error' description={serverMessage.text} /> : null}
              </AnimatePresence>
              <AnimatePresence>{googleError ? <AuthAlert key={googleError} variant='error' description={googleError} /> : null}</AnimatePresence>
              <AnimatePresence>
                {captchaMessage ? <AuthAlert key={captchaMessage} variant='error' description={captchaMessage} /> : null}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className='text-[13rem] text-gray-500'>
            <span>New to Studybox?</span>{' '}
            <Link
              href={`/${locale}/registration`}
              className='font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
            >
              Create an account
            </Link>
          </motion.div>
        </motion.form>
      </FormCard>
    </AuthLayout>
  );
}
