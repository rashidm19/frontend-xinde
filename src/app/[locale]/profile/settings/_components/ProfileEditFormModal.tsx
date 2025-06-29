'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { DialogClose } from '@/components/ui/dialog';
import { ProfileEditForm } from './ProfileEditForm';
import React from 'react';
import nProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';

export const ProfileEditFormModal = () => {
  const router = useRouter();
  const { tImgAlts, tCommon, tActions } = useCustomTranslations();

  const { data, status } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      fetch(`https://api.studybox.kz/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }).then(res => res.json()),
  });

  if (status === 'pending') {
    return <></>;
  }

  return (
    <section className='fixed bottom-0 flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[24rem] desktop:relative desktop:rounded-[24rem]'>
      <DialogClose className='absolute right-[24rem] top-[24rem]'>
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
      <ProfileEditForm name={data.name} email={data.email} />

      {/* // * Logout & Delete */}
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
    </section>
  );
};
