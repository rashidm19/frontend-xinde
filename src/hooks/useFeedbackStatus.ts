import { useCallback, useEffect, useState } from 'react';

import { GET_feedback_status, POST_feedback } from '@/api/feedback';
import type { FeedbackHighlightKey, SubmitFeedbackPayload } from '@/api/feedback';

interface FeedbackState {
  isLoading: boolean;
  error: string | null;
  hasSubmitted: boolean;
  submittedAt: string | null;
  rating: number | null;
  highlights: FeedbackHighlightKey[];
  comment: string | null;
  otherHighlight: string | null;
}

interface UseFeedbackStatusOptions {
  enabled?: boolean;
}

const INITIAL_STATE: FeedbackState = {
  isLoading: false,
  error: null,
  hasSubmitted: false,
  submittedAt: null,
  rating: null,
  highlights: [],
  comment: null,
  otherHighlight: null,
};

export function useFeedbackStatus({ enabled = true }: UseFeedbackStatusOptions = {}) {
  const [state, setState] = useState<FeedbackState>(INITIAL_STATE);

  const fetchStatus = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await GET_feedback_status();
      setState({
        isLoading: false,
        error: null,
        hasSubmitted: response.hasSubmitted,
        submittedAt: response.submittedAt ?? null,
        rating: response.rating ?? null,
        highlights: response.highlights ?? [],
        comment: response.comment ?? null,
        otherHighlight: response.otherHighlight ?? null,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch feedback status' }));
    }
  }, [enabled]);

  const submitFeedback = useCallback(async (payload: SubmitFeedbackPayload) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await POST_feedback(payload);
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasSubmitted: true,
        submittedAt: response.submittedAt ?? new Date().toISOString(),
        rating: payload.rating ?? null,
        highlights: payload.highlights ?? [],
        comment: payload.comment ?? null,
        otherHighlight: payload.otherHighlight ?? null,
      }));
      return { ok: true as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not submit feedback';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return { ok: false as const, error: message };
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    ...state,
    refetch: fetchStatus,
    submitFeedback,
  };
}
