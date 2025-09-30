'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { DialogClose } from '@/components/ui/dialog';
import { ProfileEditForm } from './ProfileEditForm';
import React, { useEffect, useRef, useState } from 'react';
import nProgress from 'nprogress';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { postUser } from '@/api/POST_user';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { profileEditFormSchema, ProfileEditFormValues } from './profileEditSchema';
import { deleteProfile, ProfileUpdateRequest, ProfileUpdateResponse } from '@/api/profile';
import { regionSchema } from '@/types/types';
import { useProfile } from '@/hooks/useProfile';
import { refreshProfile, resetProfile } from '@/stores/profileStore';
import { openConfirmationModal } from '@/stores/confirmationModalStore';

const DEFAULT_REGION = 'kz';

const resolveRegion = (region?: string | null): string => {
  const parsed = regionSchema.safeParse(region ?? undefined);
  if (parsed.success) {
    return parsed.data;
  }

  return DEFAULT_REGION;
};

export const ProfileEditFormModal = () => {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { tImgAlts, tCommon, tActions } = useCustomTranslations();
  const { t: tProfileSettings } = useCustomTranslations('profileSettings.profileEditForm');
  const { profile, status, setProfile: setProfileInStore } = useProfile();

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditFormSchema),
    defaultValues: {
      name: '',
      email: '',
      region: DEFAULT_REGION,
      oldPassword: '',
      newPassword: '',
    },
  });

  const mutation = useMutation<ProfileUpdateResponse, Error, ProfileUpdateRequest>({
    mutationFn: postUser,
    onSuccess: async updatedUser => {
      setProfileInStore(updatedUser);
      let syncedProfile = updatedUser;

      try {
        const refreshed = await refreshProfile();
        if (refreshed) {
          syncedProfile = refreshed;
        }
      } catch (error) {
        console.error(error);
      }

      setProfileInStore(syncedProfile);
      form.reset({
        name: syncedProfile.name ?? '',
        email: syncedProfile.email,
        region: resolveRegion(syncedProfile.region ?? undefined),
        oldPassword: '',
        newPassword: '',
      });
      setIsChangingPassword(false);
      closeRef.current?.click();
    },
  });

  const deleteAccountMutation = useMutation<void, Error>({
    mutationFn: deleteProfile,
    onSuccess: () => {
      localStorage.removeItem('token');
      resetProfile();
      closeRef.current?.click();
      nProgress.start();
      router.push('/');
    },
    onError: error => {
      console.error(error);
    },
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.reset({
      name: profile.name ?? '',
      email: profile.email,
      region: resolveRegion(profile.region ?? undefined),
      oldPassword: '',
      newPassword: '',
    });
    setIsChangingPassword(false);
  }, [form, profile]);

  const onSubmit: SubmitHandler<ProfileEditFormValues> = async values => {
    const payload: ProfileUpdateRequest = {
      name: values.name.trim(),
      region: values.region,
    };

    if (values.oldPassword && values.newPassword) {
      payload.oldPassword = values.oldPassword;
      payload.newPassword = values.newPassword;
    }

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error(error);
    }
  };
  const submitForm = form.handleSubmit(onSubmit);

  const handleDeleteAccount = () => {
    openConfirmationModal({
      title: tProfileSettings('deleteAccount.title'),
      message: tProfileSettings('deleteAccount.description'),
      confirmText: tActions('deleteAccount'),
      cancelText: tActions('cancel'),
      variant: 'destructive',
      onConfirm: () => deleteAccountMutation.mutateAsync(),
    });

    closeRef.current?.click();
  };

  if (status === 'idle' || status === 'loading') {
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
          <AvatarImage src={profile?.avatar ?? undefined} />
          <AvatarFallback className='text-[18rem]'>{profile?.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
          <span className='absolute left-[72rem] top-[-4rem] flex h-[34rem] w-[98rem] items-center whitespace-nowrap rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] px-[20rem] text-[14rem] font-medium text-white'>
            {tCommon('freeTrial')}
          </span>
        </Avatar>
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
        isSubmitting={mutation.isPending}
      />

      {/* // * Logout & Delete */}
      <div className='flex justify-between'>
        <button
          type='button'
          onClick={submitForm}
          className='flex h-[50rem] items-center justify-center rounded-full bg-d-green px-[32rem] hover:bg-d-green/40 disabled:cursor-not-allowed disabled:bg-d-green/60'
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
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
            onClick={() => {
              localStorage.removeItem('token');
              nProgress.start();
              router.push('/');
            }}
            className='flex h-[50rem] items-center justify-center rounded-full bg-d-light-gray px-[32rem] hover:bg-d-green/40'
          >
            <span className='text-[14rem] font-medium leading-none'>{tActions('logout')}</span>
          </button>

          <button
            type='button'
            onClick={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending}
            className='flex h-[50rem] items-center justify-center rounded-full bg-white px-[32rem] transition-colors hover:bg-d-red/10 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <span className='text-[14rem] font-medium leading-none'>{tActions('deleteAccount')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
