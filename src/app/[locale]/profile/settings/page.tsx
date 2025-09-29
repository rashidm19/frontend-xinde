'use client';

// import { ProfileEditForm } from './_components/ProfileEditForm';
import nProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { API_URL } from '@/lib/config';

export default function ProfileSettings() {
  const router = useRouter();
  const { tCommon, tActions } = useCustomTranslations();

  const { data, status } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      fetch(`${API_URL}/auth/profile`, {
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
    <main>
      <section className='relative flex min-h-[100vh] items-center py-[80rem]'>
        <div className='container relative z-10 flex max-w-[1440rem] flex-col items-center py-[80rem]'>
          <div className='flex w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[24rem] shadow-card'>
            {/* // * Avatar, status, name, email */}
            <div className='flex items-end gap-x-[16rem]'>
              <div className='relative size-[96rem] rounded-full bg-d-light-gray'>
                <img src={`${data.avatar}`} alt='avatar' className='absolute left-1 top-1 size-[94rem] rounded-full' />
                <div className='absolute left-[72rem] top-[-4rem] flex h-[34rem] w-[98rem] items-center whitespace-nowrap rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] px-[20rem] text-[14rem] font-medium text-white'>
                  {tCommon('freeTrial')}
                </div>
              </div>
              <div className='mb-[16rem] flex flex-col gap-y-[8rem]'>
                <div className='text-[24rem] font-medium leading-none'>{data?.name}</div>
                <div className='font-poppins text-[14rem] leading-none'>{data?.email}</div>
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
                  localStorage.removeItem('token');
                  nProgress.start();
                  router.push('/');
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
