'use client';

import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { MissingDataFallback } from '@/components/MissingDataFallback';
import dynamic from 'next/dynamic';
import { mockStore } from '@/stores/mock';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SpeakingTestForm = dynamic(() => import('../../../../practice/speaking/test/_components/SpeakingTestForm').then(mod => mod.default), { ssr: false });

export default function Page() {
  const router = useRouter();
  const { mockData, setTimer } = mockStore();
  const data = mockData?.speaking?.part_1;

  useEffect(() => {
    if (!data) {
      void router.replace('/mock');
      return;
    }
    setTimer(840000);
  }, [data, router, setTimer]);

  if (!data) {
    return (
      <MissingDataFallback
        title='Speaking section is unavailable'
        description='We could not find the speaking mock data. Please return to the mock dashboard and try again.'
        actionLabel='Back to mock exams'
        onAction={() => void router.replace('/mock')}
      />
    );
  }

  return (
    <>
      <HeaderDuringTest title='Mock exam' tag='Speaking' />
      <SpeakingTestForm data={data} />
    </>
  );
}
