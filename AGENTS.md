# AGENTS.md — Portfolio Revamp Bible (`revamp/award-winning-portfolio`)

> End-to-end source of truth for the award-winning revamp. Read this file before any work on this branch.
> Concept: **CHECKPOINT // A Training Run In Public** — the whole page is one live training run; scroll = epochs.
> Design shell NOW, real content LATER. Content placeholders use `TODO(content)` and never block design gates.

## 0. Design Read + Dials

- **Read:** developer portfolio (AI/backend engineer) for freshers through 30-yr veterans, experimental lab-instrument language, Tailwind + scroll-driven canvas.
- **Dials:** `DESIGN_VARIANCE: 9 / MOTION_INTENSITY: 7 / VISUAL_DENSITY: 3`
- **Branch:** all work on `revamp/award-winning-portfolio` (off `main`). Never commit to `main` from here.

## 1. Scope

- **IN:** tokens/fonts/shell, boot + hero + loss canvas + readout, log ticker, checkpoints horizontal pan, ablations diff view, weights matrix canvas, notes index, deploy footer, Cmd-K nav, IST clock + build SHA, dual themes, QA gates.
- **OUT / deferred:** real copy, project data/dates/links, resume PDF refresh, generated art. Mark with `TODO(content): ...`.
- **Non-goals:** no Tailwind v4 migration, no backend, no router, no test framework yet (see §7), no touching `main`.

## 2. Locked Tokens (do not improvise)

- **Accent (one, locked):** Signal Orange `#FF4D00` everywhere. Zinc neutrals. Ink `#0E0E11`, Paper `#EDECE8`.
- **Bans:** no purple/blue glow, no gradient text (`bg-gradient-to` / `bg-clip-text` / `text-transparent` = fail), no pure `#000`/`#fff`, saturation <80% except accent.
- **Type:** Display `Space Grotesk`, Body `Satoshi`/`Geist`, Mono `JetBrains Mono` (ALL numbers mono). Self-host `@font-face` + `font-display: swap`. No Google `<link>`. No Inter-default, no Fraunces/Instrument.
- **Shape:** all-sharp, max `2px` radius. Square buttons only. One documented rule, zero mixing.
- **Theme:** dual-mode via `dark:` variant (`darkMode: 'class'` kept). Same orange both modes. Dark = default lab. No section inverts the page theme.
- **Copy register:** terse lab voice. No em-dashes (`—` = fail), no `92%`-style fake precision, one CTA label per intent reused in nav/hero/footer (`View checkpoints`).

## 3. Layout Families (one family max ONCE per page)

1. Boot + Hero — **split** (left type / right loss canvas). Centered hero banned. Must fit viewport: `min-h-[100dvh]` (never `h-screen`), `pt-24` max, headline ≤2 lines, subtext ≤20 words, CTAs visible without scroll.
2. Log ticker — the **ONE** marquee (CSS `translateX(-50%)` loop). `MARQUEE count ≤ 1`.
3. Dossier (About) — field file: portrait + redacted lines + stamp, max 3 hand-annotations.
4. Checkpoints (Projects) — GSAP pinned horizontal scrub (desktop) / vertical stack (mobile).
5. Ablations (Experience) — changelog/diff `+`/`-` rows, mono timeline. No cards.
6. Weights (Skills) — clusters + weight-matrix canvas. **% bars banned.**
7. Field Notes (Blog) — editorial index rows with hairlines + hover preview. No cards.
8. Deploy (Contact) — massive footer type + single CTA + IST clock + build SHA.
- Eyebrows ≤2 page-wide. No split-header (headline + floating right paragraph). No zigzag (≤1 image+text split total). Bento needs ≥2 visually distinct cells. Nav single line, ≤80px desktop.

## 4. Architecture

- **Keep + extend:** `tailwind.config.js` (`darkMode:'class'`, palettes, add mono/run tokens, prune unused `fadeIn` keyframes), `postcss.config.js`, `src/main.tsx`, `public/assets/profile.jpg` (canonical).
- **Rewrite:** `index.html` (meta/OG/theme-color, font preloads, `dark` FOUC guard, keep `/src/main.tsx` entry), `src/index.css` (directives + `scroll-behavior`, `::selection`, scrollbar, `dvh` helpers), `src/App.tsx` (fix `<Analytics/>` — currently dead code outside `return`, must move inside; add run-state shell + section order), `src/components/Header.tsx` (slim run-console HUD; keep `scrollToSection` + dark toggle behavior), `src/components/Contact.tsx` (rebuild as Deploy finale; fix resume href to `/assets/...` after copying PDF into `public/`; current `assets/Resume/...` 404s and wrong `gray/blue` palette).
- **Delete (salvage data only):** `Hero.tsx` (centered template), `About.tsx` (keep Amrita/CGPA/GDSC facts), `Experience.tsx` (keep Lam/Fidelity data), `Projects.tsx` (keep titles/tags; drop Unsplash + `example.com`/`yourusername` links), `Skills.tsx` (delete 157 lines incl. `progressBarVariant`; migrate names only), `Blog.tsx` (drop `href="#"` + stale 2024 dates).
- **New (proposed):** `src/components/{Boot,Readout,Hero,LogTicker,Dossier,Checkpoints,Ablations,Weights,FieldNotes,Deploy,CommandPalette,Grain}.tsx` + `src/hooks/{useRunProgress,useIstClock}.ts` + `src/lib/{tokens,nav,content.placeholders}.ts`. One responsibility per file.
- **Assets:** single-source `public/assets/` (`profile.jpg` + copied resume PDF). Purge Unsplash remotes. Image TODOs: hero micrograph 1600×1200, 2 checkpoint covers 1200×800, portrait 800×1000, tileable grain SVG.
- **Deps:** migrate `framer-motion` → `motion/react` (`motion` pkg), add `lenis` + `gsap` (+ScrollTrigger). Keep `lucide-react`, lock `strokeWidth 1.5`, one icon family. Add scripts `"typecheck": "tsc --noEmit"`, `"verify": "npm run typecheck && npm run lint && npm run build"`.

