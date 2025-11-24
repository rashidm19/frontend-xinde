'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useProfileEditController } from '../settings/_components/useProfileEditController';
import { ProfileAvatarManager } from '../settings/_components/ProfileAvatarManager';
import { ProfileEditForm } from '../settings/_components/ProfileEditForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ProfileEditFormModal } from '../settings/_components/ProfileEditFormModal';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

const EditProfilePageComponent = () => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)', { initializeWithValue: false });

  if (isMobile === undefined) {
    return null;
  }

  if (!isMobile) {
    return (
      <Dialog
        open
        onOpenChange={open => {
          if (!open) {
            router.back();
          }
        }}
      >
        <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[672rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
          <ProfileEditFormModal />
        </DialogContent>
      </Dialog>
    );
  }

  return <MobileEditProfileView onNavigateBack={() => router.back()} />;
};

interface MobileEditProfileViewProps {
  onNavigateBack: () => void;
}

const MobileEditProfileView = ({ onNavigateBack }: MobileEditProfileViewProps) => {
  const { tActions, tCommon } = useCustomTranslations();
  const { t: tProfile } = useCustomTranslations('profileSettings.profileEditForm');
  const controller = useProfileEditController({ onClose: onNavigateBack });

  if (controller.isProfileLoading) {
    return null;
  }

  const {
    profile,
    hasActiveSubscription,
    form,
    isChangingPassword,
    setIsChangingPassword,
    onSubmit,
    isSubmitting,
    submitForm,
    handleDeleteAccount,
    handleLogout,
    isDeleting,
  } = controller;

  const badgeLabel = useMemo(() => (!hasActiveSubscription ? tCommon('freeTrial') : undefined), [hasActiveSubscription, tCommon]);

  // const saveButton = (
  //   <button
  //     type='button'
  //     onClick={submitForm}
  //     disabled={isSubmitting || !isDirty}
  //     className='rounded-full px-[12rem] text-[14rem] font-semibold text-d-green transition enabled:hover:text-d-green/80 disabled:cursor-not-allowed disabled:text-d-green/50'
  //   >
  //     {tActions('save')}
  //   </button>
  // );

  return (
    <motion.main
      className='flex min-h-dvh flex-col bg-white'
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-20%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
    >
      <MobilePageHeader
        title={tProfile('title')}
        back
        backLabel={tActions('back')}
        onBack={onNavigateBack}
        // rightAction={saveButton}
      />

      <div className='flex-1 overflow-y-auto px-[20rem] pb-[24rem] pt-[20rem]'>
        <div className='flex flex-col gap-[24rem]'>
          <div className='flex flex-col items-center gap-[16rem] rounded-[20rem] border border-slate-100 bg-slate-50 px-[20rem] py-[24rem]'>
            <ProfileAvatarManager badgeLabel={badgeLabel} />
            <div className='text-center'>
              <p className='text-[18rem] font-semibold text-slate-900'>{profile?.name}</p>
              <p className='text-[14rem] text-slate-500'>{profile?.email}</p>
            </div>
          </div>

          <section className='rounded-[20rem] border border-slate-100 bg-white px-[20rem] py-[24rem] shadow-[0_12px_32px_rgba(15,23,42,0.06)]'>
            <ProfileEditForm
              form={form}
              isChangingPassword={isChangingPassword}
              setIsChangingPassword={setIsChangingPassword}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </section>
        </div>
      </div>

      <footer className='sticky bottom-0 z-20 border-t border-slate-100 bg-white/95 px-[20rem] pb-[calc(24rem+env(safe-area-inset-bottom))] pt-[16rem] backdrop-blur'>
        <div className='flex flex-col gap-[12rem]'>
          <button
            type='button'
            onClick={submitForm}
            disabled={isSubmitting}
            className='flex h-[52rem] items-center justify-center rounded-full bg-d-green text-[16rem] font-semibold text-black transition hover:bg-d-green/80 disabled:cursor-not-allowed disabled:bg-d-green/60'
          >
            {isSubmitting ? (
              <svg className='size-[20rem] animate-spin text-black' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            ) : (
              tActions('save')
            )}
          </button>

          <button type='button' onClick={handleLogout} className='text-[16rem] font-semibold text-slate-600 underline-offset-4 hover:underline'>
            {tActions('logout')}
          </button>

          <button
            type='button'
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className='flex h-[48rem] items-center justify-center rounded-full border border-d-red text-[15rem] font-semibold text-d-red transition hover:bg-d-red/10 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {tActions('deleteAccount')}
          </button>
        </div>
      </footer>
    </motion.main>
  );
};

const EditProfilePage = withHydrationGuard(EditProfilePageComponent);

export default EditProfilePage;
