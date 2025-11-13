'use client';

// import { ProfileEditForm } from './_components/ProfileEditForm';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useProfile } from '@/hooks/useProfile';
import { ProfileAvatarManager } from './_components/ProfileAvatarManager';
import { useSubscription } from '@/hooks/useSubscription';
import { useLogout } from '@/hooks/useLogout';

export default function ProfileSettings() {
  const { tCommon, tActions } = useCustomTranslations();

  const { profile, status } = useProfile();
  const { hasActiveSubscription } = useSubscription();
  const { logout } = useLogout();

  if (!profile && (status === 'idle' || status === 'loading')) {
    return <></>;
  }

  return (
    <main>
      <section className='relative flex min-h-[100vh] items-center py-[80rem]'>
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
          <div className='flex w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[24rem] shadow-card'>
            {/* // * Avatar, status, name, email */}
            <div className='flex items-end gap-x-[16rem]'>
              <ProfileAvatarManager badgeLabel={!hasActiveSubscription ? tCommon('freeTrial') : undefined} />
              <div className='mb-[16rem] flex flex-col gap-y-[8rem]'>
                <div className='text-[24rem] font-medium leading-none'>{profile?.name}</div>
                <div className='font-poppins text-[14rem] leading-none'>{profile?.email}</div>
              </div>
            </div>

            {/* // * Profile Edit */}
            {/*<ProfileEditForm name={data.name} email={data.email} />*/}

            {/* // * Logout & Delete */}
            <div className='flex justify-start gap-x-[6rem]'>
              <button
                type='button'
                className='flex h-[50rem] items-center justify-center rounded-full bg-d-light-gray px-[32rem] hover:bg-d-green/40'
                onClick={() => {
                  void logout();
                }}
              >
                <span className='text-[14rem] font-medium leading-none'>{tActions('logout')}</span>
              </button>
              <button type='button' className='flex h-[50rem] items-center justify-center rounded-full bg-white px-[32rem]'>
                <span className='text-[14rem] font-medium leading-none'>{tActions('deleteAccount')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
