import Link from 'next/link';
import { latestWindowsDownload } from '@/lib/latest-release';

// The Download links follow the latest release: re-checked at most every 10 minutes.
export const revalidate = 600;
import { FlutterLogo, ReactLogo } from '@/components/Logos';
import { Screenshot } from '@/components/Screenshot';
import { LiveDemo } from '@/components/home/LiveDemo';
import { Bento } from '@/components/home/Bento';
import { SpaceScene } from '@/components/home/SpaceScene';
import { RingedEarth } from '@/components/home/RingedEarth';
import { HomeMotion } from '@/components/home/HomeMotion';
import { Marquee } from '@/components/home/Marquee';
import { PlatformPicker } from '@/components/home/PlatformPicker';
import { site } from '@/lib/config';
import './home.css';

const marquee = ['Flutter', 'React Native', 'Expo', 'Dart', 'TypeScript', 'Hot reload', 'Device frames', 'Git', 'Integrated terminal', 'VS Code shortcuts', 'Tab completions', 'Ctrl+K edits'];

/** Where each step's node sits on the orbit curve (x, y as % of the 1200×260 drawing). */
const nodes = [['16.67%', '51.2%'], ['50%', '27.9%'], ['83.33%', '51.2%']];

const steps = [
  { n: '01', title: 'Describe it', text: 'Type what you want — a screen, a fix, a whole app. Attach files, errors or a screenshot with @.' },
  { n: '02', title: 'Watch it build', text: 'The agent edits your code and the phone preview updates as it goes. Every change is a diff you can keep or undo.' },
  { n: '03', title: 'Ship it', text: 'Run it on any device frame, commit from the side bar, and build your Android APK.' },
];

