# Design Decision Record — Concept #2 (post-CHECKPOINT divergence)

> Date: 2026-10-05 · Branch: `revamp/award-winning-portfolio` · Status: DECIDED, not yet implemented.
> Current implementation = **Concept #1** (`CHECKPOINT // A Training Run In Public`, 5 atomic commits, committed, shippable).
> This document records why we diverge, what wins, and what merges. The authoritative build spec is the rewritten `AGENTS.md`.

## 1. Critique of Concept #1 (CHECKPOINT)

Hostile panel (product designer, principal engineer, Awwwards juror). Condensed from full 10-answer review:

1. **Memorable:** the through-line. Career as one public training run; scroll = epochs; checkpoints/ablations/weights/deploy as section names. Most dev portfolios have no thesis; this one does.
2. **Predictable:** almost every execution choice. Split hero + canvas, boot preloader, marquee, grain, magnetic CTA, Cmd-K on 7 anchors, GSAP horizontal pan, clock+SHA footer, orange-on-zinc-dark, Grotesk + Mono. Seen assembled in this order since 2023.
3. **Familiar patterns:** skippable `BOOT→READY`, hero canvas as wallpaper, one marquee, grain-as-texture, single magnetic CTA, Cmd-K on a single page, horizontal scrub collapsing to stack, dual-theme same accent, SHA footer.
4. **Genuinely original:** the verb mapping. Experience-as-ablations (`+`/`-` rows), skills-as-explorable-matrix, checkpoints-as-loadable-states, readout-as-diegetic-progress. Concepts, not visuals.
5. **Metaphor as costume:** wherever telemetry is faked. Epoch/loss/lr derived from scroll communicate nothing; landscape canvas is wallpaper; ticker logs nothing (loops duplicates); `Dossier` smuggles a second (military) metaphor; `Deploy`-as-contact stretches past breaking.
6. **Why a top product designer rejects it:** optimizes for jury recognition over hiring comprehension. Projects in a horizontal trap, experience encoded as diffs that obscure scope, terse voice stripping outcomes, one CTA refusing to say what happens next. Motion budget spent on boot/grain/pinning, none of it on proving competence in 30 seconds.
7. **Why a principal engineer says "cool":** the discipline underneath. Scroll via MotionValues (never scrollY-in-state), transform/opacity only, rAF paused off-screen, StrictMode-safe GSAP teardown, focus-trapped palette, build-injected SHA, correct IST midnight handling, anti-slop greps + verify gate.
8. **Missing signature interaction:** functional ablation. Toggle off any checkpoint/skill/job and watch global run-state react (loss rises, heatmap cools, landscape reshapes). Turns fake telemetry into a real cause-effect model.
9. **Over-constraining rules in old AGENTS.md:** the linter-as-design-system. Locked accent in both themes, bans on all gradients/cards/bars/centered heroes, marquee≤1/eyebrow≤2/split≤1 quotas, radius≤2px, terse voice + no em-dashes + no specific numbers + one CTA label. Form chosen to dodge a grep, not serve content. Sometimes a project needs a card. Sometimes a skill needs a calibrated number with context.
10. **Worth preserving regardless:** ablations-as-diff-rows, weights-as-matrix, slim HUD over bulky header, one-marquee motion budget, transform-only + real reduced-motion fallback, single-source `public/assets`, SHA + real clock as provenance, verify gate + grep checks.

**Verdict on #1:** shippable, disciplined, forgettable-in-a-year. The engineering underneath is the real asset; the metaphor on top is costume where numbers aren't earned.

## 2. Five divergent concepts (condensed)

- **A · ABLATION INSTRUMENT** (evolve CHECKPOINT): page IS a training run where the visitor is the optimizer. Ablate anything → whole site reacts in 300ms (loss, heatmap, landscape, log receipt, deploy verdict). Real micro-predictor trains on visitor path; event-sourced `.jsonl` export; URL hash encodes ablation vector (shareable broken runs); 3 knobs that visibly change UI. Risk: illegibility, reads as fake blinking numbers.
- **B · CLEARANCE** (border checkpoint): visitor is the untrusted request; declare intent in 140 chars; deterministic visible parser routes to a lane; case files reorder, never hide. Projects+experience merged as dockets with exhibits, kills, release conditions. Risk: hostile/gatekeeping feel.
- **C · CAREER.DB** (query engine): career is a typed dataset (work/decisions/failures/notes); omnibar with tiny real grammar; EXPLAIN-style inspector (index, rows scanned, ms, cache); URL-addressable queries; COMPARE views; failures table with postmortems. Risk: cold, "Airtable with mono."
- **D · SEV-1 AT 03:14** (incident narrative): 4-minute incident debugged together; scroll = time; trace scrubber synced across latency graph + log tail + code diff; deploy-as-contact; mandatory `R`-key recruiter mode. Risk: mystery fatigue; story beats aren't indexable facts.
- **E · COLD BOOT** (ships dead): 4096MB RAM budget; projects are processes you run/kill; can't view all at full fidelity; staged OOM decay; real FSM + parser + full/degraded render paths. Risk (explicit, fatal): visitors think it's broken; costs interviews.

## 3. Adversarial scorecard (1–10; complexity 10 = simplest)

