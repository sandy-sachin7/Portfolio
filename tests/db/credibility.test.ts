// db/credibility (F6.1): public-layer honesty. No "to confirm" leakage,
// no epistemic vocabulary on narrative surfaces, proof strips resolve to
// presentable dataset records. Tests behavior contracts, not markup.
import { describe, expect, it } from 'vitest';
import { db } from '../../src/db/dataset';
import { flagshipProof, proofStrip } from '../../src/lib/narrative';

const BANNED_PUBLIC = ['to confirm', 'TBD', 'unknown', 'needs_check'];

describe('recruiter display strings', () => {
  it('contain no uncertainty placeholders', () => {
    const strings = [
      db.recruiter.positioning,
      db.recruiter.education,
      db.recruiter.location,
      ...db.recruiter.proof,
      ...db.recruiter.experience.map((e) => `${e.org} ${e.role} ${e.period}`),
      ...db.recruiter.projects.map((p) => `${p.name} ${p.line}`),
    ];
    for (const s of strings) {
      for (const banned of BANNED_PUBLIC) {
        expect(s.toLowerCase()).not.toContain(banned);
      }
    }
  });

  it('positioning names territory, not adjectives', () => {
    expect(db.recruiter.positioning).not.toMatch(/serious|exceptional|passionate|world-class/i);
    expect(db.recruiter.positioning.length).toBeGreaterThan(40);
  });
});

describe('flagship proof strips', () => {
  it('contextd releases resolve to the verified repo releases page', () => {
    const items = proofStrip(db, 'proj-contextd');
    expect(items.length).toBeGreaterThanOrEqual(3);
    const releases = items.find((i) => i.label === 'releases');
    expect(releases?.url).toBe('https://github.com/sandy-sachin7/contextd/releases');
    expect(releases?.value).toMatch(/v\d+\.\d+\.\d+/);
  });

  it('every proof item resolves to a verified repo URL and a presentable decision', () => {
    for (const id of ['proj-contextd', 'proj-shard'] as const) {
      const project = db.projects.find((p) => p.id === id);
      for (const item of proofStrip(db, id)) {
        expect(item.url.startsWith(project?.links.repo ?? 'missing')).toBe(true);
        if (item.decisionId) {
          const d = db.decisions.find((x) => x.id === item.decisionId);
          expect(d).toBeDefined();
          expect(['verified', 'asserted']).toContain(d?.verification);
        }
      }
    }
  });

  it('flagship case-file decisions are never needs_check', () => {
    for (const id of ['proj-contextd', 'proj-shard'] as const) {
      const { decision } = flagshipProof(db, id);
      expect(['verified', 'asserted']).toContain(decision.verification);
    }
  });

  it('release range matches verified provenance, not invented counts', () => {
    const project = db.projects.find((p) => p.id === 'proj-contextd');
    expect(project?.verification).toBe('verified');
    expect(project?.provenance.detail).toMatch(/v1\.0\.0 through v3\.1\.3/);
    // No bare release-count claim survives on the public surface.
    expect(db.recruiter.proof[2]).not.toMatch(/\d+\+ releases/);
  });
});
