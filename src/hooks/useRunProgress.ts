import { useScroll, useTransform, type MotionValue } from 'motion/react';

export interface RunProgress {
  progress: MotionValue<number>;
  epoch: MotionValue<number>;
  loss: MotionValue<number>;
  lr: MotionValue<number>;
}

const TOTAL_EPOCHS = 24;
const LOSS_START = 2.4;
const LOSS_END = 0.31;
const LR_START = 3e-4;
const LR_END = 3e-5;

/**
 * Scroll-linked training state. Scroll position IS the epoch counter.
 * MotionValues bypass re-render; consumers format via useMotionValueEvent.
 */
export function useRunProgress(): RunProgress {
  const { scrollYProgress: progress } = useScroll();
  const epoch = useTransform(progress, [0, 1], [0, TOTAL_EPOCHS]);
  const loss = useTransform(progress, [0, 1], [LOSS_START, LOSS_END]);
  const lr = useTransform(progress, [0, 1], [LR_START, LR_END]);
  return { progress, epoch, loss, lr };
}
