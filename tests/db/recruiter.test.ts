// Recruiter data completeness (F4): the 30-second sheet must never render empty.
import { describe, expect, it } from 'vitest';
import { db } from '../../src/db/dataset';

describe('recruiter record', () => {
  const r = db.recruiter;

  it('has identity and positioning', () => {
    expect(r.name.trim().length).toBeGreaterThan(0);
    expect(r.role.trim().length).toBeGreaterThan(0);
    expect(r.positioning.trim().length).toBeGreaterThan(0);
  });

  it('has exactly three proof bullets', () => {
    expect(r.proof).toHaveLength(3);
    for (const p of r.proof) expect(p.trim().length).toBeGreaterThan(0);
  });

  it('has projects, experience, and education', () => {
    expect(r.projects.length).toBeGreaterThan(0);
    expect(r.experience.length).toBeGreaterThan(0);
    expect(r.education.trim().length).toBeGreaterThan(0);
  });

  it('has well-formed contact targets', () => {
    expect(r.contact.email).toMatch(/@/);
    expect(r.contact.github).toMatch(/^https:\/\//);
    expect(r.contact.linkedin).toMatch(/^https:\/\//);
    expect(r.contact.resume.startsWith('/assets/')).toBe(true);
  });

  it('marks field verification state explicitly', () => {
    for (const k of ['location', 'github', 'linkedin', 'email'] as const) {
      expect(['verified', 'asserted', 'needs_check']).toContain(r.fieldVerification[k]);
    }
  });
});
