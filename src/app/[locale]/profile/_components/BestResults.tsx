'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { ApproximateIeltsScore } from './ApproximateIieltsScore  ';
import { BestMockScore } from './BestMockScore';
import { BestSectionsResults } from './BestSectionsResults';
import Link from 'next/link';
import { ProfileEditFormModal } from '../settings/_components/ProfileEditFormModal';
import nProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const BestResults = () => {
  const router = useRouter();
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

  return (
    <section>
      <div className='rounded-[16rem] bg-white p-[24rem] pt-[16rem]'>
        {/* // * Avatar & Name & settings*/}
        <div className='mb-[40rem] flex justify-between'>
          <div className='flex items-end gap-x-[16rem] pt-[4rem]'>
            <Avatar className='relative size-[96rem] overflow-visible rounded-full bg-d-light-gray'>
              <AvatarImage src={data?.avatar} />
              <AvatarFallback className='text-[18rem]'>{data?.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
              <span className='absolute left-[72rem] top-[-4rem] flex h-[34rem] w-[98rem] items-center whitespace-nowrap rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] px-[20rem] text-[14rem] font-medium text-white'>
                Free trial
              </span>
            </Avatar>
            <div className='mb-[16rem] flex flex-col gap-y-[8rem]'>
              <div className='text-[24rem] font-medium leading-none'>{data?.name}</div>
              <div className='font-poppins text-[14rem] leading-none'>{data?.email}</div>
            </div>
          </div>
          <div className='flex gap-x-[6rem]'>
            <Dialog>
              <DialogTrigger className='flex size-[46rem] items-center justify-center rounded-full bg-d-light-gray hover:bg-d-green/40'>
                <img src='/images/icon_gear.svg' alt='settings' className='size-[18rem]' />
              </DialogTrigger>

              <DialogContent className='fixed left-0 top-0 flex h-full min-h-[100dvh] w-full max-w-full flex-col items-start justify-start overflow-hidden backdrop-brightness-90 desktop:items-center desktop:justify-center'>
                <ProfileEditFormModal />
              </DialogContent>
            </Dialog>

            <button
              type='button'
              onClick={() => {
                localStorage.removeItem('token');
                nProgress.start();
                router.push('/');
              }}
              className='flex size-[46rem] items-center justify-center rounded-full bg-d-light-gray hover:bg-d-green/40'
            >
              <img src='/images/icon_door.svg' alt='logout' className='size-[18rem]' />
            </button>
          </div>
        </div>
        <div className='flex justify-start'>
          <BestSectionsResults />
          <BestMockScore />
          <ApproximateIeltsScore />
        </div>
      </div>
    </section>
  );
};
