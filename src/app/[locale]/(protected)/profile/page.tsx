'use client';

import { useCallback, useEffect, useState } from 'react';

import { BestResults } from './_components/BestResults';
import { Header } from '@/components/Header';
import { IeltsGoal } from './_components/IeltsGoal';
import { PracticeHistory } from './_components/PracticeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { PracticeBySections } from '@/app/[locale]/(protected)/profile/_components/PracticeList';
import { getPracticeHistory } from '@/api/GET_stats_practice_history';
import { useProfile } from '@/hooks/useProfile';
import { useQuery } from '@tanstack/react-query';
import { PracticeSectionKey } from '@/types/Stats';
import { useRouter } from 'next/navigation';
import { useIsClient } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ProfileEditFormModal } from '@/app/[locale]/(protected)/profile/settings/_components/ProfileEditFormModal';
import { ChangeLangModal } from '@/app/[locale]/(protected)/profile/settings/_components/ChangeLangModal';
import { SubscriptionDetailsModal } from '@/components/SubscriptionDetailsModal';
import { useLogout } from '@/hooks/useLogout';

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
  const { logout: performLogout } = useLogout();

  const isClient = useIsClient();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setIsDesktop(true);
      return;
    }

    const desktopQuery = window.matchMedia('(min-width: 1440px)');

    const updateMatches = () => {
      setIsDesktop(desktopQuery.matches);
    };

    updateMatches();

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    desktopQuery.addEventListener('change', handleDesktopChange);

    return () => {
      desktopQuery.removeEventListener('change', handleDesktopChange);
    };
  }, [isClient]);


  const { data: practiceHistory, isLoading: practiceHistoryLoading } = useQuery({
    queryKey: ['practiceHistory'],
    queryFn: getPracticeHistory,
  });

  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const handleStartSection = (section: PracticeSectionKey) => {
    const target = sectionStartRoutes[section];
    router.push(target);
  };

  const handleLogout = useCallback(() => {
    void performLogout();
  }, [performLogout]);

  const openSubscriptionModal = useCallback(() => {
    setSubscriptionModalOpen(true);
  }, []);

  const openProfileSettings = useCallback(() => {
    setProfileSettingsOpen(true);
  }, []);

  const openLanguageModal = useCallback(() => {
    setLanguageModalOpen(true);
  }, []);

  return (
    <>
      <Header
        name={profile?.name}
        email={profile?.email}
        avatar={profile?.avatar ?? undefined}
        onOpenSubscription={openSubscriptionModal}
        onOpenProfileSettings={openProfileSettings}
        onOpenLanguage={openLanguageModal}
        onLogout={handleLogout}
      />
      <main className={cn('container max-w-[1200rem]', isDesktop ? 'flex flex-wrap justify-between gap-x-[16rem] pb-[80rem] pt-[32rem]' : 'pb-[96rem] pt-[28rem]')}>
        {isDesktop ? (
          <>
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
                  <div className='flex flex-col gap-[28rem]'>
                    <PracticeHistory
                      entries={practiceHistory || []}
                      loading={isLoading || practiceHistoryLoading}
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
                  <IeltsGoal grade={profile?.target_grade || 9} />
                </>
              )}
            </div>
          </>
        ) : (
          <div className='grid w-full grid-cols-1 gap-[20rem] tablet:grid-cols-2 tablet:gap-[20rem]'>
            {isLoading ? (
              <>
                <Skeleton className='h-[360rem] w-full rounded-[16rem] tablet:col-span-2' />
                <Skeleton className='h-[220rem] w-full rounded-[16rem]' />
                <Skeleton className='h-[260rem] w-full rounded-[16rem]' />
                <Skeleton className='h-[420rem] w-full rounded-[16rem] tablet:col-span-2' />
              </>
            ) : (
              <>
                <div className='tablet:col-span-2'>
                  <BestResults />
                </div>
                <div className='flex flex-col gap-[16rem]'>
                  <PracticeBySections />
                </div>
                <div className='flex flex-col gap-[16rem]'>
                  <IeltsGoal grade={profile?.target_grade || 9} />
                </div>
                <div className='tablet:col-span-2'>
                  <PracticeHistory
                    entries={practiceHistory || []}
                    loading={isLoading || practiceHistoryLoading}
                    onStartSection={handleStartSection}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <Dialog open={profileSettingsOpen} onOpenChange={setProfileSettingsOpen}>
        <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[min(672rem,90vw)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
          <ProfileEditFormModal />
        </DialogContent>
      </Dialog>
      <Dialog open={languageModalOpen} onOpenChange={setLanguageModalOpen}>
        <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[min(672rem,90vw)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
          <ChangeLangModal variant='desktop' />
        </DialogContent>
      </Dialog>
      <SubscriptionDetailsModal open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} />
    </>
  );
}
