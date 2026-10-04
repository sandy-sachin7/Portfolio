import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import SectionHead from './SectionHead';
import { WEIGHT_CLUSTERS } from '../lib/content.placeholders';

interface Cell {
  cluster: string;
  name: string;
  heat: number;
}

const CELLS: Cell[] = WEIGHT_CLUSTERS.flatMap((c) =>
  c.weights.map((w) => ({
    cluster: c.name,
    name: w,
    heat: (w.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % 60) / 60,
  })),
);

const COLS = 8;

/**
 * Weights as an inspectable matrix, not bars. Hover (or tap) a cell
 * to read its cluster and name. Static heatmap under reduced motion.
 */
export default function Weights() {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<number>(-1);
  const glowRef = useRef<number>(0);
  const [active, setActive] = useState<Cell | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;

    const cellAt = (mx: number, my: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = mx - rect.left;
      const y = my - rect.top;
      const size = rect.width / COLS;
      const col = Math.floor(x / size);
      const row = Math.floor(y / size);
      const idx = row * COLS + col;
      return idx >= 0 && idx < CELLS.length ? idx : -1;
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      const rows = Math.ceil(CELLS.length / COLS);
      h = (rect.width / COLS) * rows;
      canvas.style.height = `${h}px`;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const size = w / COLS;
      glowRef.current += ((hoverRef.current >= 0 ? 1 : 0) - glowRef.current) * 0.2;
      ctx.clearRect(0, 0, w, h);
      CELLS.forEach((cell, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = col * size;
        const y = row * size;
        const isHot = i === hoverRef.current;
        const alpha = 0.15 + cell.heat * 0.55 + (isHot ? glowRef.current * 0.3 : 0);
        ctx.fillStyle =
          isHot || cell.heat > 0.72
            ? `rgba(255, 77, 0, ${Math.min(1, alpha + 0.2).toFixed(3)})`
            : `rgba(113, 113, 122, ${alpha.toFixed(3)})`;
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
      });
    };

    const onMove = (e: MouseEvent) => {
      hoverRef.current = cellAt(e.clientX, e.clientY);
      const idx = hoverRef.current;
      setActive(idx >= 0 ? CELLS[idx] : null);
    };
    const onLeave = () => {
      hoverRef.current = -1;
      setActive(null);
    };

    if (reduce) {
      draw();
    } else {
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseleave', onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [reduce]);

  return (
    <section id="weights" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHead index="04 / WEIGHTS" title="Weights" />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            role="img"
            aria-label="Weight matrix of skill clusters"
            onClick={(e) => {
              if (reduce) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const size = rect.width / COLS;
              const col = Math.floor((e.clientX - rect.left) / size);
              const row = Math.floor((e.clientY - rect.top) / size);
              const idx = row * COLS + col;
              setActive(idx >= 0 && idx < CELLS.length ? CELLS[idx] : null);
            }}
          />
          <p className="mt-3 h-5 font-mono text-xs tracking-[0.18em] text-signal" aria-live="polite">
            {active ? `${active.cluster} / ${active.name}` : 'hover the matrix'}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Clusters">
            {WEIGHT_CLUSTERS.map((c) => (
              <li
                key={c.name}
                className="border border-ink/25 px-2 py-1 font-mono text-xs tracking-[0.12em] text-ink/70 dark:border-paper/25 dark:text-paper/70"
              >
                {c.name}×{c.weights.length}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
