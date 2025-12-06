'use client';

import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Globe2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as NProgress from 'nprogress';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

import { AuthRegisterError, postAuthRegister } from '@/api/POST_auth_register';
import { GoogleLoginError, postAuthLoginGoogle } from '@/api/POST_auth_login_google';
import { AuthAlert, AuthButton, AuthInput, AuthLayout, CaptchaGate, FormCard, OAuthButtons, PasswordInput } from '@/components/auth';
import { REGIONS, type RegionValue } from '@/lib/regions';
import { cn } from '@/lib/utils';
import { type CaptchaExecutionResult, useCaptcha } from '@/hooks/useCaptcha';
import { resetProfile } from '@/stores/profileStore';
import { persistAuthToken } from '@/lib/auth/session';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[a-z]/, 'Include at least one lowercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    region: z.enum(REGIONS.map(region => region.value) as [RegionValue, ...RegionValue[]], {
      errorMap: () => ({ message: 'Select your region' }),
    }),
    agreement: z.boolean().refine(value => value, { message: 'You must accept the terms' }),
  })
  .refine(data => Boolean(data.region), {
    path: ['region'],
    message: 'Select your region',
  });

type RegisterSchema = z.infer<typeof registerSchema>;

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

export default function RegistrationPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleProcessing, setGoogleProcessing] = useState(false);
  const [captchaMessage, setCaptchaMessage] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const captcha = useCaptcha({ action: 'auth_register', locale });
  const tCaptcha = useTranslations('auth.captcha');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      region: REGIONS[0]?.value ?? 'kz',
      agreement: false,
    },
  });

  const selectedRegion = watch('region');
  const isAgreementChecked = watch('agreement');

  const resolveGoogleError = useMemo(() => {
    return (key: string | undefined) => {
      if (!key) return GOOGLE_ERROR_MESSAGES.default;
      return GOOGLE_ERROR_MESSAGES[key] ?? GOOGLE_ERROR_MESSAGES.default;
    };
  }, []);

  const navigateToProfile = () => {
    NProgress.start();
    router.push(`/${locale}/dashboard`);
  };

  const handleGoogleCredential = async (credential: string) => {
    setGoogleProcessing(true);
    setGoogleError(null);
    setServerMessage(null);
    setCaptchaMessage(null);

    let captchaResult: CaptchaExecutionResult | null = null;

    if (captcha.enabled) {
      try {
        captchaResult = await captcha.execute({ action: 'auth_register_google' });
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
      navigateToProfile();
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

  const onSubmit = async (values: RegisterSchema) => {
    setServerMessage(null);
    setGoogleError(null);
    setCaptchaMessage(null);

    let captchaResult: CaptchaExecutionResult | null = null;

    if (captcha.enabled) {
      try {
        captchaResult = await captcha.execute({ action: 'auth_register' });
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
      await postAuthRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        region: values.region,
        ...(captcha.enabled && captchaResult && captcha.provider
          ? {
              captchaToken: captchaResult.token,
              captchaProvider: captcha.provider,
              captchaMode: captchaResult.mode,
            }
          : {}),
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('studybox.auth.email', values.email);
      }

      setServerMessage({ type: 'success', text: 'Account created. Please verify your email.' });
      captcha.handleBackendResult(true);
      router.push(`/${locale}/email-confirmation`);
    } catch (error) {
      if (error instanceof AuthRegisterError) {
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

        if (error.code === 'email_in_use') {
          setServerMessage({ type: 'error', text: 'This email is already registered.' });
        } else {
          setServerMessage({ type: 'error', text: error.message || 'Registration failed. Try again.' });
        }
        captcha.handleBackendResult(false);
        return;
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
      <FormCard title='Let’s get you set up' subtitle='Create a Studybox account tailored to your rhythm and the way you like to prepare.'>
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
            <AuthInput label='Full name' autoComplete='name' error={errors.name?.message} {...register('name')} />
            <AuthInput label='Email' type='email' autoComplete='email' error={errors.email?.message} {...register('email')} />
            <PasswordInput label='Password' autoComplete='new-password' error={errors.password?.message} {...register('password')} />

            <div className='flex flex-col gap-[8rem]'>
              <label htmlFor='region' className='text-[14rem] font-medium text-gray-700'>
                Region
              </label>
              <div className='relative'>
                <Globe2 className='pointer-events-none absolute left-[18rem] top-1/2 size-[18rem] -translate-y-1/2 text-gray-400' aria-hidden='true' />
                <select
                  id='region'
                  {...register('region')}
                  value={selectedRegion}
                  onChange={event => setValue('region', event.target.value as RegionValue, { shouldValidate: true })}
                  className={cn(
                    'h-[52rem] w-full appearance-none rounded-[18rem] bg-gray-50 pl-[48rem] pr-[18rem] text-[16rem] text-gray-800 outline-none ring-1 ring-inset ring-gray-200 transition focus-visible:ring-2 focus-visible:ring-blue-400',
                    errors.region && 'ring-rose-400 focus-visible:ring-rose-400'
                  )}
                  autoComplete='country'
                >
                  {REGIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.value.toUpperCase()} — {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  className='pointer-events-none absolute right-[18rem] top-1/2 size-[12rem] -translate-y-1/2 text-gray-400'
                  viewBox='0 0 10 6'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  aria-hidden='true'
                >
                  <path d='M9 1L5 5 1 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </div>
              {errors.region ? <p className='text-[13rem] font-medium text-rose-500'>{errors.region.message}</p> : null}
            </div>

            <label className='flex items-center gap-[12rem] text-[13rem] text-gray-600'>
              <input
                type='checkbox'
                {...register('agreement')}
                checked={isAgreementChecked}
                onChange={event => setValue('agreement', event.target.checked, { shouldValidate: true })}
                className='mt-[4rem] size-[18rem] rounded-[4rem] border border-gray-300 accent-blue-600'
              />
              <span>I agree to the Studybox Terms and Privacy Policy.</span>
            </label>
            {errors.agreement ? <p className='text-[13rem] font-medium text-rose-500'>{errors.agreement.message}</p> : null}
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <AuthButton type='submit' loading={isSubmitting}>
              Create account
            </AuthButton>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <CaptchaGate controller={captcha} />
          </motion.div>

          {(serverMessage?.type === 'error' || serverMessage?.type === 'success' || !!googleError || !!captchaMessage) && (
            <motion.div variants={prefersReducedMotion ? undefined : itemVariants} aria-live='polite' className='flex flex-col gap-[10rem]'>
              <AnimatePresence>
                {serverMessage ? (
                  <AuthAlert key={serverMessage.text} variant={serverMessage.type === 'error' ? 'error' : 'success'} description={serverMessage.text} />
                ) : null}
              </AnimatePresence>
              <AnimatePresence>{googleError ? <AuthAlert key={googleError} variant='error' description={googleError} /> : null}</AnimatePresence>
              <AnimatePresence>{captchaMessage ? <AuthAlert key={captchaMessage} variant='error' description={captchaMessage} /> : null}</AnimatePresence>
            </motion.div>
          )}

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className='text-[13rem] text-gray-500'>
            <span>Already with Studybox?</span>{' '}
            <Link
              href={`/${locale}/login`}
              className='font-medium text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200'
            >
              Sign in here
            </Link>
          </motion.div>
        </motion.form>
      </FormCard>
    </AuthLayout>
  );
}
