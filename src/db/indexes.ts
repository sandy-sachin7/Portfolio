// CAREER.DB indexes — F0: simple lookup maps only. No database cosplay.
// Rebuilt by buildIndexes(db). All maps are read-only snapshots.

import type { CareerDB, CollectionName } from './schema';

export interface DBIndexes {
  /** Every record with an id, keyed by id. */
  byId: Map<string, { collection: CollectionName; record: unknown }>;
  /** Records with a start date, keyed by year (YYYY). */
  byYear: Map<string, string[]>;
  /** Skill id -> skill record. */
  bySkill: Map<string, string>;
  /** Project id -> project record. */
  byProject: Map<string, string>;
  /** Work id -> work record. */
  byWork: Map<string, string>;
  /** Experiment stage -> experiment ids. */
  byStage: Map<string, string[]>;
  /** Project status -> project ids. */
  byStatus: Map<string, string[]>;
  /** Lowercased topic/tag -> note ids + project ids. */
  byTopic: Map<string, string[]>;
}

const ID_COLLECTIONS: CollectionName[] = [
  'work',
  'projects',
  'decisions',
  'failures',
  'experiments',
  'notes',
  'beliefs',
  'skills',
  'interests',
  'achievements',
  'education',
];

function yearOf(start?: string): string | null {
  if (!start) return null;
  const m = /^(\d{4})/.exec(start);
  return m ? m[1] : null;
}

function push(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key);
  if (list) list.push(id);
  else map.set(key, [id]);
}

export function buildIndexes(db: CareerDB): DBIndexes {
  const byId = new Map<string, { collection: CollectionName; record: unknown }>();
  const byYear = new Map<string, string[]>();
  const bySkill = new Map<string, string>();
  const byProject = new Map<string, string>();
  const byWork = new Map<string, string>();
  const byStage = new Map<string, string[]>();
  const byStatus = new Map<string, string[]>();
  const byTopic = new Map<string, string[]>();

  for (const name of ID_COLLECTIONS) {
    const records = db[name] as Array<{ id: string; start?: string }>;
    for (const record of records) {
      byId.set(record.id, { collection: name, record });
      const year = yearOf(record.start);
      if (year) push(byYear, year, record.id);
    }
  }

  for (const skill of db.skills) bySkill.set(skill.id, skill.id);
  for (const project of db.projects) {
    byProject.set(project.id, project.id);
    push(byStatus, project.status, project.id);
    for (const tag of project.stack) push(byTopic, tag.toLowerCase(), project.id);
  }
  for (const w of db.work) byWork.set(w.id, w.id);
  for (const experiment of db.experiments) push(byStage, experiment.stage, experiment.id);
  for (const note of db.notes) {
    for (const topic of note.topics) push(byTopic, topic.toLowerCase(), note.id);
  }

  return { byId, byYear, bySkill, byProject, byWork, byStage, byStatus, byTopic };
}
