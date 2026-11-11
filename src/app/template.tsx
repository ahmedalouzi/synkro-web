import { RevealOnScroll } from '@/components/home/Effects';

/**
 * Unlike layout.tsx, a template remounts on every navigation, so each page gets an enter
 * transition and a fresh scroll-reveal pass. The animation uses fill-mode "backwards" so no
 * transform lingers afterwards (a leftover transform would break sticky/fixed children).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter" data-motion-keep>
      {children}
      <RevealOnScroll />
    </div>
  );
}
