'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { type FreePracticeTestModalPayload, isModalNotAvailableError, isModalNotTrackedError, postModalEvent } from '@/api/uiModals';
import { ACTIVE_MODALS_QUERY_KEY, useActiveModals } from '@/hooks/useActiveModals';
import { useFeedbackStatus } from '@/hooks/useFeedbackStatus';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { FreePracticeTestModal } from '@/components/modals/FreePracticeTestModal';
import type { FeedbackModalSubmitPayload, FeedbackModalSubmitResult } from '@/components/feedback/types';
import { type UiModalInstance, useUiModalStore } from '@/stores/uiModalStore';
import type { SubmitFeedbackPayload } from '@/api/feedback';
import { hasSeenModal, markModalAsSeen } from '@/utils/modalSessionLatch';

const DEFAULT_START_ROUTE = '/practice/writing/customize';

const shouldEnableForPath = (pathname: string | null): boolean => {
  if (!pathname) {
    return false;
  }

  const normalized = pathname.toLowerCase();
  return normalized.includes('/profile') || normalized.includes('/m/stats') || normalized.includes('/m/profile');
};

export function UiModalManager() {
  const pathname = usePathname();
  const enabled = shouldEnableForPath(pathname);
  const { data: activeModals, refetch } = useActiveModals({ enabled });
  const queryClient = useQueryClient();
  const currentModal = useUiModalStore(state => state.current);
  const setFromServer = useUiModalStore(state => state.setFromServer);
  const removeModal = useUiModalStore(state => state.removeModal);
  const clear = useUiModalStore(state => state.clear);

  const viewedModalIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      clear();
      viewedModalIdsRef.current.clear();
      queryClient.removeQueries({ queryKey: ACTIVE_MODALS_QUERY_KEY });
      return;
    }

    if (activeModals) {
      setFromServer(activeModals);
    }
  }, [activeModals, clear, enabled, queryClient, setFromServer]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!currentModal) {
      return;
    }
    if (hasSeenModal(currentModal.key, currentModal.version)) {
      removeModal(currentModal.id);
      if (enabled) {
        void refetch();
      }
      return;
    }

    markModalAsSeen(currentModal.key, currentModal.version);

    if (viewedModalIdsRef.current.has(currentModal.id)) {
      return;
    }

    viewedModalIdsRef.current.add(currentModal.id);

    let cancelled = false;

    postModalEvent('view', { key: currentModal.key }).catch(error => {
      if (cancelled) {
        return;
      }

      if (isModalNotAvailableError(error) || isModalNotTrackedError(error)) {
        viewedModalIdsRef.current.delete(currentModal.id);
        removeModal(currentModal.id);
        void refetch();
        return;
      }

      console.warn('[UiModalManager] Failed to report modal view', error);
      viewedModalIdsRef.current.delete(currentModal.id);
      void refetch();
    });

    return () => {
      cancelled = true;
    };
  }, [currentModal, enabled, refetch, removeModal]);

  const dismissModal = useCallback(
    async (modal: UiModalInstance) => {
      try {
        await postModalEvent('dismiss', { key: modal.key });
      } catch (error) {
        if (!(isModalNotAvailableError(error) || isModalNotTrackedError(error))) {
          console.warn('[UiModalManager] Failed to report modal dismissal', error);
        }
      } finally {
        viewedModalIdsRef.current.delete(modal.id);
        removeModal(modal.id);
        if (enabled) {
          void refetch();
        }
      }
    },
    [enabled, refetch, removeModal]
  );

  const completeModal = useCallback(
    async (modal: UiModalInstance) => {
      try {
        await postModalEvent('complete', { key: modal.key });
      } catch (error) {
        if (!(isModalNotAvailableError(error) || isModalNotTrackedError(error))) {
          console.warn('[UiModalManager] Failed to report modal completion', error);
        }
      } finally {
        viewedModalIdsRef.current.delete(modal.id);
        removeModal(modal.id);
        if (enabled) {
          void refetch();
        }
      }
    },
    [enabled, refetch, removeModal]
  );

  const renderedModal = useMemo(() => {
    if (!currentModal) {
      return null;
    }

    if (currentModal.key === 'FREE_PRACTICE_TEST_MODAL') {
      const modal = currentModal as UiModalInstance<'FREE_PRACTICE_TEST_MODAL'>;
      return <ManagedFreePracticeTestModal key={modal.id} modal={modal} onDismiss={dismissModal} onComplete={completeModal} />;
    }

    if (currentModal.key === 'FEEDBACK_MODAL') {
      const modal = currentModal as UiModalInstance<'FEEDBACK_MODAL'>;
      return <ManagedFeedbackModal key={modal.id} modal={modal} onDismiss={dismissModal} onComplete={completeModal} />;
    }

    return null;
  }, [completeModal, currentModal, dismissModal]);

  return renderedModal;
}

