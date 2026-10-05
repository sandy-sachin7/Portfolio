/**
 * Validation layer for CAREER.DB dataset.
 * Fails loudly: every check returns human-readable errors.
 * Field names match src/db/schema.ts exactly (*Ids relations, no `related*`).
 */
import type { CareerDB, VerificationState } from './schema';

export interface ValidationError {
  entity: string;
  id: string;
  field: string;
  message: string;
}

type Err = ValidationError;
const err = (entity: string, id: string, field: string, message: string): Err => ({
  entity, id, field, message,
});

// YYYY, YYYY-MM, or YYYY-MM-DD.
const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
// Only first-party or known-good targets. Catches example.com / placeholder leaks.
const URL_RE = /^(\/assets\/[\w\-.]+|https:\/\/github\.com\/[\w\-./]+|https:\/\/(www\.)?linkedin\.com\/[\w\-./]+|mailto:[\w.+-]+@[\w-]+(\.[\w-]+)+)$/;

function checkDate(errors: Err[], entity: string, id: string, field: string, value: string | undefined, required: boolean): void {
  if (!value) {
    if (required) errors.push(err(entity, id, field, 'missing required date'));
    return;
  }
  if (!DATE_RE.test(value)) {
    errors.push(err(entity, id, field, `malformed date "${value}" (want YYYY, YYYY-MM, or YYYY-MM-DD)`));
  }
}

function checkUrl(errors: Err[], entity: string, id: string, field: string, value: string | undefined): void {
  if (!value) return;
  if (!URL_RE.test(value)) {
    errors.push(err(entity, id, field, `URL not in allowlist (github/linkedin/mailto//assets only): "${value}"`));
  }
}

function nonEmpty(errors: Err[], entity: string, id: string, field: string, value: string | undefined): void {
  if (!value || value.trim().length === 0) {
    errors.push(err(entity, id, field, 'missing required text'));
  }
}

