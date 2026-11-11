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

/**
 * Runs before first paint: marks weak devices with html.lowfx so they get the light experience
 * (static poster instead of the 3D scenes, no backdrop blur). Weak = software WebGL or a GPU the
 * browser flags as slow (failIfMajorPerformanceCaveat), <= 2 GB memory (Chromium only), or Save-Data.
 * Core counts are not used: Safari reports them unreliably. It also adds html.webkit on Safari and
 * every iOS browser, where 3D CSS transforms are flattened (WebKit draws the fixed page background
 * over any part of a 3D-tilted element that falls behind the page plane). `?lowfx=1` forces light mode,
 * `?fx=full` and `?poster=...` (poster capture) skip the check.
 */
const LOWFX_SCRIPT = `(function(){try{var d=document.documentElement,n=navigator,q=location.search,w=/[?&]lowfx=1/.test(q),u=n.userAgent;
if(/AppleWebKit/.test(u)&&!/(Chrome|Chromium|Edg|OPR)\\//.test(u))d.classList.add('webkit');
if(/[?&](poster=|fx=full)/.test(q))return;
if(n.connection&&n.connection.saveData)w=true;
if(n.deviceMemory&&n.deviceMemory<=2)w=true;
if(!w){var c=document.createElement('canvas'),o={failIfMajorPerformanceCaveat:true},g=c.getContext('webgl2',o)||c.getContext('webgl',o);
if(!g){w=true}else{var e=g.getExtension('WEBGL_debug_renderer_info'),r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'';
if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r))w=true;var l=g.getExtension('WEBGL_lose_context');if(l)l.loseContext();}}
if(w)d.classList.add('lowfx');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script may add "lowfx" to <html> before React hydrates.
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOWFX_SCRIPT }} />
      </head>
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
