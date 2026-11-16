'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The Atomvs atom drawn over the hero's static poster (the posters are captured without it, with
 * `?poster=hero&atom=0`). This is what weak devices (html.lowfx) and browsers without WebGL see, and
 * the stand-in while the 3D scene starts. Plain SVG animated with SMIL: no WebGL, no blur filters,
 * a few small shapes to repaint. Electrons orbit and the atom turns slowly; with reduced motion both
 * run at half speed. It pauses while hidden behind the running 3D scene or scrolled off screen.
 *
 * Units: 100 = the orbit's long radius. Proportions follow the 3D atom in SpaceScene.tsx
 * (orbit 2.6 × 0.95, nucleus 0.9, electron 0.1, orbits turned 0°, 60°, 120°).
 */

const ORBITS = [
  { angle: 0, color: '#9ea3ff', period: 7 },
  { angle: 60, color: '#47c5fb', period: 5.6 },
  { angle: 120, color: '#f0abfc', period: 4.7 },
];
const RY = 36.5;
const ORBIT_PATH = `M 100 0 A 100 ${RY} 0 1 1 -100 0 A 100 ${RY} 0 1 1 100 0`;

export function PosterAtom() {
  const svg = useRef<SVGSVGElement>(null);
  // Animations mount after hydration, at the speed this viewer prefers.
  const [speed, setSpeed] = useState<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSpeed(query.matches ? 0.5 : 1);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Pause while the live 3D scene covers the poster (.space-hero.is-live) or the hero is off screen.
  useEffect(() => {
    const el = svg.current;
    const hero = el?.closest('.space-hero');
    if (!el || !hero || speed === null) return;
    let onScreen = true;
    const sync = () => {
      const run = onScreen && !hero.classList.contains('is-live');
      if (run) el.unpauseAnimations();
      else el.pauseAnimations();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    const mo = new MutationObserver(sync);
    io.observe(el);
    mo.observe(hero, { attributes: true, attributeFilter: ['class'] });
    sync();
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [speed]);

  const s = speed ?? 1;
  return (
    <svg ref={svg} className="poster-atom" viewBox="-125 -125 250 250" aria-hidden="true">
      <defs>
        <radialGradient id="pa-nucleus" cx="50%" cy="50%" r="50%" fx="36%" fy="30%">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset=".3" stopColor="#d3d4ff" />
          <stop offset=".75" stopColor="#959bff" />
          <stop offset="1" stopColor="#7278ea" />
        </radialGradient>
        <radialGradient id="pa-glow">
          <stop offset="0" stopColor="#8b91ff" stopOpacity=".55" />
          <stop offset="1" stopColor="#8b91ff" stopOpacity="0" />
        </radialGradient>
        {ORBITS.map((o) => (
          <radialGradient key={o.color} id={`pa-e-${o.angle}`}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".3" stopColor={o.color} stopOpacity=".8" />
            <stop offset="1" stopColor={o.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      <circle r="78" fill="url(#pa-glow)">
        {speed !== null && <animate attributeName="opacity" values=".75;1;.75" dur={`${3 / s}s`} repeatCount="indefinite" />}
      </circle>

      <g>
        {speed !== null && (
          <animateTransform key={`turn-${s}`} attributeName="transform" type="rotate" from="0" to="360" dur={`${80 / s}s`} repeatCount="indefinite" />
        )}
        {ORBITS.map((o, i) => (
          <g key={o.angle} transform={`rotate(${o.angle})`}>
            <path d={ORBIT_PATH} fill="none" stroke="rgba(212,214,255,.62)" strokeWidth="1.8" />
            {/* animateMotion places the electron on the orbit; before it starts it sits behind the nucleus. */}
            <g>
              <circle r="12" fill={`url(#pa-e-${o.angle})`} />
              <circle r="3.8" fill="#fff" />
              {speed !== null && (
                <animateMotion key={`e-${s}`} path={ORBIT_PATH} dur={`${o.period / s}s`} begin={`-${(o.period / s) * (i / 3)}s`} repeatCount="indefinite" />
              )}
            </g>
          </g>
        ))}
      </g>

      <circle r="34.6" fill="url(#pa-nucleus)" />
      <ellipse cx="-11" cy="-14" rx="9" ry="5.5" fill="#fff" opacity=".55" transform="rotate(-30 -11 -14)" />
    </svg>
  );
}
