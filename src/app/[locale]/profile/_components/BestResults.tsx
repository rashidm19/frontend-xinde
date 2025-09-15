'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { BestSectionsResults } from './BestSectionsResults';
import { ProfileEditFormModal } from '../settings/_components/ProfileEditFormModal';
import nProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ApproximateIELTSScore } from './ApproximateIELTSScore';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { ChangeLangModal } from '@/app/[locale]/profile/settings/_components/ChangeLangModal';
import { getPracticeScoresStats } from '@/api/GET_stats_practice_scores';
import { calculateIeltsOverall } from '@/lib/utils';
import { API_URL } from '@/lib/config';

export const BestResults = () => {
  const { tImgAlts, tCommon } = useCustomTranslations();

  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }).then(res => res.json()),
  });

  const { data: practiceStats, isLoading: practiceStatsLoading } = useQuery({
    queryKey: ['bestPracticeScores'],
    queryFn: getPracticeScoresStats,
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
                {tCommon('freeTrial')}
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
                <img src='/images/icon_globe.svg' alt={tImgAlts('globe')} className='size-[18rem]' />
              </DialogTrigger>

              <DialogContent className='fixed left-0 top-0 flex h-full min-h-[100dvh] w-full max-w-full flex-col items-start justify-start overflow-hidden backdrop-brightness-90 desktop:items-center desktop:justify-center'>
                <ChangeLangModal />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger className='flex size-[46rem] items-center justify-center rounded-full bg-d-light-gray hover:bg-d-green/40'>
                <img src='/images/icon_gear.svg' alt={tImgAlts('settings')} className='size-[18rem]' />
              </DialogTrigger>

              <DialogContent className='fixed left-0 top-0 flex h-full min-h-[100dvh] w-full max-w-full flex-col items-start justify-start overflow-hidden backdrop-brightness-90 desktop:items-center desktop:justify-center'>
                <ProfileEditFormModal />
              </DialogContent>
            </Dialog>

            <button
              type='button'
              className='flex size-[46rem] items-center justify-center rounded-full bg-d-light-gray hover:bg-d-green/40'
              onClick={() => {
                localStorage.removeItem('token');
                nProgress.start();
                router.push('/');
              }}
            >
              <img src='/images/icon_door.svg' alt={tImgAlts('logout')} className='size-[18rem]' />
            </button>
          </div>
        </div>
        <div className='flex justify-between'>
          <BestSectionsResults stats={practiceStats} loading={practiceStatsLoading} />
          {/*<BestMockScore />*/}
          <ApproximateIELTSScore
            score={calculateIeltsOverall(
              practiceStats?.best_listening_score,
              practiceStats?.best_reading_score,
              practiceStats?.best_writing_score,
              practiceStats?.best_speaking_score
            )}
          />
        </div>
      </div>
    </section>
  );
};
