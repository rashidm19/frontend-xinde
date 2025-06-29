'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

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
  const { t, tImgAlts, tActions, tForm } = useCustomTranslations('profileSettings.profileEditForm');

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
        <h1 className='col-span-2 text-[20rem] font-medium leading-none'>{t('title')}</h1>

        {/* // * Input fields */}
        {/* // * Name */}
        <FormField
          name='name'
          control={form.control}
          render={({ field }) => (
            <FormItem className='relative flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.name')}</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <FormControl>
                <input
                  {...field}
                  type='text'
                  placeholder={tForm('placeholders.name')}
                  className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                />
              </FormControl>
              <div className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'>
                <img src='/images/icon_edit.svg' alt={tImgAlts('edit')} className='size-[14rem]' />
              </div>
            </FormItem>
          )}
        />
        {/* // * Email, not-editable */}
        <FormField
          name='email'
          control={form.control}
          render={({ field }) => (
            <FormItem className='flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.email')}</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <FormControl>
                <input
                  {...field}
                  disabled
                  type='text'
                  placeholder={tForm('placeholders.email')}
                  className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* // * Current password, not-editable, works as a button to reveal password change fields */}
        {!isChangingPassword && (
          <FormField
            name='password'
            control={form.control}
            render={({ field }) => (
              <FormItem className='relative flex flex-col gap-y-[12rem]'>
                <div className='flex flex-row justify-between'>
                  <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.password')}</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    disabled
                    type='password'
                    placeholder='**********'
                    className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                  />
                </FormControl>
                <button
                  type='button'
                  onClick={() => setIsChangingPassword(true)}
                  className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'
                >
                  <img src='/images/icon_edit.svg' alt={tImgAlts('edit')} className='size-[14rem]' />
                </button>
              </FormItem>
            )}
          />
        )}

        {/* // * Old password */}
        {isChangingPassword && (
          <FormField
            name='old_password'
            control={form.control}
            render={({ field }) => (
              <FormItem className='relative flex flex-col gap-y-[12rem]'>
                <div className='flex flex-row justify-between'>
                  <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.oldPassword')}</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    type='password'
                    placeholder={tForm('placeholders.oldPassword')}
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
          name='region'
          control={form.control}
          render={({ field }) => (
            <FormItem className='flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.region')}</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                    <SelectValue placeholder={tForm('placeholders.select')} className='placeholder:text-d-black/60' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                  <SelectItem value='kz' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                    <span className='mr-[8rem] text-d-black/60'>KZ </span>
                    {tForm('regionKZ')}
                  </SelectItem>
                  <SelectItem value='kg' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                    <span className='mr-[8rem] text-d-black/60'>KG </span>
                    {tForm('regionKG')}
                  </SelectItem>
                  <SelectItem value='md' className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'>
                    <span className='mr-[8rem] text-d-black/60'>MD </span>
                    {tForm('regionMD')}
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
                  <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.newPassword')}</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    type='password'
                    placeholder={tForm('placeholders.newPassword')}
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
            <span className='text-[14rem] font-medium leading-none'>{tActions('save')}</span>
          </button>
        )}
      </form>
    </Form>
  );
};
