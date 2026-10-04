// CAREER.DB executor — F1. AST → rows + stats. Pure, no JSX.
// Truth contract: needs_check and idea-notes are excluded by default and
// listed in `excluded` with a reason. WITH UNVERIFIED opts them back in
// (still badged). Nothing unverified ever renders as settled fact.

import type { CareerDB, CollectionName, VerificationState } from '../db/schema';
import { type DBIndexes } from '../db/indexes';
import { isPresentable, requiresBadge } from '../db/validate';
import { type AST, type FilterNode, FIELDS, nearestWord } from './parser';

export interface ResultRow {
  collection: CollectionName;
  id: string;
  record: unknown;
  /** True when the row must render with a verification badge. */
  badge: boolean;
}

export interface ExcludedRow {
  collection: string;
  id: string;
  reason: 'needs_check' | 'idea';
}

export interface ExecStats {
  ms: number;
  scanned: number;
  returned: number;
  excluded: number;
  cacheHit: boolean;
  /** Honest plan note, e.g. `index: byStage(stage=ADOPTED)` or full-scan line. */
  index: string;
}

export interface ExecError {
  message: string;
  suggestion?: string;
}

export type ExecResult =
  | { ok: true; kind: 'rows'; rows: ResultRow[]; excluded: ExcludedRow[]; stats: ExecStats }
  | { ok: true; kind: 'schema'; collection: string; fields: string[]; stats: ExecStats }
  | { ok: true; kind: 'log'; entries: LogEntry[]; stats: ExecStats }
  | {
      ok: true;
      kind: 'compare';
      left: ResultRow;
      right: ResultRow;
      differingFields: string[];
      stats: ExecStats;
    }
  | {
      ok: true;
      kind: 'ablation';
      key: string;
      affected: Array<{ collection: string; id: string }>;
      orphanedDecisions: string[];
      coverage: { before: Record<string, number>; after: Record<string, number> };
      stats: ExecStats;
    }
  | { ok: false; error: ExecError };

// ------------------------------------------------------------ query log ---

export interface LogEntry {
  at: string;
  query: string;
  returned: number;
  ms: number;
  cacheHit: boolean;
}

const LOG: LogEntry[] = [];

export function getLog(): LogEntry[] {
  return [...LOG];
}

export function clearLog(): void {
  LOG.length = 0;
}

export function logToJSONL(): string {
  return LOG.map((e) => JSON.stringify(e)).join('\n');
}

// ---------------------------------------------------------------- cache ---

const CACHE_CAP = 20;
const cache = new Map<string, Omit<Extract<ExecResult, { ok: true }>, 'stats'>>();

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? '';
}

