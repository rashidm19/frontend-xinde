'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import img from '../../../public/images/illustration_flower.png';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(1, 'Required field'),
  email: z.string().min(1, 'Required field').email('Invalid email address'),
  password: z.string().min(1, 'Required field').min(8, '8 characters minimum'),
  region: z.string().min(1, 'Required field'),
  agreement: z.boolean().default(true),
  avatar: z.string(),
});

export default function Registration() {
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
      form.setError('email', { message: "account doesn't exist" });
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <main>
        <section className='relative flex min-h-[1024rem] items-center'>
          <img className='absolute left-0 top-[114rem] h-auto w-[951rem]' src='/images/illustration_flower2.png' alt='Flower illustration' />
          <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
            <div className='flex w-[560rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              <div className='flex items-center justify-between'>
                <figure className='flex items-center gap-x-[6rem]'>
                  <img src='/images/logo.svg' className='size-[35rem]' alt='logo' />
                  <div className='font-poppins text-[18rem] font-semibold'>studybox</div>
                </figure>
                <div className='text-[18rem] leading-none text-d-black/60'>{form.getValues('email')}</div>
              </div>
              <div className='flex flex-col gap-y-[32rem]'>
                <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>Confirmation</h1>
                <p className='text-center text-[18rem] font-medium leading-none'>We have sent a confirmation email to your email adress</p>
              </div>
              <Link href='/login' className='mx-auto flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'>
                <span className='text-[18rem] font-medium leading-none'>Ok</span>
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
        <img className='absolute left-0 top-[114rem] h-auto w-[951rem]' src='/images/illustration_flower2.png' alt='Flower illustration' />
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-[520rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white p-[40rem] shadow-card'>
              {/* // * Go back & Logo */}
              <div className='flex justify-between'>
                <Link href='/' className='flex items-center gap-x-[8rem]'>
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
              <h1 className='text-center font-poppins text-[40rem] font-semibold leading-none tracking-[-2rem]'>Create your account</h1>

              {/* // * Input fields */}
              <div className='flex flex-col gap-y-[12rem]'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-between'>
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>Name</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          placeholder='Enter your name'
                          type='text'
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
                          placeholder='Create your password'
                          type='password'
                          className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-none placeholder:text-d-black/60'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='region'
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-y-[8rem]'>
                      <div className='flex flex-row justify-between'>
                        <FormLabel className='font-poppins text-[18rem] font-medium leading-none'>Select your region</FormLabel>
                        <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                            <SelectValue placeholder='Select' className='placeholder:text-d-black/60' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                          <SelectItem value='kz' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                            <span className='mr-[16rem] text-d-black/60'>KZ</span> Kazakhstan
                          </SelectItem>
                          <SelectItem value='kg' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                            <span className='mr-[16rem] text-d-black/60'>KG</span> Kyrgyzstan
                          </SelectItem>
                          <SelectItem value='md' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                            <span className='mr-[16rem] text-d-black/60'>MD</span> Moldova
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='agreement'
                  render={({ field }) => (
                    <FormItem className='mt-[6rem] flex items-center gap-x-[12rem]'>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className='text-[18rem] font-medium leading-none'>
                        I accept the{' '}
                        <Link href='/user-agreement' className='border-b border-d-black'>
                          user agreement
                        </Link>
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <button
                  type='submit'
                  className='mx-auto mt-[6rem] flex h-[54rem] w-[428rem] items-center justify-center gap-x-[24rem] rounded-full bg-d-green hover:bg-d-green/40'
                >
                  <span className='text-[18rem] font-medium leading-none'>Create account</span>
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
                  Already have an account? <span className='text-d-black'>Log in</span>
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

          <div className='mt-[24rem] text-center text-[12rem] leading-tight'>© All rights reserved</div>
        </div>
      </section>
    </main>
  );
}
