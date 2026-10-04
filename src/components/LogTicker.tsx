import { TICKER_LINES } from '../lib/content.placeholders';

/**
 * The ONE marquee on the page. Ambient training-log feedback
 * that never steals focus. Pure CSS translateX loop, content ×2.
 */
export default function LogTicker() {
  return (
    <div
      className="overflow-hidden border-y border-ink/15 py-3 dark:border-paper/15"
      aria-label="Training log stream"
    >
      <div className="ticker-track flex w-max items-center gap-8 font-mono text-xs tracking-[0.18em] text-ink/60 dark:text-paper/60">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex items-center gap-8"
            aria-hidden={copy === 1}
          >
            {TICKER_LINES.map((line) => (
              <span key={`${copy}-${line}`} className="whitespace-nowrap">
                <span className="mr-3 text-signal">▸</span>
                {line}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
