import type { Metadata } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { site } from '@/lib/config';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: 'Atomvs is a desktop code editor with an AI agent for building Flutter and React Native apps, with a live phone preview and one-click Android builds.',
  openGraph: { title: site.name, description: site.tagline, images: ['/screens/workspace.png'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans text-ink">
        <div className="ambient" aria-hidden="true"><span className="b1" /><span className="b2" /><span className="b3" /></div>
        <Header />
        {/* pt-16 clears the fixed header; the home hero pulls itself back up under it. */}
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
