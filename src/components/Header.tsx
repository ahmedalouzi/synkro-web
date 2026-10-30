import Link from 'next/link';
import { nav, site } from '@/lib/config';
import { AtomvsLogo } from './Logos';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-content items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-ink" aria-label={`${site.name} home`}>
          <AtomvsLogo />
          <span className="font-display text-[17px] font-semibold tracking-wide">ATOMVS</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted sm:flex" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/account" className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-hover hover:text-ink">
            Sign in
          </Link>
          <Link href="/download" className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-base transition-opacity hover:opacity-90">
            Download
          </Link>
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-line px-4 py-2 text-sm text-muted sm:hidden" aria-label="Main (mobile)">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
