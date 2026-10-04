// Omnibar (F2): query-first navigation. Real input, real label, instant feedback.
import { useEffect, useState } from 'react';
import type { ParseError } from '../query/parser';
import { encodeQueryUrl } from '../lib/nav';

interface Props {
  input: string;
  onInput: (v: string) => void;
  onRun: (q: string) => void;
  parseError: ParseError | null;
  lastQuery: string;
}

const EXAMPLES = [
  'SHOW projects',
  'SHOW failures WHERE costDays > 14',
  'SHOW experiments WHERE stage = "ADOPTED"',
  'COMPARE proj-contextd vs proj-shard',
  'WITHOUT rust',
];

export function Omnibar({ input, onInput, onRun, parseError, lastQuery }: Props) {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [lastQuery]);

  const copyLink = async () => {
    if (!lastQuery) return;
    const url = `${window.location.origin}${window.location.pathname}${encodeQueryUrl(lastQuery)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onRun(input);
        }}
        role="search"
        aria-label="Query career database"
      >
        <label htmlFor="omnibar" className="sr-only">
          Query the career database
        </label>
        <div className="flex items-stretch gap-0">
          <span aria-hidden="true" className="pl-4 pr-2 py-3 font-mono text-sm text-[#ff4d00] select-none">
            &gt;
          </span>
          <input
            id="omnibar"
            value={input}
            onChange={(e) => onInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            placeholder='try: SHOW failures WHERE costDays > 14'
            className="w-full bg-transparent py-3 font-mono text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 px-4 font-mono text-sm text-zinc-500 hover:text-[#ff4d00] dark:text-zinc-400 dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            run
          </button>
          <button
            type="button"
            onClick={copyLink}
            disabled={!lastQuery}
            aria-label="Copy shareable link to this query"
            className="shrink-0 px-4 font-mono text-sm text-zinc-500 hover:text-[#ff4d00] disabled:opacity-30 dark:text-zinc-400 dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            {copied ? 'copied' : 'copy link'}
          </button>
        </div>
      </form>
      <div aria-live="polite" className="px-4 pb-2 font-mono text-xs">
        {parseError ? (
          <p className="text-red-600 dark:text-red-400">
            {parseError.token ? `token "${parseError.token}" failed: ` : ''}
            {parseError.message}
            {parseError.suggestion ? ` · try: ${parseError.suggestion}` : ''}
          </p>
        ) : (
          <p className="text-zinc-400 dark:text-zinc-600">
            grammar: SHOW ... WHERE ... ORDER BY ... LIMIT ... · SCHEMA · LOG · COMPARE a vs b · WITHOUT key
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 px-4 pb-3" aria-label="Example queries">
        {EXAMPLES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onRun(q)}
            className="border border-zinc-200 px-2 py-1 font-mono text-xs text-zinc-500 hover:border-[#ff4d00] hover:text-[#ff4d00] dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-[#ff4d00] dark:hover:text-[#ff4d00] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
