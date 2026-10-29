'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import './live-demo.css';

/**
 * The hero centerpiece: a faithful replica of the Synkro workspace (explorer, editor, Expo
 * preview, terminal and agent chat). The agent reads the project, streams its plan, writes
 * the screen line by line, and the phone fills in as the code lands. Loops; shows the
 * finished state for viewers who prefer reduced motion.
 */

const CODE = [
  "import { View, Text, SectionList } from 'react-native';",
  "import { useSchedule } from '@/context/ScheduleContext';",
  "import { ClassCard } from '@/components/ClassCard';",
  "import { AddButton } from '@/components/AddButton';",
  "",
  "export default function ClassesScreen() {",
  "  const { classes, remove } = useSchedule();",
  "  const sections = groupByDay(classes);",
  "",
  "  return (",
  "    <View style={styles.screen}>",
  "      <View style={styles.header}>",
  "        <Text style={styles.title}>Classes</Text>",
  "        <AddButton href=\"/add-class\" />",
  "      </View>",
  "      <SectionList",
  "        sections={sections}",
  "        renderSectionHeader={({ section }) => (",
  "          <Text style={styles.day}>{section.day}</Text>",
  "        )}",
  "        renderItem={({ item }) => (",
  "          <ClassCard",
  "            {...item}",
  "            onDelete={() => remove(item.id)}",
  "          />",
  "        )}",
  "      />",
  "    </View>",
  "  );",
  "}",
];

// Lines that must be fully typed before each part of the phone UI appears.
const REVEAL_AT = { header: 13, add: 14, days: 19, cards: 25 } as const;

const PROMPT = 'Build the Classes tab: group my classes by weekday, with edit and delete on each card.';
const PLAN = "I'll add app/(tabs)/classes.tsx, reuse ScheduleContext for the data and the existing ClassCard, and group the list by weekday.";
const DONE = 'Done. The Classes tab is live on iPhone 15 — tap + to add a class.';

// Timeline (ms from the start of each loop).
const T = {
  thinking: 500,
  steps: [1500, 2100, 2700],
  plan: 3200,
  code: 5600,
};
const PLAN_MS = 16;
const CHAR_MS = 9;
const TOTAL = CODE.reduce((n, l) => n + l.length + 1, 0);
const CODE_END = T.code + TOTAL * CHAR_MS;
const RELOAD = CODE_END + 300;
const RELOADED = CODE_END + 1000;
const KEEP = RELOADED + 2600;
const LOOP = KEEP + 3600;
const FINAL = LOOP - 1;

const LINE_H = 20;
const VISIBLE_LINES = 17;

const STEPS = [
  { at: T.steps[0], text: 'Read', target: 'app/(tabs)/_layout.tsx' },
  { at: T.steps[1], text: 'Searched', target: '“useSchedule”' },
  { at: T.steps[2], text: 'Read', target: 'context/ScheduleContext.tsx' },
];

const CLASSES = [
  { day: 'MONDAY', items: [
    { name: 'Mathematics', room: 'Room 101', time: '8:00 AM – 9:00 AM', color: '#3b82f6' },
    { name: 'Science', room: 'Room 310', time: '11:00 AM – 12:00 PM', color: '#22c55e' },
  ] },
  { day: 'TUESDAY', items: [
    { name: 'English', room: 'Room 205', time: '9:30 AM – 10:30 AM', color: '#a855f7' },
    { name: 'Physical Education', room: 'Gymnasium', time: '2:30 PM – 4:00 PM', color: '#ef4444' },
  ] },
  { day: 'WEDNESDAY', items: [
    { name: 'History', room: 'Room 140', time: '10:00 AM – 11:00 AM', color: '#f97316' },
  ] },
];

function highlight(line: string) {
  const parts: { text: string; cls: string }[] = [];
  const re = /('[^']*'?|"[^"]*"?)|\b(import|from|export|default|function|const|return)\b|(<\/?[A-Z]\w*)|\b([A-Z]\w*)\b|([a-zA-Z_]\w*)(?==)|([a-zA-Z_]\w*)(?=\()/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index), cls: 'tk-plain' });
    const cls = m[1] ? 'tk-str' : m[2] ? 'tk-kw' : m[3] ? 'tk-tag' : m[4] ? 'tk-type' : m[5] ? 'tk-prop' : 'tk-fn';
    parts.push({ text: m[0], cls });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), cls: 'tk-plain' });
  return parts;
}

