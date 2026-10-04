import { useRef } from 'react';
import { useMotionValueEvent, useReducedMotion } from 'motion/react';
import type { RunProgress } from '../hooks/useRunProgress';

/**
 * Fixed mono readout. Makes scroll legible as training progress.
 * MotionValues write straight to the DOM; no re-renders on scroll.
 */
export default function Readout({ run }: { run: RunProgress }) {
  const reduce = useReducedMotion();
  const epRef = useRef<HTMLSpanElement>(null);
  const lossRef = useRef<HTMLSpanElement>(null);
  const lrRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(run.epoch, 'change', (v) => {
    if (!reduce && epRef.current) {
      epRef.current.textContent = `ep ${String(Math.min(24, Math.floor(v))).padStart(2, '0')}/24`;
    }
  });
  useMotionValueEvent(run.loss, 'change', (v) => {
    if (!reduce && lossRef.current) {
      lossRef.current.textContent = `loss ${v.toFixed(3)}`;
    }
  });
  useMotionValueEvent(run.lr, 'change', (v) => {
    if (!reduce && lrRef.current) {
      lrRef.current.textContent = `lr ${v.toExponential(0)}`;
    }
  });

  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] flex h-7 items-center justify-between border-b border-paper/10 bg-ink px-4 font-mono text-[11px] tracking-[0.18em] text-paper/80"
      aria-hidden={reduce ? undefined : true}
    >
      <span ref={epRef}>ep 00/24</span>
      <span className="hidden sm:inline" ref={lossRef}>
        loss —
      </span>
      <span className="hidden md:inline" ref={lrRef}>
        lr —
      </span>
      <span className="text-signal">● RUNNING</span>
    </div>
  );
}
