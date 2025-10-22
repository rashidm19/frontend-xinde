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
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useFeedbackStatus } from '@/hooks/useFeedbackStatus';
import type { SubmitFeedbackPayload } from '@/api/feedback';
import type { FeedbackModalSubmitPayload, FeedbackModalSubmitResult } from '@/components/feedback/types';
import { FreePracticeTestModal } from '@/components/modals/FreePracticeTestModal';
import { useSubscription } from '@/hooks/useSubscription';

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

  useEffect(() => {
    if (
      !isLoading &&
      !feedbackStatusLoading &&
      !feedbackAlreadySubmitted &&
      !hasPromptedFeedback &&
      !feedbackStatusError &&
      !freeTestModalOpen
    ) {
      setFeedbackOpen(true);
      setHasPromptedFeedback(true);
    }
  }, [
    isLoading,
    feedbackStatusLoading,
    feedbackAlreadySubmitted,
    hasPromptedFeedback,
    feedbackStatusError,
    freeTestModalOpen,
  ]);

  useEffect(() => {
    if (freeTestModalOpen && feedbackOpen) {
      setFeedbackOpen(false);
    }
  }, [freeTestModalOpen, feedbackOpen]);

  const handleFeedbackClose = useCallback(() => {
    setFeedbackOpen(false);
  }, []);

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
    </>
  );
}