/** Full lines typed after `chars` characters. */
function linesTyped(chars: number) {
  let left = chars;
  let lines = 0;
  for (const l of CODE) {
    if (left < l.length + 1) break;
    left -= l.length + 1;
    lines++;
  }
  return lines;
}

function Icon({ d, size = 14, className = '' }: { d: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  files: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v5h6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  git: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  run: 'M7 4l13 8-13 8z',
  ext: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  check: 'M20 6 9 17l-5-5',
  chevron: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  pencil: 'M17 3l4 4L8 20H4v-4z',
  trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  plus: 'M12 5v14M5 12h14',
  calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  up: 'M12 19V5M5 12l7-7 7 7',
  image: 'M3 3h18v18H3zM21 15l-5-5L5 21',
  refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  inspect: 'M3 3l7 18 2.5-7.5L20 11z',
  panelLeft: 'M3 3h18v18H3zM9 3v18',
  panelBottom: 'M3 3h18v18H3zM3 15h18',
  phone: 'M7 2h10v20H7zM11 18h2',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9z',
};

function SynkroMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <ellipse cx="16" cy="16" rx="5" ry="11" />
        <ellipse cx="16" cy="16" rx="5" ry="11" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="5" ry="11" transform="rotate(120 16 16)" />
      </g>
    </svg>
  );
}

function ReactIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-11.5 -10.2 23 20.5" aria-hidden="true">
      <circle r="2.05" fill="#61dafb" />
      <g stroke="#61dafb" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

type TreeRow = { name: string; depth: number; kind: 'dir' | 'tsx' | 'ts' | 'json'; open?: boolean; isNew?: boolean };
const TREE: TreeRow[] = [
  { name: 'app', depth: 0, kind: 'dir', open: true },
  { name: '(tabs)', depth: 1, kind: 'dir', open: true },
  { name: '_layout.tsx', depth: 2, kind: 'tsx' },
  { name: 'index.tsx', depth: 2, kind: 'tsx' },
  { name: 'timetable.tsx', depth: 2, kind: 'tsx' },
  { name: 'classes.tsx', depth: 2, kind: 'tsx', isNew: true },
  { name: '+not-found.tsx', depth: 1, kind: 'tsx' },
  { name: 'add-class.tsx', depth: 1, kind: 'tsx' },
  { name: 'components', depth: 0, kind: 'dir', open: true },
  { name: 'AddButton.tsx', depth: 1, kind: 'tsx' },
  { name: 'ClassCard.tsx', depth: 1, kind: 'tsx' },
  { name: 'context', depth: 0, kind: 'dir', open: true },
  { name: 'ScheduleContext.tsx', depth: 1, kind: 'tsx' },
  { name: 'hooks', depth: 0, kind: 'dir' },
  { name: 'app.json', depth: 0, kind: 'json' },
  { name: 'package.json', depth: 0, kind: 'json' },
  { name: 'tsconfig.json', depth: 0, kind: 'json' },
];

function Explorer({ created }: { created: boolean }) {
  return (
    <aside className="ld-explorer">
      <div className="ld-explorer__head">EXPLORER</div>
      <div className="ld-explorer__filter">Filter files…</div>
      <div className="ld-explorer__root">SCHOOL-PLANNER</div>
      {TREE.map((r) => {
        if (r.isNew && !created) return null;
        return (
          <div key={r.name} className={`ld-tree ${r.isNew ? 'ld-tree--new is-active' : ''}`} style={{ paddingLeft: 10 + r.depth * 12 }}>
            {r.kind === 'dir' ? (
              <>
                <Icon d={r.open ? ICONS.chevronDown : ICONS.chevron} size={10} className="ld-tree__chev" />
                <Icon d={ICONS.folder} size={12} className="ld-tree__folder" />
              </>
            ) : r.kind === 'tsx' ? (
              <span className="ld-tree__file"><ReactIcon size={12} /></span>
            ) : (
              <span className="ld-tree__file ld-tree__json">{'{}'}</span>
            )}
            <span className="ld-tree__name">{r.name}</span>
            {r.isNew && <span className="ld-tree__badge">U</span>}
          </div>
        );
      })}
    </aside>
  );
}

