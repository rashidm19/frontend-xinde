'use client';

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { GET_practice_speaking_feedback_id } from '@/api/GET_practice_speaking_feedback_id';
import { StateContainer } from '@/components/feedback/StateContainer';
import axiosInstance from '@/lib/axiosInstance';
import { buildSpeakingFeedback } from '@/lib/speaking-feedback';
import type { ISpeakingPracticeFeedback, PracticeSpeakingPassed } from '@/types/SpeakingFeedback';

import { SpeakingFeedbackLayout } from './_components/speaking-feedback-layout';
import { SpeakingFeedbackSkeleton } from './_components/speaking-feedback-skeleton';

type SpeakingFeedbackError = Error & { status?: number };

export default function Page({ params }: { params: { id: string } }) {
  const {
    data: passedData,
    status: passedStatus,
    error: passedError,
    refetch: refetchPassed,
  } = useQuery<PracticeSpeakingPassed, SpeakingFeedbackError>({
    queryKey: ['practice-speaking-feedbacks'],
    queryFn: async () => {
      const response = await axiosInstance.get('/practice/speaking/passed');
      return response.data as PracticeSpeakingPassed;
    },
    refetchInterval: query => {
      const found = query?.state.data?.data.find(item => String(item.id) === params.id);
      return found?.feedback_ready ? false : 3000;
    },
    retry: false,
    enabled: Boolean(params.id),
  });

  const isFeedbackReady = passedData?.data.some(item => String(item.id) === params.id && item.feedback_ready) ?? false;

  const {
    data: feedbackData,
    status: feedbackStatus,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useQuery<ISpeakingPracticeFeedback, SpeakingFeedbackError>({
    queryKey: ['practice-speaking-feedback', params.id],
    queryFn: () => GET_practice_speaking_feedback_id(params.id),
    retry: false,
    enabled: isFeedbackReady,
  });

  const normalized = useMemo(() => (feedbackData ? buildSpeakingFeedback(feedbackData) : null), [feedbackData]);

  if (passedStatus === 'error') {
    return (
      <StateContainer
        tone='error'
        color='bg-d-red-secondary'
        title='We could not confirm your speaking attempt.'
        description={passedError?.message ?? 'Please retry loading this page.'}
        actionLabel='Try again'
        onAction={refetchPassed}
      />
    );
  }

  if (!isFeedbackReady) {
    return (
      <StateContainer
        color='bg-d-red-secondary'
        tone='info'
        title='Evaluating your answer'
        description='We will notify you as soon as your speaking band score is ready.'
        section='speaking'
      />
    );
  }

  if (feedbackStatus === 'error') {
    return (
      <StateContainer
        color='bg-d-red-secondary'
        tone='error'
        title='We were unable to load your feedback.'
        description={feedbackError?.message ?? 'Please check your connection and try again.'}
        actionLabel='Try again'
        onAction={refetchFeedback}
      />
    );
  }

  if (feedbackStatus === 'pending') {
    return <SpeakingFeedbackSkeleton />;
  }

  if (!feedbackData || feedbackData.parts.length === 0 || !normalized) {
    return (
      <StateContainer
        color='bg-d-red-secondary'
        tone='info'
        title='Feedback is not ready yet'
        description='Your speaking responses are still being evaluated. Please give it a little more time.'
        section='speaking'
      />
    );
  }

  return <SpeakingFeedbackLayout data={normalized} />;
}
