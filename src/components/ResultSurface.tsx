// ResultSurface (F2): LIST / READ / COMPARE. Semantic tables, honest receipts.
import { useEffect, useState } from 'react';
import type { ExecResult, ResultRow } from '../query/executor';
import type { CollectionName } from '../db/schema';
import { getById, hasCaseFile, subOf, titleOf } from '../lib/rows';
import { CaseFile } from './CaseFile';
import { CompareView } from './CompareView';
import { Badge } from './Badge';

interface Props {
  result: ExecResult | null;
  lastQuery: string;
}

function RowButton({ row, onOpen }: { row: ResultRow; onOpen: (r: ResultRow) => void }) {
  const openable = hasCaseFile(row.collection);
  return (
    <button
      type="button"
      onClick={() => openable && onOpen(row)}
      disabled={!openable}
      aria-label={openable ? `Read ${titleOf(row.collection, row.record)}` : titleOf(row.collection, row.record)}
      className={`block w-full px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-[#ff4d00] ${
        openable ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900' : 'cursor-default'
      }`}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {openable && <span aria-hidden="true" className="mr-2 text-[#ff4d00]">›</span>}
          {titleOf(row.collection, row.record)}
        </span>
        <span className="shrink-0 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{row.id}</span>
      </span>
      {subOf(row.collection, row.record) && (
        <span className="mt-0.5 block truncate text-sm text-zinc-600 dark:text-zinc-400">{subOf(row.collection, row.record)}</span>
      )}
      <Badge badge={row.badge} />
    </button>
  );
}

function RowsList({ rows, onOpen }: { rows: ResultRow[]; onOpen: (r: ResultRow) => void }) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-8">
        <p className="text-zinc-900 dark:text-zinc-100">0 rows.</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing matches with presentable evidence. Try removing a filter, or run with WITH UNVERIFIED to see candidate evidence.
        </p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800" role="list" aria-label="Query results">
      {rows.map((row) => (
        <li key={`${row.collection}/${row.id}`}>
          <RowButton row={row} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}

export function ResultSurface({ result, lastQuery }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => setOpenId(null), [lastQuery]);

  if (!result) {
    return <p className="px-4 py-8 font-mono text-sm text-zinc-600 dark:text-zinc-400">running…</p>;
  }
  if (!result.ok) {
    return (
      <div className="px-4 py-8" role="alert">
        <p className="font-mono text-sm text-red-600 dark:text-red-400">{result.error.message}</p>
        {result.error.suggestion && (
          <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">try: {result.error.suggestion}</p>
        )}
      </div>
    );
  }

  const openRow: ResultRow | null =
    openId && result.kind === 'rows'
      ? (result.rows.find((r) => `${r.collection}/${r.id}` === openId) ?? null)
      : null;

  // READ view takes over the surface; back restores LIST.
  if (openRow) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="px-4 py-3 font-mono text-sm text-zinc-600 hover:text-[#ff4d00] dark:text-zinc-400 dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
        >
          ← back to {result.kind === 'rows' ? `${result.rows.length} rows` : 'results'}
        </button>
        <div className="px-4 pb-8">
          <CaseFile row={openRow} />
        </div>
      </div>
    );
  }

  switch (result.kind) {
    case 'rows':
      return (
        <div aria-live="polite">
          <p className="px-4 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            {result.rows.length} row{result.rows.length === 1 ? '' : 's'}
            {result.excluded.length > 0 && ` · ${result.excluded.length} excluded (see inspector)`}
          </p>
          <RowsList rows={result.rows} onOpen={(r) => setOpenId(`${r.collection}/${r.id}`)} />
        </div>
      );
    case 'schema':
      return (
        <dl className="px-4 py-4">
          <dt className="font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">table {result.collection}</dt>
          {result.fields.map((f) => (
            <dd key={f} className="border-t border-zinc-200 py-1.5 font-mono text-sm first:mt-2 dark:border-zinc-800">{f}</dd>
          ))}
        </dl>
      );
    case 'log':
      return (
        <ol className="px-4 py-4 font-mono text-[13px]">
          {result.entries.length === 0 && <li className="text-zinc-600 dark:text-zinc-400">log is empty</li>}
          {result.entries.map((e, i) => (
            <li key={i} className="border-t border-zinc-200 py-1.5 first:border-t-0 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">{e.t} </span>
              <span className="text-zinc-800 dark:text-zinc-200">{e.query}</span>{' '}
              <span className="text-zinc-600 dark:text-zinc-400">→ {e.returned} rows, {e.ms.toFixed(1)}ms{e.cacheHit ? ', cache hit' : ''}</span>
            </li>
          ))}
        </ol>
      );
    case 'compare':
      return (
        <div className="px-4 py-4">
          <CompareView result={result} />
        </div>
      );
    case 'ablation': {
      const entries = Object.entries(result.coverage.before);
      return (
        <div className="px-4 py-4" aria-live="polite">
          <h3 className="font-display text-xl font-semibold tracking-tight">
            WITHOUT {result.key} <span className="font-mono text-sm font-normal text-zinc-600 dark:text-zinc-400">(evidence removed, not capability)</span>
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            These records lose {result.key} as evidence. The engineer is unchanged; the proof got thinner.
          </p>
          <dl className="mt-4 space-y-1.5 font-mono text-sm">
            {entries.map(([coll, before]) => {
              const after = result.coverage.after[coll] ?? before;
              const lost = before - after;
              return (
                <div key={coll} className="flex justify-between gap-2 border-t border-zinc-200 pt-1.5 dark:border-zinc-800">
                  <dt>{coll}</dt>
                  <dd className={lost > 0 ? 'text-[#ff4d00]' : 'text-zinc-600 dark:text-zinc-400'}>
                    {before} → {after}{lost > 0 ? ` (−${lost})` : ''}
                  </dd>
                </div>
              );
            })}
          </dl>
          {result.affected.length > 0 && (
            <div className="mt-4">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400">affected evidence</h4>
              <ul className="mt-1 space-y-0.5 font-mono text-[13px]">
                {result.affected.map((a) => {
                  const rec = getById(a.collection as CollectionName, a.id);
                  return <li key={`${a.collection}/${a.id}`}>{a.id}{rec ? ` · ${titleOf(a.collection, rec)}` : ''}</li>;
                })}
              </ul>
            </div>
          )}
          {result.orphanedDecisions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#ff4d00]">orphaned decisions</h4>
              <ul className="mt-1 space-y-0.5 text-sm">
                {result.orphanedDecisions.map((id) => {
                  const d = getById('decisions', id);
                  return <li key={id}>{d ? titleOf('decisions', d) : id} <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">({id})</span></li>;
                })}
              </ul>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">These decisions lost their only supporting evidence.</p>
            </div>
          )}
        </div>
      );
    }
  }
}