function Phone({ done, reloaded }: { done: number; reloaded: boolean }) {
  const show = (k: keyof typeof REVEAL_AT) => done >= REVEAL_AT[k];
  let card = 0;
  return (
    <div className={`ld-phone ${reloaded ? 'is-reloaded' : ''}`}>
      <div className="ld-phone__island" />
      <div className="ld-screen">
        <div className="ld-status"><span>9:41</span><span className="ld-status__bars" /></div>
        <div className={`ld-app-head ${show('header') ? 'is-in' : ''}`}>
          <span className="ld-app-title">Classes</span>
          <span className={`ld-app-add ${show('add') ? 'is-in' : ''}`}><Icon d={ICONS.plus} size={12} /></span>
        </div>
        {!show('header') && <div className="ld-app-empty">Nothing here yet</div>}
        <div className="ld-app-list">
          {CLASSES.map((section) => (
            <div key={section.day}>
              <div className={`ld-app-day ${show('days') ? 'is-in' : ''}`}>{section.day}</div>
              {section.items.map((c) => {
                const i = card++;
                return (
                  <div key={c.name} className={`ld-app-card ${show('cards') ? 'is-in' : ''}`} style={{ transitionDelay: show('cards') ? `${i * 110}ms` : '0ms' }}>
                    <span className="ld-app-icon" style={{ background: c.color }}><Icon d={ICONS.book} size={11} /></span>
                    <span className="ld-app-text">
                      <b>{c.name}</b>
                      <span>{c.room}</span>
                      <span>{c.time}</span>
                    </span>
                    <Icon d={ICONS.pencil} size={10} className="ld-app-edit" />
                    <Icon d={ICONS.trash} size={10} className="ld-app-del" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="ld-app-tabs">
          <span><Icon d={ICONS.calendar} size={13} />Today</span>
          <span><Icon d={ICONS.grid} size={13} />Timetable</span>
          <span className="is-active"><Icon d={ICONS.book} size={13} />Classes</span>
        </div>
        <div className="ld-sweep" />
      </div>
    </div>
  );
}

function Typed({ text, start, t, ms }: { text: string; start: number; t: number; ms: number }) {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - start) / ms)));
  const streaming = n > 0 && n < text.length;
  return (
    <>
      {text.slice(0, n)}
      {streaming && <span className="ld-stream-caret" />}
    </>
  );
}

function Chat({ t, done }: { t: number; done: number }) {
  const typing = t >= T.code && t < CODE_END;
  const running = t < RELOADED;
  const kept = t >= KEEP;
  return (
    <aside className="ld-chat">
      <div className="ld-chat__tabs">
        <span className="ld-chat__tab">Build the Classes tab<span className="ld-x">×</span></span>
        <span className="ld-chat__tools"><Icon d={ICONS.plus} size={12} /><Icon d={ICONS.history} size={12} /></span>
      </div>

      <div className="ld-chat__scroll">
        <div className="ld-user">{PROMPT}</div>

        {t >= T.thinking && t < T.steps[0] && <div className="ld-thinking">Thinking</div>}
        {t >= T.steps[0] && <div className="ld-thought">Thought for 1s</div>}

        <div className="ld-steps">
          {STEPS.map((s) => (
            <div key={s.target} className={`ld-step ${t >= s.at ? 'is-in' : ''}`}>
              <Icon d={s.text === 'Searched' ? ICONS.search : ICONS.files} size={11} />
              <span>{s.text}</span>
              <span className="ld-step__target">{s.target}</span>
            </div>
          ))}
        </div>

        {t >= T.plan && <p className="ld-answer"><Typed text={PLAN} start={T.plan} t={t} ms={PLAN_MS} /></p>}

        {t >= T.code && (
          <div className={`ld-edit ${typing ? 'is-writing' : ''} ${kept ? 'is-kept' : ''}`}>
            <div className="ld-edit__head">
              <ReactIcon size={12} />
              <span className="ld-edit__name">classes.tsx</span>
              <span className="ld-edit__add">+{done}</span>
              <span className="ld-edit__state">{typing ? 'Writing…' : kept ? 'Kept' : 'Ready to review'}</span>
            </div>
            <div className="ld-edit__bar"><span style={{ width: `${(done / CODE.length) * 100}%` }} /></div>
            {!typing && (
              <div className="ld-edit__actions">
                <span className="ld-btn">Undo</span>
                <span className="ld-btn ld-btn--primary">{kept ? <><Icon d={ICONS.check} size={10} /> Kept</> : 'Keep'}</span>
                <span className="ld-btn">Review</span>
                {t >= KEEP - 1400 && !kept && <span className="ld-pointer" />}
              </div>
            )}
          </div>
        )}

        {t >= RELOADED && (
          <>
            <div className="ld-step is-in is-ok"><Icon d={ICONS.zap} size={11} /><span>Fast Refresh</span><span className="ld-step__target">412 ms · iPhone 15</span></div>
            <p className="ld-answer"><Typed text={DONE} start={RELOADED + 200} t={t} ms={PLAN_MS} /></p>
          </>
        )}
      </div>

      <div className={`ld-composer ${running ? 'is-running' : ''}`}>
        <span className="ld-chip"><ReactIcon size={10} /> classes.tsx</span>
        <span className="ld-composer__ph">Plan, build, @ for context</span>
        <div className="ld-composer__row">
          <span className="ld-model">Auto <Icon d={ICONS.chevronDown} size={9} /></span>
          <span className="ld-composer__icons">
            <Icon d={ICONS.image} size={12} />
            <span className="ld-send">{running ? <span className="ld-stop" /> : <Icon d={ICONS.up} size={11} />}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

function Terminal({ t }: { t: number }) {
  const lines: ReactNode[] = [
    <><span className="ld-term-dim">$</span> npx expo start</>,
    <><span className="ld-term-acc">›</span> Metro waiting on <u>exp://192.168.1.24:8081</u></>,
    <><span className="ld-term-acc">›</span> Opened on <b>iPhone 15</b> · Expo Go</>,
  ];
  if (t >= T.code) lines.push(<><span className="ld-term-dim">›</span> Watching app/(tabs)/classes.tsx</>);
  if (t >= RELOAD) lines.push(<><span className="ld-term-acc">›</span> Reloading apps</>);
  if (t >= RELOADED) lines.push(<><span className="ld-term-ok">✓ iOS Bundled 412ms</span> app/(tabs)/classes.tsx <span className="ld-term-dim">(1 module)</span></>);
  return (
    <div className="ld-panel">
      <div className="ld-panel__tabs">
        <span className="is-active"><i className="ld-dot ld-dot--green" />Terminal</span>
        <span><i className="ld-dot" />Output</span>
        <span>Problems <b>0</b></span>
        <span><i className="ld-dot ld-dot--green" />Build</span>
      </div>
      <div className="ld-term">
        {lines.slice(-4).map((l, i) => <div key={lines.length - 4 + i}>{l}</div>)}
      </div>
    </div>
  );
}

export function LiveDemo() {
  const [t, setT] = useState(FINAL);
  const [animated, setAnimated] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  // The timeline clock: one loop, paused while the demo is off screen.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = frame.current;
    setAnimated(true);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    if (el) io.observe(el);
    let clock = 0;
    let prev = performance.now();
    let shown = -1;
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - prev, 100);
      prev = now;
      if (visible && !document.hidden) {
        clock = (clock + dt) % LOOP;
        // ~40fps is plenty for typing and keeps React work light.
        if (Math.abs(clock - shown) >= 25 || clock < shown) {
          shown = clock;
          setT(clock);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    setT(0);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  // Gentle 3D tilt toward the pointer.
  useEffect(() => {
    const el = frame.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
    };
    const reset = () => {
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', reset);
    };
  }, []);

  const chars = Math.max(0, Math.min(TOTAL, Math.floor((t - T.code) / CHAR_MS)));
  const done = linesTyped(chars);
  const created = t >= T.code;
  const typing = t >= T.code && t < CODE_END;
  const reloaded = t >= RELOADED;
  const cursorLine = Math.min(done, CODE.length - 1);
  const scroll = Math.max(0, cursorLine - (VISIBLE_LINES - 3)) * LINE_H;
  let remaining = chars;

  return (
    <div className="ld-stage" aria-label="Synkro's agent building a React Native Classes screen while the app updates on the phone preview" role="img">
      <div ref={frame} className={`ld-frame ${reloaded ? 'is-reloaded' : ''}`}>
        <div className="ld-glow" aria-hidden="true" />

        <div className="ld-window">
          {/* Title bar */}
          <div className="ld-top">
            <span className="ld-top__logo"><SynkroMark /></span>
            <span className="ld-top__menus">
              {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((m) => <span key={m}>{m}</span>)}
            </span>
            <span className="ld-top__nav"><Icon d={ICONS.panelLeft} size={12} /><span>‹</span><span>›</span></span>
            <span className="ld-top__search"><Icon d={ICONS.search} size={11} />school-planner</span>
            <span className="ld-top__right">
              <span className="ld-top__upgrade">Upgrade to Pro</span>
              <span className="ld-top__apk">Build APK</span>
              <span className="ld-top__icons">
                <Icon d={ICONS.panelBottom} size={12} /><Icon d={ICONS.phone} size={12} /><Icon d={ICONS.chat} size={12} /><Icon d={ICONS.gear} size={12} />
              </span>
              <span className="ld-top__avatar">A</span>
            </span>
          </div>

          <div className="ld-body">
            {/* Activity bar */}
            <nav className="ld-activity">
              <span className="is-active"><Icon d={ICONS.files} size={15} /></span>
              <span><Icon d={ICONS.search} size={15} /></span>
              <span><Icon d={ICONS.git} size={15} /></span>
              <span><Icon d={ICONS.run} size={15} /></span>
              <span><Icon d={ICONS.ext} size={15} /></span>
              <span className="ld-activity__gear"><Icon d={ICONS.gear} size={15} /></span>
            </nav>

            <Explorer created={created} />

            <div className="ld-center">
              <div className="ld-work">
                {/* Editor */}
                <section className="ld-editor">
                  <div className="ld-tabs">
                    <span className="ld-tab"><ReactIcon size={12} />_layout.tsx</span>
                    {created && <span className="ld-tab ld-tab--active"><ReactIcon size={12} />classes.tsx{typing && <i className="ld-tab__dirty" />}</span>}
                  </div>
                  <div className="ld-crumbs">
                    <span>school-planner › app › (tabs) › {created ? 'classes.tsx' : '_layout.tsx'}</span>
                    <span className="ld-crumbs__tools"><span className="ld-pill">TSX</span><span>Save</span><span>Lint</span></span>
                  </div>
                  <div className="ld-code-view">
                    {created ? (
                      <pre className="ld-code" style={{ transform: `translateY(${-scroll}px)` }}>
                        {CODE.map((line, i) => {
                          const visible = Math.max(0, Math.min(line.length, remaining));
                          const lineDone = remaining > line.length;
                          const isCursor = animated && !lineDone && remaining >= 0;
                          remaining -= line.length + 1;
                          if (visible === 0 && !isCursor && !lineDone) return <div key={i} className="ld-line" />;
                          return (
                            <div key={i} className={`ld-line ${lineDone || isCursor ? 'is-added' : ''} ${isCursor && typing ? 'is-cursor' : ''}`}>
                              <span className="ld-ln">{i + 1}</span>
                              <span>
                                {highlight(line.slice(0, visible)).map((p, j) => <span key={j} className={p.cls}>{p.text}</span>)}
                                {isCursor && typing && <span className="ld-caret" />}
                              </span>
                            </div>
                          );
                        })}
                      </pre>
                    ) : (
                      <div className="ld-code-empty"><SynkroMark size={34} /><span>Waiting for the agent…</span></div>
                    )}
                  </div>
                </section>

                {/* Preview */}
                <section className="ld-preview">
                  <div className="ld-preview__head">
                    <span>PREVIEW</span>
                    <span className="ld-expo"><i />EXPO</span>
                  </div>
                  <div className="ld-preview__tools">
                    <span><Icon d={ICONS.inspect} size={10} />Inspect</span>
                    <span className={t >= RELOAD && !reloaded ? 'is-spinning' : ''}><Icon d={ICONS.refresh} size={10} />Refresh</span>
                  </div>
                  <div className="ld-device-label">IPHONE 15</div>
                  <div className="ld-phone-wrap">
                    <div className="ld-ripple" />
                    <Phone done={done} reloaded={reloaded} />
                  </div>
                </section>
              </div>

              <Terminal t={t} />
            </div>

            <Chat t={t} done={done} />
          </div>

          {/* Status bar */}
          <div className="ld-statusbar">
            <span><Icon d={ICONS.git} size={10} />master{created && '*'}</span>
            <span>⊗ 0 &nbsp;⚠ 0</span>
            <span className="ld-statusbar__mid">Synkro Ready · school-planner</span>
            <span className="ld-statusbar__right">
              <span>Ln {cursorLine + 1}, Col 1</span><span>Spaces: 2</span><span>UTF-8</span><span>TypeScript JSX</span>
              <span className="ld-online"><i />Online</span>
            </span>
          </div>
        </div>

        {/* Floating callouts that pop out of the window in 3D */}
        <div className={`ld-float ld-float--reload ${reloaded ? 'is-in' : ''}`}><Icon d={ICONS.zap} size={13} />Fast Refresh · 412 ms</div>
        <div className={`ld-float ld-float--lines ${created ? 'is-in' : ''}`}><span className="ld-float__plus">+{done}</span> lines written by the agent</div>
        <div className={`ld-float ld-float--problems ${reloaded ? 'is-in' : ''}`}><Icon d={ICONS.check} size={13} />0 problems</div>
      </div>
    </div>
  );
}
