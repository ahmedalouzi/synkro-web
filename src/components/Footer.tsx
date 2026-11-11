import Link from 'next/link';
import { site } from '@/lib/config';
import { AtomvsLogo } from './Logos';

const columns = [
  { title: 'Product', links: [{ href: '/download', label: 'Download' }, { href: '/pricing', label: 'Pricing' }, { href: '/docs', label: 'Docs' }] },
  { title: 'Account', links: [{ href: '/account', label: 'Sign in' }, { href: '/account/billing', label: 'Billing' }, { href: '/beta-feedback', label: 'Beta feedback' }] },
  { title: 'Legal', links: [{ href: '/privacy', label: 'Privacy' }, { href: '/terms', label: 'Terms' }] },
];

/**
 * Site footer: link columns, then the wordmark set huge across the full width. Its letters
 * rise in one after another as the footer scrolls into view (a CSS scroll-driven animation;
 * browsers without it simply show the wordmark).
 */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap grid gap-12 pt-20 sm:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 text-ink">
            <AtomvsLogo size={24} />
            <span className="wordmark text-[15px]">ATOMVS</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted">{site.tagline}. Describe a screen — watch it build on a real device frame.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3 text-sm">
            <span className="kicker text-[10.5px]">{col.title}</span>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="footer-link">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="wrap mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-faint">
        <span>© {new Date().getFullYear()} Atomvs</span>
        <span>
          Planet imagery:{' '}
          <a href="https://www.solarsystemscope.com/textures/" className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noopener noreferrer">
            Solar System Scope
          </a>{' '}
          (
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>
          ), based on NASA imagery · Moon:{' '}
          <a href="https://svs.gsfc.nasa.gov/4720" className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noopener noreferrer">
            NASA SVS / LRO
          </a>
        </span>
      </div>

      <div className="footer-mark" aria-hidden="true">
        {'ATOMVS'.split('').map((c, i) => (
          <span key={i} style={{ '--i': i } as React.CSSProperties}>{c}</span>
        ))}
      </div>
    </footer>
  );
}
