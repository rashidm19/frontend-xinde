'use client';

import { BestResults } from './_components/BestResults';
import { Header } from '@/components/Header';
import { IeltsGoal } from './_components/IeltsGoal';
import { PracticeHistory } from './_components/PracticeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { PracticeBySections } from '@/app/[locale]/profile/_components/PracticeList';
import { getPracticeHistory } from '@/api/GET_stats_practice_history';
import { useProfile } from '@/hooks/useProfile';
import { useQuery } from '@tanstack/react-query';
import { PracticeSectionKey } from '@/types/Stats';
import { useRouter } from 'next/navigation';

const sectionStartRoutes: Record<PracticeSectionKey, string> = {
  writing: '/practice/writing/customize',
  reading: '/practice/reading/rules',
  listening: '/practice/listening/rules',
  speaking: '/practice/speaking/customize',
};

export default function Page() {
  const router = useRouter();
  const { profile, status } = useProfile();
  const isLoading = !profile && (status === 'idle' || status === 'loading');

  const { data: practiceHistory, isLoading: practiceHistoryLoading } = useQuery({
    queryKey: ['practiceHistory'],
    queryFn: getPracticeHistory,
  });

  const handleStartSection = (section: PracticeSectionKey) => {
    const target = sectionStartRoutes[section];
    router.push(target);
  };

  const handleHistoryCta = (section: PracticeSectionKey, id: number) => {
    if (section === 'writing') {
      router.push(`/practice/writing/feedback/${id}`);
      return;
    }
    if (section === 'speaking') {
      router.push(`/practice/speaking/feedback/${id}`);
      return;
    }
    router.push(`/practice/${section}/results/${id}`);
    return;
  };

  return (
    <>
      <Header name={profile?.name} email={profile?.email} avatar={profile?.avatar ?? undefined} />
      <main className='container flex max-w-[1200rem] flex-wrap justify-between gap-x-[16rem] pb-[80rem] pt-[32rem]'>
        <div className='flex w-[856rem] flex-col gap-y-[16rem]'>
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
              {/*<PracticeHistory data={practiceHistory} loading={practiceHistoryLoading} />*/}
              <div className='flex flex-col gap-[28rem]'>
                <PracticeHistory
                  entries={practiceHistory || []}
                  loading={isLoading || practiceHistoryLoading}
                  onCta={handleHistoryCta}
                  onStartSection={handleStartSection}
                />
              </div>
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
