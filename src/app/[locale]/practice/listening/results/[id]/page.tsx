'use client';

import { useQuery } from '@tanstack/react-query';

import { GET_practice_listening_results_id } from '@/api/GET_practice_listening_results_id';
import type { PracticeListeningResult } from '@/types/PracticeListening';

import {
  ListeningAnswerSheet,
  ListeningAnswerSheetError,
  ListeningAnswerSheetSkeleton,
} from './_components/listening-answer-sheet';

export default function Page({ params }: { params: { id: string; locale: string } }) {
  const {
    data,
    status,
    refetch,
  } = useQuery<PracticeListeningResult, Error>({
    queryKey: ['practice-listening-results', params.id],
    queryFn: () => GET_practice_listening_results_id(params.id),
    retry: false,
  });

  if (status === 'pending') {
    return <ListeningAnswerSheetSkeleton />;
  }

  if (status === 'error') {
    return <ListeningAnswerSheetError onRetry={() => refetch()} />;
  }

  if (!data) {
    return <ListeningAnswerSheetError onRetry={() => refetch()} />;
  }

  return <ListeningAnswerSheet data={data} locale={params.locale} />;
}
