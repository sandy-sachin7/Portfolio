// tests/db/narrative.test.ts (F6): flagship proof helpers quote the dataset
// verbatim and never leak needs_check records into the public layer.
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/db/dataset';
import { buildIndexes } from '../../src/db/indexes';
import { isPresentable } from '../../src/db/validate';
import { FLAGSHIP_IDS, flagshipProof } from '../../src/lib/narrative';
import { clearCache, clearLog, execute, type AST } from '../../src/query/executor';
import { parse } from '../../src/query/parser';

const indexes = buildIndexes(db);

function run(query: string) {
  const ast = parse(query);
  if ('kind' in ast && ast.kind === 'parse-error') throw new Error(`parse failed: ${query}`);
  return execute(db, indexes, ast as AST, { query, includeUnverified: false });
}

beforeEach(() => {
  clearCache();
  clearLog();
});

describe('flagshipProof', () => {
  it('covers exactly the two published flagships', () => {
    expect([...FLAGSHIP_IDS]).toEqual(['proj-contextd', 'proj-shard']);
  });

  it('returns verbatim dataset content with repo evidence', () => {
    for (const id of FLAGSHIP_IDS) {
      const proof = flagshipProof(db, id);
      expect(proof.project.title.length).toBeGreaterThan(0);
      expect(proof.project.thesis.length).toBeGreaterThan(0);
      expect(proof.decision.chosen.length).toBeGreaterThan(0);
      expect(proof.decision.rejected.length).toBeGreaterThan(0);
      expect(proof.repoUrl.startsWith('https://github.com/')).toBe(true);
    }
  });

  it('uses only presentable decisions, never needs_check', () => {
    for (const id of FLAGSHIP_IDS) {
      const proof = flagshipProof(db, id);
      expect(isPresentable(proof.decision.verification)).toBe(true);
    }
  });

  it('carries the project verification badge (Shard is asserted, Contextd is not)', () => {
    expect(flagshipProof(db, 'proj-contextd').badge).toBeNull();
    expect(flagshipProof(db, 'proj-shard').badge).toBe('asserted');
  });

  it('exposes no failure surface: proof has no failure ids', () => {
    for (const id of FLAGSHIP_IDS) {
      expect(Object.keys(flagshipProof(db, id)).sort()).toEqual(['badge', 'decision', 'project', 'repoUrl']);
    }
  });

  it('throws loudly on unknown project or missing evidence', () => {
    expect(() => flagshipProof(db, 'proj-nope')).toThrow();
  });
});

describe('failure CTA honesty (F6)', () => {
  it('SHOW failures returns one asserted public row, six named needs_check excluded', () => {
    const r = run('SHOW failures');
    if (!r.ok || r.kind !== 'rows') throw new Error('SHOW failures failed');
    expect(r.rows.map((row) => row.id)).toEqual(['fail-llama13b-math']);
    expect(r.excluded.length).toBe(6);
    const excludedIds = r.excluded.map((e) => e.id);
    expect(excludedIds).toContain('fail-contextd-v1');
    expect(excludedIds).toContain('fail-shard-scope');
  });
});