/** djb2 hex. Content hash of the normalized AST, not a security primitive. */
export function hashAST(ast: AST): string {
  const s = stableStringify(ast);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export function clearCache(): void {
  cache.clear();
}

// -------------------------------------------------------------- evaluation ---

type RecordAny = Record<string, unknown>;

function fieldValue(record: RecordAny, field: string): unknown {
  return record[field];
}

function compareValues(actual: unknown, op: string, expected: string | number): boolean {
  if (Array.isArray(actual)) {
    // `=` on an array means membership. Honest and documented.
    const has = actual.some((v) => String(v).toLowerCase() === String(expected).toLowerCase());
    return op === '=' ? has : op === '!=' ? !has : false;
  }
  if (typeof actual === 'boolean') {
    const want = String(expected).toLowerCase() === 'true';
    return op === '=' ? actual === want : op === '!=' ? actual !== want : false;
  }
  if (typeof actual === 'number' && typeof expected === 'number') {
    switch (op) {
      case '=':
        return actual === expected;
      case '!=':
        return actual !== expected;
      case '>':
        return actual > expected;
      case '>=':
        return actual >= expected;
      case '<':
        return actual < expected;
      case '<=':
        return actual <= expected;
    }
  }
  const a = String(actual ?? '').toLowerCase();
  const b = String(expected).toLowerCase();
  switch (op) {
    case '=':
      return a === b;
    case '!=':
      return a !== b;
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '<=':
      return a <= b;
  }
  return false;
}

function evalFilter(record: RecordAny, node: FilterNode): boolean {
  if (node.kind === 'and') return evalFilter(record, node.left) && evalFilter(record, node.right);
  if (node.kind === 'or') return evalFilter(record, node.left) || evalFilter(record, node.right);
  return compareValues(fieldValue(record, node.field), node.op, node.value);
}

function sortRows(rows: ResultRow[], field: string, dir: 'ASC' | 'DESC'): ResultRow[] {
  const mul = dir === 'ASC' ? 1 : -1;
  return [...rows].sort((ra, rb) => {
    const a = (ra.record as RecordAny)[field];
    const b = (rb.record as RecordAny)[field];
    if (a === undefined && b === undefined) return 0;
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    if (typeof a === 'number' && typeof b === 'number') return (a - b) * mul;
    return String(a).localeCompare(String(b)) * mul;
  });
}

function verificationOf(record: RecordAny): VerificationState | undefined {
  const v = record['verification'];
  return v === 'verified' || v === 'asserted' || v === 'needs_check'
    ? v
    : undefined;
}

function isIdeaNote(collection: string, record: RecordAny): boolean {
  return collection === 'notes' && record['status'] === 'idea';
}

/** Split candidates into presentable rows vs. explicitly excluded rows. */
function splitTrust(
  collection: CollectionName,
  candidates: Array<{ id: string; record: RecordAny }>,
  includeUnverified: boolean,
): { rows: ResultRow[]; excluded: ExcludedRow[] } {
  const rows: ResultRow[] = [];
  const excluded: ExcludedRow[] = [];
  for (const { id, record } of candidates) {
    if (isIdeaNote(collection, record)) {
      excluded.push({ collection, id, reason: 'idea' });
      continue;
    }
    const v = verificationOf(record);
    if (v && !isPresentable(v) && !includeUnverified) {
      excluded.push({ collection, id, reason: 'needs_check' });
      continue;
    }
    rows.push({ collection, id, record, badge: v ? requiresBadge(v) : false });
  }
  return { rows, excluded };
}

/** Pick the honest index note + candidate id list for a SHOW filter. */
function planScan(
  db: CareerDB,
  indexes: DBIndexes,
  collection: CollectionName | 'highlights',
  filter: FilterNode | undefined,
): { ids: string[]; scanned: number; index: string } {
  const all = (db[collection as CollectionName] ?? []) as Array<{ id: string }>;
  const allIds = all.map((r) => r.id);
  const full = (why: string): { ids: string[]; scanned: number; index: string } => ({
    ids: allIds,
    scanned: allIds.length,
    index: `full scan (${allIds.length} rows, fine at this scale)${why ? ` · ${why}` : ''}`,
  });
  if (!filter || filter.kind !== 'cond' || (filter.op !== '=' && filter.op !== '!=')) {
    return full(filter ? 'compound filter, no single-term index' : 'no filter');
  }
  if (filter.op !== '=') return full('inequality has no index');
  const val = String(filter.value);
  if (collection === 'experiments' && filter.field === 'stage') {
    const hit = indexes.byStage.get(val) ?? [];
    return { ids: [...hit], scanned: hit.length, index: `index: byStage(stage=${val})` };
  }
  if (collection === 'projects' && filter.field === 'status') {
    const hit = indexes.byStatus.get(val) ?? [];
    return { ids: [...hit], scanned: hit.length, index: `index: byStatus(status=${val})` };
  }
  if (
    (collection === 'projects' && filter.field === 'stack') ||
    (collection === 'notes' && filter.field === 'topics')
  ) {
    const hit = indexes.byTopic.get(val.toLowerCase()) ?? [];
    return { ids: [...hit], scanned: hit.length, index: `index: byTopic(${filter.field}=${val})` };
  }
  if (
    (filter.field === 'start' || filter.field === 'date') &&
    /^\d{4}$/.test(val)
  ) {
    const hit = indexes.byYear.get(val) ?? [];
    return { ids: [...hit], scanned: hit.length, index: `index: byYear(${val})` };
  }
  return full(`no index on ${filter.field}`);
}

function differingFields(left: RecordAny, right: RecordAny): string[] {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const skip = new Set(['id', 'title', 'provenance', 'verification']);
  return [...keys]
    .filter((k) => !skip.has(k))
    .filter((k) => stableStringify(left[k]) !== stableStringify(right[k]))
    .sort();
}

export interface ExecuteOpts {
  /** Original query text, recorded in the log. */
  query: string;
  includeUnverified?: boolean;
}

export function execute(
  db: CareerDB,
  indexes: DBIndexes,
  ast: AST,
  opts: ExecuteOpts,
): ExecResult {
  const t0 = performance.now();
  const key = `${hashAST(ast)}|u:${ast.kind === 'show' && (ast.withUnverified || opts.includeUnverified) ? 1 : 0}`;
  const cached = cache.get(key);
  if (cached) {
    const ms = performance.now() - t0;
    const stats: ExecStats = {
      ms,
      scanned: 0,
      returned: countResult(cached),
      excluded: 0,
      cacheHit: true,
      index: 'cache hit: normalized AST hash match',
    };
    LOG.push({ at: new Date().toISOString(), query: opts.query, returned: stats.returned, ms, cacheHit: true });
    return { ...cached, stats } as ExecResult;
  }

  const result = runUncached(db, indexes, ast, opts);
  const ms = performance.now() - t0;
  if (result.ok) {
    const { stats: _drop, ...payload } = result as { stats: ExecStats } & Record<string, unknown>;
    void _drop;
    cache.set(key, payload as Omit<Extract<ExecResult, { ok: true }>, 'stats'>);
    if (cache.size > CACHE_CAP) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    const stats: ExecStats = { ...(result as { stats: ExecStats }).stats, ms, cacheHit: false };
    const final = { ...result, stats } as ExecResult;
    LOG.push({
      at: new Date().toISOString(),
      query: opts.query,
      returned: countResult(final),
      ms,
      cacheHit: false,
    });
    return final;
  }
  return result;
}

function countResult(r: ExecResult): number {
  if (!r.ok) return 0;
  switch (r.kind) {
    case 'rows':
      return r.rows.length;
    case 'schema':
      return r.fields.length;
    case 'log':
      return r.entries.length;
    case 'compare':
      return 2;
    case 'ablation':
      return r.affected.length;
  }
}

function baseStats(scanned: number, returned: number, excluded: number, index: string): ExecStats {
  return { ms: 0, scanned, returned, excluded, cacheHit: false, index };
}

function runUncached(
  db: CareerDB,
  indexes: DBIndexes,
  ast: AST,
  opts: ExecuteOpts,
): ExecResult {
  switch (ast.kind) {
    case 'log': {
      const entries = getLog();
      return { ok: true, kind: 'log', entries, stats: baseStats(entries.length, entries.length, 0, 'session log (not a table scan)') };
    }
    case 'schema': {
      const { SCHEMA_FIELDS } = schemaFields();
      const fields = SCHEMA_FIELDS[ast.collection] ?? [];
      return { ok: true, kind: 'schema', collection: ast.collection, fields, stats: baseStats(0, fields.length, 0, 'schema is metadata, no scan') };
    }
    case 'compare': {
      const leftHit = indexes.byId.get(ast.leftId);
      const rightHit = indexes.byId.get(ast.rightId);
      if (!leftHit) {
        return { ok: false, error: { message: `no record with id '${ast.leftId}'.` } };
      }
      if (!rightHit) {
        return { ok: false, error: { message: `no record with id '${ast.rightId}'.` } };
      }
      const toRow = (hit: { collection: CollectionName; record: unknown }): ResultRow => {
        const rec = hit.record as RecordAny;
        const v = verificationOf(rec);
        return { collection: hit.collection, id: String(rec['id'] ?? ''), record: rec, badge: v ? requiresBadge(v) : false };
      };
      const left = toRow(leftHit);
      const right = toRow(rightHit);
      return {
        ok: true,
        kind: 'compare',
        left,
        right,
        differingFields: differingFields(left.record as RecordAny, right.record as RecordAny),
        stats: baseStats(2, 2, 0, 'index: byId (2 direct lookups)'),
      };
    }
    case 'without':
      return runAblation(db, ast.key);
    case 'show':
      return runShow(db, indexes, ast, opts);
  }
}

// Schema field lists are parser-owned metadata (single source of truth).
function schemaFields(): { SCHEMA_FIELDS: Record<string, string[]> } {
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(FIELDS)) {
    if (k !== 'highlights') out[k] = [...v];
  }
  return { SCHEMA_FIELDS: out };
}