export function validateDataset(db: CareerDB): ValidationError[] {
  const errors: Err[] = [];
  const seenIds = new Map<string, string>();

  const registerId = (entity: string, id: string): void => {
    if (!id) {
      errors.push(err(entity, '(missing)', 'id', 'missing required id'));
      return;
    }
    const first = seenIds.get(id);
    if (first) errors.push(err(entity, id, 'id', `duplicate id (first declared in ${first})`));
    else seenIds.set(id, entity);
  };

  // ── Pass 1: fields ──────────────────────────────────────────────────────
  for (const w of db.work) {
    registerId('work', w.id);
    nonEmpty(errors, 'work', w.id, 'org', w.org);
    nonEmpty(errors, 'work', w.id, 'role', w.role);
    nonEmpty(errors, 'work', w.id, 'summary', w.summary);
    checkDate(errors, 'work', w.id, 'start', w.start, true);
    if (w.end) checkDate(errors, 'work', w.id, 'end', w.end, true);
    if (!w.provenance?.source) errors.push(err('work', w.id, 'provenance', 'missing provenance'));
  }

  for (const p of db.projects) {
    registerId('project', p.id);
    nonEmpty(errors, 'project', p.id, 'title', p.title);
    nonEmpty(errors, 'project', p.id, 'thesis', p.thesis);
    checkDate(errors, 'project', p.id, 'start', p.start, false);
    if (p.end) checkDate(errors, 'project', p.id, 'end', p.end, false);
    checkUrl(errors, 'project', p.id, 'links.repo', p.links.repo);
    checkUrl(errors, 'project', p.id, 'links.demo', p.links.demo);
    if (!p.provenance?.source) errors.push(err('project', p.id, 'provenance', 'missing provenance'));
    // Every VERIFIED project must link at least one failure.
    // needs_check drafts are exempt until verified (tracked in F0-REVIEW).
    if (p.failureIds.length === 0 && p.verification === 'verified') {
      errors.push(err('project', p.id, 'failureIds', 'verified project links no failure'));
    }
  }

  for (const d of db.decisions) {
    registerId('decision', d.id);
    nonEmpty(errors, 'decision', d.id, 'title', d.title);
    nonEmpty(errors, 'decision', d.id, 'chosen', d.chosen);
    nonEmpty(errors, 'decision', d.id, 'rejected', d.rejected);
    nonEmpty(errors, 'decision', d.id, 'why', d.why);
    if (!d.provenance?.source) errors.push(err('decision', d.id, 'provenance', 'missing provenance'));
  }

  for (const f of db.failures) {
    registerId('failure', f.id);
    nonEmpty(errors, 'failure', f.id, 'title', f.title);
    nonEmpty(errors, 'failure', f.id, 'lesson', f.lesson);
    if (!(f.costDays > 0)) errors.push(err('failure', f.id, 'costDays', 'costDays must be positive'));
    if (!f.provenance?.source) errors.push(err('failure', f.id, 'provenance', 'missing provenance'));
  }

  for (const e of db.experiments) {
    registerId('experiment', e.id);
    nonEmpty(errors, 'experiment', e.id, 'title', e.title);
    nonEmpty(errors, 'experiment', e.id, 'technology', e.technology);
    nonEmpty(errors, 'experiment', e.id, 'whyITriedIt', e.whyITriedIt);
    nonEmpty(errors, 'experiment', e.id, 'observation', e.observation);
    nonEmpty(errors, 'experiment', e.id, 'lesson', e.lesson);
    checkDate(errors, 'experiment', e.id, 'date', e.date, false);
    if (!e.provenance?.source) errors.push(err('experiment', e.id, 'provenance', 'missing provenance'));
  }

  for (const n of db.notes) {
    registerId('note', n.id);
    nonEmpty(errors, 'note', n.id, 'title', n.title);
    nonEmpty(errors, 'note', n.id, 'excerpt', n.excerpt);
    if (n.status !== 'published' && n.status !== 'referenced' && n.status !== 'idea') {
      errors.push(err('note', n.id, 'status', `unknown note status "${(n as { status: string }).status}" (want published|referenced|idea)`));
    }
    // A published note is a verifiable artifact: it must carry its URL.
    if (n.status === 'published' && !n.url) {
      errors.push(err('note', n.id, 'url', 'published note must carry a verifiable url'));
    }
    // Referenced/idea notes must never masquerade as published artifacts.
    if (n.status !== 'published' && n.url) {
      errors.push(err('note', n.id, 'url', `unpublished note (status=${n.status}) must not carry a url`));
    }
    checkDate(errors, 'note', n.id, 'date', n.date, false);
    checkUrl(errors, 'note', n.id, 'url', n.url);
    if (!n.provenance?.source) errors.push(err('note', n.id, 'provenance', 'missing provenance'));
  }

  for (const b of db.beliefs) {
    registerId('belief', b.id);
    nonEmpty(errors, 'belief', b.id, 'statement', b.statement);
    checkDate(errors, 'belief', b.id, 'date', b.date, false);
    if (b.origin !== 'stated' && b.origin !== 'inferred') {
      errors.push(err('belief', b.id, 'origin', `unknown belief origin (want stated|inferred)`));
    }
    if (b.evidence.length === 0) {
      errors.push(err('belief', b.id, 'evidence', 'belief has no evidence links'));
    }
  }

  for (const s of db.skills) {
    registerId('skill', s.id);
    nonEmpty(errors, 'skill', s.id, 'name', s.name);
    const n =
      s.evidence.workIds.length +
      s.evidence.projectIds.length +
      s.evidence.decisionIds.length +
      s.evidence.noteIds.length +
      s.evidence.experimentIds.length;
    if (n === 0) errors.push(err('skill', s.id, 'evidence', 'orphaned skill: no evidence links'));
  }

  for (const i of db.interests) {
    registerId('interest', i.id);
    nonEmpty(errors, 'interest', i.id, 'label', i.label);
  }

  for (const a of db.achievements) {
    registerId('achievement', a.id);
    nonEmpty(errors, 'achievement', a.id, 'title', a.title);
    if (a.relatedIds.length === 0) {
      errors.push(err('achievement', a.id, 'relatedIds', 'achievement attaches to nothing'));
    }
    if (!a.provenance?.source) errors.push(err('achievement', a.id, 'provenance', 'missing provenance'));
  }

  for (const e of db.education) {
    registerId('education', e.id);
    nonEmpty(errors, 'education', e.id, 'school', e.school);
    checkDate(errors, 'education', e.id, 'start', e.start, true);
  }

  // ── Pass 2: reference integrity ─────────────────────────────────────────
  const has = (id: string): boolean => seenIds.has(id);
  const checkRef = (entity: string, id: string, field: string, ref: string): void => {
    if (!has(ref)) errors.push(err(entity, id, field, `dangling reference: "${ref}" does not exist`));
  };
  const checkRefs = (entity: string, id: string, field: string, refs: string[]): void => {
    for (const r of refs) checkRef(entity, id, field, r);
  };

  for (const w of db.work) {
    checkRefs('work', w.id, 'skillIds', w.skillIds);
    checkRefs('work', w.id, 'projectIds', w.projectIds);
    checkRefs('work', w.id, 'decisionIds', w.decisionIds);
    checkRefs('work', w.id, 'failureIds', w.failureIds);
  }
  for (const p of db.projects) {
    if (p.relatedWorkId) checkRef('project', p.id, 'relatedWorkId', p.relatedWorkId);
    checkRefs('project', p.id, 'decisionIds', p.decisionIds);
    checkRefs('project', p.id, 'failureIds', p.failureIds);
    checkRefs('project', p.id, 'skillIds', p.skillIds);
    checkRefs('project', p.id, 'noteIds', p.noteIds);
    checkRefs('project', p.id, 'experimentIds', p.experimentIds);
  }
  for (const d of db.decisions) {
    checkRefs('decision', d.id, 'projectIds', d.projectIds);
    checkRefs('decision', d.id, 'workIds', d.workIds);
    checkRefs('decision', d.id, 'skillIds', d.skillIds);
  }
  for (const f of db.failures) {
    checkRefs('failure', f.id, 'projectIds', f.projectIds);
    checkRefs('failure', f.id, 'workIds', f.workIds);
    checkRefs('failure', f.id, 'decisionIds', f.decisionIds);
  }
  for (const e of db.experiments) {
    if (e.relatedProjectId) checkRef('experiment', e.id, 'relatedProjectId', e.relatedProjectId);
    if (e.relatedDecisionId) checkRef('experiment', e.id, 'relatedDecisionId', e.relatedDecisionId);
    if (e.relatedNoteId) checkRef('experiment', e.id, 'relatedNoteId', e.relatedNoteId);
  }
  for (const n of db.notes) {
    checkRefs('note', n.id, 'projectIds', n.projectIds);
    checkRefs('note', n.id, 'experimentIds', n.experimentIds);
    checkRefs('note', n.id, 'beliefIds', n.beliefIds);
  }
  for (const b of db.beliefs) {
    for (const ev of b.evidence) checkRef('belief', b.id, 'evidence', ev);
    if (b.supersedesId) checkRef('belief', b.id, 'supersedesId', b.supersedesId);
    if (b.supersededById) checkRef('belief', b.id, 'supersededById', b.supersededById);
    if ((b.supersededById && !b.changeReason) || (b.supersedesId && !b.changeReason)) {
      errors.push(err('belief', b.id, 'changeReason', 'supersede chain without a reason hides why the mind changed'));
    }
    checkRefs('belief', b.id, 'relatedExperimentIds', b.relatedExperimentIds);
    checkRefs('belief', b.id, 'relatedProjectIds', b.relatedProjectIds);
    checkRefs('belief', b.id, 'relatedNoteIds', b.relatedNoteIds);
  }
  for (const s of db.skills) {
    checkRefs('skill', s.id, 'evidence.workIds', s.evidence.workIds);
    checkRefs('skill', s.id, 'evidence.projectIds', s.evidence.projectIds);
    checkRefs('skill', s.id, 'evidence.decisionIds', s.evidence.decisionIds);
    checkRefs('skill', s.id, 'evidence.noteIds', s.evidence.noteIds);
    checkRefs('skill', s.id, 'evidence.experimentIds', s.evidence.experimentIds);
  }
  for (const i of db.interests) {
    checkRefs('interest', i.id, 'relatedSkillIds', i.relatedSkillIds);
    checkRefs('interest', i.id, 'relatedProjectIds', i.relatedProjectIds);
  }
  for (const a of db.achievements) {
    checkRefs('achievement', a.id, 'relatedIds', a.relatedIds);
  }

  // Decisions claiming experiment origin must be claimed back by an experiment.
  const claimedByExperiment = new Set<string>();
  for (const e of db.experiments) {
    if (e.relatedDecisionId) claimedByExperiment.add(e.relatedDecisionId);
  }
  for (const d of db.decisions) {
    if (d.source === 'experiment' && !claimedByExperiment.has(d.id)) {
      errors.push(err('decision', d.id, 'source', 'source=experiment but no experiment links back via relatedDecisionId'));
    }
  }

  // ── Pass 3: orphan detection ────────────────────────────────────────────
  const referenced = new Set<string>();
  const collect = (refs: string[]): void => {
    for (const r of refs) referenced.add(r);
  };
  for (const p of db.projects) {
    collect(p.noteIds);
    collect(p.experimentIds);
  }
  for (const n of db.notes) {
    collect(n.experimentIds);
    collect(n.beliefIds);
  }
  for (const b of db.beliefs) {
    collect(b.evidence);
    collect(b.relatedExperimentIds);
    collect(b.relatedProjectIds);
    collect(b.relatedNoteIds);
  }
  for (const e of db.experiments) {
    if (!referenced.has(e.id) && !e.relatedProjectId && !e.relatedDecisionId) {
      errors.push(err('experiment', e.id, 'orphan', 'orphaned experiment: unreferenced and unattached'));
    }
    if (e.relatedNoteId) referenced.add(e.relatedNoteId);
  }
  for (const n of db.notes) {
    if (!referenced.has(n.id) && n.projectIds.length === 0 && n.experimentIds.length === 0) {
      errors.push(err('note', n.id, 'orphan', 'orphaned note: unreferenced and unattached'));
    }
  }

  return errors;
}

/**
 * F1 presentation contract.
 * - verified: safe to present as factual. No badge.
 * - asserted: showable, but the UI must never dress it as independently
 *   verified. Renders with an ASSERTED badge.
 * - needs_check: candidate evidence awaiting verification. Excluded from
 *   default result sets into a named list; re-admitted only via
 *   WITH UNVERIFIED, rendered with an UNVERIFIED badge.
 *   Silent presentation as fact is a bug.
 */
export function isPresentable(v: VerificationState): boolean {
  return v === 'verified' || v === 'asserted';
}

export type BadgeKind = 'asserted' | 'unverified';

/** Badge a row must render, or null for settled (verified) fact. */
export function badgeFor(v: VerificationState): BadgeKind | null {
  if (v === 'needs_check') return 'unverified';
  if (v === 'asserted') return 'asserted';
  return null;
}

/** Throw on first validation failure. Loud by design. */
export function assertValidDataset(db: CareerDB): void {
  const errors = validateDataset(db);
  if (errors.length > 0) {
    const lines = errors.map((e) => `  [${e.entity}:${e.id}] ${e.field}: ${e.message}`);
    throw new Error(`Dataset invalid (${errors.length} errors):\n${lines.join('\n')}`);
  }
}
