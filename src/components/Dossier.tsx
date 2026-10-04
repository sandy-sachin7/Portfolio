import { motion, useReducedMotion } from 'motion/react';
import SectionHead from './SectionHead';
import { DOSSIER_FACTS } from '../lib/content.placeholders';

/**
 * Dossier: a field file, not a card stack. Portrait + record lines +
 * one clearance stamp, with two hand annotations. Max three, used two.
 */
export default function Dossier() {
  const reduce = useReducedMotion();

  return (
    <section id="dossier" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHead index="01 / FILE" title="Dossier" />
        <div className="grid gap-10 md:grid-cols-[320px_1fr] md:gap-14">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src="/assets/profile.jpg"
              alt="Portrait of Santhosh Sachin"
              className="w-full border border-ink/20 object-cover dark:border-paper/20"
            />
            <p className="mt-3 -rotate-1 font-sans text-sm italic text-ink/60 dark:text-paper/60">
              trains in public, ships anyway
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative border border-ink/20 dark:border-paper/20"
          >
            <div
              aria-hidden="true"
              className="absolute -top-4 right-6 rotate-6 border-2 border-signal px-3 py-1 font-mono text-xs tracking-[0.3em] text-signal"
            >
              ON FILE
            </div>
            <dl className="divide-y divide-ink/10 dark:divide-paper/10">
              {DOSSIER_FACTS.map((fact) => (
                <div key={fact.key} className="grid grid-cols-[120px_1fr] gap-4 px-5 py-3">
                  <dt className="font-mono text-xs tracking-[0.18em] text-ink/50 dark:text-paper/50">
                    {fact.key}
                  </dt>
                  <dd className="font-mono text-sm">
                    {fact.redacted ? (
                      <>
                        <span className="bg-ink px-6 select-none dark:bg-paper" aria-hidden="true">
                          redacted
                        </span>
                        <span className="sr-only">{fact.value}</span>
                      </>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="border-t border-ink/10 px-5 py-3 font-sans text-sm italic text-ink/60 dark:border-paper/10 dark:text-paper/60">
              ask about the GNN work first
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
