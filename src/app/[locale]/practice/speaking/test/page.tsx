'use client';

import { GET_practice_speaking_id } from '@/api/GET_practice_speaking_id';
import { HeaderDuringTest } from '@/components/HeaderDuringTest';
import { POST_practice_speaking_id_begin } from '@/api/POST_practice_speaking_id_begin';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const SpeakingTestForm = dynamic(() => import('./_components/SpeakingTestForm').then(mod => mod.default), { ssr: false });

export default function Page() {
  const { data, status } = useQuery({
    queryKey: ['practice-speaking'],
    queryFn: GET_practice_speaking_id,
  });

  useEffect(() => {
    POST_practice_speaking_id_begin().then(() => null);
  }, []);

  return (
    <>
      <HeaderDuringTest title='Practice' tag='Speaking' />
      {status === 'success' && <SpeakingTestForm data={data} />}
    </>
  );
}
