# F0 Review — Dataset + Content Architecture

> Verdict: **GO for F1** (with follow-ups in §21). Rationale in §24.
> Sources: resume PDF (verified), GitHub API `sandy-sachin7` (verified), user brief (asserted), inference (needs_check).

## 1. Evidence sources inspected

1. **Resume PDF** (`assets/Resume/SanthoshS_Resume.pdf`) — strongest source. Name: Santhosh Sachin. Amrita B.Tech CSE 2021–present, CGPA 8.41. Fidelity SWE Intern Jun–Aug 2024. Lam AI Research Intern May 2024–present ($50K grant, graph DB PoCs, temporal GNNs). One-View Jun–Aug 2024 (RAG, Azure OpenAI, OpenSearch/S3/EC2, 1000+ sources). Zephyr Oct–Nov 2023 (open LLM agent, Streamlit, LLaMA 13B/70B, Mistral 8x7B).
2. **GitHub API** (`sandy-sachin7`, 31 repos) — verified: `contextd` (Rust, local-first MCP daemon, releases v1.0.0–v3.1.3 incl. v3.0.3 on 2026-01-15), `shard` (Rust, local-first ML-artifact VCS, p2p/distributed topics), `graph4supplychain`, `Zephyr`. `the-zero-debt-index` exists but EXCLUDED per brief.
3. **Old portfolio components** — treated as stale historical source. Dates (Fidelity Jan–May 2023, Lam Jun 2023) contradict resume; resume wins. Generic cards/bars discarded; only facts salvaged.
4. **User brief (§0–§34)** — asserted source for Optum role/stack, Contextd/Shard mechanism specifics, experiments pattern, beliefs, interests, direction.
5. **No public writing URLs found** — notes are stubs pending subject-supplied links.

## 2. Source conflicts and resolutions

| # | Conflict | Resolution |
|---|----------|------------|
| 1 | Old portfolio: Fidelity Jan–May 2023 / Lam Jun 2023 vs resume Jun–Aug 2024 / May 2024–present | Resume wins (verified). Old portfolio stale. |
| 2 | Resume hedges ("potentially improve by up to 15%", "up to 40%") vs dataset honesty rule | Hedges preserved as hedges; inconclusive results encoded as failures/experiments, not wins (fail-llama13b-math, exp-llama13b-finetune). |
| 3 | 7 Contextd/Shard decisions claimed `source: 'experiment'` with no backing experiment rows | Honest fix: added `source: 'build'` to schema — decisions earned during iterative construction, evidenced by shipped releases. |
| 4 | No AGNet repo found on GitHub | proj-agnet REMOVED (see §17). |
| 5 | Dec-starling-decommission described an inferred migration approach | REMOVED; could not verify the approach was his design vs execution. |
| 6 | `the-zero-debt-index` exists on GitHub | EXCLUDED per brief (vanity/padding risk); recorded here, not in dataset. |

## 3. Final entity model

`src/db/schema.ts`: `Era` (PAST/PRESENT/DIRECTION), `VerificationState` (verified/asserted/needs_check), `Provenance` (source/detail/url), entities `Work Project Decision Failure Experiment Note Belief Skill(with evidence) Interest Achievement Education Recruiter`, top-level `CareerDB`. IDs are stable ablation keys. Relations use `*Ids` arrays (e.g. `decisionIds`, `skillIds`, `relatedProjectId`).

## 4. Dataset counts

| Entity | Count | Notes |
|---|---|---|
| work | 3 | Optum (asserted, PRESENT), Lam (verified), Fidelity (verified) |
| projects | 5 | 4 flagship: contextd, shard, demand-forecast, oneview; zephyr appendix |
| decisions | 13 | 3 Lam, 2 One-View, 4 Contextd, 3 Shard, 1 Optum (needs_check) |
| failures | 7 | 3 over 14 days (tabular-baseline 20d, relational-queries 15d, contextd-v1 21d) |
| experiments | 7 | ADOPTED 1, ABANDONED 2, PROTOTYPED 1, TESTED 2, ONGOING 1 |
| notes | 3 | all needs_check stubs (URLs pending) |
| beliefs | 6 | 3 strong/current, 3 working (2 need wording confirmation) |
| skills | 14 | all evidence-linked, zero percentages |
| interests | 12 | 9 toward, 3 away |
| achievements | 3 | grant (asserted), releases (verified), investment (asserted) |
| education | 1 | Amrita (verified) |

