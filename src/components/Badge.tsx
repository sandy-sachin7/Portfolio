// Badge (F2): epistemic UI. ASSERTED is not UNVERIFIED is not verified.
import type { BadgeKind } from '../db/validate';

export function Badge({ badge }: { badge: BadgeKind | null }) {
  if (!badge) return null;
  if (badge === 'asserted') {
    return (
      <span className="mt-1 inline-block border border-amber-500/60 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
        asserted
      </span>
    );
  }
  return (
    <span className="mt-1 inline-block border border-dashed border-zinc-400 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
      unverified
    </span>
  );
}
