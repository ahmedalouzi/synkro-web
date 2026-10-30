'use client';

import { useState } from 'react';

/** Sign in or create an account — the same account as the desktop app. */
export function SignInForm({ onSignedIn }: { onSignedIn: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mode }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || 'Sign-in failed.');
      setPassword('');
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-line-strong bg-panel p-7">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">{mode === 'signin' ? 'Sign in to Atomvs' : 'Create your account'}</h1>
        <p className="text-sm text-muted">Use the same account as the desktop app.</p>
      </div>
      {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted">Email</span>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy}
          className="rounded-lg border border-line-strong bg-base px-3 py-2 text-ink outline-none focus:border-accent" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted">Password</span>
        <input id="password" type="password" required minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy}
          className="rounded-lg border border-line-strong bg-base px-3 py-2 text-ink outline-none focus:border-accent" />
      </label>
      <button type="submit" disabled={busy} className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60">
        {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === 'signin' ? 'New to Atomvs?' : 'Already have an account?'}{' '}
        <button type="button" className="text-accent underline underline-offset-4" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
          {mode === 'signin' ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </form>
  );
}