function runShow(
  db: CareerDB,
  indexes: DBIndexes,
  ast: Extract<AST, { kind: 'show' }>,
  opts: ExecuteOpts,
): ExecResult {
  const includeUnverified = ast.withUnverified || opts.includeUnverified || false;
  if (ast.collection === 'highlights') {
    const flagged = db.projects.filter((p) => p.flagship);
    const { rows, excluded } = splitTrust(
      'projects',
      flagged.map((p) => ({ id: p.id, record: p as unknown as RecordAny })),
      includeUnverified,
    );
    const limited = ast.limit !== undefined ? rows.slice(0, ast.limit) : rows;
    return {
      ok: true,
      kind: 'rows',
      rows: limited,
      excluded,
      stats: baseStats(flagged.length, limited.length, excluded.length, 'saved view: flagship projects'),
    };
  }
  const plan = planScan(db, indexes, ast.collection, ast.filter);
  const byId = new Map<string, unknown>();
  for (const r of (db[ast.collection] as Array<{ id: string }>) ?? []) byId.set(r.id, r);
  let candidates = plan.ids
    .map((id) => byId.get(id))
    .filter((r) => r !== undefined)
    .map((r) => ({ id: (r as { id: string }).id, record: r as RecordAny }));
  if (ast.filter) candidates = candidates.filter(({ record }) => evalFilter(record, ast.filter as FilterNode));
  const { rows: trusted, excluded } = splitTrust(ast.collection, candidates, includeUnverified);
  const ordered = ast.orderBy ? sortRows(trusted, ast.orderBy.field, ast.orderBy.dir) : trusted;
  const limited = ast.limit !== undefined ? ordered.slice(0, ast.limit) : ordered;
  return {
    ok: true,
    kind: 'rows',
    rows: limited,
    excluded,
    stats: baseStats(plan.scanned, limited.length, excluded.length, plan.index),
  };
}

