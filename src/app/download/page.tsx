import type { Metadata } from 'next';
import Link from 'next/link';
import { latestDownloads, type LatestDownloads } from '@/lib/latest-release';

// The Download links follow the latest release: re-checked at most every 10 minutes.
export const revalidate = 600;
import { SmartScreenGuide } from '@/components/SmartScreenGuide';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Download' };

type Platform = {
  name: string;
  detail: string;
  /** Download buttons; none = "Coming soon". */
  files: Array<{ label: string; href: string; hint?: string }>;
};

/** The cards: every link comes from the latest published release (latest-release.ts), never a fixed version. */
const platforms = (d: LatestDownloads): Platform[] => [
  {
    name: 'Windows',
    detail: 'Windows 10 and 11, 64-bit · installs for your user, no administrator rights',
    files: [{ label: 'Download', href: d.windows.url }],
  },
  {
    name: 'Linux',
    detail: '64-bit (x64) · .deb for Ubuntu and Debian, AppImage for most other distributions',
    files: [
      ...(d.appImage ? [{ label: 'AppImage', href: d.appImage.url, hint: `chmod +x ${d.appImage.fileName} && ./${d.appImage.fileName}` }] : []),
      ...(d.deb ? [{ label: '.deb', href: d.deb.url, hint: `sudo apt install ./${d.deb.fileName}` }] : []),
    ],
  },
  { name: 'macOS', detail: 'Apple silicon and Intel', files: [] },
];

const released = (iso: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

const requirements = [
  ['Operating system', 'Windows 10 64-bit (version 2004 or later), or 64-bit Linux', 'Windows 11, or Ubuntu 24.04'],
  ['Processor', '4 cores', '8 cores'],
  ['Memory', '8 GB', '16 GB'],
  ['Disk', '4 GB free', '10 GB free on an SSD'],
  ['Flutter SDK', 'Not needed in Managed mode', 'Install it for live Flutter preview and Local CLI mode'],
  ['Node.js', 'Node.js 22.13 or newer for React Native / Expo projects (Expo SDK 58)', 'Node.js 24 LTS'],
  ['Android builds', 'None on your computer: Build APK runs in our cloud', 'An Atomvs account'],
];

const faq = [
  {
    q: 'Do I need administrator rights to install?',
    a: 'Not on Windows: Atomvs installs for your user account only, in %LOCALAPPDATA%\\Programs\\Atomvs. On Linux the AppImage needs none either; installing the .deb uses sudo, like any package.',
  },
  {
    q: 'How do updates work?',
    a: 'Atomvs checks for new versions in the background and shows a message in the app when one is ready to install. The Linux AppImage updates itself the same way; with the .deb, install the newer .deb from this page.',
  },
  {
    q: 'Is my code uploaded when I use Atomvs?',
    a: 'Your files stay on your computer. Code leaves it only when you use an AI feature (the parts that feature needs) or start a Cloud Build (the project, without dependency and build folders). Anonymous usage statistics are off by default. See the privacy policy for details.',
  },
];

export default async function DownloadPage() {
  const downloads = await latestDownloads();
  const windows = downloads.windows;
  const date = released(downloads.publishedAt);
  return (
    <div className="wrap pb-24">
      <PageHero kicker="Download" title={<>Download <em>Atomvs.</em></>} lead="Install, sign in, and open or create a project. Updates install automatically." />

      {downloads.version && (
        <p className="-mt-6 mb-8 text-sm text-muted" data-testid="download-version">
          Version <span className="text-ink">{downloads.version}</span>
          {date && <> · released {date}</>}
          {' · '}
          <a href={downloads.releaseUrl} className="text-accent underline underline-offset-4" target="_blank" rel="noopener noreferrer">Release notes</a>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {platforms(downloads).map((p, i) => (
          <div key={p.name} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
          <div className={`glass flex h-full flex-col gap-4 rounded-2xl p-6 ${p.files.length ? 'lift' : ''}`}>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-medium tracking-tight">{p.name}</h2>
              <p className="text-sm text-muted">{p.detail}</p>
            </div>
            {p.files.length ? (
              <div className="mt-auto flex flex-col gap-3">
                {p.files.map((f) => (
                  <div key={f.label} className="flex flex-col gap-1.5">
                    <a href={f.href} className="press rounded-lg bg-ink px-4 py-2.5 text-center text-sm font-semibold text-base transition-opacity hover:opacity-90">
                      {p.files.length > 1 ? `Download ${f.label}` : f.label}
                    </a>
                    {f.hint && <code className="block overflow-x-auto whitespace-nowrap rounded-md border border-line px-2 py-1 text-xs text-muted">{f.hint}</code>}
                  </div>
                ))}
              </div>
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
