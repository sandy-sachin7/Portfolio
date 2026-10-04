import { describe, expect, it } from 'vitest';
import { db } from '../../src/db/dataset';
import { buildIndexes } from '../../src/db/indexes';
import { clearCache, execute } from '../../src/query/executor';
import { explain } from '../../src/query/explain';
import { type AST, parse } from '../../src/query/parser';
import { decodeQueryUrl, encodeQueryUrl } from '../../src/lib/nav';

const indexes = buildIndexes(db);

function linesFor(query: string): string[] {
  clearCache();
  const ast = parse(query) as AST;
  const result = execute(db, indexes, ast, { query });
  return explain(ast, result);
}

describe('explain', () => {
  it('names the serving index for indexed filters', () => {
    expect(linesFor('SHOW experiments WHERE stage = "ADOPTED"').join('\n')).toMatch(
      /index: byStage\(stage=ADOPTED\)/,
    );
  });

  it('admits full scans honestly', () => {
    expect(linesFor('SHOW decisions').join('\n')).toMatch(/full scan \(13 rows, fine at this scale\)/);
  });

  it('says cache hit on the second run', () => {
    linesFor('SHOW work');
    const ast = parse('SHOW work') as AST;
    const second = execute(db, indexes, ast, { query: 'SHOW work' });
    expect(explain(ast, second).join('\n')).toMatch(/cache hit/);
  });

  it('renders ablation coverage and orphan lines', () => {
    const lines = linesFor('WITHOUT rust').join('\n');
    expect(lines).toMatch(/COVERAGE projects \d+ > \d+/);
    expect(lines).toMatch(/ORPHANED=/);
  });

  it('lists excluded rows with the UNVERIFIED path', () => {
    const lines = linesFor('SHOW failures WHERE costDays > 14').join('\n');
    expect(lines).toMatch(/EXCLUDED=.*needs_check/);
    expect(lines).toMatch(/WITH UNVERIFIED/);
  });
});

describe('nav query URLs', () => {
  it('round-trips any query string through the hash', () => {
    for (const q of [
      'SHOW highlights LIMIT 3',
      'COMPARE proj-contextd vs proj-shard',
      'WITHOUT rust',
      'SHOW experiments WHERE stage = "ADOPTED"',
    ]) {
      expect(decodeQueryUrl(encodeQueryUrl(q))).toBe(q);
    }
  });

  it('rejects non-query hashes and empty queries', () => {
    expect(decodeQueryUrl('#about')).toBeNull();
    expect(decodeQueryUrl('#q=%20%20')).toBeNull();
    expect(decodeQueryUrl('#q=%ZZ')).toBeNull();
  });
});
