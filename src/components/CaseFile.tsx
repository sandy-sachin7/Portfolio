// CaseFile (F2): READ view. Fixed schema per collection; lessons close, never invented.
import { getById, titleOf } from '../lib/rows';
import type { ResultRow } from '../query/executor';
import { Badge } from './Badge';

type R = Record<string, unknown>;
const s = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800">
      <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">{label}</h4>
      <div className="mt-2 text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">{children}</div>
    </section>
  );
}

function LinkedDecisions({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <Section label="Decisions">
      <ul className="space-y-4">
        {ids.map((id) => {
          const d = getById('decisions', id) as R | null;
          if (!d) return null;
          return (
            <li key={id}>
              <p className="font-medium">{s(d['title'])}</p>
              {s(d['context']) && <p className="mt-1 text-zinc-600 dark:text-zinc-400">{s(d['context'])}</p>}
              <dl className="mt-2 space-y-1 font-mono text-[13px]">
                <div><dt className="inline text-emerald-600 dark:text-emerald-400">+ chose: </dt><dd className="inline">{s(d['chosen'])}</dd></div>
                <div><dt className="inline text-red-600 dark:text-red-400">− rejected: </dt><dd className="inline">{s(d['rejected'])}</dd></div>
              </dl>
              {s(d['why']) && <p className="mt-1">{s(d['why'])}</p>}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function LinkedFailures({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <Section label="Attached failures">
      <ul className="space-y-3">
        {ids.map((id) => {
          const f = getById('failures', id) as R | null;
          if (!f) return null;
          return (
            <li key={id}>
              <p className="font-medium">{s(f['title'])}</p>
              {s(f['whatHappened']) && <p className="mt-1 text-zinc-600 dark:text-zinc-400">{s(f['whatHappened'])}</p>}
              {s(f['lesson']) && <p className="mt-1">Lesson: {s(f['lesson'])}</p>}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function ProjectFile({ row }: { row: ResultRow }) {
  const p = row.record as R;
  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
          {s(p['status'])} · {s(p['era'])}
          {p['flagship'] ? ' · flagship' : ''}
        </p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">{titleOf('projects', p)}</h3>
        <Badge badge={row.badge} />
      </div>
      {s(p['thesis']) && (
        <Section label="Thesis"><p>{s(p['thesis'])}</p></Section>
      )}
      <LinkedDecisions ids={arr(p['decisionIds'])} />
      <LinkedFailures ids={arr(p['failureIds'])} />
      {arr(p['stack']).length > 0 && (
        <Section label="Stack">
          <p className="font-mono text-[13px]">{arr(p['stack']).join(' · ')}</p>
        </Section>
      )}
    </div>
  );
}

function DefinitionFile({ row, fields }: { row: ResultRow; fields: Array<[string, string]> }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight">{titleOf(row.collection, row.record)}</h3>
        <Badge badge={row.badge} />
      </div>
      <Section label="Record">
        <dl className="space-y-2">
          {fields.map(([label, value]) =>
            value ? (
              <div key={label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">{label}</dt>
                <dd className="mt-0.5">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
      </Section>
    </div>
  );
}

export function CaseFile({ row }: { row: ResultRow }) {
  const r = row.record as R;
  const back = { ids: arr(r['decisionIds']), fails: arr(r['failureIds']) };

  if (row.collection === 'projects') return <ProjectFile row={row} />;
  if (row.collection === 'work')
    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-display text-2xl font-semibold tracking-tight">{titleOf('work', r)}</h3>
          <Badge badge={row.badge} />
        </div>
        {s(r['summary']) && <Section label="Summary"><p>{s(r['summary'])}</p></Section>}
        {arr(r['highlights']).length > 0 && (
          <Section label="Highlights">
            <ul className="list-disc space-y-1 pl-5">{arr(r['highlights']).map((h) => <li key={h}>{h}</li>)}</ul>
          </Section>
        )}
        <LinkedDecisions ids={back.ids} />
        <LinkedFailures ids={back.fails} />
      </div>
    );
  if (row.collection === 'decisions')
    return <DefinitionFile row={row} fields={[['Context', s(r['context'])], ['Chose', s(r['chosen'])], ['Rejected', s(r['rejected'])], ['Why', s(r['why'])]]} />;
  if (row.collection === 'failures')
    return <DefinitionFile row={row} fields={[['What happened', s(r['whatHappened'])], ['Cost', typeof r['costDays'] === 'number' ? `${r['costDays']} days` : ''], ['Lesson', s(r['lesson'])]]} />;
  if (row.collection === 'experiments')
    return <DefinitionFile row={row} fields={[['Technology', s(r['technology'])], ['Stage', s(r['stage'])], ['Why tried', s(r['whyITriedIt'])], ['Expectation', s(r['expectation'])], ['Observation', s(r['observation'])], ['Result', s(r['result'])], ['Lesson', s(r['lesson'])]]} />;
  if (row.collection === 'notes')
    return <DefinitionFile row={row} fields={[['Venue', `${s(r['venue'])} · ${s(r['status'])}`], ['Excerpt', s(r['excerpt'])], ['Topics', arr(r['topics']).join(' · ')]]} />;
  if (row.collection === 'beliefs')
    return <DefinitionFile row={row} fields={[['Statement', s(r['statement'])], ['Context', s(r['context'])], ['Strength', `${s(r['strength'])} · ${s(r['origin'])}`]]} />;
  return <DefinitionFile row={row} fields={Object.entries(r).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, v as string]).slice(0, 8)} />;
}
