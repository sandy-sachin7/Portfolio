// ContextdFigure (taste pass): the real Contextd retrieval pipeline, benchmark
// figures, and release history. Every stage, number, and date below is taken
// from the public repo (README architecture + benchmarks, GitHub releases,
// verified 2026-10-05). Nothing is invented; nothing animates.
import { CONTEXTD_RELEASES, RELEASE_MILESTONES } from '../lib/narrative';
import { Reveal } from './Reveal';

const STAGES: ReadonlyArray<{ name: string; detail: string }> = [
  { name: 'watch', detail: 'file watcher, debouncer, .contextignore' },
  { name: 'parse', detail: 'plugin and native parsers' },
  { name: 'chunk', detail: 'Tree-sitter for Rust, Python, JS/TS, Go' },
  { name: 'embed', detail: 'local ONNX embeddings' },
  { name: 'store', detail: 'SQLite plus FTS5, hybrid search' },
  { name: 'serve', detail: 'REST, CLI, MCP' },
];

// Repo-reported benchmarks (README, 10K files / 500K LOC codebase).
const BENCHMARKS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '2 to 3 min', label: 'full index, 500K LOC' },
  { value: 'under 50 ms', label: 'query p99' },
  { value: '150 MB', label: 'storage per 100K chunks' },
  { value: 'under 100 ms', label: 'incremental reindex' },
];

export function ContextdFigure() {
  return (
    <figure aria-labelledby="contextd-fig-caption" className="mt-4">
      <figcaption id="contextd-fig-caption" className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
        retrieval pipeline, as implemented
      </figcaption>
      <ol className="mt-2 flex flex-col gap-2 md:flex-row md:items-stretch">
        {STAGES.map((stage, i) => (
          <li key={stage.name} className="flex flex-1 flex-col">
            <Reveal index={i} className="flex flex-1 flex-col border border-zinc-200 p-3 transition-colors hover:border-[#ff4d00] dark:border-zinc-800">
              <p className="font-mono text-sm font-semibold">
                <span className="mr-2 text-[#9a3412] dark:text-[#ff4d00]">{String(i + 1).padStart(2, '0')}</span>
                {stage.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{stage.detail}</p>
            </Reveal>
            {i < STAGES.length - 1 && (
              <span aria-hidden="true" className="self-center py-1 font-mono text-sm text-zinc-600 dark:text-zinc-400 md:hidden">
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
      <ul aria-label="Contextd reported benchmarks" className="mt-3 grid grid-cols-2 gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 md:grid-cols-4">
        {BENCHMARKS.map((b) => (
          <li key={b.label} className="bg-paper p-3 dark:bg-ink">
            <p className="font-mono text-sm font-semibold">{b.value}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{b.label}, repo-reported</p>
          </li>
        ))}
      </ul>
      <ol aria-label="Contextd release milestones" className="mt-3 flex flex-col gap-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
        {RELEASE_MILESTONES.map((r) => (
          <li key={r.version}>
            {r.version} <span className="text-zinc-600 dark:text-zinc-400">{r.date}</span>
            <span className="text-zinc-900 dark:text-zinc-100">, {r.note}</span>
          </li>
        ))}
        <li>
          <a
            href="https://github.com/sandy-sachin7/contextd/releases"
            className="text-[#9a3412] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:text-[#ff4d00]"
          >
            all {CONTEXTD_RELEASES.length} releases
          </a>
        </li>
      </ol>
    </figure>
  );
}
