import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import SpeakingTestClient from './SpeakingTestClient';
import { isPracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

export const dynamic = 'force-dynamic';

export default function Page() {
  const cookieStore = cookies();
  const practiceId = cookieStore.get('practiceSpeakingId')?.value;
  const partCookie = cookieStore.get('practiceSpeakingPart')?.value;
  const practicePart = partCookie && isPracticeSpeakingPartValue(partCookie) ? partCookie : null;

  if (!practiceId) {
    redirect('/practice/speaking/customize');
  }

  return <SpeakingTestClient practiceId={practiceId} practicePart={practicePart} />;
}
