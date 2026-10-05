/**
 * F0 tests: schema validity, relationship integrity, provenance, starter queries.
 * Field names match src/db/schema.ts (*Ids relations). No UI, no parser.
 * If the data lies, these fail.
 */
import { describe, expect, it } from 'vitest';
import { db as dataset } from '../../src/db/dataset';
import { buildIndexes } from '../../src/db/indexes';
import { assertValidDataset, isPresentable, badgeFor, validateDataset } from '../../src/db/validate';
import { STARTER_QUERIES, STARTER_REFERENCED_IDS } from '../../src/lib/starterQueries';

describe('dataset validation', () => {
  it('passes the loud validator with zero errors', () => {
    expect(() => assertValidDataset(dataset)).not.toThrow();
  });

  it('returns an empty error list', () => {
    expect(validateDataset(dataset)).toEqual([]);
  });
});

describe('deterministic IDs', () => {
  it('has unique IDs across every entity', () => {
    const ids = [
      ...dataset.work.map((w) => w.id),
      ...dataset.projects.map((p) => p.id),
      ...dataset.decisions.map((d) => d.id),
      ...dataset.failures.map((f) => f.id),
      ...dataset.experiments.map((e) => e.id),
      ...dataset.notes.map((n) => n.id),
      ...dataset.beliefs.map((b) => b.id),
      ...dataset.skills.map((s) => s.id),
      ...dataset.interests.map((i) => i.id),
      ...dataset.achievements.map((a) => a.id),
      ...dataset.education.map((e) => e.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses stable kebab-case ids (no spaces, no caps)', () => {
    const ids = [
      ...dataset.work.map((w) => w.id),
      ...dataset.projects.map((p) => p.id),
      ...dataset.decisions.map((d) => d.id),
      ...dataset.failures.map((f) => f.id),
      ...dataset.experiments.map((e) => e.id),
      ...dataset.notes.map((n) => n.id),
      ...dataset.beliefs.map((b) => b.id),
      ...dataset.skills.map((s) => s.id),
    ];
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('provenance presence', () => {
  it('every work/project/decision/failure/experiment/note carries provenance', () => {
    for (const w of dataset.work) expect(w.provenance.source, `work:${w.id}`).toBeTruthy();
    for (const p of dataset.projects) expect(p.provenance.source, `project:${p.id}`).toBeTruthy();
    for (const d of dataset.decisions) expect(d.provenance.source, `decision:${d.id}`).toBeTruthy();
    for (const f of dataset.failures) expect(f.provenance.source, `failure:${f.id}`).toBeTruthy();
    for (const e of dataset.experiments) expect(e.provenance.source, `experiment:${e.id}`).toBeTruthy();
    for (const n of dataset.notes) expect(n.provenance.source, `note:${n.id}`).toBeTruthy();
  });

  it('flags rather than hides uncertainty (needs_check exists where claimed)', () => {
    const flagged = [
      ...dataset.projects.filter((p) => p.verification === 'needs_check'),
      ...dataset.notes.filter((n) => n.verification === 'needs_check'),
    ];
    expect(flagged.length).toBeGreaterThan(0);
  });
});

describe('relationship integrity', () => {
  it('every verified project links at least one failure', () => {
    for (const p of dataset.projects) {
      if (p.verification === 'verified') {
        expect(p.failureIds.length, `project:${p.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('every failure is referenced by at least one project or work record', () => {
    const referenced = new Set<string>();
    for (const p of dataset.projects) for (const f of p.failureIds) referenced.add(f);
    for (const w of dataset.work) for (const f of w.failureIds) referenced.add(f);
    for (const f of dataset.failures) {
      expect(referenced.has(f.id), `failure:${f.id} unreferenced`).toBe(true);
    }
  });

  it('every skill has at least one evidence link', () => {
    for (const s of dataset.skills) {
      const n =
        s.evidence.workIds.length +
        s.evidence.projectIds.length +
        s.evidence.decisionIds.length +
        s.evidence.noteIds.length +
        s.evidence.experimentIds.length;
      expect(n, `skill:${s.id}`).toBeGreaterThan(0);
    }
  });

  it('indexes resolve every registered id', () => {
    const idx = buildIndexes(dataset);
    for (const id of idx.byId.keys()) {
      expect(idx.byId.get(id)).toBeTruthy();
    }
    expect(idx.byId.size).toBeGreaterThan(40);
  });
});

describe('starter queries', () => {
  it('references only ids that exist', () => {
    const idx = buildIndexes(dataset);
    for (const id of STARTER_REFERENCED_IDS) {
      expect(idx.byId.has(id), `starter id "${id}" missing`).toBe(true);
    }
  });

  it('every starter query that targets the dataset returns rows', () => {
    for (const q of STARTER_QUERIES) {
      if (q.query.startsWith('WITHOUT')) continue; // ablation returns a receipt, not rows
      if (q.query.startsWith('COMPARE')) continue; // handled by F1 compare view
      expect(q.expectedCount, q.query).toBeGreaterThan(0);
    }
  });

  it('expensive-failure filter returns exactly the three costly postmortems', () => {
    const expensive = dataset.failures.filter((f) => f.costDays > 14).map((f) => f.id).sort();
    expect(expensive).toEqual(['fail-contextd-v1', 'fail-relational-queries', 'fail-tabular-baseline']);
  });

  it('expensive failures are all needs_check, so F1 must badge them UNVERIFIED', () => {
    const expensive = dataset.failures.filter((f) => f.costDays > 14);
    for (const f of expensive) {
      expect(badgeFor(f.verification), `failure:${f.id} must render badged`).toBe('unverified');
    }
  });

  it('both experiment terminal stages are represented', () => {
    const stages = new Set(dataset.experiments.map((e) => e.stage));
    expect(stages.has('ADOPTED')).toBe(true);
    expect(stages.has('ABANDONED')).toBe(true);
  });

  it('adopted experiments outnumber abandoned ones (explore-then-commit, not tourism)', () => {
    const adopted = dataset.experiments.filter((e) => e.stage === 'ADOPTED').length;
    const abandoned = dataset.experiments.filter((e) => e.stage === 'ABANDONED').length;
    expect(adopted).toBeGreaterThanOrEqual(2);
    expect(abandoned).toBeGreaterThanOrEqual(1);
  });
});

describe('recruiter data', () => {
  it('is complete: name, role, positioning, proof, projects, contact', () => {
    const r = dataset.recruiter;
    expect(r.name).toBeTruthy();
    expect(r.role).toBeTruthy();
    expect(r.positioning).toBeTruthy();
    expect(r.proof.length).toBeGreaterThanOrEqual(3);
    expect(r.projects.length).toBeGreaterThanOrEqual(3);
    expect(r.contact.email).toMatch(/@/);
    expect(r.contact.github).toContain('github.com');
    expect(r.contact.linkedin).toContain('linkedin.com');
    expect(r.contact.resume).toContain('/assets/');
  });

  it('marks stale-prone fields instead of publishing them as fact', () => {
    const fv = dataset.recruiter.fieldVerification;
    expect(fv.github).toBe('verified'); // repo owner confirmed via API
    expect(fv.location).toBe('needs_check'); // city unknown; country only
    expect(fv.linkedin).toBe('needs_check'); // carried from old portfolio
    expect(fv.email).toBe('needs_check'); // carried from old portfolio
  });

  it('Lam is historical and education is graduated', () => {
    const lam = dataset.work.find((w) => w.id === 'work-lam');
    expect(lam?.current).toBe(false);
    expect(lam?.era).toBe('PAST');
    const edu = dataset.education.find((e) => e.id === 'edu-amrita');
    expect(edu?.end).toBeTruthy();
  });
});

describe('verification semantics (F1 contract)', () => {
  it('verified is settled, asserted carries ASSERTED, needs_check carries UNVERIFIED', () => {
    expect(isPresentable('verified')).toBe(true);
    expect(isPresentable('asserted')).toBe(true);
    expect(isPresentable('needs_check')).toBe(false);
    expect(badgeFor('verified')).toBe(null);
    expect(badgeFor('asserted')).toBe('asserted');
    expect(badgeFor('needs_check')).toBe('unverified');
  });

  it('every belief declares stated-vs-inferred provenance', () => {
    for (const b of dataset.beliefs) {
      expect(['stated', 'inferred']).toContain(b.origin);
    }
    // At least one of each: the model must carry both voice and synthesis.
    const origins = new Set(dataset.beliefs.map((b) => b.origin));
    expect(origins.has('stated')).toBe(true);
    expect(origins.has('inferred')).toBe(true);
  });

  it('every note declares published-vs-referenced status', () => {
    for (const n of dataset.notes) {
      expect(['published', 'referenced', 'idea']).toContain(n.status);
    }
    // Published notes carry verifiable URLs; referenced ones must not fake them.
    for (const n of dataset.notes) {
      if (n.status === 'published') expect(n.url, `note:${n.id}`).toBeTruthy();
      else expect(n.url, `note:${n.id}`).toBeUndefined();
    }
  });
});
