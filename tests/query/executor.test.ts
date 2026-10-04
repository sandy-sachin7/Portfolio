import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/db/dataset';
import { buildIndexes } from '../../src/db/indexes';
import { clearCache, clearLog, execute, getLog, hashAST, logToJSONL } from '../../src/query/executor';
import { type AST, parse } from '../../src/query/parser';

const indexes = buildIndexes(db);

function run(query: string, includeUnverified = false) {
  const ast = parse(query);
  if ('kind' in ast && ast.kind === 'parse-error') throw new Error(`parse failed: ${query}`);
  return execute(db, indexes, ast as AST, { query, includeUnverified });
}

beforeEach(() => {
  clearCache();
  clearLog();
});

describe('executor: starter queries return documented counts', () => {
  it('SHOW highlights LIMIT 3 → 3 flagship rows', () => {
    const r = run('SHOW highlights LIMIT 3');
    expect(r.ok && r.kind === 'rows' && r.rows.length).toBe(3);
  });

  it('SHOW work → 3, SHOW projects → 5, SHOW beliefs → 6', () => {
    expect(run('SHOW work')).toMatchObject({ ok: true });
    const work = run('SHOW work');
    if (work.ok && work.kind === 'rows') expect(work.rows.length).toBe(3);
    const projects = run('SHOW projects');
    if (projects.ok && projects.kind === 'rows') expect(projects.rows.length).toBe(5);
    const beliefs = run('SHOW beliefs ORDER BY date DESC');
    // 3 asserted beliefs presentable; 3 inferred (needs_check) excluded by default
    if (beliefs.ok && beliefs.kind === 'rows') expect(beliefs.rows.length).toBe(3);
    const beliefsAll = run('SHOW beliefs ORDER BY date DESC WITH UNVERIFIED');
    if (beliefsAll.ok && beliefsAll.kind === 'rows') {
      expect(beliefsAll.rows.length).toBe(6);
      expect(beliefsAll.rows.filter((r) => r.badge).length).toBe(3);
    }
  });

  it('SHOW failures WHERE costDays > 14 → exactly the 3 expensive postmortems', () => {
    const r = run('SHOW failures WHERE costDays > 14 WITH UNVERIFIED');
    expect(r.ok && r.kind === 'rows').toBe(true);
    if (r.ok && r.kind === 'rows') {
      expect(r.rows.map((row) => row.id).sort()).toEqual(
        ['fail-contextd-v1', 'fail-relational-queries', 'fail-tabular-baseline'].sort(),
      );
      // needs_check rows are badged, never dressed as settled fact
      expect(r.rows.every((row) => row.badge)).toBe(true);
    }
  });

  it('SHOW experiments by stage → 4 ADOPTED, 2 ABANDONED', () => {
    const adopted = run('SHOW experiments WHERE stage = "ADOPTED"');
    const abandoned = run('SHOW experiments WHERE stage = "ABANDONED"');
    if (adopted.ok && adopted.kind === 'rows') expect(adopted.rows.length).toBe(4);
    if (abandoned.ok && abandoned.kind === 'rows') expect(abandoned.rows.length).toBe(2);
  });

  it('COMPARE proj-contextd vs proj-shard → 2 rows + differing fields', () => {
    const r = run('COMPARE proj-contextd vs proj-shard');
    expect(r.ok && r.kind === 'compare').toBe(true);
    if (r.ok && r.kind === 'compare') {
      expect(r.differingFields.length).toBeGreaterThan(0);
      expect(r.stats.index).toMatch(/byId/);
    }
  });

  it('SCHEMA work lists real fields; LOG records the session', () => {
    const s = run('SCHEMA work');
    if (s.ok && s.kind === 'schema') expect(s.fields).toContain('org');
    run('SHOW work');
    const log = run('LOG');
    if (log.ok && log.kind === 'log') expect(log.entries.length).toBeGreaterThanOrEqual(2);
  });
});

describe('executor: verification contract', () => {
  it('needs_check failures are excluded by default and named', () => {
    const r = run('SHOW failures WHERE costDays > 14');
    if (r.ok && r.kind === 'rows') {
      expect(r.rows.length).toBe(0);
      expect(r.excluded.map((e) => e.id).sort()).toEqual(
        ['fail-contextd-v1', 'fail-relational-queries', 'fail-tabular-baseline'].sort(),
      );
      expect(r.excluded.every((e) => e.reason === 'needs_check')).toBe(true);
    } else throw new Error('expected rows result');
  });

  it('idea notes never appear in evidence results', () => {
    const r = run('SHOW notes WITH UNVERIFIED');
    if (r.ok && r.kind === 'rows') {
      expect(r.rows.some((row) => (row.record as { status?: string }).status === 'idea')).toBe(false);
    } else throw new Error('expected rows result');
  });

  it('array fields use membership semantics; unknown id errors', () => {
    const r = run('SHOW projects WHERE stack = "Rust"');
    if (r.ok && r.kind === 'rows') expect(r.rows.length).toBeGreaterThanOrEqual(2);
    const bad = run('COMPARE nope vs proj-shard');
    expect(bad.ok).toBe(false);
  });
});

