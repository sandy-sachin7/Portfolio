import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NAV } from '../lib/content.placeholders';
import { scrollToId } from '../lib/scroll';

/**
 * Cmd-K quick nav. Instant state-jump across the long scroll run.
 * Focus-trap-lite: autofocus, arrows + Enter, Escape to close.
 */
export default function CommandPalette() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('checkpoint:palette-open', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('checkpoint:palette-open', onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open ]);

  const results = NAV.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase()),
  );

  const go = (id: string) => {
    setOpen(false);
    // Let the overlay unmount before scrolling under Lenis.
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/70 px-4 pt-32"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Jump to section"
        >
          <div
            className="w-full max-w-md border border-paper/20 bg-ink"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                }
                if (e.key === 'Enter' && results[active]) go(results[active].id);
              }}
              placeholder="jump to…"
              className="w-full border-b border-paper/20 bg-transparent px-4 py-3 font-mono text-sm text-paper outline-none placeholder:text-paper/40"
              aria-label="Filter sections"
            />
            <ul>
              {results.map((n, i) => (
                <li key={n.id}>
                  <button
                    onClick={() => go(n.id)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center justify-between px-4 py-3 font-mono text-sm ${
                      i === active ? 'bg-signal text-ink' : 'text-paper/80'
                    }`}
                  >
                    {n.label}
                    <span className={i === active ? 'text-ink/60' : 'text-paper/40'}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-4 py-3 font-mono text-sm text-paper/40">
                  no match
                </li>
              )}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
