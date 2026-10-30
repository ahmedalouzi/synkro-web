/** Shown on legal pages until they have been reviewed; remove it when publishing the final text. */
export function DraftNotice() {
  return (
    <div role="note" className="mb-8 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
      Draft — this text has not been reviewed yet and is not in effect. Bracketed items like [address] still need to be filled in.
    </div>
  );
}
