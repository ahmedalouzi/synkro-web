import type { Metadata } from 'next';
import { PlanCards } from '@/components/PlanCards';

export const metadata: Metadata = { title: 'Pricing' };

const faq = [
  {
    q: 'What is “included AI usage”?',
    a: 'Every plan includes a weekly amount of AI usage for the agent and chat. Short questions use a little, long agent tasks on large projects use more. Your remaining usage is always visible in Synkro under Settings › Plan & Usage, and it refreshes every Monday.',
  },
  {
    q: 'What happens when I run out?',
    a: 'On Free, AI requests pause until your usage refreshes the next week. On Pro, Synkro keeps working by switching to a fast model until the refresh.',
  },
  {
    q: 'Do Tab completions count against my usage?',
    a: 'No. Free includes 2,000 Tab completions a month; on Pro they are unlimited.',
  },
  {
    q: 'Can I choose the AI model?',
    a: 'On Free, Auto picks a fast model for each task. Pro lets you choose a premium model from the model menu in the chat or in Settings › Models.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. You keep Pro until the end of the billing period, then your account goes back to Free.',
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-12 flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Simple pricing</h1>
        <p className="max-w-xl text-muted">Start free. Upgrade when you build every day.</p>
      </div>
      <div className="mx-auto max-w-4xl">
        <PlanCards />
      </div>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-6 font-display text-2xl font-semibold">Questions</h2>
        <div className="divide-y divide-line rounded-2xl border border-line">
          {faq.map((item) => (
            <details key={item.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}
                <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
