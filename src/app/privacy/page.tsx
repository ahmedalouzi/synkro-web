import type { Metadata } from 'next';
import { DraftNotice } from '@/components/DraftNotice';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <article className="prose-synkro mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <DraftNotice />
      <h1 className="mb-2 font-display text-4xl font-semibold tracking-tight text-[#f4f4f5]">Privacy Policy</h1>
      <p className="text-sm text-[#71717a]">Last updated: [date]</p>

      <p>This policy explains what Atomvs (“we”) collects when you use the Atomvs desktop app and this website, why, and the choices you have.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account</strong> — your email address and a hashed (never plain-text) password.</li>
        <li><strong>Usage</strong> — how much AI usage and how many Tab completions your account uses, so we can apply your plan’s limits. We record token counts and cost, not the content of your requests.</li>
        <li><strong>Chats</strong> — your conversations with the agent are stored so you can return to them in your chat history. You can delete a chat at any time.</li>
        <li><strong>Payments</strong> — handled by our payment provider ([provider]). We receive your plan and subscription status, not your full card details.</li>
        <li><strong>Crash reports</strong> — when the app crashes, a report with technical details (error, app version, operating system) may be sent to our error-tracking service ([Sentry]). Reports are scrubbed of API keys and tokens.</li>
        <li><strong>Anonymous usage statistics</strong> — off by default. If you turn them on in Settings › Privacy, the app records which features you use, without code, file names or personal data.</li>
      </ul>

      <h2>Your code and AI providers</h2>
      <p>When you use the agent, chat, Tab completions or Ctrl+K, the relevant parts of your code and your message are sent to our server and then to an AI model provider ([Google Gemini]) to generate the answer. We send only what the feature needs — for example the code around your cursor for a completion, or the files you attach with @.</p>
      <p>We do not sell your code, and we do not use it to train our own models. The AI provider processes it under its own terms for paid API use: [link to the provider’s data-use terms].</p>
      <p>Your project files stay on your computer. They are not uploaded unless a feature you use sends them, as described above.</p>

      <h2>How we use information</h2>
      <ul>
        <li>To provide the service: sign-in, AI features, chat history and plan limits.</li>
        <li>To bill paid plans.</li>
        <li>To fix bugs and keep the service secure.</li>
        <li>To contact you about your account or important changes. We do not send marketing email without your consent.</li>
      </ul>

      <h2>Sharing</h2>
      <p>We share data only with the providers that run the service — hosting ([host]), the AI model provider, payments and error tracking — and only as needed for them to do so, or when the law requires it.</p>

      <h2>Retention and deletion</h2>
      <p>We keep your account data while your account exists. You can delete chats in the app, and you can ask us to delete your account and its data at [contact email]. We delete it within [30] days, except where we must keep billing records by law.</p>

      <h2>Your rights</h2>
      <p>Depending on where you live, you may have the right to access, correct, export or delete your data, and to object to some processing. Contact us at [contact email].</p>

      <h2>Security</h2>
      <p>Connections use HTTPS, passwords are hashed, and session tokens stored by the app are encrypted on your device. No system is perfectly secure, so please use a strong, unique password.</p>

      <h2>Children</h2>
      <p>Atomvs is not intended for children under [13/16].</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date above and, for significant changes, let you know in the app or by email.</p>

      <h2>Contact</h2>
      <p>Atomvs, [address], [country] — [contact email].</p>
    </article>
  );
}
