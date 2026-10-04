import { motion, useReducedMotion } from 'motion/react';
import SectionHead from './SectionHead';
import { ABLATIONS } from '../lib/content.placeholders';

/**
 * Ablations: a changelog, not cards. Each role keeps some rows
 * and drops others. Mono timeline, diff gutter, no elevation.
 */
export default function Ablations() {
  const reduce = useReducedMotion();

  return (
    <section id="ablations" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHead index="03 / ABLATIONS" title="Ablations" />
        <div className="space-y-14">
          {ABLATIONS.map((a, i) => (
            <motion.div
              key={a.org}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="border-t border-ink/20 pt-6 dark:border-paper/20"
            >
              <p className="font-mono text-xs tracking-[0.25em] text-ink/50 dark:text-paper/50">
                {a.period}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                {a.role} <span className="text-ink/50 dark:text-paper/50">— {a.org}</span>
              </h3>
              <ul className="mt-5 space-y-2">
                {a.kept.map((line) => (
                  <li key={line} className="flex gap-3 font-mono text-sm">
                    <span className="text-signal" aria-hidden="true">+</span>
                    <span>{line}</span>
                  </li>
                ))}
                {a.dropped.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 font-mono text-sm text-ink/45 dark:text-paper/45"
                  >
                    <span aria-hidden="true">−</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
