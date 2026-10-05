// RecruiterSheet (F4): instant static evidence sheet. No query language needed.
// Full-screen dialog overlay: Esc closes, focus trapped inside, focus returned
// to the trigger on close. Open/close announced via the caller's live region.
import { useEffect, useRef } from 'react';
import type { Recruiter } from '../db/schema';

interface Props {
  recruiter: Recruiter;
  onClose: () => void;
}

export function RecruiterSheet({ recruiter, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the close button on open; trap Tab inside; Esc closes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-autofocus]');
    closeBtn?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  // Unverified location is omitted from the public sheet, never hedged in prose.
  const showLocation = recruiter.fieldVerification.location === 'verified';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-paper text-ink dark:bg-ink dark:text-paper">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Recruiter summary for ${recruiter.name}`}
        className="mx-auto max-w-2xl px-4 py-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              recruiter sheet · 30 seconds
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {recruiter.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{recruiter.role}</p>
          </div>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label="Close recruiter summary and return to the query interface"
            className="shrink-0 border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-600 hover:border-[#ff4d00] hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-[#ff4d00] dark:hover:text-[#ff4d00]"
          >
            close [esc]
          </button>
        </div>

        <p className="mt-4 text-[15px] leading-relaxed">{recruiter.positioning}</p>
        {showLocation && (
          <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">{recruiter.location}</p>
        )}

        <h2 className="mt-6 font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          proof
        </h2>
        <ul className="mt-2 space-y-2">
          {recruiter.proof.map((p) => (
            <li key={p} className="border-l-2 border-[#ff4d00] pl-3 text-[15px] leading-relaxed">
              {p}
            </li>
          ))}
        </ul>

        <h2 className="mt-6 font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          projects
        </h2>
        <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
          {recruiter.projects.map((p) => (
            <li key={p.name} className="py-2">
              {p.url ? (
                <a
                  href={p.url}
                  className="font-display font-medium hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
                >
                  {p.name}
                </a>
              ) : (
                <span className="font-display font-medium">{p.name}</span>
              )}
              <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">{p.line}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          experience
        </h2>
        <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
          {recruiter.experience.map((e) => (
            <li key={e.org} className="py-2 text-sm">
              <span className="font-display font-medium">{e.org}</span>
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">{e.role}</span>
              <span className="ml-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">{e.period}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{recruiter.education}</p>

        <h2 className="mt-6 font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          contact
        </h2>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href={`mailto:${recruiter.contact.email}`}
            className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            {recruiter.contact.email}
          </a>
          <a
            href={recruiter.contact.github}
            className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            github
          </a>
          <a
            href={recruiter.contact.linkedin}
            className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            linkedin
          </a>
          <a
            href={recruiter.contact.resume}
            className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            resume.pdf
          </a>
        </div>
      </div>
    </div>
  );
}
