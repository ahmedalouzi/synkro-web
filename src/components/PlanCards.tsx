'use client';

import Link from 'next/link';
import { useState } from 'react';
import { plans, site, type Plan } from '@/lib/config';

type Billing = 'monthly' | 'yearly';

const MAX_CREDITS = Math.max(...plans.map((p) => p.credits));
/** Log scale so 150 credits still shows as a visible sliver next to 12,000. */
const meter = (credits: number) => Math.log10(credits) / Math.log10(MAX_CREDITS);
const fmt = (n: number) => n.toLocaleString('en-US');

function Check({ on = true }: { on?: boolean }) {
  return on ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="plan-check">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="plan-dash">
      <path d="M6 12h12" />
    </svg>
  );
}

/** Monthly / yearly switch with a sliding pill. */
function BillingToggle({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) {
  return (
    <div className="billing-toggle" role="radiogroup" aria-label="Billing period" data-value={value}>
      <span className="billing-pill" aria-hidden="true" />
      {(['monthly', 'yearly'] as const).map((b) => (
        <button key={b} type="button" role="radio" aria-checked={value === b} onClick={() => onChange(b)} className="press">
          {b === 'monthly' ? 'Monthly' : 'Yearly'}
          {b === 'yearly' && <span className="billing-save">2 months free</span>}
        </button>
      ))}
    </div>
  );
}

function Price({ plan, billing }: { plan: Plan; billing: Billing }) {
  const yearly = billing === 'yearly' && plan.yearly !== null;
  const amount = yearly ? plan.yearly! : plan.monthly;
  const period = plan.monthly === 0 ? 'forever' : yearly ? 'per year' : 'per month';
  return (
    <div className="plan-price">
      {/* key re-mounts the number so it rolls in on every switch */}
      <span key={`${plan.id}-${billing}`} className="plan-amount">
        ${fmt(amount)}
      </span>
      <span className="plan-period">
        {period}
        {yearly && (
          <em className="plan-permonth">
            ≈ ${(plan.yearly! / 12).toFixed(2)}/mo · save ${fmt(plan.monthly * 12 - plan.yearly!)}
          </em>
        )}
      </span>
    </div>
  );
}

function Cta({ plan }: { plan: Plan }) {
  if (plan.monthly === 0) {
    return (
      <Link href="/download" className="plan-cta plan-cta--ghost press">
        Download for free
      </Link>
    );
  }
  if (site.checkoutUrl) {
    return (
      <a href={site.checkoutUrl} className="plan-cta press">
        Upgrade to {plan.name}
      </a>
    );
  }
  return (
    <span className="plan-cta plan-cta--soon" aria-disabled="true">
      {plan.name} opens soon
    </span>
  );
}

const MAX_APK = Math.max(...plans.map((p) => p.apkPerDay));

const Icon = {
  models: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
      <path d="M19 15l.8 1.9 1.9.8-1.9.8L19 20.4l-.8-1.9-1.9-.8 1.9-.8z" />
    </svg>
  ),
  apk: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M12 7v6m-2.5-2.5L12 13l2.5-2.5M10 18h4" />
    </svg>
  ),
  priority: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12z" />
    </svg>
  ),
  out: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </svg>
  ),
  badge: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.4-1.8 1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z" />
    </svg>
  ),
};

function Tile({ icon, label, children, wide = false }: { icon: JSX.Element; label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`spec ${wide ? 'spec--wide' : ''}`}>
      <span className="spec-label">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

/** What each plan includes, as small visual tiles instead of a checklist. */
function PlanSpecs({ plan }: { plan: Plan }) {
  const dots = 10;
  const filled = Math.max(1, Math.round((plan.apkPerDay / MAX_APK) * dots));
  const paid = plan.monthly > 0;
  return (
    <div className="specs">
      <Tile icon={Icon.models} label="Models" wide>
        <div className="spec-chips">
          {plan.models.startsWith('Fast') ? (
            <span className="spec-chip">Fast model</span>
          ) : (
            <span className="spec-chip spec-chip--on">All models</span>
          )}
          {plan.models.includes('strongest') && <span className="spec-chip spec-chip--max">Strongest first</span>}
        </div>
      </Tile>

      <Tile icon={Icon.apk} label="Build APK">
        <div className="spec-value">
          <strong>{plan.apkPerDay}</strong>
          <span>a day</span>
        </div>
        <span className="spec-dots" aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => (
            <i key={i} className={i < filled ? 'on' : ''} />
          ))}
        </span>
      </Tile>

      <Tile icon={Icon.priority} label="Build queue">
        <span className="spec-bars" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <i key={i} className={i <= plan.priority ? 'on' : ''} />
          ))}
        </span>
        <span className="spec-note">{['Standard', 'Priority', 'Top priority'][plan.priority]}</span>
      </Tile>

      <Tile icon={Icon.out} label="Credits run out">
        <span className={`spec-status ${paid ? 'spec-status--go' : 'spec-status--pause'}`}>
          <i aria-hidden="true" />
          {paid ? 'Keeps going' : 'Pauses'}
        </span>
        <span className="spec-note">{paid ? 'on the fast model' : 'until next month'}</span>
      </Tile>

      <Tile icon={Icon.badge} label="Your apps">
        {plan.badge ? (
          <span className="spec-madewith">
            <i aria-hidden="true" />
            Made with Atomvs
          </span>
        ) : (
          <span className="spec-chip spec-chip--on">Clean, no badge</span>
        )}
        <span className="spec-note">{plan.badge ? 'badge shown' : 'your brand only'}</span>
      </Tile>
    </div>
  );
}

