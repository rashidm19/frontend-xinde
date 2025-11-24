import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import WritingTestClient from './WritingTestClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  const practiceId = cookies().get('practiceWritingId')?.value;

  if (!practiceId) {
    redirect('/practice/writing/customize');
  }

  return <WritingTestClient practiceId={practiceId} />;
}
