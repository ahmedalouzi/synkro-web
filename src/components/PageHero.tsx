import type { ReactNode } from 'react';

/**
 * The heading block every inner page opens with, in the same language as the home page:
 * a pill kicker, a display title (wrap one word in <em> for the italic serif accent) and a lead.
 */
export function PageHero({ kicker, title, lead, children }: { kicker: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-hero">
      <p className="kicker"><span className="dot" />{kicker}</p>
      <h1 className="display">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </header>
  );
}
