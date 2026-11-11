'use client';

import { useState } from 'react';

/**
 * The scrolling ticker of supported tech. It runs for more than five seconds, so it has a
 * pause control (WCAG 2.2.2). It also pauses on hover and stops for reduced motion (CSS).
 */
export function Marquee({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="marquee" data-paused={paused || undefined}>
      <div className="marquee-skew">
        <div className="marquee-track" aria-hidden="true">
          {[...items, ...items].map((m, i) => (
            <span key={i} className={`marquee-item ${i % 2 ? 'is-serif' : ''}`}>
              {m}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="marquee-toggle press"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? 'Play the scrolling list' : 'Pause the scrolling list'}
      >
        {paused ? (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" /></svg>
        )}
      </button>
    </div>
  );
}
