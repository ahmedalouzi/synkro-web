import type { Config } from 'tailwindcss';

// Colors mirror the desktop app's palette so the site and the app feel like one product.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#09090b',
        panel: '#0f0f12',
        elevated: '#141418',
        hover: '#1c1c22',
        line: 'rgba(255,255,255,0.08)',
        'line-strong': 'rgba(255,255,255,0.14)',
        ink: '#e4e4e7',
        muted: '#a1a1aa',
        faint: '#71717a',
        accent: '#7c83ff',
        flutter: '#47C5FB',
        react: '#61DAFB',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Consolas', 'monospace'],
      },
      maxWidth: { content: '1120px' },
    },
  },
  plugins: [],
};

export default config;
