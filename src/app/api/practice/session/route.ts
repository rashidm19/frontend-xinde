import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { SPEAKING_PART_VALUES } from '@/types/PracticeSpeaking';
import type { PracticeFlow } from '@/lib/practiceSession';

const practiceFlowSchema = z.enum(['reading', 'writing', 'listening', 'speaking']);

const speakingPartSchema = z.enum(SPEAKING_PART_VALUES);

const sessionPayloadSchema = z
  .object({
    flow: practiceFlowSchema,
    practiceId: z.union([z.string(), z.number()]).transform(value => String(value)),
    part: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.flow === 'speaking') {
      if (!value.part || !speakingPartSchema.safeParse(value.part).success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Speaking practice requires a valid part value', path: ['part'] });
      }
      return;
    }

    if (value.part != null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Part is only supported for speaking practice', path: ['part'] });
    }
  });

type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const COOKIE_NAMES: Record<PracticeFlow, string[]> = {
  reading: ['practiceReadingId'],
  writing: ['practiceWritingId'],
  listening: ['practiceListeningId'],
  speaking: ['practiceSpeakingId', 'practiceSpeakingPart'],
};

const COOKIE_MAX_AGE = 60 * 60 * 2; // 2 hours
const BASE_COOKIE_CONFIG = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function setPracticeCookies(payload: SessionPayload) {
  const store = cookies();
  const [primaryName, secondaryName] = COOKIE_NAMES[payload.flow];

  store.set(primaryName, payload.practiceId, { ...BASE_COOKIE_CONFIG, maxAge: COOKIE_MAX_AGE });

  if (payload.flow === 'speaking' && secondaryName && payload.part) {
    store.set(secondaryName, payload.part, { ...BASE_COOKIE_CONFIG, maxAge: COOKIE_MAX_AGE });
  }
}

function deletePracticeCookies(flow: PracticeFlow) {
  const store = cookies();
  const names = COOKIE_NAMES[flow] ?? [];
  names.forEach(name => {
    store.delete(name);
  });
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const result = sessionPayloadSchema.safeParse(raw);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid practice session payload' }, { status: 400 });
    }

    setPracticeCookies(result.data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to persist practice session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flowParam = searchParams.get('flow');
  const result = practiceFlowSchema.safeParse(flowParam);

  if (!result.success) {
    return NextResponse.json({ error: 'Unknown practice flow' }, { status: 400 });
  }

  deletePracticeCookies(result.data);

  return NextResponse.json({ ok: true });
}
