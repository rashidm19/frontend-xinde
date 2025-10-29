'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useMediaQuery } from 'usehooks-ts';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, History as HistoryIcon, PenSquare, UserRound } from 'lucide-react';

import { BestResults } from './BestResults';
import { FeedbackNudgeBanner } from './FeedbackNudgeBanner';
import { IeltsGoal } from './IeltsGoal';
import { PracticeBySections } from './PracticeList';
import { PracticeHistory } from './PracticeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { PracticeSectionKey } from '@/types/Stats';
import { getPracticeHistory } from '@/api/GET_stats_practice_history';
import { useProfile } from '@/hooks/useProfile';
import { useFeedbackStatus } from '@/hooks/useFeedbackStatus';
import type { SubmitFeedbackPayload } from '@/api/feedback';
import type { FeedbackModalSubmitPayload, FeedbackModalSubmitResult } from '@/components/feedback/types';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { FreePracticeTestModal } from '@/components/modals/FreePracticeTestModal';
import { useSubscription } from '@/hooks/useSubscription';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubscriptionDetailsModal } from '@/components/SubscriptionDetailsModal';
import { ChangeLangModal } from '@/app/[locale]/profile/settings/_components/ChangeLangModal';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { logout } from '@/lib/logout';
import nProgress from 'nprogress';
import { trackScreenView } from '@/lib/analytics';

const sectionStartRoutes: Record<PracticeSectionKey, string> = {
  writing: '/practice/writing/customize',
  reading: '/practice/reading/rules',
  listening: '/practice/listening/rules',
  speaking: '/practice/speaking/customize',
};

export type MobileTabKey = 'stats' | 'practice' | 'history' | 'profile';

const MOBILE_TABS: Array<{ key: MobileTabKey; label: string; icon: LucideIcon; path: string }> = [
  { key: 'stats', label: 'Stats', icon: BarChart3, path: 'stats' },
  { key: 'practice', label: 'Practice', icon: PenSquare, path: 'practice' },
  { key: 'history', label: 'History', icon: HistoryIcon, path: 'history' },
  { key: 'profile', label: 'Profile', icon: UserRound, path: 'profile' },
];

const FEEDBACK_NUDGE_STORAGE_KEY = 'studybox.feedback.nudge.dismissedAt';
const FEEDBACK_NUDGE_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
const LAST_TAB_STORAGE_KEY = 'studybox.mobile-dashboard.last-tab';

interface MobileDashboardPageProps {
  activeTab: MobileTabKey;
}

