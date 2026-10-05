# AGENTS.md — Implementation Bible, Concept #2 (`revamp/award-winning-portfolio`)

> Read before any work on this branch. Supersedes the Concept #1 spec (CHECKPOINT; preserved in git history).
> **Final thesis:** *Stop scrolling my resume. Query my judgment. Remove anything and watch what breaks.*
> Product: **CAREER.DB** — the portfolio is a running query engine over a typed career dataset, with an ablation verb.
> Full reasoning: `DESIGN-DECISION.md`. Concept #1 implementation remains committed as fallback; do not regress it until #2 passes F2 gates.

## 1. Design Principles (load-bearing, in order)

1. **Every number is earned.** Nothing moves on scroll alone. Counts are row counts; ms are `performance.now()`; cache states are real. If it can't be computed, it isn't shown.
2. **Machine strict, person generous.** The engine is terse and exact; the human voice in case files is warm, specific, self-deprecating where earned. Never both strict.
3. **Filtering is curation, gating is arrogance.** Queries reorder and reveal; they never hide, lock, or punish. Every parse shows its receipt.
4. **Inspectability is the aesthetic.** EXPLAIN lines, schema views, error tokens, trace exports are layout details, not dev tools.
5. **Restraint is the spectacle.** One accent, two canvases max (prefer zero), no motion that doesn't explain state change. Discipline must be visible.
6. **Facts first, theater never.** Recruiter sheet, noscript sheet, and static fallback ship before any interactivity. Content is complete with JS dead.

## 2. Visual Identity

- Lab instrument, never hacker cosplay. No green-on-black, no scanlines, no `$` prompts, no blinking cursor, no ASCII boxes.
- Density is the aesthetic: 13px mono data, generous whitespace for prose. Hairlines separate; no cards, no shadows, no glow, no gradients, no particles, no WebGL.
- Accent means *executable*: query caret, result count, active filter chips, ablation damage. Never decoration, icons, or headlines.
- One fixed grain layer, `pointer-events-none`, ≤4% opacity, off under reduced-motion. Never blocks clicks.

## 3. Typography (strict role separation; mixing is a bug)

- **Machine voice — JetBrains Mono:** queries, table cells, inspector, timestamps, IDs, errors, clocks. ALL numbers mono, tabular (`tnum`).
- **Human voice — Space Grotesk (display) + Geist (body):** case files, decisions, postmortems, about statement, empty-state guidance.
- Self-host, `font-display: swap`, no Google `<link>`, no Inter default. Sentence case for human voice; uppercase tracked-out for machine labels only.

## 4. Color System

- Signal Orange `#FF4D00` (one accent, both themes, executable-only). Ink `#0E0E11`, Paper `#EDECE8`, zinc hairlines (`zinc-800` dark / `zinc-200` light).
- Dark = dim lab mode (default); light = paper. Same orange both. No pure `#000`/`#fff`. Contrast ≥7:1 body both themes (AAA target, AA floor 4.5:1).
- Ablated/removed state: struck + cooled, never hidden. Erasure hides causality.

## 5. Layout System

- No pages, no hero, no sections. One runtime, three persistent regions: **Omnibar** (top, always present), **Result surface** (center: LIST / READ / COMPARE views), **Inspector** (right rail, collapsible; below results on mobile).
- Boots with `SHOW highlights LIMIT 3`: three rows fully legible, no tutorial, queryable before fonts finish.
- Mobile <768px: inspector becomes disclosure below results; tables become stacked definition lists (designed, not degraded). Targets ≥44px.
- Single line top rail; footer index of 6 pre-saved human-labeled queries + SHA + IST clock. `min-h-[100dvh]`, never `h-screen`.

## 6. Interaction Principles

- **Query-first, links-second, scroll-last.** Omnibar is primary nav; every object has stable ID + copy-link resolving to a query; scroll only reads inside case files. Back button restores queries (history state per query).
- **One signature loop:** ask → evidence + provenance → damage receipt on removal. `WITHOUT`/`EXCLUDE` verb on any field renders coverage delta + what lost its only evidence.
- **Every input gets legible feedback ≤150ms.** Parse ghost line while typing; typed errors naming the exact failed token + nearest non-empty suggestion. Empty results must suggest the nearest query that returns rows.
- **Full keyboard path:** omnibar focusable first, arrows through rows/suggestions, Enter runs/opens, Esc clears/closes, `R` recruiter sheet, `?` grammar overlay. Focus-trapped overlays, visible `:focus-visible` rings.

## 7. Motion Principles (MOTION_INTENSITY 3 — motion explains state change, nothing else)

