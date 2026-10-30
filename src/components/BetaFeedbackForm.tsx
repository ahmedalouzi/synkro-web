'use client';

import { useState } from 'react';
import { site } from '@/lib/config';

const worked = [
  ['preview', 'Live phone preview'],
  ['ai-edit', 'AI code edits (diff and apply)'],
  ['editor', 'Code editor'],
  ['git', 'Git integration'],
  ['terminal', 'Terminal'],
  ['diagnostics', 'Problems panel'],
  ['cloud-build', 'Cloud Build (APK)'],
  ['onboarding', 'Onboarding'],
] as const;

const pain = [
  ['preview-slow', 'Preview was too slow to start'],
  ['ai-wrong', 'AI produced incorrect code'],
  ['ai-slow', 'AI responses were too slow'],
  ['crash', 'The app crashed or froze'],
  ['build-failed', 'A Cloud Build failed'],
  ['sdk-setup', 'Flutter/React Native setup was painful'],
  ['missing-feature', 'Missing a feature I need daily'],
] as const;

const moods = ['😤', '😕', '😐', '🙂', '😄'];

function Rating({ values, labels, value, onChange, name }: {
  values: number[]; labels?: string[]; value: number | null; onChange: (v: number) => void; name: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={name}>
      {values.map((v, i) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`h-10 w-10 rounded-lg border text-sm font-semibold transition-colors ${value === v
            ? 'border-accent bg-accent/15 text-ink' : 'border-line-strong bg-base text-muted hover:border-accent/60'}`}>
          {labels ? labels[i] : v}
        </button>
      ))}
    </div>
  );
}

function Checks({ items, selected, toggle }: {
  items: readonly (readonly [string, string])[]; selected: string[]; toggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map(([id, label]) => (
        <label key={id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-ink hover:border-line-strong">
          <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} className="h-4 w-4 accent-[#7c83ff]" />
          {label}
        </label>
      ))}
    </div>
  );
}

const sectionTitle = 'mb-3 mt-8 border-b border-line pb-2 text-xs font-semibold uppercase tracking-wider text-faint';
const field = 'w-full rounded-lg border border-line-strong bg-base px-3 py-2 text-sm text-ink outline-none focus:border-accent';

/**
 * Weekly closed-beta survey. There is no feedback endpoint yet, so Send opens an email with the answers,
 * addressed to the support mailbox; nothing is stored by the site.
 */
export function BetaFeedbackForm({ week }: { week: number }) {
  const [nps, setNps] = useState<number | null>(null);
  const [csat, setCsat] = useState<number | null>(null);
  const [good, setGood] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const [ideas, setIdeas] = useState('');
  const [bugs, setBugs] = useState('');
  const [platform, setPlatform] = useState('');
  const [opened, setOpened] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void) => (id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const labelsOf = (items: readonly (readonly [string, string])[], ids: string[]) =>
    items.filter(([id]) => ids.includes(id)).map(([, label]) => label).join(', ') || '—';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Week: ${week}`,
      `Would recommend (0-10): ${nps ?? '—'}`,
      `Satisfaction (1-5): ${csat ?? '—'}`,
      `Worked well: ${labelsOf(worked, good)}`,
      `Frustrating: ${labelsOf(pain, bad)}`,
      `Platform: ${platform || '—'}`,
      '',
      'What would make Atomvs 10x better:',
      ideas || '—',
      '',
      'Bugs (steps to reproduce):',
      bugs || '—',
    ].join('\n');
    const subject = `Atomvs beta feedback — week ${week}`;
    window.location.href = `mailto:${site.feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line-strong bg-panel p-7 sm:p-9">
      <div className="text-xs font-semibold uppercase tracking-wider text-accent">Closed beta — week {week}</div>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Weekly feedback</h1>
      <p className="mt-2 text-sm text-muted">Takes 3 minutes. Your answers shape what we build next.</p>

      <div className={sectionTitle}>Overall</div>
      <p className="mb-3 text-sm text-muted">How likely are you to recommend Atomvs to another Flutter or React Native developer?</p>
      <Rating name="Recommend" values={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} value={nps} onChange={setNps} />
      <div className="mt-1.5 flex justify-between text-xs text-faint"><span>Not at all</span><span>Definitely</span></div>

      <div className={sectionTitle}>Satisfaction</div>
      <p className="mb-3 text-sm text-muted">How satisfied were you with Atomvs this week?</p>
      <Rating name="Satisfaction" values={[1, 2, 3, 4, 5]} labels={moods} value={csat} onChange={setCsat} />

      <div className={sectionTitle}>What worked well?</div>
      <Checks items={worked} selected={good} toggle={toggle(good, setGood)} />

      <div className={sectionTitle}>What frustrated you?</div>
      <Checks items={pain} selected={bad} toggle={toggle(bad, setBad)} />

      <div className={sectionTitle}>Open feedback</div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted">What would make Atomvs 10x better for you?</span>
        <textarea rows={4} value={ideas} onChange={(e) => setIdeas(e.target.value)} className={field} />
      </label>
      <label className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-muted">Bugs or unexpected behavior (steps to reproduce)</span>
        <textarea rows={3} value={bugs} onChange={(e) => setBugs(e.target.value)} className={field} />
      </label>

      <div className={sectionTitle}>Your week</div>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-muted">Which platform did you use?</span>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={field}>
          <option value="">Select…</option>
          <option value="Flutter">Flutter only</option>
          <option value="React Native / Expo">React Native / Expo only</option>
          <option value="Both">Both</option>
        </select>
      </label>

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-faint">Opens your email app with your answers, addressed to {site.feedbackEmail}.</p>
        <button type="submit" className="whitespace-nowrap rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90">
          Send by email →
        </button>
      </div>
      {opened && (
        <p role="status" className="mt-4 rounded-lg border border-line-strong bg-base px-3 py-2 text-sm text-muted">
          Your email app should now show the message. Press Send there to submit it. No email app? Copy your answers to {site.feedbackEmail}.
        </p>
      )}
    </form>
  );
}
