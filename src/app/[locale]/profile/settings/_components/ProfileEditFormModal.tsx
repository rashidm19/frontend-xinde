'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { DialogClose } from '@/components/ui/dialog';
import { ProfileEditForm } from './ProfileEditForm';
import React, { useRef, useState } from 'react';
import nProgress from 'nprogress';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import axiosInstance from '@/lib/axiosInstance';
import { postUser } from '@/api/POST_user';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().min(2),
  password: z.string(),
  old_password: z.string().min(8),
  new_password: z.string().min(8),
  region: z.string().min(2),
});

export const ProfileEditFormModal = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { tImgAlts, tCommon, tActions } = useCustomTranslations();

  const [loading, setLoading] = useState(false);

  const { data, status } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      axiosInstance.get('/auth/profile').then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: postUser,
    onSuccess: (updatedUser: any) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name,
      email: data?.email,
      password: '*********',
      old_password: '',
      new_password: '',
      region: 'kz',
    },
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await mutation.mutateAsync({});
      closeRef.current?.click();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'pending') {
    return <></>;
  }

  return (
    <section className='fixed bottom-0 flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[24rem] desktop:relative desktop:rounded-[24rem]'>
      <DialogClose ref={closeRef} className='absolute right-[24rem] top-[24rem]'>
        <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[20rem]' />
      </DialogClose>

      {/* // * Avatar, status, name, email */}
      <div className='flex items-end gap-x-[16rem]'>
        <Avatar className='relative size-[96rem] overflow-visible rounded-full bg-d-light-gray'>
          <AvatarImage src={data?.avatar} />
          <AvatarFallback className='text-[18rem]'>{data?.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
          <span className='absolute left-[72rem] top-[-4rem] flex h-[34rem] w-[98rem] items-center whitespace-nowrap rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] px-[20rem] text-[14rem] font-medium text-white'>
            {tCommon('freeTrial')}
          </span>
        </Avatar>
        <div className='mb-[16rem] flex flex-col gap-y-[8rem]'>
          <div className='text-[24rem] font-medium leading-none'>{data?.name}</div>
          <div className='font-poppins text-[14rem] leading-none'>{data?.email}</div>
        </div>
      </div>

      {/* // * Profile Edit */}
      <ProfileEditForm isChangingPassword={isChangingPassword} setIsChangingPassword={setIsChangingPassword} form={form} />

      {/* // * Logout & Delete */}
      <div className='flex justify-between'>
        <button type='button' onClick={handleSubmit} className='flex h-[50rem] items-center justify-center rounded-full bg-d-green px-[32rem] hover:bg-d-green/40'>
          {loading ? (
            <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          ) : (
            <span className='text-[14rem] font-medium leading-none'>{tActions('editProfile')}</span>
          )}
        </button>

        <div className='flex justify-start gap-x-[6rem]'>
          <button
            type='button'
            onClick={() => {
              localStorage.removeItem('token');
              nProgress.start();
              router.push('/');
            }}
            className='flex h-[50rem] items-center justify-center rounded-full bg-d-light-gray px-[32rem] hover:bg-d-green/40'
          >
            <span className='text-[14rem] font-medium leading-none'>{tActions('logout')}</span>
          </button>

          <button type='button' className='flex h-[50rem] items-center justify-center rounded-full bg-white px-[32rem]'>
            <span className='text-[14rem] font-medium leading-none'>{tActions('deleteAccount')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
