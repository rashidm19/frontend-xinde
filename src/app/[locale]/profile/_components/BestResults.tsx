'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { BestSectionsResults } from './BestSectionsResults';
import { ApproximateIELTSScore } from './ApproximateIELTSScore';
import { getPracticeScoresStats } from '@/api/GET_stats_practice_scores';
import { calculateIeltsOverall } from '@/lib/utils';

export const BestResults = () => {
  const { data: practiceStats, isLoading: practiceStatsLoading } = useQuery({
    queryKey: ['bestPracticeScores'],
    queryFn: getPracticeScoresStats,
  });

  const overallScore = React.useMemo(() => {
    if (!practiceStats) {
      return 0;
    }

    return calculateIeltsOverall(
      practiceStats.best_listening_score ?? 0,
      practiceStats.best_reading_score ?? 0,
      practiceStats.best_writing_score ?? 0,
      practiceStats.best_speaking_score ?? 0
    );
  }, [practiceStats]);

  return (
    <section>
      <div className='rounded-[16rem] bg-white p-[20rem] tablet:p-[24rem]'>
        <div className='flex flex-col gap-[24rem] tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-[24rem]'>
          <BestSectionsResults stats={practiceStats} loading={practiceStatsLoading} />
          <ApproximateIELTSScore score={overallScore} loading={practiceStatsLoading} />
        </div>
      </div>
    </section>
  );
};
