import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import ListeningTestClient from './ListeningTestClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  const practiceId = cookies().get('practiceListeningId')?.value;

  if (!practiceId) {
    redirect('/practice/listening/rules');
  }

  return <ListeningTestClient practiceId={practiceId} />;
}
