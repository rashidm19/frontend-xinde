'use client';

import { useQuery } from '@tanstack/react-query';

import { GET_practice_reading_results_id_v2 } from '@/api/GET_practice_reading_results_id_v2';
import type { PracticeReadingResultV2 } from '@/types/PracticeReadingResultV2';

import { ReadingAnswerSheetV2, ReadingAnswerSheetV2Error, ReadingAnswerSheetV2Skeleton } from './_components/reading-answer-sheet-v2';

export default function Page({ params }: { params: { id: string; locale: string } }) {
  const query = useQuery<PracticeReadingResultV2, Error>({
    queryKey: ['practice-reading-results-v2', params.id],
    queryFn: () => GET_practice_reading_results_id_v2(params.id),
    retry: false,
  });

  const { data, status } = query;

  const handleRetry = () => {
    void query.refetch();
  };

  if (status === 'pending') {
    return <ReadingAnswerSheetV2Skeleton />;
  }

  if (status === 'error') {
    return <ReadingAnswerSheetV2Error onRetry={handleRetry} />;
  }

  if (!data) {
    return <ReadingAnswerSheetV2Error onRetry={handleRetry} />;
  }

  return <ReadingAnswerSheetV2 data={data} locale={params.locale} />;
}
