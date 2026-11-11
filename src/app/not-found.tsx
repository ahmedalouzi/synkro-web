import Link from 'next/link';
import { PageHero } from '@/components/PageHero';

export default function NotFound() {
  return (
    <div className="wrap pb-32">
      <PageHero kicker="404" title={<>Lost in <em>space.</em></>} lead="This page doesn’t exist. The link may be old, or the page has moved.">
        <div>
          <Link href="/" className="btn-ghost press">Back to the home page</Link>
        </div>
      </PageHero>
    </div>
  );
}
