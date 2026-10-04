import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import LossCanvas from './LossCanvas';
import { scrollToId } from '../lib/scroll';

/** The single magnetic CTA on the page. Transform-only spring. */
function MagneticButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  return (
    <motion.button
      onClick={onClick}
      style={reduce ? undefined : { x: sx, y: sy }}
      onMouseMove={(e) => {
        if (reduce || window.matchMedia('(pointer: coarse)').matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.98 }}
      className="inline-block bg-signal px-6 py-3 font-mono text-sm tracking-[0.12em] text-ink"
    >
      {children}
    </motion.button>
  );
}

/**
 * Split hero: left type, right loss canvas. Viewport fit is law:
 * headline 2 lines max, subtext 12 words, CTAs visible without scroll.
 */
export default function Hero({ run }: { run: { progress: MotionValue<number> } }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-[100dvh] items-center pt-24 pb-16"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-xs tracking-[0.25em] text-signal">
            TRAINING RUN // PUBLIC LOG
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-none tracking-tight md:text-6xl">
            Santhosh Sachin trains models in public.
          </h1>
          <p className="mt-5 max-w-[45ch] leading-relaxed text-ink/70 dark:text-paper/70">
            AI engineer building LLM systems and backends. Every scroll is
            another epoch.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <MagneticButton onClick={() => scrollToId('checkpoints')}>
              View checkpoints
            </MagneticButton>
            <span className="font-mono text-xs tracking-[0.18em] text-ink/50 dark:text-paper/50">
              or press ⌘K
            </span>
          </div>
        </motion.div>
        <motion.div
          style={reduce ? undefined : { y: canvasY, opacity: canvasOpacity }}
          className="h-72 w-full md:h-[420px]"
          aria-label="Loss landscape with descent path"
          role="img"
        >
          <LossCanvas progress={run.progress} />
        </motion.div>
      </div>
    </section>
  );
}
