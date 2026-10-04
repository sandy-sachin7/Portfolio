// CompareView (F2): COMPARE must show WHY two records differ, not two cards side by side.
import { titleOf } from '../lib/rows';
import type { ExecResult } from '../query/executor';
import { Badge } from './Badge';

type R = Record<string, unknown>;
const fmt = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (Array.isArray(v)) return v.map(String).join(', ') || '-';
  return String(v);
};

export function CompareView({ result }: { result: Extract<ExecResult, { kind: 'compare' }> }) {
  const { left, right, differingFields } = result;
  const l = left.record as R;
  const r = right.record as R;
  const keys = [...new Set([...Object.keys(l), ...Object.keys(r)])]
    .filter((k) => !['id', 'provenance', 'verification'].includes(k))
    .sort();
  const diff = new Set(differingFields);

  return (
    <div>
      <div className="grid grid-cols-[1fr_1fr] gap-0 md:grid-cols-[12rem_1fr_1fr]">
        <div className="hidden md:block" aria-hidden="true" />
        {[left, right].map((side) => (
          <h3 key={side.id} className="border-l border-zinc-200 px-3 font-display text-lg font-semibold tracking-tight dark:border-zinc-800">
            {titleOf(side.collection, side.record)}
            <Badge badge={side.badge} />
          </h3>
        ))}
      </div>
      <dl>
        {keys.map((k) => {
          const isDiff = diff.has(k);
          return (
            <div key={k} className="grid grid-cols-[1fr_1fr] gap-0 border-t border-zinc-200 md:grid-cols-[12rem_1fr_1fr] dark:border-zinc-800">
              <dt className="hidden px-0 py-2 font-mono text-xs uppercase tracking-wider text-zinc-400 md:block dark:text-zinc-500">
                {k}
              </dt>
              {[l[k], r[k]].map((v, i) => (
                <dd
                  key={i}
                  className={`border-l border-zinc-200 px-3 py-2 text-sm md:first:border-l-0 dark:border-zinc-800 ${
                    isDiff ? 'bg-[#ff4d00]/[0.07] text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 md:hidden dark:text-zinc-500">{k}: </span>
                  {fmt(v)}
                </dd>
              ))}
            </div>
          );
        })}
      </dl>
      <p className="mt-3 font-mono text-xs text-zinc-400 dark:text-zinc-500">
        {differingFields.length} differing field{differingFields.length === 1 ? '' : 's'} highlighted: {differingFields.join(', ') || 'none'}
      </p>
    </div>
  );
}
