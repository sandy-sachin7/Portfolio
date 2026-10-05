// lib/narrative (F6): recruiter-facing proof helpers. Pure, unit-tested.
// Reads the frozen dataset; changes no engine semantics. Every string shown
// comes verbatim from a dataset record; nothing is composed here.
import type { CareerDB, Decision, Project } from '../db/schema';
import { badgeFor, isPresentable, type BadgeKind } from '../db/validate';

export const FLAGSHIP_IDS = ['proj-contextd', 'proj-shard'] as const;

export interface FlagshipProof {
  project: Project;
  /** First presentable decision in project order. Never a needs_check record. */
  decision: Decision;
  repoUrl: string;
  badge: BadgeKind | null;
}

export function flagshipProof(database: CareerDB, projectId: string): FlagshipProof {
  const project = database.projects.find((p) => p.id === projectId);
  if (!project) throw new Error(`unknown flagship project: ${projectId}`);
  const decision = project.decisionIds
    .map((id) => database.decisions.find((d) => d.id === id))
    .find((d): d is Decision => !!d && isPresentable(d.verification));
  if (!decision) throw new Error(`flagship ${projectId} has no presentable decision`);
  const repoUrl = project.links.repo;
  if (!repoUrl) throw new Error(`flagship ${projectId} has no repo link`);
  return { project, decision, repoUrl, badge: badgeFor(project.verification) };
}
