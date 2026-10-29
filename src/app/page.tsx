import Link from 'next/link';
import { FlutterLogo, ReactLogo } from '@/components/Logos';
import { Screenshot } from '@/components/Screenshot';
import { LiveDemo } from '@/components/home/LiveDemo';
import { Bento } from '@/components/home/Bento';
import { RevealOnScroll, Spotlight } from '@/components/home/Effects';
import { site } from '@/lib/config';
import './home.css';

const marquee = ['Flutter', 'React Native', 'Expo', 'Dart', 'TypeScript', 'Hot reload', 'Device frames', 'Git', 'Integrated terminal', 'VS Code shortcuts', 'Tab completions', 'Ctrl+K edits'];

const steps = [
  { n: '01', title: 'Describe it', text: 'Type what you want — a screen, a fix, a whole app. Attach files, errors or a screenshot with @.' },
  { n: '02', title: 'Watch it build', text: 'The agent edits your code and the phone preview updates as it goes. Every change is a diff you can keep or undo.' },
  { n: '03', title: 'Ship it', text: 'Run it on any device frame, commit from the side bar, and build your Android APK.' },
];

const headline = ['Build', 'mobile', 'apps', 'with', 'an', 'AI', 'that'];

export default function Home() {
  return (
    <>
      <RevealOnScroll />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Spotlight className="hero">
        <div className="hero-aurora" aria-hidden="true">
          <span className="aurora a1" />
          <span className="aurora a2" />
          <span className="aurora a3" />
        </div>
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-spot" aria-hidden="true" />
        <div className="hero-noise" aria-hidden="true" />

        <div className="relative mx-auto flex max-w-content flex-col items-center gap-7 px-4 pb-10 pt-20 text-center sm:px-6 sm:pt-28">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            <FlutterLogo size={11} />
            <ReactLogo size={14} />
            <span>The AI editor for Flutter &amp; React Native</span>
          </div>

          <h1 className="hero-title">
            {headline.map((w, i) => (
              <span key={i} className="word" style={{ animationDelay: `${i * 70}ms` }}>{w}&nbsp;</span>
            ))}
            <span className="word shimmer" style={{ animationDelay: `${headline.length * 70}ms` }}>sees your phone</span>
          </h1>

          <p className="hero-sub">
            Describe a screen. Synkro writes the code, shows every diff, and you watch the app change on a real device frame — all in one window.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a href={site.downloadWindows} className="btn-shine">
              <span>Download for Windows</span>
            </a>
            <Link href="/pricing" className="btn-ghost">See pricing →</Link>
          </div>
          <p className="text-xs text-faint">Free to start · No credit card · macOS coming soon</p>
        </div>

        <div className="relative mx-auto max-w-[1180px] px-3 pb-24 sm:px-6">
          <LiveDemo />
        </div>
      </Spotlight>

      {/* ── Marquee ──────────────────────────────────────────── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="marquee-item">{m}<i>✦</i></span>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-4 py-28 sm:px-6">
        <div className="mb-12 flex flex-col gap-4" data-reveal>
          <span className="eyebrow">One window</span>
          <h2 className="section-title">Code, phone and AI —<br />side by side.</h2>
          <p className="max-w-xl text-muted">No copying code between a chat tab and your editor. No guessing what changed.</p>
        </div>
        <Bento />
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-line bg-panel/60 py-28">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="mb-14 flex flex-col gap-4" data-reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="section-title">From a sentence to a running app.</h2>
          </div>
          <div className="steps">
            <div className="steps-beam" aria-hidden="true"><span /></div>
            {steps.map((s, i) => (
              <div key={s.n} className="step" data-reveal style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="step-n">{s.n}</span>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real screenshot ──────────────────────────────────── */}
      <section className="mx-auto grid max-w-content items-center gap-12 px-4 py-28 sm:px-6 lg:grid-cols-[1fr_1.35fr]">
        <div className="flex flex-col gap-4" data-reveal>
          <span className="eyebrow">New project</span>
          <h2 className="section-title">Pick a framework.<br />Start building.</h2>
          <p className="text-muted">Flutter or React Native, from a template or from a sentence. Managed mode runs the toolchain for you — nothing to install first.</p>
        </div>
        <div className="tilt" data-reveal>
          <Screenshot src="/screens/new-project.png" alt="The New Project dialog in Synkro with Flutter selected, toolchain options and templates" />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-4 pb-10 sm:px-6">
        <div className="cta" data-reveal>
          <div className="cta-inner">
            <h2 className="section-title text-center">Your next app starts<br />with one sentence.</h2>
            <p className="max-w-md text-center text-muted">Free to start. Upgrade when you build every day.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={site.downloadWindows} className="btn-shine"><span>Download for Windows</span></a>
              <Link href="/docs" className="btn-ghost">Read the docs</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
