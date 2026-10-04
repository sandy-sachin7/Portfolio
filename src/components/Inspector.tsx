// Inspector (F2): the engine shows its work. Plan lines, real stats, named exclusions.
import type { ExecResult } from '../query/executor';

interface Props {
  plan: string[];
  result: ExecResult | null;
  lastQuery: string;
}

export function Inspector({ plan, result, lastQuery }: Props) {
  const stats = result && result.ok ? result.stats : null;
  const excluded = result && result.ok && result.kind === 'rows' ? result.excluded : [];

  return (
    <aside aria-label="Query inspector" className="border-zinc-200 font-mono text-xs dark:border-zinc-800 lg:border-l lg:pl-4">
      <h2 className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">inspector</h2>
      {stats ? (
        <dl className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
          <div className="flex justify-between gap-2"><dt>query</dt><dd className="truncate text-right text-zinc-900 dark:text-zinc-100">{lastQuery}</dd></div>
          <div className="flex justify-between gap-2"><dt>returned</dt><dd className="text-[#ff4d00]">{stats.returned}</dd></div>
          <div className="flex justify-between gap-2"><dt>scanned</dt><dd>{stats.scanned}</dd></div>
          <div className="flex justify-between gap-2"><dt>excluded</dt><dd>{stats.excluded}</dd></div>
          <div className="flex justify-between gap-2"><dt>time</dt><dd>{stats.ms.toFixed(2)} ms</dd></div>
          <div className="flex justify-between gap-2"><dt>cache</dt><dd>{stats.cacheHit ? 'hit' : 'miss'}</dd></div>
        </dl>
      ) : (
        <p className="mt-2 text-zinc-400 dark:text-zinc-600">no query yet</p>
      )}
      {plan.length > 0 && (
        <div className="mt-3 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          {plan.map((line) => (
            <p key={line} className="whitespace-pre-wrap break-words text-zinc-600 dark:text-zinc-400">{line}</p>
          ))}
        </div>
      )}
      {excluded.length > 0 && (
        <div className="mt-3 border-t border-zinc-200 pt-2 dark:border-zinc-800" aria-live="polite">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            excluded by default
          </p>
          <ul className="mt-1 space-y-0.5">
            {excluded.map((e) => (
              <li key={`${e.collection}/${e.id}`} className="text-zinc-500 dark:text-zinc-500">
                {e.id} <span className="text-zinc-400 dark:text-zinc-600">({e.reason === 'idea' ? 'not an artifact yet' : 'needs verification'})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 border-t border-zinc-200 pt-2 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
        <p>verified → no badge</p>
        <p>asserted → ASSERTED</p>
        <p>needs_check → excluded</p>
      </div>
    </aside>
  );
}
