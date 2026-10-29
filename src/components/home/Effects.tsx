'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Tracks the pointer inside the element as --mx / --my (used for spotlight gradients). */
export function Spotlight({ className = '', children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

/**
 * Fades [data-reveal] descendants in as they scroll into view. Content is fully visible
 * without JavaScript; the animation only arms once this runs (html.reveal-ready).
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    // Anything already on screen stays put; only content below the fold animates in.
    for (const el of items) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-revealed');
    }
    root.classList.add('reveal-ready');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

/** A card whose border lights up under the pointer. */
export function GlowCard({ className = '', children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onPointerMove={onMove} className={`glow-card ${className}`}>
      {children}
    </div>
  );
}
