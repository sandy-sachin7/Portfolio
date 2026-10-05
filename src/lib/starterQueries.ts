/**
 * Starter queries for CAREER.DB.
 * Every entry must return something interesting against the CURRENT dataset.
 * `expectedCount` is documentation for tests, not a guarantee of the future engine.
 * Shape is grammar-agnostic: F1 will map these to the real parser.
 */
export interface StarterQuery {
  /** Exact query string shown in the omnibar. */
  query: string;
  /** Human label for the footer index. */
  label: string;
  /** Why this query is worth running first. */
  why: string;
  /** Rows the current dataset returns (update when the dataset changes). */
  expectedCount: number;
  /**
   * Verification caveat for F1: e.g. when every returned row is needs_check
   * and must render badged. Omit when all rows are presentable.
   */
  note?: string;
}

export const STARTER_QUERIES: StarterQuery[] = [
  {
    query: 'SHOW highlights LIMIT 3',
    label: 'Start here',
    why: 'Boot state. Three flagship builds, fully legible, no tutorial needed.',
    expectedCount: 3,
  },
  {
    query: 'SHOW work',
    label: 'Where you have worked',
    why: 'Professional spine: Optum present, LAM research, Fidelity past.',
    expectedCount: 3,
  },
  {
    query: 'SHOW projects',
    label: 'What you have shipped',
    why: 'All five builds, flagships first.',
    expectedCount: 5,
  },
  {
    query: 'SHOW decisions ORDER BY date DESC LIMIT 5',
    label: 'How you decide',
    why: 'Newest architectural tradeoffs with rejected options attached.',
    expectedCount: 5,
  },
  {
    query: 'SHOW failures',
    label: 'Where you failed',
    why: 'One published postmortem. Six more failures are indexed but need verification before they appear as fact.',
    expectedCount: 1,
    note: 'Only fail-llama13b-math (asserted) is presentable. Six needs_check records are excluded by default and named in the receipt. WITH UNVERIFIED surfaces them badged.',
  },
  {
    query: 'SHOW experiments WHERE stage = "ADOPTED"',
    label: 'What survived contact with reality',
    why: 'The explore-to-adopt pipeline, proven.',
    expectedCount: 4,
  },
  {
    query: 'SHOW experiments WHERE stage = "ABANDONED"',
    label: 'What you killed',
    why: 'Discarded tools with reasons. Abandonment with a lesson is judgment.',
    expectedCount: 2,
  },
  {
    query: 'SHOW beliefs ORDER BY date DESC',
    label: 'What you believe',
    why: 'Opinions with evidence links and strength. Newest first.',
    expectedCount: 3,
    note: '3 asserted beliefs presentable by default; 3 inferred (needs_check) excluded until WITH UNVERIFIED (6 total, badged). F1 must never quote inferred beliefs as the subject\u2019s words.',
  },
  {
    query: 'COMPARE proj-contextd vs proj-shard',
    label: 'Two flagships, side by side',
    why: 'Differing decisions highlighted. How hiring managers actually think.',
    expectedCount: 2,
  },
  {
    query: 'WITHOUT python',
    label: 'Remove Python. Watch what breaks.',
    why: 'Ablation preview: which evidence loses Python, and which decisions lose their only support.',
    expectedCount: 0, // ablation returns a damage receipt, not rows
    note: 'Ablation is evidence coverage, not capability: WITHOUT python means these records lose Python as evidence, never that the engineer cannot engineer. F1 receipt must name orphaned decisions, not just counts.',
  },
];

/** IDs referenced by starter queries must exist in the dataset. Tested in tests/db. */
export const STARTER_REFERENCED_IDS = ['proj-contextd', 'proj-shard', 'python'] as const;
