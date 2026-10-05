// lib/narrative (F6): recruiter-facing proof helpers. Pure, unit-tested.
// Reads the frozen dataset; changes no engine semantics. Every string shown
// comes verbatim from a dataset record; nothing is composed here.
import type { CareerDB, Decision, Project } from '../db/schema';
import { badgeFor, isPresentable, type BadgeKind } from '../db/validate';

export const FLAGSHIP_IDS = ['proj-contextd', 'proj-shard'] as const;

/**
 * Contextd release history, verified against the public GitHub releases page
 * (https://github.com/sandy-sachin7/contextd/releases) on 2026-10-05.
 * Exactly 10 releases: six shipped 2026-01-15 (v1.0.0 through v3.0.1),
 * then steady hardening to v3.1.3 on 2026-07-02.
 */
export const CONTEXTD_RELEASES: ReadonlyArray<{ version: string; date: string }> = [
  { version: 'v1.0.0', date: '2026-01-15' },
  { version: 'v1.1.0', date: '2026-01-15' },
  { version: 'v2.0.0', date: '2026-01-15' },
  { version: 'v3.0.0', date: '2026-01-15' },
  { version: 'v3.0.1', date: '2026-01-15' },
  { version: 'v3.0.3', date: '2026-01-15' },
  { version: 'v3.1.0', date: '2026-05-29' },
  { version: 'v3.0.2', date: '2026-06-28' },
  { version: 'v3.1.1', date: '2026-06-28' },
  { version: 'v3.1.3', date: '2026-07-02' },
]; // Chronological. v3.0.2 backports the v3.0.3 security fix to the 3.0 line.

/**
 * Display milestones distilled from CONTEXTD_RELEASES. Notes use only
 * verified release-note facts (read from the public releases page):
 * v1.0.0 is the earliest listed release; v3.0.3 is the RUSTSEC-2026-0002 +
 * FTS5-sanitization hardening; v3.1.3 is the latest daemon-stdin/health
 * fix. No milestone descriptors beyond what the notes support.
 */
export const RELEASE_MILESTONES: ReadonlyArray<{ version: string; date: string; note: string }> = [
  { version: 'v1.0.0', date: '2026-01-15', note: 'earliest release' },
  { version: 'v3.0.3', date: '2026-01-15', note: 'security hardening' },
  { version: 'v3.1.3', date: '2026-07-02', note: 'latest daemon fixes' },
];

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

export interface ProofItem {
  label: string;
  /** Concrete value: release range, mechanism, or integration. Phrased from the linked decision. */
  value: string;
  /** Verified URL the value resolves to (repo or releases page). Never fabricated. */
  url: string;
  /** Dataset decision this value is phrased from. Always presentable. */
  decisionId?: string;
}

/** Parse "vA.B.C through vX.Y.Z" release bounds out of verified provenance text. Loud on mismatch. */
function releaseBounds(detail: string): [string, string] {
  const m = /v(\d+\.\d+\.\d+) through v(\d+\.\d+\.\d+)/.exec(detail);
  if (!m) throw new Error('proof strip: verified release range missing from provenance detail');
  return [`v${m[1]}`, `v${m[2]}`];
}

export function proofStrip(database: CareerDB, projectId: string): ProofItem[] {
  const project = database.projects.find((p) => p.id === projectId);
  if (!project) throw new Error(`unknown flagship project: ${projectId}`);
  const repoUrl = project.links.repo;
  if (!repoUrl) throw new Error(`flagship ${projectId} has no repo link`);
  const fromDecision = (decisionId: string, label: string, value: string): ProofItem => {
    const d = database.decisions.find((x) => x.id === decisionId);
    if (!d) throw new Error(`proof strip: unknown decision ${decisionId}`);
    if (!isPresentable(d.verification)) throw new Error(`proof strip: ${decisionId} is not presentable`);
    return { label, value, url: repoUrl, decisionId };
  };
  if (projectId === 'proj-contextd') {
    if (project.verification !== 'verified') throw new Error('proof strip: contextd release range needs verified provenance');
    const [from, to] = releaseBounds(project.provenance.detail);
    const first = CONTEXTD_RELEASES[0];
    const last = CONTEXTD_RELEASES[CONTEXTD_RELEASES.length - 1];
    if (from !== first.version || to !== last.version) {
      throw new Error('proof strip: provenance release range disagrees with verified CONTEXTD_RELEASES');
    }
    return [
      { label: 'releases', value: `${CONTEXTD_RELEASES.length} releases, ${from} through ${to}`, url: `${repoUrl}/releases` },
      fromDecision('dec-contextd-mcp', 'interface', 'MCP-native'),
      fromDecision('dec-contextd-local-first', 'design', 'local-first daemon'),
    ];
  }
  if (projectId === 'proj-shard') {
    return [
      fromDecision('dec-shard-content-address', 'integrity', 'BLAKE3 content addressing'),
      fromDecision('dec-shard-rabin', 'chunking', 'Rabin'),
      fromDecision('dec-shard-p2p', 'distribution', 'peer-to-peer'),
      { label: 'push benchmark', value: '10 GB in about 40s, author-reported', url: `${repoUrl}/tree/main/benchmarks` },
    ];
  }
  throw new Error(`no proof strip for ${projectId}`);
}
