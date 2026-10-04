# F0 Review — Dataset + Content Architecture

> Verdict: **GO for F1** (with follow-ups in §21). Rationale in §24.
> Sources: resume PDF (verified), GitHub API `sandy-sachin7` (verified), user brief (asserted), inference (needs_check).

## 1. Evidence sources inspected

1. **Resume PDF** (`assets/Resume/SanthoshS_Resume.pdf`) — strongest source. Name: Santhosh Sachin. Amrita B.Tech CSE 2021 (CGPA 8.41 to 6th sem). Fidelity SWE Intern Jun–Aug 2024. Lam AI Research Intern May 2024 (resume said present at resume time). One-View Jun–Aug 2024 (RAG, Azure OpenAI, OpenSearch/S3/EC2, 1000+ sources). Zephyr Oct–Nov 2023 (open LLM agent, Streamlit, LLaMA 13B/70B, Mistral 8x7B).
2. **GitHub API** (`sandy-sachin7`, 31 repos) — verified: `contextd` (Rust, local-first MCP daemon, releases v1.0.0–v3.1.3 incl. v3.0.3 on 2026-01-15), `shard` (Rust, local-first ML-artifact VCS, p2p/distributed topics), `graph4supplychain`, `Zephyr`. `the-zero-debt-index` exists but EXCLUDED per brief.
3. **Old portfolio components** — treated as stale historical source. Dates (Fidelity Jan–May 2023, Lam Jun 2023) contradict resume; resume wins. Contact block salvaged with verification flags (GitHub handle conflict, see §2). Generic cards/bars discarded; only facts salvaged.
4. **User brief (§0–§34)** — asserted source for Optum role/stack, Contextd/Shard mechanism specifics, experiments pattern, beliefs, interests, direction.
5. **Subject corrections, Oct 2026 (post-F0 review)** — graduated (Amrita; 2025 inferred); Lam is historical; recruiter location city unknown; experiment/writing expansion directed by subject. Treated as asserted; inferred details marked needs_check.
6. **No public LinkedIn writing URLs verified** — 3 notes stay `referenced`; 2 new notes are repo writeups (published, URLs verified via API).

## 2. Source conflicts and resolutions

| # | Conflict | Resolution |
|---|----------|------------|
| 1 | Old portfolio: Fidelity Jan–May 2023 / Lam Jun 2023 vs resume Jun–Aug 2024 / May 2024–present | Resume wins (verified). Old portfolio stale. |
| 2 | Resume hedges ("potentially improve by up to 15%", "up to 40%") vs dataset honesty rule | Hedges preserved as hedges; inconclusive results encoded as failures/experiments, not wins (fail-llama13b-math, exp-llama13b-finetune). |
| 3 | 7 Contextd/Shard decisions claimed `source: 'experiment'` with no backing experiment rows | Honest fix: added `source: 'build'` to schema — decisions earned during iterative construction, evidenced by shipped releases. |
| 4 | No AGNet repo found on GitHub | proj-agnet REMOVED (see §17). |
| 5 | Dec-starling-decommission described an inferred migration approach | REMOVED; could not verify the approach was his design vs execution. |
| 6 | `the-zero-debt-index` exists on GitHub | EXCLUDED per brief (vanity/padding risk); recorded here, not in dataset. |
| 7 | Old portfolio GitHub `SANTHOSH-SACHIN` vs API-verified `sandy-sachin7` | `sandy-sachin7` wins (owns the verified repos). Recruiter record uses it; conflict recorded. |
| 8 | Resume "Lam May 2024–present" vs subject "Lam is historical" | Subject wins for narrative; resume was true at resume time. work-lam → PAST, current false, end date unconfirmed (see §25). |
| 9 | Resume "2021–present" education vs subject "graduated" | Subject wins; 2025 inferred from 4-year window, exact date needs_check. |
| 10 | Old portfolio location "Coimbatore" vs unknown current city | Neither trusted. Recruiter location = "India", fieldVerification needs_check. |

