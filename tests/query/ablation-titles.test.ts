import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/db/dataset';
import { buildIndexes } from '../../src/db/indexes';
import { clearCache, clearLog, execute } from '../../src/query/executor';
import { type AST, parse } from '../../src/query/parser';
import type { CollectionName } from '../../src/db/schema';
import { getById, titleOf } from '../../src/lib/rows';

const indexes = buildIndexes(db);

function run(query: string) {
  const ast = parse(query);
  if ('kind' in ast && ast.kind === 'parse-error') throw new Error(`parse failed: ${query}`);
  return execute(db, indexes, ast as AST, { query });
}

beforeEach(() => {
  clearCache();
  clearLog();
});

describe('F3 ablation receipt: every affected entry resolves a title in its own collection', () => {
  it('WITHOUT rust: affected spans projects+decisions, all resolve (regression: receipt searched projects only)', () => {
    const r = run('WITHOUT rust');
    if (!(r.ok && r.kind === 'ablation')) throw new Error('expected ablation result');
    expect(r.affected.length).toBeGreaterThan(0);
    // The receipt must show titles for non-project evidence too.
    expect(r.affected.some((a) => a.collection !== 'projects')).toBe(true);
    for (const a of r.affected) {
      const rec = getById(a.collection as CollectionName, a.id);
      expect(rec, `${a.collection}/${a.id} should resolve`).not.toBeNull();
      expect(titleOf(a.collection, rec).length).toBeGreaterThan(0);
    }
  });

  it('WITHOUT python: all affected entries resolve titles', () => {
    const r = run('WITHOUT python');
    if (!(r.ok && r.kind === 'ablation')) throw new Error('expected ablation result');
    for (const a of r.affected) {
      expect(getById(a.collection as CollectionName, a.id)).not.toBeNull();
    }
  });
});
