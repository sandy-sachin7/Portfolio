import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { NAV } from '../lib/content.placeholders';
import { scrollToId } from '../lib/scroll';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Slim run-console HUD: readout sits above, this bar holds mark,
 * section nav, theme toggle, and the palette trigger. One line, ≤72px.
 */
export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <header className="fixed inset-x-0 top-7 z-[70] border-b border-ink/15 bg-paper/90 backdrop-blur-md dark:border-paper/15 dark:bg-ink/90">
      <nav className="mx-auto flex h-11 max-w-6xl items-center justify-between px-4" aria-label="Sections">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-lg font-bold tracking-tight"
          aria-label="SS/ back to top"
        >
          SS<span className="text-signal">/</span>
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className="font-mono text-xs tracking-[0.18em] text-ink/70 transition-colors hover:text-signal dark:text-paper/70"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new Event('checkpoint:palette-open'))}
            className="hidden border border-ink/25 px-2 py-1 font-mono text-xs text-ink/70 sm:block dark:border-paper/25 dark:text-paper/70"
            aria-label="⌘K open command palette"
          >
            ⌘K
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-ink/70 transition-colors hover:text-signal dark:text-paper/70"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
          <button
            className="p-2 text-ink/70 md:hidden dark:text-paper/70"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink/15 px-4 py-2 md:hidden dark:border-paper/15">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className="block w-full py-2 text-left font-mono text-sm tracking-[0.12em]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