export function MobileDashboardPage({ activeTab }: MobileDashboardPageProps) {
  const router = useRouter();
  const locale = useLocale();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const { profile, status: profileStatus } = useProfile();
  const isLoadingProfile = !profile && (profileStatus === 'idle' || profileStatus === 'loading');

  const {
    isLoading: feedbackStatusLoading,
    hasSubmitted: feedbackAlreadySubmitted,
    error: feedbackStatusError,
    submitFeedback,
    refetch: refetchFeedbackStatus,
  } = useFeedbackStatus({ enabled: profileStatus !== 'idle' });

  const { data: practiceHistory, isLoading: practiceHistoryLoading } = useQuery({
    queryKey: ['practiceHistory'],
    queryFn: getPracticeHistory,
  });

  const { hasActiveSubscription, status: subscriptionStatus, subscription, openPaywall } = useSubscription();
  const planName = subscription?.plan?.name ?? subscription?.subscription_plan?.name ?? null;
  const isSubscriptionReady = subscriptionStatus === 'success' || subscriptionStatus === 'error';

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [hasPromptedFeedback, setHasPromptedFeedback] = useState(false);
  const [feedbackNudgeVisible, setFeedbackNudgeVisible] = useState(false);
  const [freeTestModalOpen, setFreeTestModalOpen] = useState(false);
  const [hasAutoOpenedFreeTestModal, setHasAutoOpenedFreeTestModal] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<0 | 1 | -1>(0);

  const localePath = useCallback(
    (path: string) => `/${locale}/m/${path}`,
    [locale]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextIndex = MOBILE_TABS.findIndex(tab => tab.key === activeTab);
    const storedIndexRaw = window.sessionStorage.getItem(LAST_TAB_STORAGE_KEY);
    const storedIndex = storedIndexRaw ? Number(storedIndexRaw) : null;

    if (storedIndex !== null && Number.isFinite(storedIndex)) {
      if (nextIndex > storedIndex) {
        setTransitionDirection(1);
      } else if (nextIndex < storedIndex) {
        setTransitionDirection(-1);
      } else {
        setTransitionDirection(0);
      }
    } else {
      setTransitionDirection(0);
    }

    window.sessionStorage.setItem(LAST_TAB_STORAGE_KEY, String(nextIndex));
  }, [activeTab]);

  useEffect(() => {
    if (!isMobile) {
      router.replace(`/${locale}/profile`);
    }
  }, [isMobile, router, locale]);

  useEffect(() => {
    trackScreenView(activeTab);
  }, [activeTab]);

  const shouldPromptFeedback = useMemo(
    () =>
      !isLoadingProfile &&
      !feedbackStatusLoading &&
      !feedbackAlreadySubmitted &&
      !hasPromptedFeedback &&
      !feedbackStatusError &&
      !freeTestModalOpen,
    [feedbackAlreadySubmitted, feedbackStatusError, feedbackStatusLoading, freeTestModalOpen, hasPromptedFeedback, isLoadingProfile]
  );

  useEffect(() => {
    if (!shouldPromptFeedback) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(FEEDBACK_NUDGE_STORAGE_KEY);
    const dismissedAt = raw ? Number(raw) : 0;
    const now = Date.now();

    if (Number.isFinite(dismissedAt) && now - dismissedAt < FEEDBACK_NUDGE_COOLDOWN_MS) {
      return;
    }

    setHasPromptedFeedback(true);
    setFeedbackNudgeVisible(true);
  }, [shouldPromptFeedback]);

  useEffect(() => {
    if (freeTestModalOpen && feedbackOpen) {
      setFeedbackOpen(false);
    }
  }, [freeTestModalOpen, feedbackOpen]);

  useEffect(() => {
    if (!feedbackOpen) {
      return;
    }
    setFeedbackNudgeVisible(false);
  }, [feedbackOpen]);

  useEffect(() => {
    if (!feedbackOpen) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FEEDBACK_NUDGE_STORAGE_KEY, Date.now().toString());
    }
  }, [feedbackOpen]);

  useEffect(() => {
    if (hasAutoOpenedFreeTestModal || isLoadingProfile || !profile || subscriptionStatus !== 'success') {
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
  }, [hasAutoOpenedFreeTestModal, hasActiveSubscription, isLoadingProfile, profile, subscriptionStatus]);

  const handleFreeTestStart = useCallback(() => {
    router.push(sectionStartRoutes.writing);
  }, [router]);

  const handleFeedbackClose = useCallback(() => {
    setFeedbackOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FEEDBACK_NUDGE_STORAGE_KEY, Date.now().toString());
    }
    setFeedbackNudgeVisible(false);
  }, []);

  const handleFeedbackNudgeOpen = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FEEDBACK_NUDGE_STORAGE_KEY, Date.now().toString());
    }
    setFeedbackNudgeVisible(false);
    setFeedbackOpen(true);
    setHasPromptedFeedback(true);
  }, []);

  const handleFeedbackNudgeDismiss = useCallback(() => {
    setFeedbackNudgeVisible(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FEEDBACK_NUDGE_STORAGE_KEY, Date.now().toString());
    }
  }, []);

  const handleStartSection = useCallback(
    (section: PracticeSectionKey) => {
      router.push(sectionStartRoutes[section]);
    },
    [router]
  );

  const handleHistoryCta = useCallback(
    (section: PracticeSectionKey, id: number) => {
      if (section === 'writing') {
        router.push(`/practice/writing/feedback/${id}`);
        return;
      }

      if (section === 'speaking') {
        router.push(`/practice/speaking/feedback/${id}`);
        return;
      }

      router.push(`/practice/${section}/results/${id}`);
    },
    [router]
  );

  const handleLogout = useCallback(() => {
    logout();
    nProgress.start();
    router.push('/');
  }, [router]);

  const openSubscriptionModal = useCallback(() => {
    setSubscriptionModalOpen(true);
  }, []);

  const openProfileSettings = useCallback(() => {
    router.push(`/${locale}/profile/edit`);
  }, [locale, router]);

  const openLanguageModal = useCallback(() => {
    setLanguageModalOpen(true);
  }, []);

  const handleUpgradeClick = useCallback(() => {
    openPaywall();
  }, [openPaywall]);

  const basePaddingBottom = feedbackNudgeVisible ? '200rem' : '140rem';

  const statsContent = isLoadingProfile ? (
    <div className='flex flex-col gap-[16rem]'>
      <Skeleton className='h-[320rem] w-full rounded-[16rem]' />
      <Skeleton className='h-[220rem] w-full rounded-[16rem]' />
    </div>
  ) : (
    <div className='flex flex-col gap-[16rem]'>
      <BestResults />
      <IeltsGoal grade={profile?.target_grade || 9} />
    </div>
  );

  const practiceContent = (
    <div className='flex flex-col gap-[16rem]'>
      {!hasActiveSubscription && isSubscriptionReady ? (
        <div className='rounded-[16rem] border border-d-gray/60 bg-white p-[20rem] text-center shadow-[0_12rem_32rem_-28rem_rgba(56,56,56,0.32)]'>
          <p className='text-[13rem] text-d-black/75'>Unlock full access to guided practices and feedback.</p>
          <button
            type='button'
            onClick={handleUpgradeClick}
            className='mt-[12rem] flex h-[48rem] w-full items-center justify-center rounded-[40rem] bg-d-violet text-[14rem] font-semibold text-white transition-colors hover:bg-d-violet/80'
          >
            Upgrade plan
          </button>
        </div>
      ) : null}
      <PracticeBySections />
    </div>
  );

  const historyContent = (
    <PracticeHistory
      entries={practiceHistory || []}
      loading={isLoadingProfile || practiceHistoryLoading}
      onCta={handleHistoryCta}
      onStartSection={handleStartSection}
    />
  );

  const displayName = profile?.name?.trim() ?? '';
  const displayEmail = profile?.email?.trim() ?? '';

  const profileContent = isLoadingProfile ? (
    <div className='flex flex-col gap-[16rem]'>
      <Skeleton className='h-[140rem] w-full rounded-[16rem]' />
      <Skeleton className='h-[140rem] w-full rounded-[16rem]' />
      <Skeleton className='h-[220rem] w-full rounded-[16rem]' />
    </div>
  ) : (
    <div className='flex flex-col gap-[16rem]'>
      <section className='flex items-center gap-[16rem] rounded-[16rem] bg-white p-[20rem] shadow-[0_16rem_40rem_-32rem_rgba(56,56,56,0.32)]'>
        <Avatar className='size-[64rem] border border-d-gray/50 bg-d-light-gray'>
          <AvatarImage src={profile?.avatar ?? undefined} />
          <AvatarFallback className='text-[18rem] font-semibold text-d-black'>{(displayName || displayEmail || 'SB').slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-[4rem]'>
          <span className='text-[18rem] font-semibold text-d-black'>{displayName || 'Studybox learner'}</span>
          <span className='text-[13rem] text-d-black/70'>{displayEmail || '—'}</span>
        </div>
      </section>

      <section className='flex flex-col gap-[12rem] rounded-[16rem] bg-white p-[20rem] shadow-[0_16rem_40rem_-32rem_rgba(56,56,56,0.32)]'>
        {hasActiveSubscription ? (
          <button
            type='button'
            onClick={openSubscriptionModal}
            className='inline-flex items-center justify-center rounded-[32rem] bg-d-green px-[20rem] py-[12rem] text-[13rem] font-semibold text-d-black transition hover:bg-d-green/40'
          >
            Subscription active{planName ? ` • ${planName}` : ''}
          </button>
        ) : (
          <div className='flex flex-col gap-[12rem]'>
            <div className='text-[14rem] font-medium text-d-black'>Upgrade to unlock unlimited guided practice sessions.</div>
            <button
              type='button'
              onClick={handleUpgradeClick}
              className='flex h-[48rem] items-center justify-center rounded-[40rem] bg-d-violet text-[14rem] font-semibold text-white transition-colors hover:bg-d-violet/80'
            >
              Upgrade plan
            </button>
          </div>
        )}
      </section>

      <section className='flex flex-col gap-[8rem] rounded-[16rem] bg-white p-[8rem] shadow-[0_16rem_40rem_-32rem_rgba(56,56,56,0.32)]'>
        {[
          {
            key: 'subscription',
            label: 'Subscription & billing',
            action: openSubscriptionModal,
          },
          {
            key: 'settings',
            label: 'Profile settings',
            action: openProfileSettings,
          },
          {
            key: 'language',
            label: 'Change language',
            action: openLanguageModal,
          },
          {
            key: 'logout',
            label: 'Log out',
            action: handleLogout,
          },
        ].map(item => (
          <button
            key={item.key}
            type='button'
            onClick={item.action}
            className='flex w-full items-center justify-between rounded-[12rem] px-[20rem] py-[16rem] text-left text-[14rem] font-medium text-d-black transition hover:bg-d-light-gray/50'
          >
            <span>{item.label}</span>
            <svg className='size-[16rem]' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M6 4l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </button>
        ))}
      </section>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'practice':
        return practiceContent;
      case 'history':
        return historyContent;
      case 'profile':
        return profileContent;
      default:
        return statsContent;
    }
  };

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
    [refetchFeedbackStatus, submitFeedback]
  );

  if (!isMobile) {
    return null;
  }

  return (
    <div className='flex min-h-dvh flex-col bg-gradient-to-b from-white via-white to-slate-50'>
      <Header
        name={profile?.name ?? undefined}
        email={profile?.email ?? undefined}
        avatar={profile?.avatar ?? undefined}
        onOpenSubscription={openSubscriptionModal}
        onOpenProfileSettings={openProfileSettings}
        onOpenLanguage={openLanguageModal}
        onLogout={handleLogout}
      />

      <AnimatePresence mode='wait'>
        <motion.main
          key={activeTab}
          initial={{ x: transitionDirection === 0 ? 0 : transitionDirection > 0 ? 72 : -72, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: transitionDirection >= 0 ? -40 : 40, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className='flex-1 overflow-y-auto'
        >
          <div
            className='mx-auto flex w-full max-w-[520rem] flex-col gap-[16rem] px-[16rem] pt-[24rem]'
            style={{ paddingBottom: `calc(${basePaddingBottom} + env(safe-area-inset-bottom))` }}
          >
            {renderContent()}
          </div>
        </motion.main>
      </AnimatePresence>

      <AnimatePresence>{feedbackNudgeVisible ? <FeedbackNudgeBanner onOpen={handleFeedbackNudgeOpen} onDismiss={handleFeedbackNudgeDismiss} /> : null}</AnimatePresence>

      <nav className='fixed bottom-0 left-0 right-0 z-40 border-t border-d-light-gray/60 bg-white/95 backdrop-blur-md'>
        <div className='mx-auto flex max-w-[520rem] items-center justify-between gap-[8rem] px-[16rem] py-[12rem]' style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12rem)' }}>
          {MOBILE_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            const targetPath = localePath(tab.path);
            return (
              <Link
                key={tab.key}
                href={targetPath}
                className={cn(
                  'relative flex flex-1 flex-col items-center gap-[4rem] rounded-[20rem] px-[10rem] py-[8rem] text-[12rem] font-medium transition-colors',
                  isActive ? 'text-d-violet' : 'text-d-black/60 hover:text-d-black'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive ? (
                  <motion.span
                    layoutId='profile-bottom-nav-active'
                    className='absolute inset-0 -z-10 rounded-[20rem] bg-d-light-gray/70'
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                  />
                ) : null}
                <Icon className='size-[20rem]' />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

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

      <BottomSheet open={languageModalOpen} onOpenChange={setLanguageModalOpen}>
        <ChangeLangModal variant='mobile' />
      </BottomSheet>

      <SubscriptionDetailsModal open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} />
    </div>
  );
}
