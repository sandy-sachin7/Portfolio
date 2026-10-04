import { motion, useReducedMotion } from 'motion/react';

interface SectionHeadProps {
  index: string;
  title: string;
}

/** Mono index + display title. One focused message, no floating paragraph. */
export default function SectionHead({ index, title }: SectionHeadProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="mb-10 md:mb-14"
    >
      <div className="font-mono text-xs tracking-[0.25em] text-signal">{index}</div>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
        {title}
      </h2>
    </motion.div>
  );
}
