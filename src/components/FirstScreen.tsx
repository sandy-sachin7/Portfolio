// FirstScreen (taste pass): poster hero, one dominant Contextd chapter, one
// offset Shard chapter. Reads the frozen dataset only. Flagship failures stay
// out: both are needs_check. No invented visuals: both figures below are real
// repo-evidenced designs.
import { db } from '../db/dataset';
import { FLAGSHIP_IDS, flagshipProof, proofStrip } from '../lib/narrative';
import { ContextdFigure } from './ContextdFigure';
import { ShardFigure } from './ShardFigure';

interface Props {
  onOpenCase: (projectId: string) => void;
  onRecruiter: () => void;
}

export function FirstScreen({ onOpenCase, onRecruiter }: Props) {
  const recruiter = db.recruiter;
  const contextd = flagshipProof(db, FLAGSHIP_IDS[0]);
  const shard = flagshipProof(db, FLAGSHIP_IDS[1]);
  return (
    <section aria-labelledby="firstscreen-heading" className="border-b border-zinc-200 pb-10 dark:border-zinc-800">
      <h2 id="firstscreen-heading" className="max-w-[16ch] font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
        Backend and systems engineer.
      </h2>
      <p className="mt-4 max-w-[65ch] leading-relaxed text-zinc-600 dark:text-zinc-400">{recruiter.positioning}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href="#explore"
          className="border border-[#ff4d00] px-4 py-2 text-sm font-medium text-[#9a3412] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:text-[#ff4d00]"
        >
          Explore career.db
        </a>
        <button
          type="button"
          onClick={onRecruiter}
          className="border border-zinc-200 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:border-[#ff4d00] hover:text-[#9a3412] dark:border-zinc-800 dark:hover:text-[#ff4d00]"
        >
          Recruiter [R]
        </button>
        <a
          href={`mailto:${recruiter.contact.email}`}
          className="px-2 py-2 font-mono text-sm text-zinc-600 focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:text-[#9a3412] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
        >
          {recruiter.contact.email}
        </a>
      </div>

      <article aria-labelledby="flag-proj-contextd" className="mt-12 border-t-2 border-ink pt-6 dark:border-paper">
        <p className="font-mono text-xs text-[#9a3412] dark:text-[#ff4d00]">flagship system, 01</p>
        <h3 id="flag-proj-contextd" className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {contextd.project.title}
        </h3>
        <p className="mt-3 max-w-[65ch] leading-relaxed">{contextd.project.thesis}</p>
        <ContextdFigure />
        <ul aria-label={`${contextd.project.title} evidence`} className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
          {proofStrip(db, contextd.project.id).map((item) => (
            <li key={item.label}>
              <a
                href={item.url}
                className="text-zinc-600 focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:text-[#9a3412] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
              >
                {item.label}: <span className="text-zinc-900 dark:text-zinc-100">{item.value}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-medium">{contextd.decision.title}</p>
        <p className="mt-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Chose: </span>
          {contextd.decision.chosen}
        </p>
        <p className="mt-1 max-w-[65ch] text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Rejected: </span>
          {contextd.decision.rejected}
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <a
            href={contextd.repoUrl}
            className="font-mono text-sm text-[#9a3412] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:text-[#ff4d00]"
          >
            repository
          </a>
          <button
            type="button"
            onClick={() => onOpenCase(contextd.project.id)}
            className="font-mono text-sm text-zinc-600 focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:text-[#9a3412] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
          >
            open case file
          </button>
        </div>
      </article>

      <article aria-labelledby="flag-proj-shard" className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-800 md:ml-[16.666%]">
        <p className="font-mono text-xs text-[#9a3412] dark:text-[#ff4d00]">flagship system, 02</p>
        <h3 id="flag-proj-shard" className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {shard.project.title}
        </h3>
        <p className="mt-3 max-w-[65ch] leading-relaxed">{shard.project.thesis}</p>
        <ShardFigure />
        <ul aria-label={`${shard.project.title} evidence`} className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
          {proofStrip(db, shard.project.id).map((item) => (
            <li key={item.label}>
              <a
                href={item.url}
                className="text-zinc-600 focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:text-[#9a3412] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
              >
                {item.label}: <span className="text-zinc-900 dark:text-zinc-100">{item.value}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-medium">{shard.decision.title}</p>
        <p className="mt-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Chose: </span>
          {shard.decision.chosen}
        </p>
        <p className="mt-1 max-w-[65ch] text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Rejected: </span>
          {shard.decision.rejected}
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <a
            href={shard.repoUrl}
            className="font-mono text-sm text-[#9a3412] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:text-[#ff4d00]"
          >
            repository
          </a>
          <button
            type="button"
            onClick={() => onOpenCase(shard.project.id)}
            className="font-mono text-sm text-zinc-600 focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:text-[#9a3412] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
          >
            open case file
          </button>
        </div>
      </article>
    </section>
  );
}
