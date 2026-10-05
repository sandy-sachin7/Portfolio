// ShardFigure (taste pass): the real Shard content-addressing design and the
// author-reported push comparison. Design facts from the public repo
// (README architecture, REPORT.md, benchmarks/, verified 2026-10-05).
// Comparison numbers are the author's, reproducible via benchmarks/benchmark.sh.
const STAGES: ReadonlyArray<{ name: string; detail: string }> = [
  { name: 'chunk', detail: 'Rabin content-defined chunking by default' },
  { name: 'hash', detail: 'BLAKE3 addressing, ed25519 signing' },
  { name: 'store', detail: 'Sled, SQLite, or flat backends' },
  { name: 'distribute', detail: 'libp2p with mDNS discovery' },
  { name: 'collect', detail: 'DAG-reachability garbage collection' },
];

// Author-reported 10 GB push comparison (REPORT.md). Labeled as such.
const COMPARISON: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'about 5 min', label: 'Git LFS push' },
  { value: 'about 4 min', label: 'Hugging Face push' },
  { value: 'about 40 s', label: 'Shard push' },
];

export function ShardFigure() {
  return (
    <figure aria-labelledby="shard-fig-caption" className="mt-4">
      <figcaption id="shard-fig-caption" className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
        content addressing and distribution, as implemented
      </figcaption>
      <ol className="mt-2 flex flex-col gap-2 md:flex-row md:items-stretch">
        {STAGES.map((stage, i) => (
          <li key={stage.name} className="flex flex-1 flex-col">
            <div className="flex-1 border border-zinc-200 p-3 transition-colors hover:border-[#ff4d00] dark:border-zinc-800">
              <p className="font-mono text-sm font-semibold">
                <span className="mr-2 text-[#9a3412] dark:text-[#ff4d00]">{String(i + 1).padStart(2, '0')}</span>
                {stage.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{stage.detail}</p>
            </div>
            {i < STAGES.length - 1 && (
              <span aria-hidden="true" className="self-center py-1 font-mono text-sm text-zinc-600 dark:text-zinc-400 md:hidden">
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
      <ul aria-label="Shard author-reported push comparison" className="mt-3 grid grid-cols-1 gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 md:grid-cols-3">
        {COMPARISON.map((c) => (
          <li key={c.label} className="bg-paper p-3 dark:bg-ink">
            <p className="font-mono text-sm font-semibold">{c.value}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{c.label}, author-reported</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
