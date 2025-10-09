'use client';

import { useQuery } from '@tanstack/react-query';

import { GET_practice_reading_results_id } from '@/api/GET_practice_reading_results_id';
import type { PracticeReadingResult } from '@/types/PracticeReading';

import {
  ReadingAnswerSheet,
  ReadingAnswerSheetError,
  ReadingAnswerSheetSkeleton,
} from './_components/reading-answer-sheet';

export default function Page({ params }: { params: { id: string; locale: string } }) {
  const query = useQuery<PracticeReadingResult, Error>({
    queryKey: ['practice-reading-results', params.id],
    queryFn: () => GET_practice_reading_results_id(params.id),
    retry: false,
  });

  const { data, status } = query;

  const handleRetry = () => {
    void query.refetch();
  };

  if (status === 'pending') {
    return <ReadingAnswerSheetSkeleton />;
  }

  if (status === 'error') {
    return <ReadingAnswerSheetError onRetry={handleRetry} />;
  }

  if (!data) {
    return <ReadingAnswerSheetError onRetry={handleRetry} />;
  }

  return <ReadingAnswerSheet data={data} locale={params.locale} />;
}
