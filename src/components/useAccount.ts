'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Account } from '@/lib/session';

export type AccountState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'error'; message: string }
  | { status: 'signed-in'; account: Account };

/** Loads the signed-in account through the site's own API (session cookies stay httpOnly). */
export function useAccount() {
  const [state, setState] = useState<AccountState>({ status: 'loading' });

  const reload = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/account', { cache: 'no-store' });
      if (res.status === 401) return setState({ status: 'signed-out' });
      const body = await res.json();
      if (!res.ok) return setState({ status: 'error', message: body?.message || 'Could not load your account.' });
      setState({ status: 'signed-in', account: body });
    } catch {
      setState({ status: 'error', message: 'Could not reach Synkro. Check your connection and try again.' });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => undefined);
    setState({ status: 'signed-out' });
  }, []);

  return { state, reload, signOut };
}

export const planName = (account: Account) => {
  const plan = (account.tier || account.plan || 'free').toString();
  return plan.charAt(0).toUpperCase() + plan.slice(1);
};

export const isFree = (account: Account) => /^free( plan)?$/i.test((account.tier || account.plan || 'free').toString());

export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
