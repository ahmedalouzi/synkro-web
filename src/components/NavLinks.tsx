'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { nav } from '@/lib/config';

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The fixed header element: transparent at the top of the page, frosted glass once scrolled. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50" data-scrolled={scrolled || undefined}>
      {children}
    </header>
  );
}

/** Header nav pills; the current page is filled white (aria-current). */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
          className="nav-pill press"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

/** Small-screen menu: a round button that opens a glass panel with the links. */
export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="relative md:hidden">
      <button
        type="button"
        className="press grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-ink backdrop-blur"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          {open ? <path d="M3 3l8 8M11 3l-8 8" /> : <path d="M2 4.5h10M2 9.5h10" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" className="mobile-menu glass absolute right-0 top-12 flex w-52 flex-col gap-1 rounded-2xl p-2" aria-label="Main (mobile)">
          {[...nav, { href: '/account', label: 'Sign in' }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
              className="rounded-xl px-3 py-2.5 text-sm text-ink/90 hover:bg-white/10 aria-[current=page]:bg-white aria-[current=page]:text-[#0b0b12]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
