import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import ReadingTestClient from './ReadingTestClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  const practiceId = cookies().get('practiceReadingId')?.value;

  if (!practiceId) {
    redirect('/practice/reading/rules');
  }

  return <ReadingTestClient practiceId={practiceId} />;
}
