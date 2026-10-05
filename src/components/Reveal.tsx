// Reveal: one-shot in-view sequential reveal for figure nodes. Nodes sit
// 12px low and rise into place in processing order (parent passes index),
// transform only, once. Opacity is never touched: below-fold nodes keep full
// contrast so axe/Lighthouse never measure a mid-fade state, and content is
// complete for assistive tech before it is seen. Reduced motion renders the
// final state instantly. No timers, no loops.
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  index?: number;
  className?: string;
  children: ReactNode;
}

export function Reveal({ index = 0, className = '', children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 90}ms` }}
      className={`${className} transition-transform duration-500 motion-reduce:translate-y-0 ${
        shown ? 'translate-y-0' : 'translate-y-3'
      }`}
    >
      {children}
    </div>
  );
}