/** The three plans side by side, each wearing its planet, with a monthly / yearly switch. */
export function PlanCards() {
  const [billing, setBilling] = useState<Billing>('monthly');
  return (
    <div className="flex flex-col gap-10">
      <BillingToggle value={billing} onChange={setBilling} />
      <div className="plan-grid">
        {plans.map((plan, i) => (
          <div key={plan.id} data-reveal style={{ transitionDelay: `${i * 110}ms` }} className="plan-slot">
            <article className={`plan-card ${plan.highlight ? `plan-card--${plan.highlight}` : ''}`}>
              <div className="plan-inner glass">
                <span className={`plan-planet plan-planet--${plan.planet}`} aria-hidden="true" />
                <header className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="plan-name">{plan.name}</h3>
                    {plan.highlight === 'popular' && <span className="plan-tag">Most popular</span>}
                    {plan.highlight === 'max' && <span className="plan-tag plan-tag--max">Max power</span>}
                  </div>
                  <p className="plan-tagline">{plan.tagline}</p>
                </header>

                <Price plan={plan} billing={billing} />

                <div className="plan-credits">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="plan-credits-num">{fmt(plan.credits)} credits</span>
                    <span className="plan-credits-apps">≈ {plan.apps} / month</span>
                  </div>
                  <span className="plan-meter" aria-hidden="true">
                    <span style={{ '--fill': meter(plan.credits) } as React.CSSProperties} />
                  </span>
                </div>

                <PlanSpecs plan={plan} />

                <div className="mt-auto flex flex-col gap-2">
                  <Cta plan={plan} />
                  {plan.monthly > 0 && !site.checkoutUrl && (
                    <p className="text-center text-xs text-faint">Payments are being set up. Start on Free — your account carries over.</p>
                  )}
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Every detail, row by row. */
export function PlanCompare() {
  const rows: { label: string; cell: (p: Plan) => React.ReactNode }[] = [
    { label: 'Price', cell: (p) => (p.monthly === 0 ? '$0' : `$${p.monthly} / month`) },
    { label: 'Yearly (2 months free)', cell: (p) => (p.yearly === null ? '—' : `$${fmt(p.yearly)} / year`) },
    { label: 'Credits each month', cell: (p) => fmt(p.credits) },
    { label: 'Roughly', cell: (p) => p.apps },
    { label: 'Models', cell: (p) => p.models },
    { label: 'Build APK', cell: (p) => `${p.apkPerDay} a day` },
    {
      label: 'Build priority',
      cell: (p) =>
        p.priority === 0 ? (
          <span className="text-muted">Standard</span>
        ) : (
          <span className="inline-flex items-center gap-0.5" aria-label={p.priority === 2 ? 'Top priority' : 'Priority'}>
            <Check />
            {p.priority === 2 && <Check />}
          </span>
        ),
    },
    { label: 'When credits run out', cell: (p) => p.whenOut },
    { label: '“Made with Atomvs” badge', cell: (p) => (p.badge ? 'Shown' : <span className="inline-flex"><Check on={false} /><span className="sr-only">Removed</span></span>) },
  ];
  return (
    <div className="compare glass">
      <table>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Feature</span></th>
            {plans.map((p) => (
              <th key={p.id} scope="col" className={p.highlight === 'popular' ? 'is-popular' : ''}>
                <span className={`compare-planet plan-planet--${p.planet}`} aria-hidden="true" />
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {plans.map((p) => (
                <td key={p.id} className={p.highlight === 'popular' ? 'is-popular' : ''}>{r.cell(p)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
