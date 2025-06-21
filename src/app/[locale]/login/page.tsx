'use client';

import * as NProgress from 'nprogress';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default function Login() {
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().min(1, 'Required field').email('Invalid email address'),
    password: z.string().min(1, 'Required field'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch('https://api.studybox.kz/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(values),
    });

    if (response?.ok) {
      const result = await response.json();
      localStorage.setItem('token', result.token);
      NProgress.start();
      router.push('/profile/');
    }

    if (response.status === 404) {
      form.setError('email', { message: "account doesn't exist" });
    }
  }

  return (
    <main>
      <section className='relative flex h-full min-h-[100vh] items-center'>
        <img className='absolute bottom-0 left-0 h-auto w-[960rem]' src='/images/illustration_torusArray.png' alt='Flower illustration' />
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[74rem]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-[520rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              {/* // * Go back & Logo */}
              <div className='flex justify-between'>
                <Link href='/public' className='flex items-center gap-x-[8rem]'>
                  <img src='/images/icon_back.svg' alt='go back' className='h-auto w-[16rem]' />
                  <span className='text-[18rem] font-medium leading-tight text-d-black/60'>Back</span>
                </Link>
                <figure className='flex items-center gap-x-[6rem]'>
                  <img src='/images/logo.svg' className='size-[35rem]' alt='logo' />
                  <div className='font-poppins text-[18rem] font-semibold'>studybox</div>
                </figure>
                <div className='w-[70rem]'></div>
              </div>
              {/* // * Title */}
              <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>Log into your account</h1>

              {/* // * Input fields */}
              <div className='flex flex-col gap-y-[12rem]'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-between'>
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>Email</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          placeholder='Enter your email'
                          type='text'
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
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>Password</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          placeholder='Enter your password'
                          type='password'
                          className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-none placeholder:text-d-black/60'
                        />
                      </FormControl>
                      <Link href='/password-recovery' className='ml-auto text-[16rem] font-medium text-d-black/60'>
                        Forgot your password?
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
                    <span className='text-[18rem] font-medium leading-none'>Log in</span>
                  )}
                </button>
                <Link href='/registration' className='text-center text-[18rem] leading-none text-d-black/60'>
                  Don’t have an account? <span className='text-d-black'>Sign up</span>
                </Link>
              </div>

              {/* // * Submit & Google Auth */}
              {/* <div className='mx-auto flex flex-col gap-y-[20rem]'>
                <button className='flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-light-gray hover:bg-d-green/40'>
                  <img src='/images/icon_google.svg' className='size-[20rem]' alt='google auth' />
                  <span className='text-[18rem] font-medium leading-none'>Continue with Google</span>
                </button>
                <Link href='/registration' className='text-center text-[18rem] leading-none text-d-black/60'>
                  Don’t have an account? <span className='text-d-black'>Sign up</span>
                </Link>
              </div> */}
            </form>
          </Form>
        </div>
      </section>
    </main>
  );
}
