import Image from 'next/image';

/** A real app screenshot in a window frame. */
export function Screenshot({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a42]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a42]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a42]" />
      </div>
      <Image src={src} alt={alt} width={1440} height={860} priority={priority} className="h-auto w-full" />
    </figure>
  );
}
