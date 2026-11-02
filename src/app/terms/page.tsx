import type { Metadata } from 'next';
import { DraftNotice } from '@/components/DraftNotice';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <article className="prose-synkro mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <DraftNotice />
      <h1 className="mb-2 font-display text-4xl font-semibold tracking-tight text-[#f4f4f5]">Terms of Service</h1>
      <p className="text-sm text-[#71717a]">Last updated: [date]</p>

      <p>These terms are an agreement between you and Atomvs (“we”) for the Atomvs desktop app, this website and the related services. By using Atomvs you accept them.</p>

      <h2>Your account</h2>
      <p>You need an account to use the AI features. Keep your password safe; you are responsible for activity on your account. You must be at least [13/16] years old.</p>

      <h2>Plans, usage and limits</h2>
      <p>The Free plan and paid plans include a weekly amount of AI usage, Tab completion limits and short-term rate limits, as described on the pricing page. Today the Free plan includes US$0.50 of AI usage per week and 2,000 Tab completions per month; Pro includes US$5.00 per week and unlimited Tab completions. Weekly usage refreshes every Monday at 00:00 UTC, and unused usage does not carry over. We may adjust limits to keep the service reliable and fair, and we will tell you before reducing what a paid plan includes.</p>

      <h2>Payments and cancellation</h2>
      <ul>
        <li>Paid plans renew automatically each billing period until you cancel.</li>
        <li>You can cancel at any time; you keep the paid plan until the end of the current period.</li>
        <li>Refunds: [policy — for example, a full refund within 7 or 14 days of the first Pro payment].</li>
        <li>Payments are processed by [provider], and prices may include taxes depending on your location.</li>
      </ul>

      <h2>Your code</h2>
      <p>You own your code and the code the AI writes for you. You give us permission to process the code and messages you send only as needed to provide the features you use (see the Privacy Policy).</p>

      <h2>AI output</h2>
      <p>AI suggestions can be wrong, insecure or incomplete. Review and test anything the agent writes before you rely on it or ship it. You are responsible for the code you publish.</p>

      <h2>Acceptable use</h2>
      <p>Do not use Atomvs to:</p>
      <ul>
        <li>break the law or infringe others’ rights;</li>
        <li>create malware or attack other systems;</li>
        <li>get around usage limits, share accounts, or resell access;</li>
        <li>reverse engineer or overload the service;</li>
        <li>use Cloud Build for anything other than building your app — for example mining cryptocurrency, attacking or scanning other systems, scraping, or relaying traffic;</li>
        <li>upload build archives meant to escape the build container, such as path-traversal entries, symbolic-link tricks or decompression bombs.</li>
      </ul>
      <p>We may suspend accounts that break these rules.</p>

      <h2>Availability and changes</h2>
      <p>We work to keep Atomvs available but do not guarantee it will be uninterrupted. We may change or discontinue features; for paid plans we will give reasonable notice of significant changes.</p>

      <h2>Disclaimer and liability</h2>
      <p>Atomvs is provided “as is”. To the extent the law allows, we are not liable for indirect or consequential damages, lost profits or lost data, and our total liability is limited to the amount you paid us in the [12] months before the claim [or US$20, whichever is greater].</p>

      <h2>Ending your use</h2>
      <p>You can stop using Atomvs and delete your account at any time. We may end these terms if you break them.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of [country/state].</p>

      <h2>Contact</h2>
      <p>Atomvs, [address] — [contact email].</p>
    </article>
  );
}
