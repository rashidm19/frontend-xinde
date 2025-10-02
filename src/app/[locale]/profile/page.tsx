'use client';

import { BestResults } from './_components/BestResults';
import { Header } from '@/components/Header';
import { IeltsGoal } from './_components/IeltsGoal';
import { TimeSpent } from './_components/TimeSpent';
import { Skeleton } from '@/components/ui/skeleton';
import { PracticeBySections } from '@/app/[locale]/profile/_components/PracticeList';
import { getPracticeTimeStats } from '@/api/GET_stats_practice_time';
import { useProfile } from '@/hooks/useProfile';
import { useQuery } from '@tanstack/react-query';

export default function Page() {
  const { profile, status } = useProfile();
  const isLoading = !profile && (status === 'idle' || status === 'loading');

  const { data: practiceTimeStats, isLoading: practiceTimeStatsLoading } = useQuery({
    queryKey: ['practiceTimeStats'],
    queryFn: getPracticeTimeStats,
  });

  return (
    <>
      <Header name={profile?.name} avatar={profile?.avatar} />
      <main className='container flex max-w-[1440rem] flex-wrap justify-between gap-x-[16rem] px-[40rem] pb-[80rem] pt-[40rem]'>
        <div className='flex w-[1016rem] flex-col gap-y-[16rem]'>
          {isLoading ? (
            <>
              <Skeleton className='h-[400rem] w-full rounded-[16rem]' />
              <Skeleton className='h-[400rem] w-full rounded-[16rem]' />
              <Skeleton className='h-[400rem] w-full rounded-[16rem]' />
            </>
          ) : (
            <>
              <BestResults />
              {/*<Achievements />*/}
              <TimeSpent data={practiceTimeStats} loading={practiceTimeStatsLoading} />
            </>
          )}
        </div>
        <div className='flex w-[328rem] flex-col gap-y-[16rem]'>
          {isLoading ? (
            <>
              <Skeleton className='h-[380rem] w-full rounded-[16rem]' />
              <Skeleton className='h-[200rem] w-full rounded-[16rem]' />
              <Skeleton className='h-[300rem] w-full rounded-[16rem]' />
            </>
          ) : (
            <>
              <PracticeBySections />
              {/*<Notifications />*/}
              {/*<Referrals />*/}
              <IeltsGoal grade={profile?.target_grade || 9} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
