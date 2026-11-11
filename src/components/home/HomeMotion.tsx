'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Scroll-driven motion for the home page (GSAP + ScrollTrigger + SplitText).
 *
 * Progressive: without JavaScript every section renders in its finished state.
 * Tiered on prefers-reduced-motion (gsap.matchMedia reacts to live OS changes):
 *  - full motion: masked heading reveals, the comet orbit, a rising horizon, parallax chips,
 *    a scroll-velocity skew on the ticker, the eclipse growing into view;
 *  - reduced: no movement — short (≤200ms) fades and final states only.
 * Only transform, opacity and SVG stroke offsets animate. useGSAP reverts everything on unmount.
 */
export function HomeMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      { motionOK: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { motionOK } = ctx.conditions as { motionOK: boolean; reduce: boolean };
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
        const nodes = gsap.utils.toArray<HTMLElement>('[data-node]');
        const lightAll = () => [...steps, ...nodes].forEach((s) => s.classList.add('is-lit'));
        const path = document.querySelector<SVGPathElement>('#orbit-path');

        if (!motionOK) {
          // Tier 2: headings fade in briefly; Tier 1 (3D, scrubs, parallax) is dropped.
          gsap.set('[data-split]', { autoAlpha: 0 });
          ScrollTrigger.batch('[data-split]', {
            start: 'top 85%',
            once: true,
            onEnter: (els) => gsap.to(els, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' }),
          });
          lightAll();
          return () => [...steps, ...nodes].forEach((s) => s.classList.remove('is-lit'));
        }

        // 0. Hero copy lifts away as the camera sinks into the fog.
        gsap.to('.hero-content', {
          y: -90,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.space-hero', start: 'top top', end: 'bottom 35%', scrub: 0.4 },
        });

        // 1. Section headings: masked line-by-line rise; kicker, lead and extras follow.
        gsap.utils.toArray<HTMLElement>('[data-split]').forEach((block) => {
          const title = block.querySelector<HTMLElement>('.section-title');
          const rest = block.querySelectorAll('.kicker, .lead, [data-split-rest]');
          const trigger = { trigger: block, start: 'top 82%', once: true };
          if (title) {
            SplitText.create(title, {
              type: 'lines',
              mask: 'lines',
              autoSplit: true, // re-split after web fonts load and on resize
              onSplit: (self) =>
                gsap.from(self.lines, { yPercent: 115, duration: 1.05, ease: 'power4.out', stagger: 0.1, scrollTrigger: trigger }),
            });
          }
          if (rest.length) {
            gsap.from(rest, { autoAlpha: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.09, delay: 0.15, scrollTrigger: trigger });
          }
        });

        // 2. Demo: a planet's glowing horizon rises behind it; the workspace tips forward to flat.
        gsap.fromTo('.horizon', { yPercent: 14 }, {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: '.demo-section', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
        // WebKit (html.webkit) gets 2D versions of the 3D scrubs (see layout.tsx).
        const webkit = document.documentElement.classList.contains('webkit');
        gsap.fromTo(
          '.hero-stage',
          webkit
            ? { y: 70, scale: 0.92, transformOrigin: '50% 0%' }
            : { rotateX: 16, scale: 0.92, transformPerspective: 1800, transformOrigin: '50% 0%' },
          { ...(webkit ? { y: 0 } : { rotateX: 0 }), scale: 1, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top 95%', end: 'top 25%', scrub: 0.6 } },
        );

        // 3. Ticker: skews with scroll velocity, then springs back.
        const skewTo = gsap.quickTo('.marquee-skew', 'skewX', { duration: 0.5, ease: 'power3' });
        ScrollTrigger.create({
          trigger: '.marquee',
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => skewTo(gsap.utils.clamp(-14, 14, self.getVelocity() / -260)),
        });

        // 4. How it works: the orbit draws itself, a comet rides it, steps light up as it passes.
        if (path) {
          const len = path.getTotalLength();
          const comet = document.querySelector<SVGCircleElement>('.orbit-comet');
          const xs = [200, 600, 1000]; // node x positions in the drawing
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          const prog = { p: 0 };
          gsap.to(prog, {
            p: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.orbit', start: 'top 78%', end: 'bottom 55%', scrub: 0.6 },
            onUpdate: () => {
              path.style.strokeDashoffset = String(len * (1 - prog.p));
              const pt = path.getPointAtLength(len * prog.p);
              if (comet) {
                comet.setAttribute('cx', String(pt.x));
                comet.setAttribute('cy', String(pt.y));
                comet.style.opacity = prog.p > 0.005 && prog.p < 0.995 ? '1' : '0';
              }
              xs.forEach((x, i) => {
                const on = pt.x >= x - 4;
                nodes[i]?.classList.toggle('is-lit', on);
                steps[i]?.classList.toggle('is-lit', on);
              });
            },
          });
        }
        // Small screens have no orbit drawing: light each step as it scrolls in.
        if (window.matchMedia('(max-width: 767px)').matches) {
          steps.forEach((step) =>
            ScrollTrigger.create({
              trigger: step,
              start: 'top 70%',
              onEnter: () => step.classList.add('is-lit'),
              onLeaveBack: () => step.classList.remove('is-lit'),
            }),
          );
        }

        // 5. New project: the screenshot straightens; glass chips float at their own depths.
        gsap.set('.tilt > figure', { transition: 'none' }); // CSS transition would lag the scrub
        gsap.fromTo(
          '.tilt > figure',
          webkit ? { y: 60, scale: 0.94 } : { rotateY: -14, rotateX: 7, transformPerspective: 1400 },
          { ...(webkit ? { y: 0, scale: 1 } : { rotateY: 0, rotateX: 0 }), ease: 'none', scrollTrigger: { trigger: '.tilt', start: 'top 90%', end: 'center 55%', scrub: 0.6 } },
        );
        gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((chip) => {
          gsap.fromTo(chip, { y: 0, autoAlpha: 0 }, {
            y: Number(chip.dataset.speed),
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.shot-stage', start: 'top 85%', end: 'bottom 20%', scrub: 0.8 },
          });
        });

        // 6. CTA: the ringed Earth rises from below and grows into view.
        gsap.fromTo('.planet-stage', { scale: 0.82, yPercent: 22, autoAlpha: 0.3 }, {
          scale: 1,
          yPercent: 0,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.eclipse-section', start: 'top bottom', end: 'center 55%', scrub: 0.7 },
        });

        return () => [...steps, ...nodes].forEach((s) => s.classList.remove('is-lit'));
      },
    );

    return () => mm.revert();
  });

  return null;
}
