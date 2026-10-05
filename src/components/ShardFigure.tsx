// ShardFigure (second critique pass): the Shard design as a content-addressed
// DAG, visually distinct from Contextd's linear pipeline. Fan-out/fan-in:
// one artifact fans into content-defined chunks, resolves to BLAKE3 hashes,
// lands in store + peer distribution, reassembles into a verified snapshot.
// Design facts from the public repo (README, REPORT.md, benchmarks/,
// verified 2026-10-05). Comparison numbers are the author's, labeled as such.
import { Reveal } from './Reveal';

const CHUNKS: ReadonlyArray<{ id: string; detail: string }> = [
  { id: 'chunk a', detail: 'content-defined boundary' },
  { id: 'chunk b', detail: 'content-defined boundary' },
  { id: 'chunk c', detail: 'content-defined boundary' },
];

const HASHES: ReadonlyArray<string> = ['blake3(chunk a)', 'blake3(chunk b)', 'blake3(chunk c)'];

// Author-reported 10 GB push comparison (REPORT.md). Labeled as such.
const COMPARISON: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'about 5 min', label: 'Git LFS push' },
  { value: 'about 4 min', label: 'Hugging Face push' },
  { value: 'about 40 s', label: 'Shard push' },
];

function Edge({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`block text-center font-mono text-sm text-zinc-600 dark:text-zinc-400 ${className}`}>
      ↓
    </span>
  );
}

export function ShardFigure() {
  return (
    <figure aria-labelledby="shard-fig-caption" className="mt-4">
      <figcaption id="shard-fig-caption" className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
        content-addressed distribution, as implemented
      </figcaption>

      <Reveal index={0} className="mt-2 border-2 border-ink p-4 text-center dark:border-paper">
        <p className="font-display text-lg font-semibold tracking-tight">training artifact</p>
        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">one immutable blob in, verified snapshot out</p>
      </Reveal>
      <Edge className="py-1" />

      <div role="group" aria-label="Content-defined chunks">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CHUNKS.map((c, i) => (
            <Reveal key={c.id} index={1 + i} className="border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="font-mono text-sm font-semibold">{c.id}</p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{c.detail}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <Edge className="py-1" />

      <div role="group" aria-label="BLAKE3 content hashes">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-2">
          {HASHES.map((h, i) => (
            <Reveal key={h} index={4 + i} className="border border-dashed border-zinc-200 px-2 py-1 dark:border-zinc-800">
              <p className="font-mono text-xs text-[#9a3412] dark:text-[#ff4d00]">{h}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <Edge className="py-1" />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Reveal index={7} className="border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="font-mono text-sm font-semibold">store</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            Sled, SQLite, or flat backends. Signed commits, tamper-evident history.
          </p>
        </Reveal>
        <Reveal index={8} className="border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="font-mono text-sm font-semibold">distribute</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            libp2p peers with mDNS discovery. Fetch by hash, never by path.
          </p>
        </Reveal>
      </div>
      <Edge className="py-1" />

      <Reveal index={9} className="border-2 border-ink p-4 text-center dark:border-paper">
        <p className="font-display text-lg font-semibold tracking-tight">verified snapshot</p>
        <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">reassembled from hashes, DAG-reachability collection</p>
      </Reveal>

      <ul aria-label="Shard author-reported push comparison" className="mt-3 grid grid-cols-2 gap-px border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 md:grid-cols-3">
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
