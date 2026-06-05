'use client';

import { GET_practice_speaking_id } from '@/api/GET_practice_speaking_id';
import { POST_practice_speaking_id_begin } from '@/api/POST_practice_speaking_id_begin';
import { PracticeLeaveGuard } from '@/components/PracticeLeaveGuard';
import { WritingFeedbackHeader } from '@/components/practice/WritingFeedbackHeader';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import type { PracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

const SpeakingTestForm = dynamic(() => import('./_components/SpeakingTestForm').then(mod => mod.default), { ssr: false });

type SpeakingTestClientProps = {
  practiceId: string;
  practicePart?: PracticeSpeakingPartValue | null;
};

export default function SpeakingTestClient({ practiceId, practicePart }: SpeakingTestClientProps) {
  const router = useRouter();
  const { tActions } = useCustomTranslations();
  const partParam = practicePart ?? undefined;
  const [attemptId, setAttemptId] = React.useState<string | null>(null);

  const { data, status } = useQuery({
    queryKey: ['practice-speaking', practiceId, partParam],
    queryFn: () => GET_practice_speaking_id(practiceId, partParam),
  });

  React.useEffect(() => {
    let mounted = true;

    POST_practice_speaking_id_begin(practiceId, partParam)
      .then(response => {
        if (!mounted) {
          return;
        }

        if (response?.id != null) {
          setAttemptId(String(response.id));
        } else {
          setAttemptId(null);
        }
      })
      .catch(error => {
        console.error('[speaking] failed to begin practice attempt', error);
        if (mounted) {
          setAttemptId(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [practiceId, partParam]);

  return (
    <PracticeLeaveGuard>
      <div className='hidden tablet:block'>
        <WritingFeedbackHeader title={'Practice Speaking'} exitLabel={tActions('exit')} onExit={() => router.push('/dashboard')} showFullscreen />
      </div>

      {status === 'success' ? (
        <SpeakingTestForm
          data={data}
          practicePart={partParam}
          practiceAttemptId={attemptId}
          exitLabel={tActions('exit')}
          onExit={() => router.push('/dashboard')}
        />
      ) : null}
    </PracticeLeaveGuard>
  );
}
