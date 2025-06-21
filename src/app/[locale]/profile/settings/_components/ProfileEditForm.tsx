'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().min(2),
  password: z.string(),
  old_password: z.string().min(8),
  new_password: z.string().min(8),
  region: z.string().min(2),
});

interface Props {
  name: string;
  email: string;
}

export const ProfileEditForm = ({ name, email }: Props) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name,
      email: email,
      password: '*********',
      old_password: '',
      new_password: '',
      region: 'kz',
    },
  });

  return (
    <Form {...form}>
      <form className='grid grid-cols-2 gap-[24rem]'>
        {/* // * Title */}
        <h1 className='col-span-2 text-[20rem] font-medium leading-none'>Profile editing</h1>

        {/* // * Input fields */}
        {/* // * Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='relative flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>Name</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <FormControl>
                <input
                  {...field}
                  placeholder='Enter your name'
                  type='text'
                  className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                />
              </FormControl>
              <div className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'>
                <img src='/images/icon_edit.svg' alt='edit' className='size-[14rem]' />
              </div>
            </FormItem>
          )}
        />
        {/* // * Email, not-editable */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>Email</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <FormControl>
                <input
                  {...field}
                  disabled
                  placeholder='Enter your email'
                  type='text'
                  className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* // * Current password, not-editable, works as a button to reveal password change fields */}
        {!isChangingPassword && (
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='relative flex flex-col gap-y-[12rem]'>
                <div className='flex flex-row justify-between'>
                  <FormLabel className='font-poppins text-[14rem] leading-none'>Password</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    disabled
                    placeholder='**********'
                    type='password'
                    className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                  />
                </FormControl>
                <button
                  type='button'
                  onClick={() => setIsChangingPassword(true)}
                  className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'
                >
                  <img src='/images/icon_edit.svg' alt='edit' className='size-[14rem]' />
                </button>
              </FormItem>
            )}
          />
        )}

        {/* // * Old password */}
        {isChangingPassword && (
          <FormField
            control={form.control}
            name='old_password'
            render={({ field }) => (
              <FormItem className='relative flex flex-col gap-y-[12rem]'>
                <div className='flex flex-row justify-between'>
                  <FormLabel className='font-poppins text-[14rem] leading-none'>Old password</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    placeholder='Enter old password'
                    type='password'
                    className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                  />
                </FormControl>
                {/* <button type='button' className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'>
                          <img src='/images/icon_edit.svg' alt='edit' className='size-[14rem]' />
                        </button> */}
              </FormItem>
            )}
          />
        )}

        {/* // * Region */}
        <FormField
          control={form.control}
          name='region'
          render={({ field }) => (
            <FormItem className='flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>Select your region</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                    <SelectValue placeholder='Select' className='placeholder:text-d-black/60' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                  <SelectItem value='kz' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                    <span className='mr-[8rem] text-d-black/60'>KZ</span> Kazakhstan
                  </SelectItem>
                  <SelectItem value='kg' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                    <span className='mr-[8rem] text-d-black/60'>KG</span> Kyrgyzstan
                  </SelectItem>
                  <SelectItem value='md' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                    <span className='mr-[8rem] text-d-black/60'>MD</span> Moldova
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* // * New password */}
        {isChangingPassword && (
          <FormField
            control={form.control}
            name='new_password'
            render={({ field }) => (
              <FormItem className='relative flex flex-col gap-y-[12rem]'>
                <div className='flex flex-row justify-between'>
                  <FormLabel className='font-poppins text-[14rem] leading-none'>New password</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    placeholder='Enter new password'
                    type='password'
                    className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                  />
                </FormControl>
                {/* <button type='button' className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'>
                          <img src='/images/icon_edit.svg' alt='edit' className='size-[14rem]' />
                        </button> */}
              </FormItem>
            )}
          />
        )}

        {/* // * Submit */}
        {isChangingPassword && (
          <button type='button' className='col-start-1 flex h-[50rem] w-full items-center justify-center rounded-full bg-d-light-gray hover:bg-d-green/40'>
            <span className='text-[14rem] font-medium leading-none'>Save</span>
          </button>
        )}
      </form>
    </Form>
  );
};
