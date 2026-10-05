// FirstScreen (F6): recruiter-facing narrative layer above the query engine.
// Answers WHO / WHAT / PROOF / CONTACT without query syntax. Reads the
// frozen dataset only. Flagship failures stay out: both are needs_check.
import { db } from '../db/dataset';
import { FLAGSHIP_IDS, flagshipProof } from '../lib/narrative';
import { Badge } from './Badge';

interface Props {
  onOpenCase: (projectId: string) => void;
  onRecruiter: () => void;
}

export function FirstScreen({ onOpenCase, onRecruiter }: Props) {
  const recruiter = db.recruiter;
  const proofs = FLAGSHIP_IDS.map((id) => flagshipProof(db, id));
  return (
    <section aria-labelledby="firstscreen-heading" className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
      <h2 id="firstscreen-heading" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {recruiter.role}
      </h2>
      <p className="mt-2 max-w-[65ch] leading-relaxed text-zinc-600 dark:text-zinc-400">{recruiter.positioning}</p>
      <div className="mt-4 flex flex-wrap gap-3">
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
          className="px-4 py-2 font-mono text-sm text-zinc-600 focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:text-[#9a3412] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
        >
          {recruiter.contact.email}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {proofs.map(({ project, decision, repoUrl, badge }) => (
          <article key={project.id} aria-labelledby={`flag-${project.id}`} className="border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 id={`flag-${project.id}`} className="font-display text-lg font-semibold tracking-tight">
              {project.title}
            </h3>
            <Badge badge={badge} />
            <p className="mt-2 text-sm leading-relaxed">{project.thesis}</p>
            <p className="mt-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">{project.stack.join(' / ')}</p>
            <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">one decision</p>
              <p className="mt-1 text-sm font-medium">{decision.title}</p>
              <p className="mt-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Chose: </span>
                {decision.chosen}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Rejected: </span>
                {decision.rejected}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={repoUrl}
                className="font-mono text-sm text-[#9a3412] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:text-[#ff4d00]"
              >
                repository
              </a>
              <button
                type="button"
                onClick={() => onOpenCase(project.id)}
                className="font-mono text-sm text-zinc-600 focus-visible:outline-2 focus-visible:outline-[#ff4d00] hover:text-[#9a3412] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
              >
                open case file
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
