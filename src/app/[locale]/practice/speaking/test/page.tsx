'use client';

import { GET_practice_speaking_id } from '@/api/GET_practice_speaking_id';
import { POST_practice_speaking_id_begin } from '@/api/POST_practice_speaking_id_begin';
import { PracticeLeaveGuard } from '@/components/PracticeLeaveGuard';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useRouter } from 'next/navigation';

const SpeakingTestForm = dynamic(() => import('./_components/SpeakingTestForm').then(mod => mod.default), { ssr: false });

export default function Page() {
  const router = useRouter();
  const { tActions } = useCustomTranslations();

  const { data, status } = useQuery({
    queryKey: ['practice-speaking'],
    queryFn: GET_practice_speaking_id,
  });

  useEffect(() => {
    POST_practice_speaking_id_begin().then(() => null);
  }, []);

  return (
    <PracticeLeaveGuard>
      <WritingFeedbackHeader topBarElevated title={'Practice Speaking'} exitLabel={tActions('exit')} onExit={() => router.push('/profile')} />

      {status === 'success' && <SpeakingTestForm data={data} />}
    </PracticeLeaveGuard>
  );
}
