'use client';

import Link from 'next/link';
import { useState } from 'react';

type Platform = 'windows' | 'macos' | 'linux';

const icons: Record<Platform, JSX.Element> = {
  windows: (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M0 2.2 6.5 1.3v6.2H0zM7.3 1.2 16 0v7.5H7.3zM0 8.3h6.5v6.3L0 13.7zM7.3 8.3H16V16l-8.7-1.2z" />
    </svg>
  ),
  macos: (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.3 8.6c0-1.6 1.3-2.3 1.4-2.4-.8-1.1-1.9-1.3-2.3-1.3-1-.1-1.9.6-2.4.6s-1.3-.6-2.1-.5c-1.1 0-2.1.6-2.6 1.6-1.1 2-.3 4.9.8 6.4.5.8 1.2 1.6 2 1.6s1.1-.5 2.1-.5 1.2.5 2.1.5 1.4-.8 1.9-1.6c.6-.9.8-1.7.9-1.8 0 0-1.8-.7-1.8-2.6zM9.8 3.8c.4-.5.7-1.3.6-2-.6 0-1.4.4-1.8.9-.4.5-.8 1.2-.7 1.9.7.1 1.4-.3 1.9-.8z"
      />
    </svg>
  ),
  linux: (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1c-1.6 0-2.6 1.3-2.6 3.1 0 .9.2 1.5-.4 2.4-.9 1.3-2.1 2.9-2.1 4.9 0 .5.1 1 .3 1.4-.6.3-1 .7-.9 1.2.2.7 1.4.6 2.6.9 1 .3 1.6.6 2.2.1.4.2.6.2.9.2s.5 0 .9-.2c.6.5 1.2.2 2.2-.1 1.2-.3 2.4-.2 2.6-.9.1-.5-.3-.9-.9-1.2.2-.4.3-.9.3-1.4 0-2-1.2-3.6-2.1-4.9-.6-.9-.4-1.5-.4-2.4C10.6 2.3 9.6 1 8 1zm-1 2.6c.3 0 .5.3.5.7s-.2.7-.5.7-.5-.3-.5-.7.2-.7.5-.7zm2 0c.3 0 .5.3.5.7s-.2.7-.5.7-.5-.3-.5-.7.2-.7.5-.7zM8 5.4c.6 0 1.4.4 1.4.7 0 .3-.8.8-1.4.8s-1.4-.5-1.4-.8c0-.3.8-.7 1.4-.7z"
      />
    </svg>
  ),
};

const names: Record<Platform, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };

/**
 * The hero card's platform switch. Windows downloads today; macOS and Linux are shown so people
 * know they are coming — picking one swaps the download button for a "coming soon" note.
 */
export function PlatformPicker({ windowsUrl }: { windowsUrl: string }) {
  const [platform, setPlatform] = useState<Platform>('windows');
  const soon = platform !== 'windows';

  return (
    <div className="platform-picker">
      <div className="platform-tabs" role="radiogroup" aria-label="Choose your platform">
        {(Object.keys(names) as Platform[]).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={platform === p}
            className="platform-tab press"
            onClick={() => setPlatform(p)}
          >
            {icons[p]}
            <span>{names[p]}</span>
            {p !== 'windows' && <span className="platform-soon">Soon</span>}
          </button>
        ))}
      </div>

      <div className="hero-card-actions">
        {soon ? (
          <span key={platform} className="platform-coming btn-shine" aria-disabled="true">
            {icons[platform]}
            <span className="ml-2.5">{names[platform]} — coming soon</span>
          </span>
        ) : (
          <a key="windows" href={windowsUrl} className="btn-shine press platform-swap">
            <span className="relative z-[1] mr-2.5 inline-flex">{icons.windows}</span>
            <span>Download for Windows</span>
          </a>
        )}
        <Link href="/pricing" className="btn-ghost press">Pricing</Link>
      </div>

      <p className="hero-card-foot" aria-live="polite">
        {soon
          ? `We're building Atomvs for ${names[platform]}. Use Windows for now — your account carries over.`
          : 'Free to start · No credit card'}
      </p>
    </div>
  );
}
