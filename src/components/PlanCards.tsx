import Link from 'next/link';
import { plans, site } from '@/lib/config';

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-[3px] shrink-0 text-accent">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Free and Pro side by side. The Pro button links to checkout only once a payment provider is configured. */
export function PlanCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {plans.map((plan) => {
        const pro = plan.id === 'pro';
        return (
          <article
            key={plan.id}
            className={`flex flex-col gap-6 rounded-2xl border p-7 ${pro ? 'border-accent/50 bg-[radial-gradient(120%_120%_at_100%_0%,rgba(124,131,255,0.14),transparent_55%)] bg-elevated' : 'border-line-strong bg-panel'}`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                {pro && <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">Most popular</span>}
              </div>
              <p className="text-sm text-muted">{plan.summary}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-semibold tracking-tight">{plan.price}</span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              {!pro ? (
                <Link href="/download" className="block rounded-lg border border-line-strong px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-hover">
                  Download for free
                </Link>
              ) : site.checkoutUrl ? (
                <a href={site.checkoutUrl} className="block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-base transition-opacity hover:opacity-90">
                  Upgrade to Pro
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="block cursor-not-allowed rounded-lg bg-accent/30 px-4 py-2.5 text-center text-sm font-semibold text-ink/70" aria-disabled="true">
                    Pro opens soon
                  </span>
                  <p className="text-center text-xs text-faint">Payments are being set up. Start on Free — your account carries over.</p>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
