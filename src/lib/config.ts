/** Site-wide settings. Public values come from NEXT_PUBLIC_* env vars (see .env.example). */
export const site = {
  name: 'Synkro',
  tagline: 'The AI code editor for mobile apps',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  downloadWindows: process.env.NEXT_PUBLIC_DOWNLOAD_URL_WINDOWS || 'https://github.com/ahmedalouzi/synkro/releases/latest',
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL || '',
  billingPortalUrl: process.env.NEXT_PUBLIC_BILLING_PORTAL_URL || '',
};

export interface Plan {
  id: 'free' | 'pro';
  name: string;
  price: string;
  period: string;
  summary: string;
  features: string[];
}

/**
 * Mirrors the server's plan policy (packages/agent/src/models/usage-limits.ts in the Synkro repo).
 * Keep the two in sync when limits change.
 */
export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    summary: 'Everything you need to build your first apps.',
    features: [
      'Flutter & React Native projects',
      'Live phone preview with real device frames',
      'AI agent, chat and inline edits (Ctrl+K)',
      'Included AI usage that refreshes every week',
      '2,000 Tab completions per month',
      'Auto model selection',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$20',
    period: 'per month',
    summary: 'For people who build every day.',
    features: [
      'Everything in Free',
      '10× the weekly AI usage',
      'Unlimited Tab completions',
      'Choose premium models',
      'Keeps working on a fast model when your weekly usage runs out',
      'Priority support',
    ],
  },
];

export const nav = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/download', label: 'Download' },
];
