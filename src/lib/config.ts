/** Site-wide settings. Public values come from NEXT_PUBLIC_* env vars (see .env.example), except the download URL. */
export const site = {
  name: 'Atomvs',
  tagline: 'The AI code editor for mobile apps',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.atomvs.com',
  /** The public repo the desktop app is released to (the source repo is private). */
  releasesRepo: 'ahmedalouzi/atomvs-releases',
  /**
   * Fallbacks only: the Download buttons use the latest release's installer, looked up by
   * latestWindowsDownload() (src/lib/latest-release.ts), and fall back to these when there is no published
   * release yet or GitHub cannot be reached. The releases list, not /releases/latest, which is a 404 until the
   * first release is published. Never the private source repo.
   */
  downloadWindows: 'https://github.com/ahmedalouzi/atomvs-releases/releases',
  windowsInstallerName: 'Atomvs-Setup-0.1.0.exe',
  /** Where /beta-feedback sends answers (by email; there is no feedback endpoint yet). */
  feedbackEmail: 'support@atomvs.com',
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
