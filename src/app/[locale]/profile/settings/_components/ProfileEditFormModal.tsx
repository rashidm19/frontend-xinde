'use client';

import { DialogClose } from '@/components/ui/dialog';
import { ProfileEditForm } from './ProfileEditForm';
import React, { useRef } from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { ProfileAvatarManager } from './ProfileAvatarManager';
import { useProfileEditController } from './useProfileEditController';

export const ProfileEditFormModal = () => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { tImgAlts, tCommon, tActions } = useCustomTranslations();
  const {
    profile,
    hasActiveSubscription,
    isProfileLoading,
    form,
    isChangingPassword,
    setIsChangingPassword,
    onSubmit,
    submitForm,
    isSubmitting,
    isDeleting,
    handleDeleteAccount,
    handleLogout,
  } = useProfileEditController({ onClose: () => closeRef.current?.click() });

  if (isProfileLoading) {
    return <></>;
  }

  return (
    <section className='fixed bottom-0 flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[24rem] desktop:relative desktop:rounded-[24rem]'>
      <DialogClose ref={closeRef} className='absolute right-[24rem] top-[24rem]'>
        <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[20rem]' />
      </DialogClose>

      {/* // * Avatar, status, name, email */}
      <div className='flex items-end gap-x-[16rem]'>
        <ProfileAvatarManager badgeLabel={!hasActiveSubscription ? tCommon('freeTrial') : undefined} />
        <div className='mb-[16rem] flex flex-col gap-y-[8rem]'>
          <div className='text-[24rem] font-medium leading-none'>{profile?.name}</div>
          <div className='font-poppins text-[14rem] leading-none'>{profile?.email}</div>
        </div>
      </div>

      {/* // * Profile Edit */}
      <ProfileEditForm
        form={form}
        isChangingPassword={isChangingPassword}
        setIsChangingPassword={setIsChangingPassword}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />

      {/* // * Logout & Delete */}
      <div className='flex justify-between'>
        <button
          type='button'
          onClick={submitForm}
          className='flex h-[50rem] items-center justify-center rounded-full bg-d-green px-[32rem] hover:bg-d-green/40 disabled:cursor-not-allowed disabled:bg-d-green/60'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4' />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          ) : (
            <span className='text-[14rem] font-medium leading-none'>{tActions('save')}</span>
          )}
        </button>

        <div className='flex justify-start gap-x-[6rem]'>
          <button
            type='button'
            onClick={handleLogout}
            className='flex h-[50rem] items-center justify-center rounded-full bg-d-light-gray px-[32rem] hover:bg-d-green/40'
          >
            <span className='text-[14rem] font-medium leading-none'>{tActions('logout')}</span>
          </button>

          <button
            type='button'
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className='flex h-[50rem] items-center justify-center rounded-full bg-white px-[32rem] transition-colors hover:bg-d-red/10 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <span className='text-[14rem] font-medium leading-none'>{tActions('deleteAccount')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