## 3. Final entity model

`src/db/schema.ts`: `Era` (PAST/PRESENT/DIRECTION), `VerificationState` (verified/asserted/needs_check), `Provenance` (source/detail/url), entities `Work Project Decision Failure Experiment Note Belief Skill(with evidence) Interest Achievement Education Recruiter`, top-level `CareerDB`. IDs are stable ablation keys. Relations use `*Ids` arrays (e.g. `decisionIds`, `skillIds`, `relatedProjectId`).

## 4. Dataset counts

| Entity | Count | Notes |
|---|---|---|
| work | 3 | Optum (asserted, PRESENT), Lam (verified, PAST), Fidelity (verified, PAST) |
| projects | 5 | 4 flagship: contextd, shard, demand-forecast (PAST), oneview; zephyr appendix |
| decisions | 13 | 3 Lam, 2 One-View, 4 Contextd, 3 Shard, 1 Optum (needs_check) |
| failures | 7 | 3 over 14 days (tabular-baseline 20d, relational-queries 15d, contextd-v1 21d) — all needs_check, must render badged |
| experiments | 12 | ADOPTED 4, ABANDONED 2, PROTOTYPED 1, TESTED 3, ONGOING 2 |
| notes | 5 | 2 published repo writeups (verified URLs) + 3 referenced stubs (no URLs invented) |
| beliefs | 6 | origin-labeled: stated (inspectability, explore-early, evidence-over-claims), inferred (grounding, representation, novelty-budget) |
| skills | 14 | all evidence-linked, zero percentages |
| interests | 12 | 9 toward, 3 away |
| achievements | 3 | grant (asserted), releases (verified), investment reworded to quote resume (asserted) |
| education | 1 | Amrita, graduated (needs_check: 2025 year inferred) |

## 5. Core professional narrative

**Research → production backend engineering → systems/infrastructure → deeper distributed/data/ML systems.**
Positioning: **backend/systems/infrastructure engineer with serious ML/AI systems experience** — NOT "AI/LLM engineer." Recruiter record encodes this verbatim.

## 6. Flagship projects

1. **Contextd** (verified repo + releases) — local-first MCP code-context daemon; mechanism-redesign arc (v1→v3) is the story.
2. **Shard** (asserted mechanism, verified repo) — content-addressed P2P ML-artifact VCS; strongest distributed-systems evidence.
3. **Demand forecasting on temporal supply-chain graphs** (verified) — Lam research pillar; graph abstraction + temporal structure + graph-DB PoCs.
4. **One-View** (verified, no public repo) — enterprise RAG where grounding + access control beat model size.

## 7. Professional experience

Optum/UH Backend SWE, PRESENT (asserted: Python/Go microservices, price estimation, claims-adjacent, AWS/Azure, OpenSearch, K8s). Lam AI Research Intern May 2024–2025, PAST (verified role/start; exact end to confirm). Fidelity SWE Intern Jun–Aug 2024, PAST (verified). Weight: Optum present heaviest; Lam heaviest historical evidence; Fidelity supporting.

## 8. Research threads

Graph learning (supplier graphs, message passing), temporal graph systems (temporal GNNs, TKGs, capacity planning), ML systems (grounding over tuning, eval discipline, artifact identity). AGNet thread dropped for lack of evidence (see §17).

## 9. Experiments

