import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const STAGES = ['BOOT', 'LOAD WEIGHTS', 'READY'];

/**
 * Staged boot preloader (~1.2s). Sets the training-run story in one beat.
 * Skippable via click or Escape. Skipped entirely under reduced motion.
 */
export default function Boot() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(
    () => !sessionStorage.getItem('checkpoint:booted'),
  );
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!visible || reduce) return;
    const dismiss = () => {
      sessionStorage.setItem('checkpoint:booted', '1');
      setVisible(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    const timers = [
      window.setTimeout(() => setStage(1), 400),
      window.setTimeout(() => setStage(2), 800),
      window.setTimeout(dismiss, 1250),
    ];
    window.addEventListener('keydown', onKey);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('keydown', onKey);
    };
  }, [visible, reduce]);

  if (reduce || !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => {
            sessionStorage.setItem('checkpoint:booted', '1');
            setVisible(false);
          }}
          role="status"
          aria-label="Loading training run"
        >
          <div className="font-mono text-sm tracking-[0.3em] text-paper">
            {STAGES[stage]}
            <span className="ml-2 inline-block h-3 w-2 animate-pulse bg-signal" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
