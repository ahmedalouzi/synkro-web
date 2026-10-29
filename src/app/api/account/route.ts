import { NextResponse } from 'next/server';
import { ApiError, getAccount } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const account = await getAccount();
    if (!account) return NextResponse.json({ message: 'Signed out' }, { status: 401 });
    return NextResponse.json(account);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Could not load your account.' }, { status });
  }
}
