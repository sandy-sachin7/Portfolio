import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import SectionHead from './SectionHead';
import { CHECKPOINTS } from '../lib/content.placeholders';

gsap.registerPlugin(ScrollTrigger);

/**
 * Checkpoints read as timeline frames, so lateral scrub matches
 * the mental model. Pinned horizontal pan on desktop, plain
 * vertical stack on mobile and under reduced motion.
 */
export default function Checkpoints() {
  const reduce = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduce || !pinRef.current || !trackRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const track = trackRef.current as HTMLDivElement;
      const pin = pinRef.current as HTMLDivElement;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, [reduce]);

  return (
    <section id="checkpoints" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 pt-20 md:pt-28">
        <SectionHead index="02 / CHECKPOINTS" title="Checkpoints" />
      </div>
      <div ref={pinRef} className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex flex-col gap-16 px-4 pb-20 md:h-[100dvh] md:flex-row md:items-center md:gap-0 md:pb-0"
        >
          {CHECKPOINTS.map((c) => (
            <article
              key={c.title}
              className="flex flex-col justify-center md:h-full md:w-[72vw] md:shrink-0 md:px-[10vw]"
            >
              <p className="font-mono text-xs tracking-[0.25em] text-signal">
                {c.epoch}
              </p>
              <h3 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
                {c.title}
              </h3>
              <p className="mt-4 max-w-[50ch] leading-relaxed text-ink/70 dark:text-paper/70">
                {c.blurb}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Stack">
                {c.tags.map((t) => (
                  <li
                    key={t}
                    className="border border-ink/25 px-2 py-1 font-mono text-xs tracking-[0.12em] dark:border-paper/25"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-mono text-xs tracking-[0.12em] text-ink/60 dark:text-paper/60">
                {c.demo ?? 'demo: pending'} · {c.repo ?? 'repo: pending'}
              </p>
            </article>
          ))}
          <div
            className="hidden font-mono text-xs tracking-[0.25em] text-ink/40 md:block md:w-[20vw] md:shrink-0 dark:text-paper/40"
            aria-hidden="true"
          >
            END OF LOG
          </div>
        </div>
      </div>
    </section>
  );
}
