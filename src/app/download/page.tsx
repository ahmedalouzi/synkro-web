import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/config';

export const metadata: Metadata = { title: 'Download' };

const platforms = [
  { name: 'Windows', detail: 'Windows 10 and 11, 64-bit', href: site.downloadWindows, available: true },
  { name: 'macOS', detail: 'Apple silicon and Intel', href: '', available: false },
  { name: 'Linux', detail: 'AppImage and .deb', href: '', available: false },
];

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-12 flex flex-col gap-3">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Download Atomvs</h1>
        <p className="max-w-xl text-muted">Install, sign in, and open or create a project. Updates install automatically.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {platforms.map((p) => (
          <div key={p.name} className="flex flex-col gap-4 rounded-2xl border border-line-strong bg-panel p-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-xl font-semibold">{p.name}</h2>
              <p className="text-sm text-muted">{p.detail}</p>
            </div>
            {p.available ? (
              <a href={p.href} className="mt-auto rounded-lg bg-ink px-4 py-2.5 text-center text-sm font-semibold text-base transition-opacity hover:opacity-90">
                Download
              </a>
            ) : (
              <span className="mt-auto rounded-lg border border-line px-4 py-2.5 text-center text-sm text-faint" aria-disabled="true">
                Coming soon
              </span>
            )}
          </div>
        ))}
      </div>

      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        {[
          ['1. Install', 'Run the installer. Windows may ask you to confirm the first launch.'],
          ['2. Sign in', 'Create a free account in the app, or sign in with your existing one.'],
          ['3. Build', 'Open a folder, clone a repository, or create a Flutter or React Native project.'],
        ].map(([title, text]) => (
          <div key={title} className="flex flex-col gap-1.5">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      <p className="mt-12 text-sm text-muted">
        New to Atomvs? Start with the <Link href="/docs" className="text-accent underline underline-offset-4">docs</Link>.
      </p>
    </div>
  );
}
