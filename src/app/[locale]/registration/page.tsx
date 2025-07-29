'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import img from '../../../../public/images/illustration_flower.png';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Registration() {
  const router = useRouter();

  const { t, tImgAlts, tCommon, tCommonRich, tActions, tForm, tMessages } = useCustomTranslations('registration');

  const formErrorRequiredField = tForm('validation.requiredField');

  const formSchema = z.object({
    name: z.string().min(1, formErrorRequiredField),
    email: z.string().min(1, formErrorRequiredField).email(tForm('validation.invalidEmailAddress')),
    password: z
      .string()
      .min(1, formErrorRequiredField)
      .min(8, tForm('validation.charactersMinimum', { count: 8 })),
    region: z.string().min(1, formErrorRequiredField),
    agreement: z.boolean().default(true),
    avatar: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      region: 'kz',
      avatar: '',
      agreement: true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const req = new FormData();
    req.append('name', values.name);
    req.append('email', values.email);
    req.append('password', values.password);
    req.append('region', values.region);

    // @ts-ignore
    await fetch(img)
      .then(response => {
        return response.blob();
      })
      .then(blob => {
        console.log(blob);
        req.append('avatar', blob);
      });

    const response = await fetch('https://api.studybox.kz/auth/register', {
      method: 'POST',
      body: req,
    });

    if (response.ok && response.status === 200) {
      // const result = await response.json();
      // router.push(`/email-verification?email=${values.email}`);
    }

    if (response.status === 404) {
      form.setError('email', { message: tMessages('accountNoExist') });
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <main>
        <section className='relative flex min-h-[1024rem] items-center'>
          <img alt={tImgAlts('flower')} src='/images/illustration_flower2.png' className='absolute left-0 top-[114rem] h-auto w-[951rem]' />
          <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
            <div className='flex w-[560rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              <div className='flex items-center justify-between'>
                <figure className='flex items-center gap-x-[6rem]'>
                  <img src='/images/logo.svg' alt={tImgAlts('logo')} className='size-[35rem]' />
                  <div className='font-poppins text-[18rem] font-semibold'>{tCommon('studybox')}</div>
                </figure>
                <div className='text-[18rem] leading-none text-d-black/60'>{form.getValues('email')}</div>
              </div>
              <div className='flex flex-col gap-y-[32rem]'>
                <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>{t('confirmationTitle')}</h1>
                <p className='text-center text-[18rem] font-medium leading-none'>{t('confirmationMessage')}</p>
              </div>
              <Link href='/login' className='mx-auto flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'>
                <span className='text-[18rem] font-medium leading-none'>{tActions('ok')}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className='relative flex min-h-[1024rem] items-center'>
        <img alt={tImgAlts('flower')} src='/images/illustration_flower2.png' className='absolute left-0 top-[114rem] h-auto w-[951rem]' />
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-[520rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              {/* Go back & Logo */}
              <div className='flex justify-between'>
                <button type='button' onClick={() => router.back()} className='flex items-center gap-x-[8rem]'>
                  <img src='/images/icon_back.svg' alt={tImgAlts('back')} className='h-auto w-[16rem]' />
                  <span className='text-[18rem] font-medium leading-tight text-d-black/60'>{tActions('back')}</span>
                </button>
                <figure className='flex items-center gap-x-[6rem]'>
                  <img src='/images/logo.svg' alt={tImgAlts('logo')} className='size-[35rem]' />
                  <div className='font-poppins text-[18rem] font-semibold'>{tCommon('studybox')}</div>
                </figure>
                <div className='w-[70rem]' />
              </div>

              {/* Title */}
              <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>{t('createAccountTitle')}</h1>

              {/* Input fields */}
              <div className='flex flex-col gap-y-[12rem]'>
                <FormField
                  name='name'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-between'>
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>{tForm('labels.name')}</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          type='text'
                          placeholder={tForm('placeholders.name')}
                          className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-none placeholder:text-d-black/60'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
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
                    </FormItem>
                  )}
                />

                {/* Region */}
                <FormField
                  name='region'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-between'>
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>{tForm('labels.region')}</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                            <SelectValue placeholder={tForm('placeholders.select')} className='placeholder:text-d-black/60' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                          <SelectItem value='kz' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                            <span className='mr-[16rem] text-d-black/60'>KZ </span>
                            {tForm('regionKZ')}
                          </SelectItem>
                          <SelectItem value='kg' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                            <span className='mr-[16rem] text-d-black/60'>KG </span>
                            {tForm('regionKG')}
                          </SelectItem>
                          <SelectItem value='md' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                            <span className='mr-[16rem] text-d-black/60'>MD </span>
                            {tForm('regionMD')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Agreement */}
                <FormField
                  control={form.control}
                  name='agreement'
                  render={({ field }) => (
                    <FormItem className='mt-[6rem] flex items-center gap-x-[12rem]'>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className='text-[18rem] font-medium leading-none'>
                        {tCommonRich('acceptUserAgreement', {
                          link: (chunks: any) => (
                            <Link href='/user-agreement' className='border-b border-d-black'>
                              {chunks}
                            </Link>
                          ),
                        })}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <button
                  type='submit'
                  className='mx-auto mt-[6rem] flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'
                >
                  <span className='text-[18rem] font-medium leading-none'>{tActions('createAccount')}</span>

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

                <Link href='/login' className='text-center text-[18rem] leading-none text-d-black/60'>
                  {t.rich('alreadyHaveAccount', {
                    span: chunks => <span className='text-d-black'>{chunks}</span>,
                  })}
                </Link>
              </div>

              {/* // * Submit & Google Auth */}
              {/* <div className='mx-auto flex flex-col gap-y-[20rem]'>
                <button className='flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-light-gray hover:bg-d-green/40'>
                  <img src='/images/icon_google.svg' className='size-[20rem]' alt='google auth' />
                  <span className='text-[18rem] font-medium leading-none'>Continue with Google</span>
                </button>
                <Link href='/login' className='text-center text-[18rem] leading-none text-d-black/60'>
                  Already have an account? <span className='text-d-black'>Log in</span>
                </Link>
              </div> */}
            </form>
          </Form>

          <div className='mt-[24rem] text-center text-[12rem] leading-tight'>{tCommon('allRightsReserved')}</div>
        </div>
      </section>
    </main>
  );
}
