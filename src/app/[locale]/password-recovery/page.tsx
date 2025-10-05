'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import axiosInstance from '@/lib/axiosInstance';

export default function PasswordRecovery() {
  const { t, tImgAlts, tCommon, tActions, tForm, tMessages } = useCustomTranslations('passwordRecovery');

  const formSchema = z.object({
    email: z.string().min(1, tForm('validation.requiredField')).email(tForm('validation.invalidEmailAddress')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await axiosInstance.post('/auth/reset-password', values, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 300) {
      const result = response.data;
      localStorage.setItem('token', result.token);
    }

    if (response.status === 404) {
      form.setError('email', { message: tMessages('accountNoExist') });
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <main>
        <section className='relative flex min-h-[1024rem] items-center'>
          <img className='absolute left-0 top-[114rem] h-auto w-[951rem]' src='/images/illustration_flower2.png' alt={tImgAlts('flower')} />
          <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
            <div className='flex w-[560rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              <div className='flex items-center justify-between'>
                <figure className='flex items-center gap-x-[6rem]'>
                  <img src='/images/logo.svg' className='size-[35rem]' alt={tImgAlts('logo')} />
                  <div className='font-poppins text-[18rem] font-semibold'>{tCommon('studybox')}</div>
                </figure>
                <div className='text-[18rem] leading-none text-d-black/60'>{form.getValues('email')}</div>
              </div>
              <div className='flex flex-col gap-y-[20rem]'>
                <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>{t('title')}</h1>
                <p className='text-center text-[20rem] font-medium leading-[26rem]'>{t('recoveryMessageSent')}</p>
              </div>
              <Link href='/login' className='mx-auto flex h-[65rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'>
                <span className='text-[20rem] font-medium leading-none'>{tActions('ok')}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className='relative flex h-full min-h-[100vh] items-center'>
        <img className='absolute bottom-0 left-0 h-auto w-[960rem]' src='/images/illustration_torusArray.png' alt={tImgAlts('flower')} />
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[74rem]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-[560rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              {/* // * Go back & Logo */}
              <div className='flex justify-between'>
                <Link href='/login' className='flex items-center gap-x-[8rem]'>
                  <img src='/images/icon_back.svg' alt={tImgAlts('back')} className='h-auto w-[16rem]' />
                  <span className='text-[18rem] font-medium leading-tight text-d-black/60'>{tActions('back')}</span>
                </Link>
                <figure className='flex items-center gap-x-[6rem]'>
                  <img src='/images/logo.svg' className='size-[35rem]' alt={tImgAlts('logo')} />
                  <div className='font-poppins text-[18rem] font-semibold'>{tCommon('studybox')}</div>
                </figure>
                <div className='w-[70rem]' />
              </div>
              {/* // * Title */}
              <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>{t('title')}</h1>

              {/* // * Input fields */}
              <div className='mt-[-20rem] flex flex-col gap-y-[12rem]'>
                <FormField
                  name='email'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-end'>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          type='text'
                          placeholder={tForm('placeholders.email')}
                          className='h-[65rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[20rem] font-medium leading-none placeholder:text-d-black/60 data-[error=true]:bg-d-red-disabled'
                          // data-error={form.formState?.errors?.email?.message ? 'true' : 'false'}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <button
                  type='submit'
                  className='mx-auto mt-[8rem] flex h-[65rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'
                >
                  <span className='text-[20rem] font-medium leading-none'>{tActions('resetPassword')}</span>
                  {form.formState.isSubmitting && (
                    <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </main>
  );
}
