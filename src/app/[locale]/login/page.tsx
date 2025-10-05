'use client';

import React from 'react';
import * as NProgress from 'nprogress';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import axiosInstance from '@/lib/axiosInstance';
import { useLocale } from 'next-intl';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { GoogleLoginError, postAuthLoginGoogle } from '@/api/POST_auth_login_google';
import { resetProfile } from '@/stores/profileStore';

export default function Login() {
  const router = useRouter();
  const locale = useLocale();
  const { t, tImgAlts, tCommon, tActions, tForm, tMessages } = useCustomTranslations('login');
  const translateGoogleError = React.useCallback(
    (key: string) => {
      try {
        return t(`google.errors.${key}` as any);
      } catch (error) {
        return t('google.errors.default' as any);
      }
    },
    [t]
  );

  const [googleError, setGoogleError] = React.useState<string | null>(null);
  const [googleProcessing, setGoogleProcessing] = React.useState(false);

  const formErrorRequiredField = tForm('validation.requiredField');

  const formSchema = z.object({
    email: z.string().min(1, formErrorRequiredField).email('validation.invalidEmailAddress'),
    password: z.string().min(1, formErrorRequiredField),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await axiosInstance.post('/auth/login', values, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 300) {
      const result = response.data;
      localStorage.setItem('token', result.token);
      resetProfile();
      NProgress.start();
      router.push(`/${locale}/profile`);
    }

    if (response.status === 404) {
      form.setError('email', { message: tMessages('accountNoExist') });
    }
  }

  const GOOGLE_ERROR_CODE_TO_KEY: Record<string, string> = React.useMemo(
    () => ({
      invalid_audience: 'invalid_audience',
      google_payload_incomplete: 'google_payload_incomplete',
      invalid_token: 'invalid_token',
      email_not_verified: 'email_not_verified',
      USER_ALREADY_LINKED: 'USER_ALREADY_LINKED',
      google_service_unavailable: 'google_service_unavailable',
      google_auth_failed: 'google_auth_failed',
    }),
    []
  );

  const resolveGoogleErrorKey = React.useCallback(
    (error: GoogleLoginError): string => {
      if (error.code && GOOGLE_ERROR_CODE_TO_KEY[error.code]) {
        return GOOGLE_ERROR_CODE_TO_KEY[error.code];
      }

      if (error.status === 503) {
        return 'google_service_unavailable';
      }

      if (error.status === 409) {
        return 'USER_ALREADY_LINKED';
      }

      if (error.status === 401) {
        if (error.code && GOOGLE_ERROR_CODE_TO_KEY[error.code]) {
          return GOOGLE_ERROR_CODE_TO_KEY[error.code];
        }
        return 'invalid_token';
      }

      if (error.status === 400) {
        if (error.code && GOOGLE_ERROR_CODE_TO_KEY[error.code]) {
          return GOOGLE_ERROR_CODE_TO_KEY[error.code];
        }
        return 'invalid_audience';
      }

      return 'default';
    },
    [GOOGLE_ERROR_CODE_TO_KEY]
  );

  const handleGoogleCredential = React.useCallback(
    async (credential: string) => {
      setGoogleProcessing(true);
      setGoogleError(null);

      try {
        const result = await postAuthLoginGoogle({ token: credential });
        localStorage.setItem('token', result.token);
        resetProfile();
        NProgress.start();
        router.push(`/${locale}/profile`);
      } catch (error) {
        if (error instanceof GoogleLoginError) {
          const key = resolveGoogleErrorKey(error);
          setGoogleError(translateGoogleError(key));
        } else {
          setGoogleError(translateGoogleError('default'));
        }
      } finally {
        setGoogleProcessing(false);
      }
    },
    [locale, resolveGoogleErrorKey, router, translateGoogleError]
  );

  const handleGoogleInitError = React.useCallback(
    (errorKey: string) => {
      setGoogleError(translateGoogleError(errorKey));
    },
    [translateGoogleError]
  );

  return (
    <main>
      <section className='relative flex h-full min-h-[100vh] items-center'>
        <img className='absolute bottom-0 left-0 h-auto w-[960rem]' src='/images/illustration_torusArray.png' alt={tImgAlts('flower')} />
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[74rem]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-[520rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              {/* // * Go back & Logo */}
              <div className='flex justify-between'>
                <button type='button' onClick={() => router.back()} className='flex items-center gap-x-[8rem]'>
                  <img src='/images/icon_back.svg' alt={tImgAlts('back')} className='h-auto w-[16rem]' />
                  <span className='text-[18rem] font-medium leading-tight text-d-black/60'>{tActions('back')}</span>
                </button>
                <figure className='flex items-center gap-x-[6rem]'>
                  <img src='/images/logo.svg' className='size-[35rem]' alt={tImgAlts('logo')} />
                  <div className='font-poppins text-[18rem] font-semibold'>{tCommon('studybox')}</div>
                </figure>
                <div className='w-[70rem]' />
              </div>
              {/* // * Title */}
              <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>{t('title')}</h1>

              {/* // * Input fields */}
              <div className='flex flex-col gap-y-[12rem]'>
                <FormField
                  name='email'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-between'>
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>{tForm('labels.email')}</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          type='text'
                          placeholder={tForm('placeholders.email')}
                          className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-none placeholder:text-d-black/60'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-between'>
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>{tForm('labels.password')}</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          type='password'
                          placeholder={tForm('placeholders.password')}
                          className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-none placeholder:text-d-black/60'
                        />
                      </FormControl>
                      <Link href='/password-recovery' className='ml-auto text-[16rem] font-medium text-d-black/60'>
                        {t('forgotPassword')}
                      </Link>
                    </FormItem>
                  )}
                />
                <button
                  type='submit'
                  className='mx-auto mt-[8rem] flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'
                >
                  {form.formState.isSubmitting ? (
                    <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  ) : (
                    <span className='text-[18rem] font-medium leading-none'>{tActions('login')}</span>
                  )}
                </button>

                <Link href='/registration' className='text-center text-[18rem] leading-none text-d-black/60'>
                  {t.rich('dontHaveAccount', {
                    span: chunks => <span className='text-d-black'>{chunks}</span>,
                  })}
                </Link>
              </div>

              <div className='mx-auto flex w-[428rem] flex-col gap-y-[12rem]'>
                <GoogleLoginButton
                  label={t('google.button')}
                  onCredential={handleGoogleCredential}
                  onError={handleGoogleInitError}
                  disabled={googleProcessing || form.formState.isSubmitting}
                />
                {googleProcessing ? (
                  <div className='flex justify-center'>
                    <svg className='size-[20rem] animate-spin text-d-black/80' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  </div>
                ) : null}
                {googleError ? <p className='text-center text-[14rem] font-medium leading-none text-d-red'>{googleError}</p> : null}
              </div>
            </form>
          </Form>
        </div>
      </section>
    </main>
  );
}
