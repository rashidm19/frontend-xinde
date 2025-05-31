'use client';

import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import dynamic from 'next/dynamic';
import { mockStore } from '@/stores/mock';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SpeakingTestForm = dynamic(() => import('../../../../practice/speaking/test/_components/SpeakingTestForm').then(mod => mod.default), { ssr: false });

export default function Page() {
  const router = useRouter();
  const { mockData, setTimer } = mockStore();
  const data = mockData?.speaking?.part_1;

  if (!data) {
    return router.push('/mock');
  }

  useEffect(() => {
    setTimer(840000);
  }, []);

  return (
    <>
      <HeaderDuringTest title='Mock exam' tag='Speaking' />
      <SpeakingTestForm data={data} />
    </>
  );
}
