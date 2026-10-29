import { cookies } from 'next/headers';

/**
 * Talks to the Synkro server from the site's server side, so the session tokens live in
 * httpOnly cookies the browser's JavaScript can never read, and the API needs no CORS.
 */

const API = (process.env.SYNKRO_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
const SESSION_COOKIE = 'synkro_session';
const REFRESH_COOKIE = 'synkro_refresh';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface Account {
  email: string;
  tier?: string;
  plan?: string;
  weeklyPoolUsd?: number;
  weeklyUsedUsd?: number;
  weekResetsAt?: string;
  monthlyCompletions?: number | null;
  completionsUsed?: number;
  completionsResetAt?: string;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function call(path: string, init: RequestInit & { token?: string } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers, cache: 'no-store' });
  } catch {
    throw new ApiError('The Synkro server is not reachable right now. Try again in a moment.', 503);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.message || `Request failed (${res.status})`, res.status);
  return body;
}

function setSession(tokens: { sessionToken: string; refreshToken?: string }) {
  const jar = cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: MAX_AGE };
  jar.set(SESSION_COOKIE, tokens.sessionToken, options);
  if (tokens.refreshToken) jar.set(REFRESH_COOKIE, tokens.refreshToken, options);
}

export function clearSession() {
  const jar = cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function signIn(email: string, password: string, mode: 'signin' | 'signup') {
  const session = await call(mode === 'signin' ? '/v1/auth/signin' : '/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!session?.sessionToken) throw new ApiError('The server did not return a session.', 502);
  setSession(session);
}

export async function signOut() {
  const jar = cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await call('/v1/auth/logout', {
      method: 'POST',
      token,
      body: JSON.stringify({ refreshToken: jar.get(REFRESH_COOKIE)?.value }),
    }).catch(() => undefined);
  }
  clearSession();
}

/** The signed-in account, refreshing an expired session once. Null when signed out. */
export async function getAccount(): Promise<Account | null> {
  const jar = cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await call('/v1/account/status', { token });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;
  }
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    clearSession();
    return null;
  }
  try {
    const refreshed = await call('/v1/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) });
    setSession(refreshed);
    return await call('/v1/account/status', { token: refreshed.sessionToken });
  } catch {
    clearSession();
    return null;
  }
}