12 records, all with built/tested/used evidence — nothing added to hit a number. New since audit: MCP interface (ADOPTED, shipped in releases), hybrid local search (ADOPTED, v3 mechanism), agent coding workflows (ONGOING, sustained real builds), Rabin/BLAKE3 evaluation (ADOPTED, Shard's identity layer), OpenSearch tuning (TESTED, One-View). Lifecycle coverage: 4 ADOPTED, 2 ABANDONED, 1 PROTOTYPED, 3 TESTED, 2 ONGOING. The adopt/abandon contrast is the personality of the site. Kept at 12: further candidates (local-vs-hosted model evals, P2P distribution trials) overlap existing decisions and would duplicate, not deepen.

## 10. Writing / notes

5 records with explicit status: 2 published repo writeups (Contextd, Shard — URLs verified via API, venue `writeup`), 3 referenced stubs (RAG enterprise, graph supply chain, emerging tools — subject-referenced topics, no URLs invented, must not render as published artifacts). Validator enforces: published requires url; non-published must not carry one. Subject-supplied LinkedIn links upgrade stubs to published; until then they stay out of F1 starter queries.

## 11. Beliefs / opinions

6 records, each with explicit `origin`. Stated (subject's own words): inspectability (strong), explore-early (strong), evidence-over-claims (strong, self-referential to this site). Inferred (synthesized, wording needs subject OK): grounding-beats-tuning, representation-first, novelty-budget (thinnest evidence — single decision). Schema supports evolution (`supersedesId`/`supersededById`/`changeReason`); no chains yet — first candidate: novelty-budget either gains Optum evidence or gets superseded by a narrower claim.

## 12. Skills derived from evidence

14 skills, every one with work/project/decision/experiment back-links. Densest: python (3 work + 3 projects + 2 decisions). Thinnest but legitimate: go, postgres (single-work evidence — honest, keep). Zero percentages anywhere (grep-verified).

## 13. Interests and career direction

Toward (9): distributed systems, data infra, ML systems, backend infra, dev tooling, storage/identity, search/retrieval, graph systems, performance-with-denominators. Away (3): generic CRUD, notebook-only data work, isolated prompt engineering. Directional preferences, not mastery claims.

## 14. Achievements

3 only, all attached to real entities: $50K grant (asserted; awarding body unverified), Contextd 10+ releases past v3 (verified via API), forecasting→investment reworded to quote the resume exactly with form unspecified (asserted; the fact is that the resume claims it, not that investment is confirmed). No awards wall. Fact vs interpretation split enforced in record wording.

## 15. Patterns discovered

Observed pattern separated from interpretation. Confidence = strength of record support, not enthusiasm.

1. **Representation before architecture** — confidence HIGH.
   Evidence: fail-tabular-baseline, dec-graph-abstraction, dec-shard-content-address, dec-contextd-treesitter, belief-representation-first.
   Interpretation: the fingerprint. Flattening destroys signal; identity and structure come before model choice. Strongest cross-era recurrence (research + builds).
2. **Inspectability as non-negotiable** — confidence MEDIUM.
   Evidence: dec-contextd-treesitter, dec-shard-content-address, dec-access-limits, belief-inspectability (stated).
   Interpretation: plausible and subject-stated, but note circularity risk — CAREER.DB itself was designed around this belief, so the site cannot be counted as independent evidence. Keep; do not let the product testify for the pattern.
3. **Local-first reflex** — confidence MEDIUM (was overstated).
   Evidence: dec-contextd-local-first, proj-shard positioning, exp-streamlit-agent (abandoning hosted demo shell).
   Interpretation: real but narrow — two flagship builds plus one abandonment. RAG/enterprise work is NOT counted here (no local-first decision exists in those records). Strengthens only if a third independent instance appears.
4. **Experiment → opinion → adopt/abandon loop** — confidence MEDIUM, emerging.
   Evidence: exp-llama13b-finetune → exp-openai-assistant; exp-streamlit-agent → dec-contextd-local-first; exp-contextd-redesign (ongoing); now 12 experiments, 4 adopted / 2 abandoned.
   Interpretation: good direction, real loop instances, but still a small sample. Present as an emerging operating pattern, not a universal personality trait, until the experiment table grows with use.
5. **Research and production increasingly converge in my interests** — confidence LOW as causality, MEDIUM as interest statement (rephrased per review; was "research-to-production pipeline").
   Evidence: career sequence Lam → Optum; int-* records.
   Interpretation: Lam → Optum is progression, not proof that Lam research shaped production work. NO cross-pollination is claimed without evidence. What the data supports: systems depth pursued in both registers, converging interests. Upgrade only if a record ties a Lam technique to an Optum decision.
6. **Deletion as engineering (scope reduction, observed)** — confidence MEDIUM for the observed act, LOW for the philosophy.
   Evidence: fail-shard-scope, dec-contextd-mcp (reject custom protocols), dec-rag-grounding (reject fine-tuning), dec-enterprise-constraints (reject rewrite — needs_check).
   Interpretation: scope reduction recurs and is quotable. The broader "deletion is my engineering identity" reading is attractive but ahead of the evidence; keep the observed form, hold the philosophy lightly.

## 16. Strongest 15 records

dec-graph-abstraction, dec-shard-content-address, dec-contextd-treesitter, dec-rag-grounding, dec-shard-rabin, proj-contextd, proj-shard, fail-contextd-v1, fail-tabular-baseline, exp-contextd-redesign, exp-llama13b-finetune, work-lam, belief-inspectability, ach-contextd-releases, dec-access-limits.

## 17. Five weakest records removed or rewritten

1. **proj-agnet REMOVED** — needs_check, zero decisions/failures, no repo. (AGNet thread aspirational, not evidenced.)
2. **dec-starling-decommission REMOVED** — inferred approach, unverifiable authorship.
3. **dec-enterprise-constraints REWRITTEN → needs_check** — evidence narrowed to enterprise theme; awaits Optum specifics.
4. **fail-manual-eval KEPT but flagged** — inferred, needs subject confirmation; is verification item #1.
5. **3 note stubs KEPT as declared `referenced` records + 2 published repo writeups ADDED** — no URLs invented; validator forbids unpublished notes from carrying URLs. Stubs excluded from F1 starter queries until linked.

## 18. Five missing pieces

1. Optum specifics: service names, scale figures, one incident or tradeoff story (dec-enterprise-constraints is thin).
2. One-View grounding artifact or eval anecdote (fail-manual-eval confirmation doubles as this).
3. Note URLs + dates (3 stubs blocked).
4. AGNet evidence or permanent drop (dropped for now; reinstate only with repo/paper).
5. Contextd mechanism confirmation from subject (Tree-sitter/recency/MCP asserted from brief + repo description).

## 19. Ten strongest future queries

`SHOW highlights LIMIT 3` · `SHOW failures WHERE costDays > 14` → 3 postmortems, ALL needs_check and must render badged · `SHOW experiments WHERE stage = "ABANDONED"` → honest discards · `SHOW decisions WHERE source = "build"` → iterative construction · `COMPARE proj-contextd vs proj-shard` → local-first vs identity · `WITHOUT python` → evidence-coverage receipt (records losing Python as evidence, orphaned decisions named — never "cannot engineer") · `WITHOUT rust` → both flagships go dark (more dramatic, less insightful; default to python for causal insight) · `SHOW beliefs ORDER BY date` → evolving mind · `SHOW work WHERE era = "PRESENT"` → Optum + current builds, trajectory legible · `SHOW experiments ORDER BY date` → curiosity arc 2023→2026.

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
4. Note URLs + dates (3 referenced stubs).
5. Contextd mechanism details (Tree-sitter/recency/MCP internals).
6. Shard chunking/hashing specifics (Rabin/BLAKE3 asserted from brief).
7. $50K grant: awarding body + terms.
8. "Organizational investment" form (quoted exactly; underlying form unknown).
9. Fidelity 80% onboarding claim: resume claim, keep hedged or drop.
10. Lam exact end date; Amrita exact graduation date; recruiter city; LinkedIn URL + email confirmation.

## 22. Validation results

`assertValidDataset(db)` passes: no duplicate IDs, no dangling references, no orphaned skills/experiments/notes, per-project failure rule holds, experiment-source back-links resolve, note status/url rules hold, belief origins + supersede refs resolve. `npm run verify` (typecheck + lint + build) green.

## 23. Test results

`tests/db/dataset.test.ts`: **22 pass** (schema validity, deterministic IDs, relationship integrity, provenance presence, starter-query references, recruiter completeness + field-verification flags, F1 presentation contract, belief origins, note statuses, graduated/historical chronology). No UI tests (correct at F0). Parser tests land at F1.

## 24. GO / NO-GO for F1

**GO.** (1) A stranger learns non-resume things: the adopt/abandon loop, representation-first instinct, deletion-as-engineering — none visible on a conventional CV. (2) Fingerprint identifiable: inspectability + local-first + content-addressing recurs across 6+ records. (3) WITHOUT has real causal graphs: skill→project/decision/work evidence links make `WITHOUT rust`/`WITHOUT python` genuinely informative. (4) Present trajectory, not undergraduate identity: Optum + Contextd/Shard ongoing dominate; Zephyr is appendix. Conditions: §21 items resolve async and must not block F1; notes stay out of starter queries until linked; any §21 correction that contradicts a record triggers a dataset patch + re-validation before F2.

## 25. Audit corrections (post-F0 subject review)

Surgical pass over F0; model kept, semantics hardened. All seven F1-blocking items fixed:

1. **Starter-query count:** `failures WHERE costDays > 14` returns exactly 3 (20d, 15d, 21d) — metadata was 2, now 3. Semantics checked, not just the number: all three rows are needs_check, so the starter entry carries a `note` mandating F1 badging, and a test locks the exact id set.
2. **Lam chronology:** work-lam → PAST, current false. Resume's "present" was true at resume time; subject confirms historical. Exact end date unconfirmed (recorded, not invented). proj-demand-forecast → archived/PAST.
3. **Graduation:** edu-amrita gains end 2025 (inferred from 4-year window), verification needs_check, provenance narrates the inference. Career spine now reads PAST (education, Fidelity, Lam, early work) → PRESENT (Optum, Contextd, Shard, experimentation) → DIRECTION (interests).
4. **Recruiter location:** "Coimbatore" dropped (stale); location "India" with fieldVerification needs_check. City unknown > city wrong.
5. **Recruiter URLs:** GitHub corrected to `sandy-sachin7` (API-verified repo owner; old `SANTHOSH-SACHIN` conflict recorded in §2). LinkedIn + email carried over flagged needs_check. Email normalized to plain address. Resume path verified on disk (`public/assets/SanthoshS_Resume.pdf`).
6. **Verification semantics:** schema documents the F1 contract; `isPresentable`/`requiresBadge` helpers exported and tested; default-exclusion-or-badge rule is now code, not prose. Inferred failures stay as candidate evidence, never fact.
7. **Fingerprint confidence:** §15 rewritten — every pattern carries evidence ids + confidence (HIGH: representation-first; MEDIUM: inspectability with circularity warning, local-first narrowed, experiment-loop as emerging, deletion as observed act; LOW-as-causality: research→production rephrased to converging interests).
8. **Experiment expansion:** 7 → 12, all evidenced (MCP, hybrid search, agent workflows, Rabin/BLAKE3 eval, OpenSearch tuning). No junk to hit a number; overlapping candidates deliberately excluded.
9. **Writing layer:** 3 stubs typed `referenced` (validator bans their URLs); 2 published repo writeups with verified URLs. PUBLISHED/REFERENCED/IDEA is now schema, enforced.
10. **Achievements:** investment record reworded to quote the resume exactly; fact (resume says it) split from interpretation (investment confirmed).
11. **Ablation semantics:** WITHOUT = evidence-coverage receipt, not capability verdict. Starter `why` rewritten toward causal insight; python kept over rust (insight > damage).
12. **Preserved deletions:** AGNet, Vibe Station, GDSC, certificates, vanity metrics, Starling inference all stay out. No reversal for fullness.

**F1 GO reaffirmed** — engine work may proceed on these semantics. Unresolved needs_check items ride along explicitly marked; the engine must understand their status from day one.