## 5. Motion Spec (MOTION_INTENSITY 7 — every animation needs a one-sentence reason)

| Interaction | Implementation | Mobile <768px | Reduced-motion |
|---|---|---|---|
| Boot ~1.2s staged (`BOOT→READY`), skippable (click/Esc) | `motion/AnimatePresence` | shorter copy | skip entirely |
| Readout `epoch/loss/lr` from scroll | `useScroll`+`useTransform`+`useMotionValueEvent`; NEVER `window.scroll`/scrollY-in-state | epoch+% only | static `ep 00 / loss —` |
| Hero loss-landscape canvas | `<canvas>` rAF + scroll parallax (`y/scale/opacity` only) | static poster | frozen frame |
| Log ticker (ONE) | CSS keyframes `translateX(-50%)`, content ×2 | slower | `animation: none` |
| Checkpoints pan | GSAP ScrollTrigger `start: top top, pin, scrub: 1, end: +=distance`, `invalidateOnRefresh`, kill on unmount | vertical stack, no GSAP | stack, no pin |
| Reveals | `motion/whileInView` stagger, `once: true` | stagger 0.04, y≤12px | final state |
| Magnetic CTA (hero primary ONLY) | `useMotionValue`+`useSpring`, transform-only | disabled (`pointer: coarse`) | disabled |
| Cmd-K palette | overlay + `AnimatePresence`, focus-trap, arrows+Enter, Esc | full-screen sheet | instant show/hide |
| IST clock + build SHA | 1s interval + build-injected SHA; no motion lib | stacked | same (content, not animation) |
| Weights matrix hover | `<canvas>` rAF hover lerp, pause off-screen via IntersectionObserver | tap-to-highlight | static heatmap |
- Global: transform/opacity only; `will-change` sparingly; grain = one `fixed inset-0 pointer-events-none` layer; keyboard scroll + anchors must survive Lenis; StrictMode double-mount clean.

## 6. Phases + Gates

```
P0 Scaffold (deps, typecheck/verify scripts, shell) → verify: `npm run verify` green
P1 Tokens/themes/fonts/grain/base layout → verify: no FOUC, toggle flips all sections, both themes readable
P2 Sections (hero/dossier/checkpoints/ablations/weights/notes/deploy) → verify: greps clean, 390px no h-scroll
P3 Motion/scroll (Lenis+GSAP+motion migration) → verify: reduced-motion static, no jank/shift
P4 Interact/a11y (Cmd-K, keyboard, focus, alt, clock/SHA) → verify: Lighthouse A11y ≥95, keyboard-only pass
P5 Release → `npm run build && npm run preview` + Lighthouse desktop+mobile: LCP<2.5s INP<200ms CLS<0.1, zero console errors
```
Record Lighthouse baseline at P2 (pre-motion) so P3 regressions are attributable.

## 7. Verification

- **Gate:** `npm run verify` green before any merge. No `vitest` yet — add it only when Cmd-K/clock logic lands or first refactor regression; then cover interactive utils only (80%+), presentational sections excluded. Content accuracy explicitly NOT tested (deferred).
- **Anti-slop greps (expect zero hits unless noted):**
```bash
grep -rnE '\bh-screen\b' src/ --include='*.tsx' --include='*.css'
grep -rnEi 'skill.*%|w-\[[0-9]+%|width:\s*[0-9]+%' src/ --include='*.tsx' --include='*.css'
grep -rnE 'bg-gradient-to|bg-clip-text|text-transparent' src/ --include='*.tsx' --include='*.css'
grep -rn '—' src/ --include='*.tsx'
grep -rn "from ['\"]framer-motion['\"]" src/ --include='*.tsx'
grep -rn 'pointer-events-none' src/ --include='*.tsx' | grep -i 'grain'
grep -rci 'marquee' src/ --include='*.tsx'  # total ≤ 1
grep -rci 'eyebrow' src/ --include='*.tsx'  # total ≤ 2
```
- **Manual QA:** themes persist reload · 390px no h-scroll, targets ≥44px · reduced-motion (OS + DevTools) static · Tab order + Cmd/Ctrl-K/Esc/arrows + focus-trap + `:focus-visible` rings · meaningful `alt` · footer SHA (prod) + `Asia/Kolkata` clock at midnight boundary · grain never blocks clicks · zero console errors both themes.
- **A11y:** WCAG AA body (4.5:1) mandatory, AAA hero attempt; document intentional misses.

## 8. Known Constraints (from codebase audit)

- `App.tsx:16` `<Analytics/>` renders nothing — move inside return.
- `Contact.tsx:59` resume path 404s — copy PDF to `public/assets/`, href `/assets/<file>`.
- `scrollToSection` couples nav ids (`about,experience,projects,skills,blog,contact`); Hero has no id; renames need `scroll-mt-24` + nav map update.
- Fixed header ≈68px — account in `whileInView` thresholds.
- `noUnusedLocals/Parameters` strict — prune dead variants/imports (`React` defaults unused under `react-jsx`).
- Placeholders to purge: Unsplash IDs `1526374965328-7f61d4dc18c5`/`1677442136019-21780ecad995`, `example.com`, `yourusername`, `href="#"`, `Hero.tsx:62` joke line, stale `Jun 2023 - Present`.