describe('executor: WITHOUT is evidence coverage, not capability', () => {
  it('WITHOUT rust names affected records + orphaned decisions + coverage delta', () => {
    const r = run('WITHOUT rust');
    expect(r.ok && r.kind === 'ablation').toBe(true);
    if (r.ok && r.kind === 'ablation') {
      expect(r.affected.map((a) => a.id)).toContain('proj-contextd');
      expect(r.affected.map((a) => a.id)).toContain('proj-shard');
      expect(r.coverage.after['projects']).toBeLessThan(r.coverage.before['projects']);
      expect(Array.isArray(r.orphanedDecisions)).toBe(true);
      expect(r.stats.index).toMatch(/evidence graph walk/);
    }
  });

  it('unknown ablation keys error with a suggestion', () => {
    const r = run('WITHOUT pythoon');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.suggestion).toBe('python');
  });
});

describe('executor: cache and log are real', () => {
  it('repeat queries hit the normalized-AST cache; LRU cap holds', () => {
    const first = run('SHOW work');
    const second = run('SHOW work');
    if (first.ok && first.kind === 'rows' && second.ok && second.kind === 'rows') {
      expect(first.stats.cacheHit).toBe(false);
      expect(second.stats.cacheHit).toBe(true);
      expect(second.stats.index).toMatch(/cache hit/);
      expect(second.rows).toEqual(first.rows);
    } else throw new Error('expected rows results');
    // Distinct ASTs share the cache only on identical normalization
    expect(hashAST(parse('SHOW work') as AST)).toBe(hashAST(parse('SHOW work') as AST));
    expect(hashAST(parse('SHOW work') as AST)).not.toBe(hashAST(parse('SHOW projects') as AST));
  });

  it('log is append-only and exports JSONL', () => {
    run('SHOW work');
    run('WITHOUT rust');
    const entries = getLog();
    expect(entries.length).toBe(2);
    const lines = logToJSONL().split('\n');
    expect(lines.length).toBe(2);
    expect(JSON.parse(lines[0])).toMatchObject({ query: 'SHOW work' });
  });

  it('stats measure real time and honest scans', () => {
    const r = run('SHOW decisions');
    if (r.ok && r.kind === 'rows') {
      expect(r.stats.ms).toBeGreaterThanOrEqual(0);
      expect(r.stats.scanned).toBeGreaterThan(0);
      expect(r.stats.index).toMatch(/fine at this scale/);
    } else throw new Error('expected rows result');
  });
});

describe('executor: F1.1 truthfulness fixes', () => {
  it('cache is really LRU: a hit refreshes recency before eviction', () => {
    // Fill the 20-slot cache with 21 distinct ASTs would evict #1;
    // touch #1 first so #2 (untouched) is evicted instead.
    for (let n = 1; n <= 20; n++) run(`SHOW work LIMIT ${n}`);
    const touched = run('SHOW work LIMIT 1');
    if (!touched.ok) throw new Error('expected rows result');
    expect(touched.stats.cacheHit).toBe(true);
    run('SHOW work LIMIT 21');
    const survivor = run('SHOW work LIMIT 1');
    const evicted = run('SHOW work LIMIT 2');
    if (!survivor.ok || !evicted.ok) throw new Error('expected rows results');
    expect(survivor.stats.cacheHit).toBe(true);
    expect(evicted.stats.cacheHit).toBe(false);
  });

  it('LOG is never cached: it sees queries that ran after the first LOG', () => {
    const first = run('LOG');
    run('SHOW work');
    const second = run('LOG');
    if (
      first.ok && first.kind === 'log' &&
      second.ok && second.kind === 'log'
    ) {
      // +1 for the SHOW work entry, +1 for the first LOG's own entry
      expect(second.entries.length).toBe(first.entries.length + 2);
      expect(second.stats.cacheHit).toBe(false);
      expect(second.entries.some((e) => e.query === 'SHOW work')).toBe(true);
    } else throw new Error('expected log results');
  });

  it('indexed filters mean the same as full scans regardless of case', () => {
    const upper = run('SHOW experiments WHERE stage = "ADOPTED"');
    const lower = run('SHOW experiments WHERE stage = "adopted"');
    const mixed = run('SHOW experiments WHERE stage = "Adopted"');
    if (
      upper.ok && upper.kind === 'rows' &&
      lower.ok && lower.kind === 'rows' &&
      mixed.ok && mixed.kind === 'rows'
    ) {
      const ids = (r: typeof upper) =>
        r.ok && r.kind === 'rows' ? r.rows.map((row) => row.id).sort() : [];
      expect(ids(lower)).toEqual(ids(upper));
      expect(ids(mixed)).toEqual(ids(upper));
      expect(upper.rows.length).toBeGreaterThan(0);
    } else throw new Error('expected rows results');
  });

  it('byYear scanned counts only the queried collection', () => {
    const r = run('SHOW work WHERE start = "2024"');
    if (r.ok && r.kind === 'rows') {
      expect(r.stats.index).toMatch(/index: byYear\(work, 2024\)/);
      // Scanned = work records with a 2024 start that were actually examined:
      // in-collection only, never inflated with other collections' ids.
      const examined = db.work.filter((w) =>
        ((w as unknown as Record<string, unknown>)['start'] as string | undefined)?.startsWith('2024'),
      ).length;
      expect(r.stats.scanned).toBe(examined);
      expect(r.stats.scanned).toBeLessThanOrEqual(db.work.length);
      expect(r.rows.length + r.excluded.length).toBeLessThanOrEqual(r.stats.scanned);
    } else throw new Error('expected rows result');
  });
});