## 5. Core professional narrative

**Research → production backend engineering → systems/infrastructure → deeper distributed/data/ML systems.**
Positioning: **backend/systems/infrastructure engineer with serious ML/AI systems experience** — NOT "AI/LLM engineer." Recruiter record encodes this verbatim.

## 6. Flagship projects

1. **Contextd** (verified repo + releases) — local-first MCP code-context daemon; mechanism-redesign arc (v1→v3) is the story.
2. **Shard** (asserted mechanism, verified repo) — content-addressed P2P ML-artifact VCS; strongest distributed-systems evidence.
3. **Demand forecasting on temporal supply-chain graphs** (verified) — Lam research pillar; graph abstraction + temporal structure + graph-DB PoCs.
4. **One-View** (verified, no public repo) — enterprise RAG where grounding + access control beat model size.

## 7. Professional experience

Optum/UH Backend SWE, PRESENT (asserted: Python/Go microservices, price estimation, claims-adjacent, AWS/Azure, OpenSearch, K8s). Lam AI Research Intern May 2024–present (verified). Fidelity SWE Intern Jun–Aug 2024 (verified). Weight: Optum + Lam heaviest; Fidelity historical.

## 8. Research threads

Graph learning (supplier graphs, message passing), temporal graph systems (temporal GNNs, TKGs, capacity planning), ML systems (grounding over tuning, eval discipline, artifact identity). AGNet thread dropped for lack of evidence (see §17).

## 9. Experiments

7 records covering the full lifecycle: CURIOUS→PROTOTYPED→TESTED→ADOPTED (openai-assistant) and →ABANDONED (llama13b-finetune, streamlit-agent). The adopt/abandon contrast is the personality of the site. Two ABANDONED records with honest lessons > ten shipped demos.

## 10. Writing / notes

3 stubs (RAG enterprise, graph supply chain, emerging tools), all needs_check. No URLs invented. Subject must supply links/dates or these stay out of F1 starter queries.

## 11. Beliefs / opinions

6 records: inspectability (strong), explore-early (strong), grounding-beats-tuning (working, needs wording OK), representation-first (working), novelty-budget (working, thinnest evidence), evidence-over-claims (strong, self-referential to this site). Two beliefs carry `evolved` status potential; none yet do — future strength.

## 12. Skills derived from evidence

14 skills, every one with work/project/decision/experiment back-links. Densest: python (3 work + 3 projects + 2 decisions). Thinnest but legitimate: go, postgres (single-work evidence — honest, keep). Zero percentages anywhere (grep-verified).

## 13. Interests and career direction

Toward (9): distributed systems, data infra, ML systems, backend infra, dev tooling, storage/identity, search/retrieval, graph systems, performance-with-denominators. Away (3): generic CRUD, notebook-only data work, isolated prompt engineering. Directional preferences, not mastery claims.

## 14. Achievements

3 only, all attached to real entities: $50K grant (asserted), Contextd 10+ releases past v3 (verified via API), forecasting→investment conversion (asserted). No awards wall.

## 15. Patterns discovered

Each supported by ≥2 records:
1. **Representation before architecture** — tabular flattening (fail), graph abstraction (dec), content addressing (dec), structural extraction (dec). The fingerprint.
2. **Inspectability as non-negotiable** — Tree-sitter over chunking, hashes over registries, access-in-retrieval, EXPLAIN on this site.
3. **Local-first reflex** — Contextd daemon, Shard P2P, grounding over hosted tuning. Distrust of black-box hosted dependencies.
4. **Experiment→opinion→adopt/abandon loop** — Zephyr tuning abandoned → RAG adopted; Streamlit abandoned → daemon direction; v1 coverage → v3 selection.
5. **Research-to-production pipeline** — Lam graph work informs Shard identity thinking; Fidelity grounding informs Contextd retrieval; each era's lesson ports forward.
6. **Deletion as engineering** — scope narrowed (Shard), rewrite rejected (Optum), fine-tuning rejected (One-View), custom protocols rejected (MCP).

## 16. Strongest 15 records

dec-graph-abstraction, dec-shard-content-address, dec-contextd-treesitter, dec-rag-grounding, dec-shard-rabin, proj-contextd, proj-shard, fail-contextd-v1, fail-tabular-baseline, exp-contextd-redesign, exp-llama13b-finetune, work-lam, belief-inspectability, ach-contextd-releases, dec-access-limits.

