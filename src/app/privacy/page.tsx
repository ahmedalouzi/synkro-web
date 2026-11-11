import type { Metadata } from 'next';
import { DraftNotice } from '@/components/DraftNotice';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="wrap pb-24">
      <PageHero kicker="Legal" title={<>Privacy <em>Policy</em></>} lead="Last updated: [date]" />
      <article className="prose-synkro max-w-3xl">
      <DraftNotice />

      <p>This policy explains what Atomvs (“we”) collects when you use the Atomvs desktop app and this website, why, and the choices you have.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account</strong> — your email address and a hashed (never plain-text) password.</li>
        <li><strong>Usage</strong> — how much AI usage and how many Tab completions your account uses, so we can apply your plan’s limits. For each request we record the time, the model, token counts and estimated cost, not its content.</li>
        <li><strong>Chats</strong> — your conversations with the agent are stored so you can return to them in your chat history. You can delete a chat at any time.</li>
        <li><strong>Payments</strong> — handled by our payment provider ([provider]). We store only the customer and subscription reference IDs and your subscription status. We never receive or store card numbers or bank details.</li>
        <li><strong>Crash reports</strong> — only if you turn on usage statistics in Settings › Privacy (off by default). When the app crashes, a report with technical details (error, app version, operating system) is sent to our error-tracking service ([Sentry]). Before it leaves your computer, sign-in tokens, API keys and your local file paths are removed from it.</li>
        <li><strong>Anonymous usage statistics</strong> — off by default. If you turn them on in Settings › Privacy, the app records which features you use, without code, file names or personal data, in a file on your computer that keeps at most 2,000 entries.</li>
        <li><strong>Settings on your computer</strong> — your settings and recent projects are kept in a file on your computer. Your sign-in tokens and any API keys you enter there are encrypted with your operating system’s protection where it provides one (Windows and macOS do).</li>
      </ul>

      <h2>Your code and AI providers</h2>
      <p>When you use the agent, chat, Tab completions or Ctrl+K, the relevant parts of your code and your message are sent to our server and then to an AI model provider ([Google Gemini]) to generate the answer. We send only what the feature needs — for example the code around your cursor for a completion, or the files you attach with @.</p>
      <p>We do not sell your code, and we do not use it to train our own models. The AI provider processes it under its own terms for paid API use: [link to the provider’s data-use terms].</p>
      <p>Your project files stay on your computer. They are not uploaded unless a feature you use sends them, as described above and under Cloud Build.</p>

      <h2>Cloud Build</h2>
      <p>When you start a Cloud Build to get an Android APK:</p>
      <ul>
        <li>The app uploads your project as an archive over HTTPS, without dependency and build folders such as <code>node_modules</code>, <code>.git</code> and Android build outputs.</li>
        <li>Our server builds it inside an isolated container with restricted network access.</li>
        <li>When the build ends — successfully, with an error or cancelled — the uploaded archive and the extracted source are deleted from the build server.</li>
        <li>The finished APK is kept on our server for you to download, then deleted: after 24 hours on the Free plan and 7 days on paid plans.</li>
        <li>APKs are signed with an upload key created for your project. The key is stored encrypted on our server so that every build of the project is signed the same way; you can download it with your account password.</li>
      </ul>

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
      <p>Connections use HTTPS and passwords are hashed. Accounts are kept apart from each other in our database, and Cloud Builds run in isolated containers. No system is perfectly secure, so please use a strong, unique password.</p>
      <p>If you find a security problem, please report it to [security contact email].</p>

      <h2>Children</h2>
      <p>Atomvs is not intended for children under [13/16].</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date above and, for significant changes, let you know in the app or by email.</p>

      <h2>Contact</h2>
      <p>Atomvs, [address], [country] — [contact email].</p>
    </article>
    </div>
  );
}
