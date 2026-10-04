// CAREER.DB entity model — F0: Dataset + Content Architecture.
// Every entity: stable id, relationships as id refs, evidence/provenance.
// No UI, no query logic here. Pure types.

/** Career phase of a record. */
export type Era = 'PAST' | 'PRESENT' | 'DIRECTION';

/**
 * How much we trust a record. F1 engine contract:
 * - verified: safe to present as factual.
 * - asserted: subject stated it; showable, but never dressed as independently verified.
 * - needs_check: candidate evidence awaiting verification. MUST NOT participate in
 *   high-confidence claims by default — F1 default result sets exclude it, or badge
 *   it visibly with a path to include it. Silently presenting it as fact is a bug.
 */
export type VerificationState = 'verified' | 'asserted' | 'needs_check';

export interface Provenance {
  /** Where this record came from. */
  source: 'resume' | 'github' | 'user-brief' | 'codebase' | 'inferred';
  url?: string;
  detail?: string;
  checkedOn?: string;
}

/** YYYY-MM. End omitted = ongoing. */
export interface Dated {
  start: string;
  end?: string;
}

// ---------------------------------------------------------------- work ---

export interface Work {
  id: string;
  org: string;
  role: string;
  location?: string;
  start: string;
  end?: string;
  current: boolean;
  era: Era;
  /** One or two sentences. No metrics unless verified. */
  summary: string;
  highlights: string[];
  skillIds: string[];
  projectIds: string[];
  decisionIds: string[];
  failureIds: string[];
  provenance: Provenance;
  verification: VerificationState;
}

// ------------------------------------------------------------- projects ---

export type ProjectStatus = 'shipped' | 'ongoing' | 'archived' | 'exploring';

export interface Project {
  id: string;
  title: string;
  /** What was learned or proven, not what was built. */
  thesis: string;
  status: ProjectStatus;
  start?: string;
  end?: string;
  era: Era;
  stack: string[];
  links: { repo?: string; demo?: string };
  flagship: boolean;
  relatedWorkId?: string;
  decisionIds: string[];
  /** Every project must link at least one failure. */
  failureIds: string[];
  skillIds: string[];
  noteIds: string[];
  experimentIds: string[];
  provenance: Provenance;
  verification: VerificationState;
}

// ------------------------------------------------------------ decisions ---

export interface Decision {
  id: string;
  title: string;
  context: string;
  chosen: string;
  rejected: string;
  /** Why, in <= 40 words. */
  why: string;
  projectIds: string[];
  workIds: string[];
  skillIds: string[];
  /** Where the decision was earned. `build` = emerged during iterative construction (shipped releases are the evidence). */
  source?: 'experiment' | 'work' | 'research' | 'build';
  provenance: Provenance;
  verification: VerificationState;
}

// ------------------------------------------------------------ failures ---

export interface Failure {
  id: string;
  title: string;
  whatHappened: string;
  /** Rough felt cost in days. Estimated unless stated — see F0-REVIEW. */
  costDays: number;
  lesson: string;
  projectIds: string[];
  workIds: string[];
  decisionIds: string[];
  provenance: Provenance;
  verification: VerificationState;
}

// ---------------------------------------------------------- experiments ---

export type ExperimentStage =
  | 'CURIOUS'
  | 'PROTOTYPED'
  | 'TESTED'
  | 'ADOPTED'
  | 'ABANDONED'
  | 'ONGOING';

export interface Experiment {
  id: string;
  title: string;
  technology: string;
  category: string;
  date?: string;
  stage: ExperimentStage;
  whyITriedIt: string;
  expectation: string;
  observation: string;
  surprise?: string;
  result: string;
  kept: boolean;
  lesson: string;
  relatedProjectId?: string;
  relatedDecisionId?: string;
  relatedNoteId?: string;
  provenance: Provenance;
  verification: VerificationState;
}

// ---------------------------------------------------------------- notes ---

export type NoteStatus = 'published' | 'referenced' | 'idea';

