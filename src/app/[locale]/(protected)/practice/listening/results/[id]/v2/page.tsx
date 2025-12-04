'use client';

import { useQuery } from '@tanstack/react-query';

import { GET_practice_listening_results_id_v2 } from '@/api/GET_practice_listening_results_id_v2';
import type { PracticeListeningResultV2 } from '@/types/PracticeListeningResultV2';

import { ListeningAnswerSheetV2, ListeningAnswerSheetV2Error, ListeningAnswerSheetV2Skeleton } from './_components/listening-answer-sheet-v2';

export default function Page({ params }: { params: { id: string; locale: string } }) {
  const query = useQuery<PracticeListeningResultV2, Error>({
    queryKey: ['practice-listening-results-v2', params.id],
    queryFn: () => GET_practice_listening_results_id_v2(params.id),
    retry: false,
  });

  const { data, status } = query;

  const handleRetry = () => {
    void query.refetch();
  };

  if (status === 'pending') {
    return <ListeningAnswerSheetV2Skeleton />;
  }

  if (status === 'error') {
    return <ListeningAnswerSheetV2Error onRetry={handleRetry} />;
  }

  if (!data) {
    return <ListeningAnswerSheetV2Error onRetry={handleRetry} />;
  }

  return <ListeningAnswerSheetV2 data={data} locale={params.locale} />;
}