/**
 * WITHOUT <skill-key>: evidence-coverage ablation, never capability.
 * Removing python means "these records lose Python as evidence",
 * never "the engineer cannot engineer".
 */
function runAblation(db: CareerDB, rawKey: string): ExecResult {
  const key = rawKey.toLowerCase();
  const skill = db.skills.find((s) => s.id.toLowerCase() === key);
  if (!skill) {
    const ids = db.skills.map((s) => s.id);
    return {
      ok: false,
      error: {
        message: `no skill with key '${rawKey}'. skills: ${ids.join(', ')}.`,
        suggestion: nearestWord(rawKey, ids),
      },
    };
  }

  const affected: Array<{ collection: string; id: string }> = [];
  const removedProjects = new Set<string>();
  const removedSkills = new Set<string>([skill.id]);

  const touchesSkill = (stack: string[], skillIds: string[]): boolean =>
    skillIds.some((s) => s.toLowerCase() === key) ||
    stack.some((s) => s.toLowerCase() === key);

  for (const p of db.projects) {
    if (touchesSkill(p.stack, p.skillIds)) {
      affected.push({ collection: 'projects', id: p.id });
      removedProjects.add(p.id);
    }
  }
  for (const w of db.work) {
    if (w.skillIds.some((s) => s.toLowerCase() === key)) affected.push({ collection: 'work', id: w.id });
  }
  for (const d of db.decisions) {
    if (d.skillIds.some((s) => s.toLowerCase() === key)) affected.push({ collection: 'decisions', id: d.id });
  }
  for (const e of db.experiments) {
    if (e.technology.toLowerCase() === key || e.technology.toLowerCase().includes(key)) {
      affected.push({ collection: 'experiments', id: e.id });
    }
  }

  // A decision is orphaned only when EVERY record evidencing it is removed:
  // all its project refs are removed projects and all its skill refs are
  // removed skills. Anything else still has support standing.
  const orphanedDecisions = db.decisions
    .filter((d) => {
      const refs = [...d.projectIds, ...d.skillIds];
      if (refs.length === 0) return false;
      return refs.every((r) => removedProjects.has(r) || removedSkills.has(r));
    })
    .map((d) => d.id);

  const coverage: { before: Record<string, number>; after: Record<string, number> } = {
    before: {},
    after: {},
  };
  const countBy = (ids: Set<string>, table: Array<{ id: string }>): number =>
    table.filter((r) => !ids.has(r.id)).length;
  coverage.before['projects'] = db.projects.length;
  coverage.after['projects'] = countBy(removedProjects, db.projects);
  coverage.before['decisions'] = db.decisions.length;
  coverage.after['decisions'] = countBy(new Set(orphanedDecisions), db.decisions);

  const scanned = db.projects.length + db.work.length + db.decisions.length + db.experiments.length;
  return {
    ok: true,
    kind: 'ablation',
    key: skill.id,
    affected,
    orphanedDecisions,
    coverage,
    stats: baseStats(scanned, affected.length, 0, `evidence graph walk (no index; ${scanned} refs checked)`),
  };
}