| Dimension | A Ablation | B Clearance | C Career.DB | D SEV-1 | E Cold Boot |
|---|---:|---:|---:|---:|---:|
| Originality | 9 | 8 | 7 | 6 | 9 |
| Memorability | 9 | 7 | 6 | 9 | 10 |
| Engineering credibility | 8 | 5 | 9 | 5 | 7 |
| Visual sophistication | 8 | 8 | 6 | 8 | 6 |
| Interaction quality | 9 | 5 | 8 | 5 | 5 |
| Narrative strength | 9 | 8 | 5 | 9 | 8 |
| Personality | 8 | 8 | 5 | 8 | 9 |
| Restraint | 5 | 7 | 9 | 5 | 2 |
| Technical storytelling | 9 | 6 | 9 | 8 | 6 |
| Recruiter usability | 5 | 5 | 9 | 5 | 1 |
| Mobile viability | 6 | 7 | 9 | 4 | 4 |
| Performance feasibility | 7 | 9 | 10 | 6 | 9 |
| Accessibility feasibility | 4 | 7 | 9 | 3 | 4 |
| Implementation complexity | 3 | 8 | 7 | 3 | 2 |
| Holy-shit factor | 9 | 5 | 5 | 8 | 8 |
| **TOTAL** | **108** | **103** | **113** | **92** | **90** |

Rank: **C > A > B > D > E.** Panel winner: C. Panel runner-up: A.

## 4. Winning concept: C (CAREER.DB), fused with A's ablation verb

I endorse the panel's ranking with one correction: **C alone is not enough.** C scores memorability 6 / personality 5 / holy-shit 5 — "Airtable with a mono font" is a real failure mode against the bar ("elite designers stop, explore, remember"). But A as the front door fails the people who hire (recruiter 5, mobile 6, a11y 4, complexity 3).

**Decision: C is the foundation; A's ablation becomes a query verb inside it.**

- `work WITHOUT kafka` → results filter AND a damage receipt renders (what broke, what lost its only evidence, coverage delta). Same causal thrill as A's toggles, but legible, keyboard-native, URL-addressable, mobile-safe, screen-reader-announced.
- The predictor/knobs/global-reactive-canvas layer of A is CUT. Too much machinery, too little legibility. One causal loop (ablation-as-query), not five coupled views.
- D contributes the recruiter kill-switch (`R` → static sheet, visible from second zero) and narrative causality inside case files.
- B contributes reorder-never-hide disclosure: every parse shows its receipt; filtering never gates.
- E contributes degraded-first rendering: noscript + no-JS facts sheet ships before any interactivity.

**Final thesis:** *Stop scrolling my resume. Query my judgment. Remove anything and watch what breaks.*

## 5. Runner-up: A (ABLATION INSTRUMENT)

The most AI-native idea and the strongest single interaction (site-wide ablation with receipts + shareable vectors). Loses as foundation because its credibility depends on provenance links a hurried principal never opens, while canvas + global 300ms updates wreck mobile, accessibility, and recruiter extraction. Preserved as the ablation verb + damage receipt inside C, not as the site.

## 6. Ideas merged from the losers

1. **From A:** ablation-as-query (`WITHOUT`/`EXCLUDE` + damage receipt + coverage delta). The signature moment.
2. **From D:** recruiter kill-switch (`R` key + visible button, static sheet, persists via localStorage) + decision-trace structure in case files (constraint → options → why).
3. **From B:** parse receipts + reorder-never-hide. Show what was understood; hide nothing.
4. **From E:** facts-first degraded paths. `<noscript>` sheet; content complete with JS dead, motion off, fonts failed.

## 7. Why the winner beats Concept #1

1. **Every number is earned.** CHECKPOINT's sin was scroll-mapped telemetry. Here nothing moves unless the visitor acts; every ms/inspector line is measured on-device (`performance.now()`), every count is a real row count.
2. **Facts in 30 seconds, depth on demand.** Boots with `SHOW highlights LIMIT 3` legible immediately; the query loop rewards exploration instead of requiring it. CHECKPOINT hid projects in a horizontal trap.
3. **The metaphor does work.** Querying IS evaluation: filter/project/compare is what hiring managers do. No costume, no second military metaphor, no contact-as-deploy stretch.
4. **Survives the wild.** Semantic tables feed ATS crawlers; mobile gets stacked definition lists (not a different site); reduced-motion gets instant state; keyboard path is complete via omnibar.
5. **Harder to fake.** A clone copies orange-on-ink in an afternoon; it can't copy 14 typed projects with honest constraints, linked failures, and a terse error voice without doing the editorial work. CHECKPOINT's visuals were the clonable part.

## 8. Revised AGENTS.md

Rewritten as the authoritative implementation bible for Concept #2 (CAREER.DB + ablation verb). Old §0–§8 superseded; Concept #1 implementation remains in git history (`revamp/award-winning-portfolio` commits) as fallback.

## 9. Recommended next implementation phase

**F0 · Dataset + content (first, blocks everything):** author the typed dataset (work/decisions/failures/notes), schemas, starter queries, recruiter sheet copy. No UI until the data is honest.
Then F1 (parser + inspector) → F2 (result views + case files) → F3 (ablation verb + receipts) → F4 (recruiter mode + a11y) → F5 (release gates).
