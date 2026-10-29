import { GlowCard } from './Effects';

/** Feature cards, each with a small looping illustration of the feature itself. */

function TabDemo() {
  return (
    <div className="mini mini-code" aria-hidden="true">
      <div><span className="tk-kw">final</span> total = items</div>
      <div>
        &nbsp;&nbsp;.where((i) =&gt; i.done)
        <span className="ghost">.fold(0, (sum, i) =&gt; sum + i.points);</span>
      </div>
      <span className="mini-key">Tab</span>
    </div>
  );
}

function InlineEditDemo() {
  return (
    <div className="mini mini-code" aria-hidden="true">
      <div className="mini-prompt"><span className="mini-k">Ctrl+K</span><span className="mini-typing">make it async</span></div>
      <div className="mini-del">- User load() =&gt; cache.read();</div>
      <div className="mini-add">+ Future&lt;User&gt; load() async =&gt;</div>
      <div className="mini-add">+ &nbsp;&nbsp;await api.fetchUser();</div>
    </div>
  );
}

function DevicesDemo() {
  return (
    <div className="mini mini-devices" aria-hidden="true">
      <div className="morph-phone"><span /></div>
      <div className="morph-labels">
        <span>iPhone 15</span><span>Pixel 8</span><span>Pixel Fold</span>
      </div>
    </div>
  );
}

function AgentDemo() {
  return (
    <div className="mini mini-steps" aria-hidden="true">
      <div style={{ animationDelay: '0s' }}><i />Read lib/main.dart</div>
      <div style={{ animationDelay: '0.6s' }}><i />Searched “ThemeData”</div>
      <div style={{ animationDelay: '1.2s' }}><i />Edited lib/theme.dart <b>+8 −2</b></div>
      <div style={{ animationDelay: '1.8s' }} className="ok"><i />Keep · Undo · Review</div>
    </div>
  );
}

function TemplatesDemo() {
  return (
    <div className="mini mini-templates" aria-hidden="true">
      <span>Blank</span><span className="on">Material App</span><span>Bottom Nav</span><span>RN Tabs</span>
    </div>
  );
}

function VsCodeDemo() {
  return (
    <div className="mini mini-keys" aria-hidden="true">
      <kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>P</kbd>
      <span className="mini-palette">&gt; Toggle Word Wrap</span>
    </div>
  );
}

const cards = [
  { title: 'Tab completions', text: 'Ghost text that finishes the line — or the whole expression — as you type.', demo: <TabDemo />, wide: true },
  { title: 'Edit in place', text: 'Select code, press Ctrl+K, say what to change. Review the diff inline.', demo: <InlineEditDemo /> },
  { title: 'Every screen size', text: 'iPhone, Pixel, Galaxy and foldables, side by side with your code.', demo: <DevicesDemo /> },
  { title: 'An agent you can trust', text: 'Every step and every diff is visible. Keep, undo, or restore a checkpoint.', demo: <AgentDemo />, wide: true },
  { title: 'Start in seconds', text: 'Flutter and React Native templates, or describe the app and let it scaffold.', demo: <TemplatesDemo /> },
  { title: 'Your VS Code muscle memory', text: 'Same menus, palette and shortcuts. Import your settings in one click.', demo: <VsCodeDemo />, wide: true },
];

export function Bento() {
  return (
    <div className="bento">
      {cards.map((c, i) => (
        <GlowCard key={c.title} className={c.wide ? 'bento-wide' : ''}>
          <div className="bento-inner" data-reveal style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
            {c.demo}
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{c.text}</p>
            </div>
          </div>
        </GlowCard>
      ))}
    </div>
  );
}
