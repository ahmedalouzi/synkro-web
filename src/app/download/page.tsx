import type { Metadata } from 'next';
import Link from 'next/link';
import { latestWindowsDownload } from '@/lib/latest-release';

// The Download links follow the latest release: re-checked at most every 10 minutes.
export const revalidate = 600;
import { SmartScreenGuide } from '@/components/SmartScreenGuide';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Download' };

const platforms = (windowsUrl: string) => [
  { name: 'Windows', detail: 'Windows 10 and 11, 64-bit · installs for your user, no administrator rights', href: windowsUrl, available: true },
  { name: 'macOS', detail: 'Apple silicon and Intel', href: '', available: false },
  { name: 'Linux', detail: 'AppImage and .deb', href: '', available: false },
];

const requirements = [
  ['Operating system', 'Windows 10 64-bit (version 2004 or later)', 'Windows 11'],
  ['Processor', '4 cores', '8 cores'],
  ['Memory', '8 GB', '16 GB'],
  ['Disk', '4 GB free', '10 GB free on an SSD'],
  ['Flutter SDK', 'Not needed in Managed mode', 'Install it for live Flutter preview and Local CLI mode'],
  ['Node.js', 'Node.js 18 LTS for React Native / Expo projects', 'Node.js 20 LTS'],
  ['Android builds', 'None on your computer: Build APK runs in our cloud', 'An Atomvs account'],
];

const faq = [
  {
    q: 'Do I need administrator rights to install?',
    a: 'No. Atomvs installs for your user account only, in %LOCALAPPDATA%\\Programs\\Atomvs, so Windows does not ask for administrator access.',
  },
  {
    q: 'How do updates work?',
    a: 'Atomvs checks for new versions in the background and shows a message in the app when one is ready to install.',
  },
  {
    q: 'Is my code uploaded when I use Atomvs?',
    a: 'Your files stay on your computer. Code leaves it only when you use an AI feature (the parts that feature needs) or start a Cloud Build (the project, without dependency and build folders). Anonymous usage statistics are off by default. See the privacy policy for details.',
  },
];

export default async function DownloadPage() {
  const windows = await latestWindowsDownload();
  return (
    <div className="wrap pb-24">
      <PageHero kicker="Download" title={<>Download <em>Atomvs.</em></>} lead="Install, sign in, and open or create a project. Updates install automatically." />

      <div className="grid gap-4 sm:grid-cols-3">
        {platforms(windows.url).map((p, i) => (
          <div key={p.name} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
          <div className={`glass flex h-full flex-col gap-4 rounded-2xl p-6 ${p.available ? 'lift' : ''}`}>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-medium tracking-tight">{p.name}</h2>
              <p className="text-sm text-muted">{p.detail}</p>
            </div>
            {p.available ? (
              <a href={p.href} className="press mt-auto rounded-lg bg-ink px-4 py-2.5 text-center text-sm font-semibold text-base transition-opacity hover:opacity-90">
                Download
              </a>
            ) : (
              <span className="mt-auto rounded-lg border border-line px-4 py-2.5 text-center text-sm text-faint" aria-disabled="true">
                Coming soon
              </span>
            )}
          </div>
          </div>
        ))}
      </div>

      <section className="mt-16 grid gap-8 sm:grid-cols-3" data-reveal>
        {[
          ['1. Install', 'Run the installer. Windows asks you to confirm the first launch (see below).'],
          ['2. Sign in', 'Create a free account in the app, or sign in with your existing one.'],
          ['3. Build', 'Open a folder, clone a repository, or create a Flutter or React Native project.'],
        ].map(([title, text]) => (
          <div key={title} className="flex flex-col gap-1.5">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      <section id="smartscreen" className="mt-20 flex flex-col gap-4" data-reveal>
        <h2 className="h-section">“Windows protected your PC”?</h2>
        <SmartScreenGuide installerName={windows.fileName} />
      </section>

      <section id="requirements" className="mt-20 flex flex-col gap-4" data-reveal>
        <h2 className="h-section">System requirements</h2>
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.03] text-ink">
              <tr>
                <th className="px-4 py-3 font-medium">Component</th>
                <th className="px-4 py-3 font-medium">Minimum</th>
                <th className="px-4 py-3 font-medium">Recommended</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {requirements.map(([name, min, rec]) => (
                <tr key={name} className="border-t border-line">
                  <td className="px-4 py-3 text-ink">{name}</td>
                  <td className="px-4 py-3">{min}</td>
                  <td className="px-4 py-3">{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" className="mt-20 flex flex-col gap-4" data-reveal>
        <h2 className="h-section">Questions</h2>
        <div className="glass flex flex-col divide-y divide-line rounded-2xl">
          {faq.map(({ q, a }) => (
            <details key={q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-medium marker:hidden">{q}</summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-12 text-sm text-muted">
        New to Atomvs? Start with the <Link href="/docs" className="text-accent underline underline-offset-4">docs</Link>.
      </p>
    </div>
  );
}
