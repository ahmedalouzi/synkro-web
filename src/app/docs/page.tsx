import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Docs' };

const toc = [
  ['getting-started', 'Getting started'],
  ['projects', 'Projects'],
  ['preview', 'Phone preview'],
  ['ai', 'AI agent and chat'],
  ['tab', 'Tab and Ctrl+K'],
  ['rules', 'Project rules'],
  ['terminal', 'Terminal and Git'],
  ['shortcuts', 'Keyboard shortcuts'],
  ['plans', 'Plans and usage'],
] as const;

const shortcuts = [
  ['Command Palette', 'Ctrl+Shift+P'],
  ['Go to File', 'Ctrl+P'],
  ['Settings', 'Ctrl+,'],
  ['Toggle side bar', 'Ctrl+B'],
  ['Toggle panel', 'Ctrl+J'],
  ['Toggle terminal', 'Ctrl+`'],
  ['New terminal', 'Ctrl+Shift+`'],
  ['Toggle chat', 'Ctrl+Alt+B'],
  ['Edit with AI (inline)', 'Ctrl+K'],
  ['Trigger a suggestion', 'Alt+\\'],
  ['Start preview', 'F5'],
  ['Build Android APK', 'Ctrl+Shift+B'],
  ['Find in files', 'Ctrl+Shift+F'],
  ['Save / Save all', 'Ctrl+S / Ctrl+K S'],
];

export default function DocsPage() {
  return (
    <div className="mx-auto grid max-w-content gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav aria-label="On this page" className="flex flex-col gap-1.5 text-sm">
          <span className="mb-1 text-xs font-medium uppercase tracking-wider text-faint">On this page</span>
          {toc.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-muted transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <article className="prose-synkro min-w-0">
        <h1 className="mb-3 font-display text-4xl font-semibold tracking-tight text-[#f4f4f5]">Synkro docs</h1>
        <p>Everything you need to build Flutter and React Native apps with Synkro.</p>

        <h2 id="getting-started">Getting started</h2>
        <ol>
          <li><Link href="/download">Download</Link> and install Synkro.</li>
          <li>Create a free account in the app, or sign in.</li>
          <li>On the start page, choose <strong>Open project</strong>, <strong>New project</strong>, <strong>Clone repo</strong> or <strong>Connect via SSH</strong>.</li>
        </ol>
        <p>Synkro looks and works like VS Code: the same menus, command palette (<kbd>Ctrl+Shift+P</kbd>) and shortcuts. To bring over your editor settings, open <strong>Settings › General › Import Settings from VS Code</strong>.</p>

        <h2 id="projects">Projects</h2>
        <p><strong>New project</strong> asks for a framework (Flutter or React Native), a toolchain and how to start:</p>
        <ul>
          <li><strong>Managed</strong> — Synkro runs the toolchain for you; nothing to install.</li>
          <li><strong>Local CLI</strong> — uses the Flutter or React Native SDK on your computer. Set the Flutter path in <strong>Settings › Mobile SDKs</strong>.</li>
          <li><strong>From template</strong> — Blank, Material App, Bottom Navigation (Flutter), or Blank and Tabs (React Native).</li>
          <li><strong>Describe with AI</strong> — write a sentence about the app and the agent scaffolds the first version.</li>
        </ul>
        <p><strong>Clone repo</strong> clones a Git repository (https or SSH) into a folder you choose and opens it. Private repositories use your usual Git credentials.</p>

        <h2 id="preview">Phone preview</h2>
        <p>The preview pane shows your app inside a device frame. Pick the device from the phone icon in the top bar, press <kbd>F5</kbd> to start, and use <strong>Detach</strong> to move the phone into its own window.</p>

        <h2 id="ai">AI agent and chat</h2>
        <p>The chat on the right is an agent: it reads files, searches your project, runs commands and edits code. Each step appears inside its reply (Read, Searched, Edited), and every changed file gets a card with its diff.</p>
        <ul>
          <li><strong>Keep / Undo</strong> — apply or discard each change, or all of them, from the bar above the input. <strong>Review</strong> opens a full diff.</li>
          <li><strong>Restore checkpoint</strong> — under any message, undo every file change the agent made from that point on.</li>
          <li><strong>@</strong> — attach files, folders, the current selection, <em>Problems</em>, <em>Terminal</em> output or the <em>Git Diff</em>.</li>
          <li><strong>/</strong> — quick commands: <code>/fix</code>, <code>/explain</code>, <code>/review</code>, <code>/tests</code>, <code>/doc</code>, <code>/refactor</code>, <code>/terminal</code>, <code>/new</code>.</li>
          <li><strong>Images</strong> — paste or drop screenshots into the input to show the agent what you see.</li>
          <li><strong>Chats</strong> — each conversation has a tab; the clock icon lists your history.</li>
        </ul>

        <h2 id="tab">Tab and Ctrl+K</h2>
        <p><strong>Tab</strong> suggests code as you type: <kbd>Tab</kbd> accepts, <kbd>Esc</kbd> dismisses, <kbd>Ctrl+→</kbd> accepts word by word. Turn it on or off from <strong>✦ Tab</strong> in the status bar.</p>
        <p><strong>Ctrl+K</strong> edits the selected code (or the current line) from a short instruction, and shows the result inline to accept or reject.</p>

        <h2 id="rules">Project rules</h2>
        <p>Rules are instructions the AI follows in one project, such as your naming style or the state-management library to use. Open them with <strong>Settings › Rules › Open</strong>; they live in <code>.synkro/rules.md</code>. Synkro also reads <code>.cursorrules</code>, <code>.cursor/rules/*.mdc</code> and <code>AGENTS.md</code>.</p>

        <h2 id="terminal">Terminal and Git</h2>
        <p>Open a terminal with <kbd>Ctrl+`</kbd> — on the start page too, where it opens in your home folder. <strong>Terminal › Run Active File</strong> saves and runs the current file (Node, TypeScript, Python, Dart, shell, PowerShell, Ruby, Go). Source control lives in the side bar: stage, commit, pull, push and switch branches.</p>

        <h2 id="shortcuts">Keyboard shortcuts</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Action</th><th>Shortcut</th></tr>
            </thead>
            <tbody>
              {shortcuts.map(([action, keys]) => (
                <tr key={action}><td>{action}</td><td><kbd>{keys}</kbd></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>The full list is in <strong>Help › Keyboard Shortcuts</strong>.</p>

        <h2 id="plans">Plans and usage</h2>
        <p>Every plan includes AI usage that refreshes weekly; see what is left in <strong>Settings › Plan & Usage</strong>. Free uses Auto model selection and includes 2,000 Tab completions a month. Pro adds more usage, unlimited Tab and model choice. See <Link href="/pricing">pricing</Link>.</p>
      </article>
    </div>
  );
}
