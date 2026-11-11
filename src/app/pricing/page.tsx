import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { PlanCards, PlanCompare } from '@/components/PlanCards';
import './pricing.css';

export const metadata: Metadata = { title: 'Pricing' };

const faq = [
  {
    q: 'What are credits?',
    a: 'Credits measure the AI work the agent and chat do for you. Short questions use a few; long agent tasks on large projects use more. Free includes 150 credits a month, Pro 4,000 and Pro+ 12,000. Your balance is always visible in Atomvs under Settings › Plan & Usage.',
  },
  {
    q: 'How many apps is that?',
    a: 'Roughly 3–4 apps on Free, about 100 on Pro and about 300 on Pro+. The real number depends on how big each app is and how much you iterate on it.',
  },
  {
    q: 'What happens when I run out?',
    a: 'On Free, AI requests pause until your credits refresh next month. On Pro and Pro+, Atomvs keeps working on the fast model until they refresh.',
  },
  {
    q: 'Can I choose the AI model?',
    a: 'Free uses the fast model. Pro unlocks every model in the model menu. Pro+ unlocks every model and puts the most capable ones first.',
  },
  {
    q: 'How does yearly billing work?',
    a: 'Pay for a year up front and get two months free: Pro is $200 a year instead of $240, and Pro+ is $500 instead of $600.',
  },
  {
    q: 'What is the “Made with Atomvs” badge?',
    a: 'Apps built on the Free plan show a small “Made with Atomvs” badge. Pro and Pro+ remove it.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. You keep your paid plan until the end of the billing period, then your account goes back to Free.',
  },
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <div className="pricing-orbits" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="wrap pb-24">
        <PageHero
          kicker="Pricing"
          title={<>Pick your <em>orbit.</em></>}
          lead="Start free. Upgrade when you build every day — switch plans or cancel any time."
        />

        <PlanCards />

        <section className="mt-32" data-reveal>
          <div className="mb-10 flex flex-col gap-4">
            <p className="kicker"><span className="dot" />Compare plans</p>
            <h2 className="h-section">Every detail, <em>side by side.</em></h2>
          </div>
          <PlanCompare />
        </section>

        <section className="mt-32 max-w-3xl" data-reveal>
          <h2 className="h-section mb-8">Good <em>questions.</em></h2>
          <div className="glass divide-y divide-line rounded-2xl">
            {faq.map((item) => (
              <details key={item.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span className="text-muted transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
