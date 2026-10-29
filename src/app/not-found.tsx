import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-32 text-center sm:px-6">
      <p className="font-mono text-sm text-faint">404</p>
      <h1 className="font-display text-3xl font-semibold">This page doesn’t exist</h1>
      <p className="text-muted">The link may be old, or the page has moved.</p>
      <Link href="/" className="rounded-lg border border-line-strong px-4 py-2 text-sm hover:bg-hover">Go to the home page</Link>
    </div>
  );
}
