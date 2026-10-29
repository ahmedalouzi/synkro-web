'use client';

import Link from 'next/link';
import { SignInForm } from '@/components/SignInForm';
import { formatDate, isFree, planName, useAccount } from '@/components/useAccount';

function Meter({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-hover" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-400' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AccountPage() {
  const { state, reload, signOut } = useAccount();

  if (state.status === 'loading') {
    return <div className="mx-auto max-w-content px-4 py-24 text-center text-muted sm:px-6">Loading your account…</div>;
  }
  if (state.status === 'signed-out') {
    return <div className="px-4 py-20 sm:px-6"><SignInForm onSignedIn={() => void reload()} /></div>;
  }
  if (state.status === 'error') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <p className="text-muted">{state.message}</p>
        <button type="button" onClick={() => void reload()} className="rounded-lg border border-line-strong px-4 py-2 text-sm hover:bg-hover">Try again</button>
      </div>
    );
  }

  const a = state.account;
  const poolLimit = a.weeklyPoolUsd ?? 0;
  const poolUsed = a.weeklyUsedUsd ?? 0;
  const tabUnlimited = a.monthlyCompletions === null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Account</h1>
          <p className="text-muted">{a.email}</p>
        </div>
        <button type="button" onClick={() => void signOut()} className="rounded-lg border border-line-strong px-3 py-1.5 text-sm text-muted hover:bg-hover hover:text-ink">Sign out</button>
      </div>

      <section className="flex flex-col divide-y divide-line rounded-2xl border border-line-strong bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-medium">Plan</h2>
            <p className="text-sm text-muted">You are on the {planName(a)} plan.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">{planName(a).toUpperCase()}</span>
            <Link href={isFree(a) ? '/pricing' : '/account/billing'} className="rounded-lg border border-line-strong px-3 py-1.5 text-sm hover:bg-hover">
              {isFree(a) ? 'Upgrade' : 'Manage billing'}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-medium">Included AI usage</h2>
              <p className="text-sm text-muted">{a.weekResetsAt ? `Refreshes weekly · next reset ${formatDate(a.weekResetsAt)}` : 'Refreshes weekly'}</p>
            </div>
            <span className="font-mono text-sm tabular-nums">{Math.round(poolLimit > 0 ? (poolUsed / poolLimit) * 100 : 0)}% used</span>
          </div>
          <Meter used={poolUsed} limit={poolLimit} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 p-5">
          <div>
            <h2 className="font-medium">Tab completions</h2>
            <p className="text-sm text-muted">{tabUnlimited ? 'Unlimited on your plan' : a.completionsResetAt ? `Resets ${formatDate(a.completionsResetAt)}` : 'This month'}</p>
          </div>
          <span className="font-mono text-sm tabular-nums">{tabUnlimited ? 'Unlimited' : `${a.completionsUsed ?? 0} / ${a.monthlyCompletions ?? '—'}`}</span>
        </div>
      </section>

      <p className="text-sm text-muted">The same numbers appear in the app under Settings › Plan &amp; Usage.</p>
    </div>
  );
}