export default async function Home() {
  const windows = await latestWindowsDownload();
  return (
    <>
      <HomeMotion />

      {/* ── Hero: a 3D space scene, the headline bottom-left, the pitch bottom-right ── */}
      <section className="space-hero" aria-labelledby="hero-title">
        <div className="space-sky" aria-hidden="true" />
        {/* A still of the 3D scene: shown on weak devices, without WebGL, or when the scene is slow to start. */}
        <div className="space-poster" aria-hidden="true" />
        <SpaceScene />
        <div className="space-fade" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-left">
            <p className="hero-kicker">
              <span className="hero-pill-dot" />
              <FlutterLogo size={10} />
              <span>Flutter</span>
              <span className="hero-kicker-pill"><ReactLogo size={12} /> React Native</span>
            </p>
            <h1 id="hero-title" className="hero-display">
              <span className="line"><span>Build mobile apps</span></span>
              <span className="line"><span>with an AI that</span></span>
              <span className="line"><span><em>sees</em> your phone.</span></span>
            </h1>
          </div>

          <div className="hero-right">
            <div className="hero-card glass">
              <p className="hero-card-tag">
                <span className="hero-pill-dot" />
                Live phone preview
              </p>
              <p className="hero-card-lead">
                Describe a screen. <em>Watch it</em> come alive.
              </p>
              <p className="hero-card-text">
                Atomvs writes the code, shows every diff, and you watch the app change on a real device frame — all in one window.
              </p>
              <PlatformPicker windowsUrl={windows.url} />
            </div>
            <a href="#demo" className="scroll-cue">
              <span className="scroll-cue-ring" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 4.5 6 7.5l3-3" /></svg>
              </span>
              Scroll to begin
            </a>
          </div>
        </div>
      </section>

      {/* ── 01 · The workspace, live ─────────────────────────── */}
      <section id="demo" className="section demo-section scroll-mt-16">
        <div className="horizon" aria-hidden="true"><span /></div>
        <div className="wrap">
          <div className="section-head" data-split>
            <div>
              <p className="kicker"><span className="idx">01</span><span className="dot" />Live workspace</p>
              <h2 className="display section-title">Watch it <em>build,</em> line by line.</h2>
            </div>
            <p className="lead">The agent reads your project, plans, and writes the screen — and the phone preview fills in as the code lands. Every change is a diff you can keep or undo.</p>
          </div>
          <div className="hero-stage mx-auto max-w-[1180px]">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────────────────── */}
      <Marquee items={marquee} />

      {/* ── 02 · Features ────────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <div className="section-head" data-split>
            <div>
              <p className="kicker"><span className="idx">02</span><span className="dot" />One window</p>
              <h2 className="display section-title">Code, phone and AI — <em>side by side.</em></h2>
            </div>
            <p className="lead">No copying code between a chat tab and your editor. No guessing what changed. Everything you need to ship a mobile app, in one place.</p>
          </div>
          <Bento />
        </div>
      </section>

      {/* ── 03 · How it works: a comet travels an orbit through the three steps ── */}
      <section className="section orbit-section">
        <div className="wrap">
          <div className="section-head" data-split>
            <div>
              <p className="kicker"><span className="idx">03</span><span className="dot" />How it works</p>
              <h2 className="display section-title">From a sentence to a <em>running app.</em></h2>
            </div>
            <p className="lead">Three steps, one window, no setup. Describe it, watch it build, ship it.</p>
          </div>

          <div className="orbit">
            <div className="orbit-canvas" aria-hidden="true">
              <svg viewBox="0 0 1200 260" className="orbit-svg">
                <defs>
                  <linearGradient id="orbit-grad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#7c83ff" />
                    <stop offset=".5" stopColor="#47c5fb" />
                    <stop offset="1" stopColor="#f0abfc" />
                  </linearGradient>
                  <radialGradient id="comet-grad">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset=".35" stopColor="#c7c9ff" stopOpacity=".85" />
                    <stop offset="1" stopColor="#7c83ff" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path className="orbit-track" d="M 0 230 C 300 20, 900 20, 1200 230" />
                <path id="orbit-path" className="orbit-line" d="M 0 230 C 300 20, 900 20, 1200 230" />
                <circle className="orbit-comet" r="22" cx="0" cy="230" fill="url(#comet-grad)" />
              </svg>
              {nodes.map((n, i) => (
                <span key={i} className="orbit-node" data-node={i} style={{ left: n[0], top: n[1] }} />
              ))}
            </div>
            <div className="orbit-steps">
              {steps.map((s, i) => (
                <div key={s.n} className="step" data-step={i} data-reveal style={{ transitionDelay: `${i * 120}ms` }}>
                  <span className="step-n">{s.n}</span>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-text">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · New project ─────────────────────────────────── */}
      <section className="section">
        <div className="wrap grid items-center gap-14 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6" data-split>
            <p className="kicker"><span className="idx">04</span><span className="dot" />New project</p>
            <h2 className="display display-md section-title">Pick a framework. <em>Start building.</em></h2>
            <p className="lead">Flutter or React Native, from a template or from a sentence. Managed mode runs the toolchain for you — nothing to install first.</p>
            <ul className="spec-list" data-split-rest>
              <li><span>Frameworks</span>Flutter · React Native · Expo</li>
              <li><span>Toolchain</span>Managed, or your local CLI</li>
              <li><span>Start from</span>A template, a repo, or a sentence</li>
            </ul>
          </div>
          <div className="shot-stage">
            <div className="tilt" data-reveal>
              <Screenshot src="/screens/new-project.png" alt="The New Project dialog in Atomvs with Flutter selected, toolchain options and templates" />
            </div>
            <span className="chip glass chip-a" data-speed="-70"><i className="chip-dot" />Flutter 3.24 ready</span>
            <span className="chip glass chip-b" data-speed="50">Hot reload · 412 ms</span>
            <span className="chip glass chip-c" data-speed="-35">Managed toolchain ✓</span>
          </div>
        </div>
      </section>

      {/* ── CTA: Earth wearing Saturn's ring rises below the copy ── */}
      <section className="eclipse-section">
        <div className="planet-stage" aria-hidden="true">
          <RingedEarth />
        </div>
        <div className="wrap eclipse-content" data-split>
          <p className="kicker"><span className="dot" />Free to start</p>
          <h2 className="display section-title">Your next app starts with <em>one sentence.</em></h2>
          <p className="lead">Free to start. Upgrade when you build every day.</p>
          <div className="flex flex-wrap justify-center gap-3" data-split-rest>
            <a href={windows.url} className="btn-shine press"><span>Download for Windows</span></a>
            <Link href="/docs" className="btn-ghost press">Read the docs</Link>
          </div>
        </div>
      </section>
    </>
  );
}
