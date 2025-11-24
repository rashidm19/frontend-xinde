import type { PracticeSpeakingPartValue } from '@/types/PracticeSpeaking';

export type PracticeFlow = 'reading' | 'writing' | 'listening' | 'speaking';

interface PracticeSessionPayload {
  flow: PracticeFlow;
  practiceId: string | number;
  part?: PracticeSpeakingPartValue;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;
const DEFAULT_ERROR = 'Unable to update practice session cookie';

async function ensureOk(response: Response, fallbackMessage: string) {
  if (response.ok) {
    return;
  }

  try {
    const data = await response.json();
    const message = typeof data?.error === 'string' ? data.error : fallbackMessage;
    throw new Error(message);
  } catch (error) {
    if (error instanceof Error && error.message !== fallbackMessage) {
      throw error;
    }
    throw new Error(fallbackMessage);
  }
}

export async function setPracticeSessionCookie(payload: PracticeSessionPayload) {
  const response = await fetch('/api/practice/session', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ ...payload, practiceId: String(payload.practiceId) }),
  });

  await ensureOk(response, DEFAULT_ERROR);
}

export async function clearPracticeSessionCookie(flow: PracticeFlow) {
  const response = await fetch(`/api/practice/session?flow=${flow}`, {
    method: 'DELETE',
  });

  await ensureOk(response, DEFAULT_ERROR);
}
