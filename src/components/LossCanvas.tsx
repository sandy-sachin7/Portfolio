import { useEffect, useRef } from 'react';
import { useReducedMotion, type MotionValue } from 'motion/react';

const ROWS = 15;

/**
 * Loss-landscape canvas: ridge field with a valley, one signal-orange
 * descent path, and a traveler dot bound to scroll progress.
 * Visualizes descending into a loss basin: the thesis of the page.
 */
export default function LossCanvas({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const ridgeY = (x: number, row: number, t: number) => {
      const n =
        Math.sin(x * 0.008 + row * 0.9 + t * 0.4) * 14 +
        Math.sin(x * 0.021 + row * 1.7 - t * 0.25) * 8;
      const valley =
        Math.exp(-Math.pow((x / w - 0.5 - row * 0.02) * 3, 2)) * 46;
      return h * (0.12 + row * 0.055) + n - valley * (row / ROWS);
    };

    const pathPoint = (s: number): [number, number] => [
      w * (0.08 + s * 0.78),
      h * (0.85 - s * 0.62) + Math.sin(s * 9) * 10 * (1 - s),
    ];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (let row = 0; row < ROWS; row++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = ridgeY(x, row, t);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(113, 113, 122, ${(0.12 + (row / ROWS) * 0.5).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const [x, y] = pathPoint(i / 60);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#FF4D00';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const s = Math.min(1, Math.max(0, progress.get()));
      const [dx, dy] = pathPoint(s);
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FF4D00';
      ctx.fill();
    };

    if (reduce) {
      draw(0);
      return () => window.removeEventListener('resize', resize);
    }
    const start = performance.now();
    const loop = (now: number) => {
      draw((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [progress, reduce]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