- Query transitions: 120ms opacity + 8px vertical shift max. Content readable frame one.
- READ expand: instant structure swap, only chevron rotates. No height animation (it lies about content).
- Inspector numbers snap. A tweened count is a fake metric.
- Reduced-motion: everything instant. No poster frames, no fallback animation. Just state.
- Transform/opacity only; `will-change` sparingly. No Lenis hijack of keyboard/anchors; no scroll-linked values, ever.

## 8. Navigation Model

- Omnibar grammar: `SHOW ... | work/decisions/failures/notes WHERE ... AND/OR ... SELECT ... ORDER BY ... LIMIT ...`, plus `SCHEMA <table>`, `LOG`, `COMPARE a vs b`, `WITHOUT/EXCLUDE` (ablation verb). Deliberately small; unparseable input → terse typed error with token + suggestion.
- Starter set + footer index in human labels ("Where you failed", "How to reach you"). Fills + runs the query.
- Recruiter kill-switch: `R` key + always-visible button → static sheet (name, role, 3 proof bullets, project lines + links, education, contact, PDF). Persists via localStorage. Never traps, never shames, instant swap.

## 9. Project Presentation Model

- Projects are rows opening into case files with FIXED schema: Constraint (stakeholder-quoted) → Decision (chose X, rejected Y, ≤40 words) → Trace (3–5 timestamped entries) → Attached failure (mandatory link, every project) → "If I did it again" (one paragraph, no hedging).
- One artifact max per project (real diff, real latency table, real query output) or a sentence saying why it can't be shown. Absence with reason beats mockups.
- COMPARE renders two decisions side-by-side with differing fields highlighted. Max ~3 deep projects; rest as appendix rows. Curation is credibility.

## 10. Technical Storytelling Model

- Narrative causality, not chronology: problem → constraint → decision → outcome → failure owned. Decision trace mandatory (tradeoffs, discarded options, what broke).
- Real mechanisms, named: typed dataset (work ~14, decisions ~30, failures ~9, notes ~20 rows) · recursive-descent parser → 4-node AST (Scan/Filter/Project/Sort-Limit) · trigram index on stack+outcome, sorted index on year, honest `full scan (N rows, fine at this scale)` · normalized-AST-hash LRU cache (cap 20) with real hit/miss · append-only in-session query log (`LOG`, clearable, `.jsonl` export).
- Opinionated ending: final view states what problems are wanted next + what is refused.

## 11. Responsive Behavior

- ≥1024px: three regions side by side. 768–1024: inspector collapses to toggleable rail. <768px: single column, omnibar sticky, inspector as disclosure, tables as definition lists, degraded-first (no canvas, no hover-dependent info).
- 390px: no h-scroll, no overlap, ≥44px targets. Mobile is designed first-class, not a fallback.

## 12. Accessibility Requirements

- Semantic tables (`<table>`, sticky `<th>`) usable by screen readers; live-region announcements for result counts, errors, ablation receipts.
- All controls real `<button>`/`<input>` with labels; every image/diagram has meaningful `alt` or `alt=""` + adjacent description.
- Keyboard-only full run completable; focus never lost on view swap. Reduced-motion = instant state. WCAG AA floor, AAA body target. Lighthouse A11y ≥95 gate.

## 13. Performance Requirements

- Loads queryable <1s on desktop broadband; LCP <2.5s, INP <200ms, CLS <0.1; Lighthouse Performance ≥90 both presets.
- Zero artificial delay (no fake spinners/streaming). Parser + 14-row scans are sub-ms; show instantly.
- Fonts preloaded, JS split (parser/data lazy after first paint if needed), zero console errors both themes. Tiny bundle: no 3D, no animation libs beyond `motion/react` for micro-transitions (or none).

## 14. Asset Strategy

- Single-source `public/assets/` (portrait, resume PDF at `/assets/<file>`). No remote images. Max one artifact per project, real only.
- OG/meta + theme-color in `index.html`; `dark` FOUC guard kept. Diagrams as inline SVG with `<title>`/desc for a11y.

## 15. Component Architecture (one responsibility per file)

