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
    query: 'SHOW failures WHERE costDays > 14',
    label: 'Where you failed',
    why: 'Vulnerability as data. Only the expensive postmortems survive this filter.',
    expectedCount: 2,
  },
  {
    query: 'SHOW experiments WHERE stage = "ADOPTED"',
    label: 'What survived contact with reality',
    why: 'The explore-to-adopt pipeline, proven.',
    expectedCount: 1,
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
    expectedCount: 6,
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
    why: 'Ablation preview: the skill with the widest evidence fan. Maximum damage.',
    expectedCount: 0, // ablation returns a damage receipt, not rows
  },
];

/** IDs referenced by starter queries must exist in the dataset. Tested in tests/db. */
export const STARTER_REFERENCED_IDS = ['proj-contextd', 'proj-shard', 'python'] as const;