## 17. Five weakest records removed or rewritten

1. **proj-agnet REMOVED** — needs_check, zero decisions/failures, no repo. (AGNet thread aspirational, not evidenced.)
2. **dec-starling-decommission REMOVED** — inferred approach, unverifiable authorship.
3. **dec-enterprise-constraints REWRITTEN → needs_check** — evidence narrowed to enterprise theme; awaits Optum specifics.
4. **fail-manual-eval KEPT but flagged** — inferred, needs subject confirmation; is verification item #1.
5. **3 note stubs KEPT as declared placeholders** — no URLs invented; excluded from F1 starter queries until linked.

## 18. Five missing pieces

1. Optum specifics: service names, scale figures, one incident or tradeoff story (dec-enterprise-constraints is thin).
2. One-View grounding artifact or eval anecdote (fail-manual-eval confirmation doubles as this).
3. Note URLs + dates (3 stubs blocked).
4. AGNet evidence or permanent drop (dropped for now; reinstate only with repo/paper).
5. Contextd mechanism confirmation from subject (Tree-sitter/recency/MCP asserted from brief + repo description).

## 19. Ten strongest future queries

`SHOW highlights LIMIT 3` · `SHOW failures WHERE costDays > 14` → 3 real postmortems · `SHOW experiments WHERE stage = "ABANDONED"` → honest discards · `SHOW decisions WHERE source = "build"` → iterative construction · `COMPARE proj-contextd vs proj-shard` → local-first vs identity · `WITHOUT python` → 3 projects + 2 work records lose evidence · `WITHOUT rust` → both flagships go dark · `SHOW beliefs ORDER BY date` → evolving mind · `SHOW work WHERE era = "PRESENT"` → trajectory · `SHOW experiments ORDER BY date` → curiosity arc 2023→2026.

## 20. Candidate signature interactions

1. **WITHOUT ablation + damage receipt** (primary) — evidence counts, not fake percentages.
2. **COMPARE two decisions side-by-side** with differing fields highlighted.
3. **Cache-hit honesty** — third query snaps faster and says so.
4. **Parse-error respect** — hostile input returns exact token + nearest non-empty suggestion.
5. **Belief evolution view** — "my view as of Oct 2026" with supersede chains (future).

## 21. Facts requiring verification

1. fail-manual-eval: was there truly no eval harness on One-View? (subject)
2. costDays on all 7 failures: estimated; subject to correct.
3. dec-enterprise-constraints instances + Optum start date/role title.
4. Note URLs + dates (3).
5. Contextd mechanism details (Tree-sitter/recency/MCP internals).
6. Shard chunking/hashing specifics (Rabin/BLAKE3 asserted from brief).
7. $50K grant: awarding body + terms.
8. "Organizational investment" form (ach-forecast-investment).
9. Fidelity 80% onboarding claim: resume claim, keep hedged or drop.
10. Lam "present" status: internship ongoing as of Oct 2026?

## 22. Validation results

`assertValidDataset(db)` passes: no duplicate IDs, no dangling references, no orphaned skills/experiments/notes, per-project failure rule holds, experiment-source back-links resolve. `npm run verify` (typecheck + lint + build) green.

## 23. Test results

`tests/db/dataset.test.ts`: **15/15 pass** (schema validity, deterministic IDs, relationship integrity, no duplicates, no dangling refs, required fields, provenance presence, starter-query references, recruiter completeness). No UI tests (correct at F0). Parser tests land at F1.

## 24. GO / NO-GO for F1

**GO.** (1) A stranger learns non-resume things: the adopt/abandon loop, representation-first instinct, deletion-as-engineering — none visible on a conventional CV. (2) Fingerprint identifiable: inspectability + local-first + content-addressing recurs across 6+ records. (3) WITHOUT has real causal graphs: skill→project/decision/work evidence links make `WITHOUT rust`/`WITHOUT python` genuinely informative. (4) Present trajectory, not undergraduate identity: Optum + Contextd/Shard ongoing dominate; Zephyr is appendix. Conditions: §21 items resolve async and must not block F1; notes stay out of starter queries until linked; any §21 correction that contradicts a record triggers a dataset patch + re-validation before F2.
