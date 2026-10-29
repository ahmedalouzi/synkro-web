import Link from 'next/link';
import { site } from '@/lib/config';
import { SynkroMark } from './Logos';

const columns = [
  { title: 'Product', links: [{ href: '/download', label: 'Download' }, { href: '/pricing', label: 'Pricing' }, { href: '/docs', label: 'Docs' }] },
  { title: 'Account', links: [{ href: '/account', label: 'Sign in' }, { href: '/account/billing', label: 'Billing' }] },
  { title: 'Legal', links: [{ href: '/privacy', label: 'Privacy' }, { href: '/terms', label: 'Terms' }] },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:grid-cols-[1.5fr_repeat(3,1fr)] sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-ink">
            <SynkroMark size={18} />
            <span className="font-display font-semibold tracking-wide">SYNKRO</span>
          </div>
          <p className="max-w-xs text-sm text-faint">{site.tagline}.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-ink">{col.title}</span>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="text-muted transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-content px-4 pb-10 text-xs text-faint sm:px-6">© {new Date().getFullYear()} Synkro</div>
    </footer>
  );
}
