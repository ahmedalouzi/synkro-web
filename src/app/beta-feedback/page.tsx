import type { Metadata } from 'next';
import { BetaFeedbackForm } from '@/components/BetaFeedbackForm';

export const metadata: Metadata = { title: 'Beta feedback', robots: { index: false } };

/** The closed beta started on Sep 1, 2026; ?week=N overrides the computed week. */
const BETA_START = Date.parse('2026-09-01T00:00:00Z');

export default function BetaFeedbackPage({ searchParams }: { searchParams: { week?: string } }) {
  const fromUrl = Number.parseInt(searchParams.week ?? '', 10);
  const computed = Math.ceil((Date.now() - BETA_START) / (7 * 24 * 60 * 60 * 1000));
  const week = Math.max(1, Number.isFinite(fromUrl) ? fromUrl : computed);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <BetaFeedbackForm week={week} />
    </div>
  );
}
