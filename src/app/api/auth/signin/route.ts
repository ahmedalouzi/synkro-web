import { NextResponse } from 'next/server';
import { ApiError, signIn } from '@/lib/session';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const mode = body?.mode === 'signup' ? 'signup' : 'signin';

  if (!email || !email.includes('@')) return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ message: 'Passwords have at least 8 characters.' }, { status: 400 });

  try {
    await signIn(email, password, mode);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Sign-in failed.';
    return NextResponse.json({ message }, { status: status === 401 ? 401 : status });
  }
}
