'use client';

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { GET_practice_writing_feedback_id } from '@/api/GET_practice_writing_feedback_id';
import axiosInstance from '@/lib/axiosInstance';
import { buildWritingFeedbackV2 } from '@/lib/writing-feedback-v2';
import type { PracticeWritingPassed, WritingFeedbackResponse } from '@/types/WritingFeedback';
import { StateContainer } from '@/components/feedback/StateContainer';

import { WritingFeedbackLayoutV2 } from './_components/writing-feedback-layout-v2';
import { WritingFeedbackV2Skeleton } from './_components/writing-feedback-v2-skeleton';

type FeedbackQueryError = Error & { status?: number };

export default function Page({ params }: { params: { id: string } }) {
  const {
    data: passedData,
    status: passedStatus,
    error: passedError,
    refetch: refetchPassed,
  } = useQuery<PracticeWritingPassed, FeedbackQueryError>({
    queryKey: ['practice-writing-feedbacks'],
    queryFn: async () => {
      const response = await axiosInstance.get('/practice/writing/passed');
      return response.data as PracticeWritingPassed;
    },
    enabled: Boolean(params.id),
    retry: false,
    refetchInterval: query => {
      const found = query?.state.data?.data.find(item => String(item.id) === params.id);
      return found?.feedback_ready ? false : 3000;
    },
  });

  const isFeedbackReady = passedData?.data.some(item => String(item.id) === params.id && item.feedback_ready) ?? false;

  const {
    data: feedbackData,
    status: feedbackStatus,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useQuery<WritingFeedbackResponse, FeedbackQueryError>({
    queryKey: ['practice-writing-feedback-v2', params.id],
    queryFn: () => GET_practice_writing_feedback_id(params.id),
    retry: false,
    enabled: isFeedbackReady,
  });

  const normalized = useMemo(() => (feedbackData ? buildWritingFeedbackV2(feedbackData) : null), [feedbackData]);

  if (passedStatus === 'error') {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='error'
        title='We could not confirm your writing attempt.'
        description={passedError?.message ?? 'Please retry loading this page.'}
        actionLabel='Try again'
        onAction={refetchPassed}
      />
    );
  }

  if (!isFeedbackReady) {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='info'
        title='Evaluating your response'
        description='We will notify you as soon as your writing band score is ready.'
        section='writing'
      />
    );
  }

  if (feedbackStatus === 'error') {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='error'
        title='We were unable to load your feedback.'
        description={feedbackError?.message ?? 'Please check your connection and try again.'}
        actionLabel='Try again'
        onAction={refetchFeedback}
      />
    );
  }

  if (feedbackStatus === 'pending' || !feedbackData) {
    return <WritingFeedbackV2Skeleton />;
  }

  if (!normalized) {
    return (
      <StateContainer
        color='bg-d-blue-secondary'
        tone='info'
        title='Feedback is not ready yet'
        description='Your writing responses are still being evaluated. Please give it a little more time.'
        section='writing'
      />
    );
  }

  return <WritingFeedbackLayoutV2 data={normalized} />;
}
