'use client';

import Link from 'next/link';
import { SignInForm } from '@/components/SignInForm';
import { isFree, planName, useAccount } from '@/components/useAccount';
import { site } from '@/lib/config';

export default function BillingPage() {
  const { state, reload } = useAccount();

  if (state.status === 'loading') {
    return <div className="mx-auto max-w-content px-4 py-24 text-center text-muted sm:px-6">Loading billing…</div>;
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
  const free = isFree(a);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-1">
        <Link href="/account" className="text-sm text-muted hover:text-ink">← Account</Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Billing</h1>
      </div>

      <section className="flex flex-col divide-y divide-line rounded-2xl border border-line-strong bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-medium">Subscription</h2>
            <p className="text-sm text-muted">{free ? 'You are on the Free plan. No payment method is needed.' : `You are on ${planName(a)}.`}</p>
          </div>
          {free ? (
            site.checkoutUrl ? (
              <a href={site.checkoutUrl} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-base hover:opacity-90">Upgrade to Pro</a>
            ) : (
              <Link href="/pricing" className="rounded-lg border border-line-strong px-4 py-2 text-sm hover:bg-hover">See Pro</Link>
            )
          ) : site.billingPortalUrl ? (
            <a href={site.billingPortalUrl} className="rounded-lg border border-line-strong px-4 py-2 text-sm hover:bg-hover">Manage subscription</a>
          ) : (
            <span className="text-sm text-faint">Subscription management opens with payments.</span>
          )}
        </div>
        <div className="p-5">
          <h2 className="font-medium">Payment method and invoices</h2>
          <p className="text-sm text-muted">
            {site.billingPortalUrl
              ? 'Update your card and download invoices from the billing portal.'
              : 'Card details and invoices will be available here once payments open.'}
          </p>
        </div>
      </section>
    </div>
  );
}
