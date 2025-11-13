import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE_NAME = 'token';
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  let token: unknown;

  try {
    const body = await request.json();
    token = body?.token;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (typeof token !== 'string' || token.trim().length === 0) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
