/** Synkro mark — the same orbit logo as the desktop app. */
export function SynkroMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <ellipse cx="16" cy="16" rx="5" ry="11" />
        <ellipse cx="16" cy="16" rx="5" ry="11" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="5" ry="11" transform="rotate(120 16 16)" />
      </g>
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** The official Flutter mark. */
export function FlutterLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size * (317 / 256)} viewBox="0 0 256 317" aria-label="Flutter" role="img">
      <path fill="#47C5FB" d="M157.666.001L.001 157.666l48.8 48.8L255.268.001z" />
      <path fill="#47C5FB" d="M156.567 145.397L72.15 229.815l48.982 49.716 48.708-48.708 85.428-85.427z" />
      <path fill="#00569E" d="M121.133 279.531l37.082 37.082h97.052l-85.428-85.428z" />
      <path fill="#00B5F8" d="M71.6 230.364l48.8-48.8 49.441 49.258-48.708 48.709z" />
    </svg>
  );
}

/** The official React mark. */
export function ReactLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size * (20.46 / 23)} viewBox="-11.5 -10.23 23 20.46" aria-label="React Native" role="img">
      <circle r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}
