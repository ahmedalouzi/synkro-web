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

export type PlanId = 'free' | 'pro' | 'pro_plus';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** US$ per month, billed monthly. */
  monthly: number;
  /** US$ per year, billed yearly (two months free); null for Free. */
  yearly: number | null;
  /** AI credits included each month. */
  credits: number;
  /** Roughly how many apps those credits build. */
  apps: string;
  models: string;
  /** Cloud Android builds per day. */
  apkPerDay: number;
  /** 0 = standard queue, 1 = priority, 2 = top priority. */
  priority: 0 | 1 | 2;
  whenOut: string;
  /** Apps built on this plan show the "Made with Atomvs" badge. */
  badge: boolean;
  /** Which planet the card wears (public/textures/planets). */
  planet: 'moon' | 'saturn' | 'jupiter';
  highlight?: 'popular' | 'max';
}

/**
 * The plan policy shown on /pricing. It must match the server's plan policy
 * (packages/agent/src/models/usage-limits.ts in the Synkro repo) and the Terms — keep them in sync.
 */
export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everything you need to build your first apps.',
    monthly: 0,
    yearly: null,
    credits: 150,
    apps: '3–4 apps',
    models: 'Fast model',
    apkPerDay: 3,
    priority: 0,
    whenOut: 'Pauses until your credits refresh',
    badge: true,
    planet: 'moon',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For people who build every day.',
    monthly: 20,
    yearly: 200,
    credits: 4000,
    apps: '100 apps',
    models: 'Every model',
    apkPerDay: 15,
    priority: 1,
    whenOut: 'Keeps going on the fast model',
    badge: false,
    planet: 'saturn',
    highlight: 'popular',
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    tagline: 'Maximum power for teams and serious builders.',
    monthly: 50,
    yearly: 500,
    credits: 12000,
    apps: '300 apps',
    models: 'Every model, strongest first',
    apkPerDay: 30,
    priority: 2,
    whenOut: 'Keeps going on the fast model',
    badge: false,
    planet: 'jupiter',
    highlight: 'max',
  },
];

export const nav = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/download', label: 'Download' },
];
