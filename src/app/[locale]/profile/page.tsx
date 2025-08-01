'use client';

import { BestResults } from './_components/BestResults';
import { Header } from '@/components/Header';
import { IeltsGoal } from './_components/IeltsGoal';
import { TimeSpent } from './_components/TimeSpent';
import { getUser } from '@/api/GET_user';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { PracticeBySections } from '@/app/[locale]/profile/_components/PracticeList';
import { getPracticeTimeStats } from '@/api/GET_stats_practice_time';

export default function Page() {
  const { data, status } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });

  const isLoading = status === 'pending';

  const { data: practiceTimeStats, isLoading: practiceTimeStatsLoading } = useQuery({
    queryKey: ['practiceTimeStats'],
    queryFn: getPracticeTimeStats,
  });

  return (
    <>
      <Header name={data?.name} avatar={data?.avatar} />
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
              <IeltsGoal grade={data?.target_grade} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