- `src/db/{schema.ts,dataset.ts,indexes.ts,cache.ts,log.ts}` — data + engine (pure, unit-testable).
- `src/query/{tokenizer.ts,parser.ts,executor.ts,explain.ts}` — grammar → AST → results + plan lines.
- `src/components/{Omnibar,ResultSurface,CaseFile,CompareView,Inspector,RecruiterSheet,Grain}.tsx` + `src/hooks/{useQueryEngine,useIstClock}.ts` + `src/lib/{starterQueries,nav}.ts`.
- Engine files have ZERO JSX; components have ZERO query logic. `App.tsx` owns theme + shell + view routing. Keep `motion`/`lenis`/`gsap` only if earned (likely drop lenis+gsap; scroll isn't navigation anymore).

## 16. Implementation Phases (Concept #1 stays committed as fallback; do not delete until F2 gates pass)

```
F0 Dataset+content (schemas, honest rows, linked failures, recruiter copy) → gate: schema review, every project has a failure link
F1 Parser+inspector (grammar, EXPLAIN, errors+suggestions, URL queries) → gate: vitest on parser/executor 80%+, `npm run verify` green
F2 Views (LIST/READ/COMPARE, case files, starter query boot) → gate: greps clean, 390px clean, facts in 30s test
F3 Ablation verb (WITHOUT + damage receipts + coverage) → gate: keyboard-only ablation, receipt announced, URL restores vector
F4 Recruiter mode + a11y (R sheet, noscript sheet, live regions, focus) → gate: Lighthouse A11y ≥95, keyboard-only pass
F5 Release → preview + Lighthouse desktop+mobile (LCP<2.5s INP<200ms CLS<0.1), zero console errors
```

## 17. QA Gates

- `npm run verify` (`typecheck && lint && build`) green before any merge. `vitest` lands at F1 (parser/executor/cache only, 80%+); presentational components excluded. Content honesty reviewed by human at F0 (not tested).
- Anti-slop greps (zero hits unless noted):
```bash
grep -rnE '\bh-screen\b' src/ --include='*.tsx' --include='*.css'
grep -rnEi 'skill.*%|progressBar|w-\[[0-9]+%' src/ --include='*.tsx' --include='*.css'
grep -rnE 'bg-gradient-to|bg-clip-text|text-transparent' src/ --include='*.tsx' --include='*.css'
grep -rn '—' src/ --include='*.tsx'
grep -rnE 'setTimeout.*[1-9][0-9]{2,}|sleep|fake.*delay' src/ --include='*.ts' --include='*.tsx'
grep -rniE 'lorem|placeholder\.com|example\.com|yourusername|href="#"' src/ --include='*.tsx' --include='*.ts'
```
- Manual QA: 30-second recruiter test (stranger finds role + 1 proof + contact) · `R` sheet instant · empty-query suggestions work · error tokens exact · cache hit felt on repeat · URL paste reproduces query · midnight IST boundary · both themes AAA-attempt · zero console errors.

## 18. Anti-Generic / Anti-Slop Rules

- No simulated typing, streaming text, fake spinners, or staged delays. Sub-10ms results show instantly.
- No shell/terminal skin (`$`, blinking cursor, Kali aesthetics). Omnibar reads as command bar (Linear), not console.
- No "AI-powered" anything. Deterministic small grammar, proudly. No vector-search badge on 14 rows.
- No metrics about the portfolio itself (queries served, visitors). Only rows scanned/returned + measured ms.
- No em-dashes in copy, no fake precision, no hype adjectives, no outcome-only storytelling. Every claim links evidence or states why it can't be shown.
- Machine voice never editorializes; human voice never logs. Mixing is a bug.

## 19. Explicitly NOT Building

- Scroll-driven narrative, pinned horizontal sections, scroll-linked numbers, marquees, boot preloaders, magnetic buttons, cursor effects, particles/WebGL, theme-as-story shifts, gamified gates, puzzles, chatbots, fake AI parsing (LLM), semantic search, dashboards, uptime theater, skill bars/percentages, timeline infographics, testimonial carousels.

## 20. Award-Winning Criteria (all must hold)

1. Third query is faster than the first and the system says so (`cache hit`).
2. `failures where cost > 2_weeks` returns real postmortems. Vulnerability as data.
3. A shared URL reproduces an exact argument (`/q/compare-a-vs-b`) — hiring managers forward it.
4. A principal tries to break the parser and respects the error.
5. A recruiter gets facts in 30s without touching the omnibar.
6. Removing any skill via `WITHOUT` tells the truth about what breaks.
7. Zero jank, zero waiting, zero intro. Speed is the aesthetic.

## 21. Release Checklist

- [ ] F0–F5 gates all green; `npm run verify` clean
- [ ] Lighthouse desktop + mobile: Perf ≥90, A11y ≥95, LCP<2.5s, INP<200ms, CLS<0.1
- [ ] 30-second stranger test passed (record who + time)
- [ ] Parser fuzz test (10 hostile inputs) all return typed errors
- [ ] URL backward-compat: old shared queries still resolve
- [ ] noscript sheet renders name/role/proof/contact
- [ ] Both themes contrast-checked; reduced-motion verified (OS + DevTools)
- [ ] Zero console errors/warnings, prod preview, both themes
- [ ] Commit atomic on branch; PR to `main` only on explicit approval
