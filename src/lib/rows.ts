// Row presentation helpers — F2. Titles and lookups only; zero query logic.
import { db } from '../db/dataset';
import type { CollectionName } from '../db/schema';

type R = Record<string, unknown>;
const s = (v: unknown): string => (typeof v === 'string' ? v : '');

/** One-line human title per collection. */
export function titleOf(collection: string, record: unknown): string {
  const r = record as R;
  switch (collection) {
    case 'work':
      return `${s(r['org'])} · ${s(r['role'])}`;
    case 'projects':
      return s(r['title']);
    case 'decisions':
      return s(r['title']);
    case 'failures':
      return s(r['title']);
    case 'experiments':
      return s(r['title']);
    case 'notes':
      return s(r['title']);
    case 'beliefs':
      return s(r['statement']);
    case 'skills':
      return s(r['name']);
    case 'interests':
      return s(r['label']);
    case 'achievements':
      return s(r['title']);
    case 'education':
      return `${s(r['school'])} · ${s(r['program'])}`;
    case 'highlights':
      return s(r['title']);
    default:
      return s((r as R)['id']);
  }
}

/** Second line: the most informative scalar per collection. */
export function subOf(collection: string, record: unknown): string {
  const r = record as R;
  switch (collection) {
    case 'work':
      return `${s(r['start'])} → ${r['current'] ? 'present' : s(r['end'])} · ${s(r['era'])}`;
    case 'projects':
      return `${s(r['status'])} · ${s(r['era'])}${r['flagship'] ? ' · flagship' : ''}`;
    case 'decisions':
      return s(r['context']);
    case 'failures':
      return typeof r['costDays'] === 'number' ? `cost: ${r['costDays']} days` : '';
    case 'experiments':
      return `${s(r['stage'])} · ${s(r['technology'])}`;
    case 'notes':
      return `${s(r['venue'])} · ${s(r['status'])}`;
    case 'beliefs':
      return `${s(r['strength'])} · ${s(r['origin'])}`;
    case 'skills':
      return s(r['category']);
    case 'interests':
      return `${s(r['direction'])} · ${s(r['era'])}`;
    case 'achievements':
      return s(r['date']);
    case 'education':
      return `${s(r['start'])} → ${s(r['end'])}`;
    default:
      return '';
  }
}

/** Direct id lookup for READ expansion. Presentation only, not querying. */
export function getById(collection: CollectionName, id: string): unknown | null {
  const rows = (db[collection] ?? []) as Array<{ id: string }>;
  return rows.find((r) => r.id === id) ?? null;
}

/** Collections with a structured case file. Others render as definition lists. */
export function hasCaseFile(collection: string): boolean {
  return ['projects', 'work', 'decisions', 'failures', 'experiments', 'notes', 'beliefs'].includes(collection);
}