interface ManagedFreePracticeTestModalProps {
  modal: UiModalInstance<'FREE_PRACTICE_TEST_MODAL'>;
  onDismiss: (modal: UiModalInstance<'FREE_PRACTICE_TEST_MODAL'>) => void | Promise<void>;
  onComplete: (modal: UiModalInstance<'FREE_PRACTICE_TEST_MODAL'>) => void | Promise<void>;
}

const ManagedFreePracticeTestModal = ({ modal, onDismiss, onComplete }: ManagedFreePracticeTestModalProps) => {
  const router = useRouter();
  const hasHandledCloseRef = useRef(false);

  const payload: FreePracticeTestModalPayload = {
    ...modal.payload,
  };

  const startRoute = payload.startPracticeRoute ?? DEFAULT_START_ROUTE;

  const handleStart = useCallback(async () => {
    hasHandledCloseRef.current = true;
    router.push(startRoute);
    await onComplete(modal);
  }, [modal, onComplete, router, startRoute]);

  const handleDismiss = useCallback(() => {
    if (hasHandledCloseRef.current) {
      return;
    }
    hasHandledCloseRef.current = true;
    void onDismiss(modal);
  }, [modal, onDismiss]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        handleDismiss();
        return;
      }
      hasHandledCloseRef.current = false;
    },
    [handleDismiss]
  );

  return <FreePracticeTestModal open onOpenChange={handleOpenChange} onStart={handleStart} onDismiss={handleDismiss} hasFreeTest={payload.hasFreeTest ?? true} />;
};

interface ManagedFeedbackModalProps {
  modal: UiModalInstance<'FEEDBACK_MODAL'>;
  onDismiss: (modal: UiModalInstance<'FEEDBACK_MODAL'>) => void | Promise<void>;
  onComplete: (modal: UiModalInstance<'FEEDBACK_MODAL'>) => void | Promise<void>;
}

const ManagedFeedbackModal = ({ modal, onDismiss, onComplete }: ManagedFeedbackModalProps) => {
  const { submitFeedback } = useFeedbackStatus({ enabled: false });
  const hasCompletedRef = useRef(false);

  const handleClose = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }
    void onDismiss(modal);
  }, [modal, onDismiss]);

  const handleSubmit = useCallback(
    async (payload: FeedbackModalSubmitPayload): Promise<FeedbackModalSubmitResult> => {
      if (payload.rating === null) {
        return { ok: false, error: 'Please rate your experience before submitting.' };
      }

      const trimmedOther = payload.otherText.trim();
      const trimmedComment = payload.comment.trim();

      if (payload.highlights.includes('other') && trimmedOther.length === 0) {
        return { ok: false, error: 'Please add a short note for “Other”.' };
      }

      const submitPayload: SubmitFeedbackPayload = {
        rating: payload.rating,
        highlights: payload.highlights,
      };

      if (payload.highlights.includes('other')) {
        submitPayload.otherHighlight = trimmedOther;
      }

      if (trimmedComment.length > 0) {
        submitPayload.comment = trimmedComment.slice(0, 2000);
      }

      return submitFeedback(submitPayload);
    },
    [submitFeedback]
  );

  const handleSuccess = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }
    hasCompletedRef.current = true;
    void onComplete(modal);
  }, [modal, onComplete]);

  return <FeedbackModal open onClose={handleClose} onSubmit={handleSubmit} onSuccess={handleSuccess} />;
};

export default UiModalManager;