export interface Note {
  id: string;
  title: string;
  venue: 'linkedin' | 'memo' | 'writeup' | 'thread';
  date?: string;
  url?: string;
  excerpt: string;
  topics: string[];
  /**
   * published = verifiable public artifact (url required).
   * referenced = subject-referenced topic with no confirmed URL; must not be
   *   presented as a published artifact.
   * idea = not yet written; must not appear in evidence results.
   */
  status: NoteStatus;
  projectIds: string[];
  experimentIds: string[];
  beliefIds: string[];
  provenance: Provenance;
  verification: VerificationState;
}

// --------------------------------------------------------------- beliefs ---

export type BeliefStrength = 'working' | 'strong' | 'held-loosely';
export type BeliefStatus = 'current' | 'evolved' | 'retired';

export interface Belief {
  id: string;
  statement: string;
  context: string;
  date?: string;
  strength: BeliefStrength;
  /**
   * stated = subject explicitly holds this (brief/conversation).
   * inferred = synthesized from records; confirm wording with subject.
   * Inferred beliefs must never be quoted as the subject's words.
   */
  origin: 'stated' | 'inferred';
  /** Belief evolution: supersededById + changeReason record a changed mind. */
  supersedesId?: string;
  supersededById?: string;
  changeReason?: string;
  /** Ids of experiments/projects/notes backing this. */
  evidence: string[];
  relatedExperimentIds: string[];
  relatedProjectIds: string[];
  relatedNoteIds: string[];
  status: BeliefStatus;
  provenance: Provenance;
  verification: VerificationState;
}

// ---------------------------------------------------------------- skills ---

export interface SkillEvidence {
  workIds: string[];
  projectIds: string[];
  decisionIds: string[];
  noteIds: string[];
  experimentIds: string[];
}

export interface Skill {
  /** Stable slug, e.g. 'python'. Doubles as the ablation key for WITHOUT. */
  id: string;
  name: string;
  category: string;
  /** A skill with no evidence must not exist. Enforced by validate.ts. */
  evidence: SkillEvidence;
}

// ------------------------------------------------------------- interests ---

export interface Interest {
  id: string;
  label: string;
  direction: 'toward' | 'away';
  era: Era;
  note: string;
  relatedSkillIds: string[];
  relatedProjectIds: string[];
}

// ---------------------------------------------------------- achievements ---

export interface Achievement {
  id: string;
  title: string;
  detail: string;
  date?: string;
  /** Ids of work/projects/research this attaches to. Must be non-empty. */
  relatedIds: string[];
  provenance: Provenance;
  verification: VerificationState;
}

// ------------------------------------------------------------ education ---

export interface Education {
  id: string;
  school: string;
  program: string;
  start: string;
  end?: string;
  note?: string;
  provenance: Provenance;
  verification: VerificationState;
}

// ------------------------------------------------------------ recruiter ---

export interface RecruiterProject {
  name: string;
  line: string;
  url?: string;
}

export interface RecruiterExperience {
  org: string;
  role: string;
  period: string;
}

export interface Recruiter {
  name: string;
  role: string;
  positioning: string;
  location: string;
  /** Per-field trust: stale fields (location/URLs) must be marked, never silently published. */
  fieldVerification: {
    location: VerificationState;
    github: VerificationState;
    linkedin: VerificationState;
    email: VerificationState;
  };
  proof: [string, string, string];
  projects: RecruiterProject[];
  experience: RecruiterExperience[];
  education: string;
  contact: { email: string; github: string; linkedin: string; resume: string };
}

// -------------------------------------------------------------- database ---

export interface CareerDB {
  work: Work[];
  projects: Project[];
  decisions: Decision[];
  failures: Failure[];
  experiments: Experiment[];
  notes: Note[];
  beliefs: Belief[];
  skills: Skill[];
  interests: Interest[];
  achievements: Achievement[];
  education: Education[];
  recruiter: Recruiter;
}

export type CollectionName =
  | 'work'
  | 'projects'
  | 'decisions'
  | 'failures'
  | 'experiments'
  | 'notes'
  | 'beliefs'
  | 'skills'
  | 'interests'
  | 'achievements'
  | 'education';
