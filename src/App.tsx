// App (F2): CAREER.DB shell. Identity rail, omnibar, results, inspector, index footer.
// Concept #1 presentation components are deleted; the frozen engine is untouched.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { db } from './db/dataset';
import { STARTER_QUERIES } from './lib/starterQueries';
import { useQueryEngine } from './hooks/useQueryEngine';
import Grain from './components/Grain';
import { Omnibar } from './components/Omnibar';
import { ResultSurface } from './components/ResultSurface';
import { Inspector } from './components/Inspector';
import { FirstScreen } from './components/FirstScreen';
import { RecruiterSheet } from './components/RecruiterSheet';

const BOOT_QUERY = 'SHOW highlights LIMIT 3';
const FOOTER_INDEX = [
  'Where you have worked',
  'What you have shipped',
  'Where you failed',
  'What you believe',
  'What survived contact with reality',
  'Remove Python. Watch what breaks.',
];

const BUILD_SHA: string =
  (import.meta.env['VITE_BUILD_SHA'] as string | undefined) ?? 'dev';

function useTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    setDark(stored ? stored === 'dark' : true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    window.localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}

export default function App() {
  const [dark, toggleTheme] = useTheme();
  const [input, setInput] = useState(BOOT_QUERY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const recruiterBtnRef = useRef<HTMLButtonElement>(null);
  const { state, run } = useQueryEngine(BOOT_QUERY);
  const recruiter = db.recruiter;

  // Keep the input box in sync when a footer/example/URL query runs.
  useEffect(() => {
    if (state.lastQuery) setInput(state.lastQuery);
  }, [state.lastQuery]);

  const openSheet = () => {
    setSheetOpen(true);
    setAnnouncement('Recruiter summary opened.');
  };
  const closeSheet = () => {
    setSheetOpen(false);
    setAnnouncement('Recruiter summary closed.');
  };

  // Plain `R` toggles the recruiter sheet. Never fires while typing,
  // and never with modifier keys (no hijacking browser shortcuts).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'r' && e.key !== 'R') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      setSheetOpen((open) => {
        setAnnouncement(open ? 'Recruiter summary closed.' : 'Recruiter summary opened.');
        return !open;
      });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // When the sheet closes, return focus to the trigger (never on mount).
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !sheetOpen) recruiterBtnRef.current?.focus();
    wasOpenRef.current = sheetOpen;
  }, [sheetOpen]);

  const footerQueries = STARTER_QUERIES.filter((q) => FOOTER_INDEX.includes(q.label));

  // READ view state lives here so flagship cards open a case file in one gesture:
  // run the query, then point at the row. The surface closes it only when a
  // later result no longer contains the open row.
  const [openId, setOpenId] = useState<string | null>(null);
  const handleOpenChange = useCallback((id: string | null) => setOpenId(id), []);
  const openCase = (projectId: string) => {
    run('SHOW projects');
    setOpenId(`projects/${projectId}`);
  };

  return (
    <div className="min-h-dvh bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <Grain />
      <Analytics />
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {sheetOpen && <RecruiterSheet recruiter={recruiter} onClose={closeSheet} />}

      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold tracking-tight">
              {recruiter.name} <span className="font-mono text-xs font-normal text-zinc-600 dark:text-zinc-400">/ career.db</span>
            </h1>
            <p className="truncate text-[13px] text-zinc-600 dark:text-zinc-400">{recruiter.role}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <button
              type="button"
              ref={recruiterBtnRef}
              onClick={openSheet}
              aria-label="Open recruiter [R] summary"
              className="border border-zinc-200 px-3 py-2 hover:border-[#ff4d00] hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:border-zinc-800"
            >
              recruiter [R]
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="border border-zinc-200 px-2 py-1 hover:border-[#ff4d00] hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:border-zinc-800"
            >
              {dark ? 'light' : 'dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">
        <FirstScreen onOpenCase={openCase} onRecruiter={openSheet} />
        <section aria-label="Explore career.db" id="explore" className="mt-8 scroll-mt-4">
          <Omnibar
            input={input}
            onInput={setInput}
            onRun={run}
            parseError={state.parseError}
            lastQuery={state.lastQuery}
          />
          <div className="mt-4 min-w-0">
            <ResultSurface
              result={state.result}
              openId={openId}
              onOpenChange={handleOpenChange}
            />
          </div>
          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Inspector plan={state.plan} result={state.result} lastQuery={state.lastQuery} />
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <nav aria-label="Discovery index">
            <h2 className="font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">discovery index</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Start with a few questions worth asking.</p>
            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {footerQueries.map((q) => (
                <li key={q.label}>
                  <button
                    type="button"
                    onClick={() => run(q.query)}
                    className="w-full py-2 text-left text-sm text-zinc-600 hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
                  >
                    <span className="font-display font-medium">{q.label}</span>
                    <span className="ml-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">{q.query}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-200 pt-4 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <a href={`mailto:${recruiter.contact.email}`} className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">
              {recruiter.contact.email}
            </a>
            <a href={recruiter.contact.github} className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">github</a>
            <a href={recruiter.contact.linkedin} className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">linkedin</a>
            <a href={recruiter.contact.resume} className="hover:text-[#9a3412] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">resume.pdf</a>
            {BUILD_SHA !== 'dev' && <span className="ml-auto">sha {BUILD_SHA}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
