import type Lenis from 'lenis';

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Anchor navigation that survives Lenis (falls back when reduced-motion). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -72 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
