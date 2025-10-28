'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
import { useLocale } from 'next-intl';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useFeedbackStatus } from '@/hooks/useFeedbackStatus';
import type { SubmitFeedbackPayload } from '@/api/feedback';
import type { FeedbackModalSubmitPayload, FeedbackModalSubmitResult } from '@/components/feedback/types';
import { FreePracticeTestModal } from '@/components/modals/FreePracticeTestModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useMediaQuery } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ProfileEditFormModal } from '@/app/[locale]/profile/settings/_components/ProfileEditFormModal';
import { ChangeLangModal } from '@/app/[locale]/profile/settings/_components/ChangeLangModal';
import { SubscriptionDetailsModal } from '@/components/SubscriptionDetailsModal';
import nProgress from 'nprogress';
import { logout } from '@/lib/logout';

const sectionStartRoutes: Record<PracticeSectionKey, string> = {
  writing: '/practice/writing/customize',
  reading: '/practice/reading/rules',
  listening: '/practice/listening/rules',
  speaking: '/practice/speaking/customize',
};

const FEEDBACK_NUDGE_STORAGE_KEY = 'studybox.feedback.nudge.dismissedAt';

export default function Page() {
  const router = useRouter();
  const locale = useLocale();
  const { profile, status } = useProfile();
  const isLoading = !profile && (status === 'idle' || status === 'loading');

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [hasPromptedFeedback, setHasPromptedFeedback] = useState(false);
  const [freeTestModalOpen, setFreeTestModalOpen] = useState(false);
  const [hasAutoOpenedFreeTestModal, setHasAutoOpenedFreeTestModal] = useState(false);

  const feedbackEnabled = useMemo(() => status !== 'idle', [status]);

  const {
    isLoading: feedbackStatusLoading,
    hasSubmitted: feedbackAlreadySubmitted,
    error: feedbackStatusError,
    submitFeedback,
    refetch: refetchFeedbackStatus,
  } = useFeedbackStatus({ enabled: feedbackEnabled });

  const isDesktop = useMediaQuery('(min-width: 1440px)');
  const isTabletUp = useMediaQuery('(min-width: 768px)');
  const isMobile = !isTabletUp;

  useEffect(() => {
    if (isMobile) {
      router.replace(`/${locale}/m/stats`);
    }
  }, [isMobile, router, locale]);

  if (isMobile) {
    return null;
  }

  const shouldPromptFeedback = useMemo(
    () => !isLoading && !feedbackStatusLoading && !feedbackAlreadySubmitted && !hasPromptedFeedback && !feedbackStatusError && !freeTestModalOpen,
    [isLoading, feedbackStatusLoading, feedbackAlreadySubmitted, hasPromptedFeedback, feedbackStatusError, freeTestModalOpen]
  );

  useEffect(() => {
    if (!shouldPromptFeedback) {
      return;
    }

    setFeedbackOpen(true);
    setHasPromptedFeedback(true);
  }, [shouldPromptFeedback]);

  const handleFeedbackClose = useCallback(() => {
    setFeedbackOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FEEDBACK_NUDGE_STORAGE_KEY, Date.now().toString());
    }
  }, []);

  useEffect(() => {
    if (freeTestModalOpen && feedbackOpen) {
      setFeedbackOpen(false);
    }
  }, [freeTestModalOpen, feedbackOpen]);

  const handleFeedbackSubmit = useCallback(
    async ({ rating, highlights, otherText, comment }: FeedbackModalSubmitPayload): Promise<FeedbackModalSubmitResult> => {
      if (rating === null) {
        return { ok: false, error: 'Please rate your experience before submitting.' };
      }

      const trimmedOther = otherText.trim();
      const trimmedComment = comment.trim();

      if (highlights.includes('other') && trimmedOther.length === 0) {
        return { ok: false, error: 'Please add a short note for “Other”.' };
      }

      const payload: SubmitFeedbackPayload = {
        rating,
        highlights,
      };

      if (highlights.includes('other')) {
        payload.otherHighlight = trimmedOther;
      }

      if (trimmedComment.length > 0) {
        payload.comment = trimmedComment.slice(0, 2000);
      }

      const result = await submitFeedback(payload);

      if (result.ok) {
        setHasPromptedFeedback(true);
        void refetchFeedbackStatus();
      }

      return result;
    },
    [submitFeedback, refetchFeedbackStatus]
  );

  const { data: practiceHistory, isLoading: practiceHistoryLoading } = useQuery({
    queryKey: ['practiceHistory'],
    queryFn: getPracticeHistory,
  });

  const { hasActiveSubscription, status: subscriptionStatus } = useSubscription();
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

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

  useEffect(() => {
    if (hasAutoOpenedFreeTestModal || isLoading || !profile || subscriptionStatus !== 'success') {
      return;
    }

    if (profile.practice_balance === 1 && !hasActiveSubscription) {
      if (typeof window !== 'undefined') {
        const storageKey = 'studybox.free-test.welcome-shown';
        const alreadyShown = window.sessionStorage.getItem(storageKey);
        if (!alreadyShown) {
          window.sessionStorage.setItem(storageKey, '1');
          setFreeTestModalOpen(true);
        }
      } else {
        setFreeTestModalOpen(true);
      }

      setHasAutoOpenedFreeTestModal(true);
    }
  }, [hasAutoOpenedFreeTestModal, hasActiveSubscription, isLoading, profile, subscriptionStatus]);

  const handleFreeTestStart = useCallback(async () => {
    router.push(sectionStartRoutes.writing);
  }, [router]);

  const handleLogout = useCallback(() => {
    logout();
    nProgress.start();
    router.push('/');
  }, [router]);

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
                    onCta={handleHistoryCta}
                    onStartSection={handleStartSection}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <FreePracticeTestModal
        open={freeTestModalOpen}
        onOpenChange={setFreeTestModalOpen}
        onStart={handleFreeTestStart}
        onDismiss={() => {
          setFreeTestModalOpen(false);
        }}
        hasFreeTest={(profile?.practice_balance ?? 0) > 0}
      />
      <FeedbackModal
        open={feedbackOpen}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
        onSuccess={() => {
          setHasPromptedFeedback(true);
          void refetchFeedbackStatus();
        }}
      />
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
