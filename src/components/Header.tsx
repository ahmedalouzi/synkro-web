import Link from 'next/link';
import { site } from '@/lib/config';
import { AtomvsLogo } from './Logos';
import { HeaderShell, MobileMenu, NavLinks } from './NavLinks';

/**
 * Full-width floating header: nav pills on the left, the wordmark centred, actions on the right.
 * Transparent over the page top, frosted glass once the page scrolls (HeaderShell).
 */
export function Header() {
  return (
    <HeaderShell>
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8">
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main">
          <NavLinks />
        </nav>
        <Link href="/" className="flex items-center gap-2.5 text-ink md:hidden" aria-label={`${site.name} home`}>
          <AtomvsLogo size={24} />
        </Link>

        <Link href="/" className="wordmark flex items-center gap-2.5 text-ink" aria-label={`${site.name} home`}>
          <span className="hidden md:inline-flex"><AtomvsLogo size={24} /></span>
          <span>ATOMVS</span>
        </Link>

        <div className="flex items-center justify-end gap-2">
          <Link href="/account" className="press hidden rounded-full px-3.5 py-2 text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink/80 transition-colors hover:text-ink sm:inline-flex">
            Sign in
          </Link>
          <Link href="/download" className="press rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold uppercase tracking-[.08em] text-[#0b0b12] transition-opacity hover:opacity-90">
            Download
          </Link>
          <MobileMenu />
        </div>
      </div>
      {/* Reading progress, driven by the scroll position in CSS (no JS); hidden where unsupported. */}
      <span className="scroll-progress" aria-hidden="true" data-motion-keep />
    </HeaderShell>
  );
}
