// App (F2): CAREER.DB shell. Identity rail, omnibar, results, inspector, index footer.
// Concept #1 presentation components are deleted; the frozen engine is untouched.
import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { db } from './db/dataset';
import { STARTER_QUERIES } from './lib/starterQueries';
import { useQueryEngine } from './hooks/useQueryEngine';
import { useIstClock } from './hooks/useIstClock';
import Grain from './components/Grain';
import { Omnibar } from './components/Omnibar';
import { ResultSurface } from './components/ResultSurface';
import { Inspector } from './components/Inspector';

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
  const { state, run } = useQueryEngine(BOOT_QUERY);
  const clock = useIstClock();
  const recruiter = db.recruiter;

  // Keep the input box in sync when a footer/example/URL query runs.
  useEffect(() => {
    if (state.lastQuery) setInput(state.lastQuery);
  }, [state.lastQuery]);

  const footerQueries = STARTER_QUERIES.filter((q) => FOOTER_INDEX.includes(q.label));

  return (
    <div className="min-h-dvh bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <Grain />
      <Analytics />

      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold tracking-tight">
              {recruiter.name} <span className="font-mono text-xs font-normal text-zinc-400 dark:text-zinc-500">/ career.db</span>
            </p>
            <p className="truncate text-[13px] text-zinc-500 dark:text-zinc-400">{recruiter.role}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">
            <span aria-label="Current time in India">{clock} IST</span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="border border-zinc-200 px-2 py-1 hover:border-[#ff4d00] hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:border-zinc-800"
            >
              {dark ? 'light' : 'dark'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        <Omnibar
          input={input}
          onInput={setInput}
          onRun={run}
          parseError={state.parseError}
          lastQuery={state.lastQuery}
        />
      </div>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0">
          <ResultSurface result={state.result} lastQuery={state.lastQuery} />
        </div>
        <Inspector plan={state.plan} result={state.result} lastQuery={state.lastQuery} />
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <nav aria-label="Pre-saved queries">
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {footerQueries.map((q) => (
                <li key={q.label}>
                  <button
                    type="button"
                    onClick={() => run(q.query)}
                    className="w-full py-2 text-left text-sm text-zinc-600 hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00] dark:text-zinc-400 dark:hover:text-[#ff4d00]"
                  >
                    <span className="font-display font-medium">{q.label}</span>
                    <span className="ml-2 font-mono text-xs text-zinc-400 dark:text-zinc-600">{q.query}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-200 pt-4 font-mono text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <a href={`mailto:${recruiter.contact.email}`} className="hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">
              {recruiter.contact.email}
            </a>
            <a href={recruiter.contact.github} className="hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">github</a>
            <a href={recruiter.contact.linkedin} className="hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">linkedin</a>
            <a href={recruiter.contact.resume} className="hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]">resume.pdf</a>
            <span className="ml-auto">sha {BUILD_SHA}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
