'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useProfile } from '@/hooks/useProfile';
import { deleteProfileAvatar, updateProfileAvatar, uploadProfileAvatar } from '@/api/profileAvatar';

interface ProfileAvatarManagerProps {
  badgeLabel?: string;
  className?: string;
}

const SPINNER = (
  <svg className='size-[20rem] animate-spin text-d-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    />
  </svg>
);

export const ProfileAvatarManager = ({ badgeLabel, className }: ProfileAvatarManagerProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { profile, setProfile } = useProfile();
  const { t, tImgAlts } = useCustomTranslations('profileSettings.avatar');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const syncProfileAvatar = React.useCallback(
    (avatar: string | null) => {
      if (!profile) {
        return;
      }

      setProfile({ ...profile, avatar: avatar ?? undefined });
    },
    [profile, setProfile]
  );

  const uploadMutation = useMutation<string | null, unknown, File>({
    mutationFn: async file => {
      if (profile?.avatar) {
        return updateProfileAvatar(file);
      }

      return uploadProfileAvatar(file);
    },
    onSuccess: avatar => {
      setErrorMessage(null);
      syncProfileAvatar(avatar);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: () => {
      setErrorMessage(t('errors.uploadFailed'));
    },
  });

  const deleteMutation = useMutation<void, unknown>({
    mutationFn: deleteProfileAvatar,
    onSuccess: () => {
      setErrorMessage(null);
      syncProfileAvatar(null);
    },
    onError: () => {
      setErrorMessage(t('errors.removeFailed'));
    },
  });

  const isProcessing = uploadMutation.isPending || deleteMutation.isPending;
  const avatarUrl = profile?.avatar ?? undefined;

  const handleSelectFile = () => {
    if (isProcessing) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage(t('errors.invalidType'));
      event.target.value = '';
      return;
    }

    setErrorMessage(null);
    uploadMutation.mutate(file);
  };

  const handleRemoveAvatar = () => {
    if (!avatarUrl || isProcessing) {
      return;
    }

    deleteMutation.mutate();
  };

  return (
    <div className={cn('flex flex-col gap-y-[12rem]', className)}>
      <div className='group relative size-[96rem]'>
        <Avatar className='h-full w-full bg-d-light-gray'>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className='text-[18rem]'>{profile?.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
        </Avatar>

        {badgeLabel ? (
          <span className='absolute left-[72rem] top-[-4rem] flex h-[34rem] w-[98rem] items-center whitespace-nowrap rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] px-[20rem] text-[14rem] font-medium text-white'>
            {badgeLabel}
          </span>
        ) : null}

        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-full bg-d-black/0 opacity-0 transition-all duration-200 group-hover:bg-d-black/40 group-hover:opacity-100'>
          <div className='flex gap-[12rem]'>
            <button
              type='button'
              onClick={handleSelectFile}
              disabled={isProcessing}
              className='pointer-events-auto flex size-[36rem] items-center justify-center rounded-full bg-white text-d-black shadow transition-colors hover:bg-d-light-gray disabled:cursor-not-allowed disabled:opacity-70'
            >
              {isProcessing && uploadMutation.isPending ? <span className='sr-only'>{t('uploading')}</span> : null}
              <img src='/images/icon_edit.svg' alt={tImgAlts('edit')} className='size-[16rem]' />
            </button>

            <button
              type='button'
              onClick={handleRemoveAvatar}
              disabled={isProcessing || !avatarUrl}
              className='pointer-events-auto flex size-[36rem] items-center justify-center rounded-full bg-white text-d-black shadow transition-colors hover:bg-d-light-gray disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isProcessing && deleteMutation.isPending ? <span className='sr-only'>{t('removing')}</span> : null}
              <img src='/images/icon_close--black.svg' alt={tImgAlts('remove') ?? 'Remove'} className='size-[16rem]' />
            </button>
          </div>
        </div>

        {isProcessing && <div className='absolute inset-0 z-20 flex items-center justify-center rounded-full bg-white/70'>{SPINNER}</div>}
      </div>

      <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />

      {errorMessage ? <p className='text-[12rem] font-medium text-d-red'>{errorMessage}</p> : null}
    </div>
  );
};
