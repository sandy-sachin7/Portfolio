import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import SectionHead from './SectionHead';
import { NOTES } from '../lib/content.placeholders';

/**
 * Field notes as an editorial index: hairline rows, no cards.
 * Rows are articles, not links — no dead hrefs until URLs exist.
 */
export default function FieldNotes() {
  const reduce = useReducedMotion();

  return (
    <section id="notes" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHead index="05 / FIELD NOTES" title="Field notes" />
        <div className="border-t border-ink/20 dark:border-paper/20">
          {NOTES.map((note, i) => (
            <motion.article
              key={note.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group grid gap-1 border-b border-ink/20 py-6 transition-transform duration-300 hover:translate-x-1 dark:border-paper/20 md:grid-cols-[110px_1fr_auto] md:items-baseline md:gap-6"
            >
              <p className="font-mono text-xs tracking-[0.18em] text-ink/50 dark:text-paper/50">
                {note.date}
              </p>
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                  {note.title}
                </h3>
                <p className="mt-1 text-sm text-ink/65 dark:text-paper/65">
                  {note.excerpt}
                </p>
              </div>
              <p className="flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-ink/50 dark:text-paper/50">
                {note.readTime}
                <ArrowUpRight size={14} className="text-signal" aria-hidden="true" />
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
