import { describe, expect, it } from 'vitest';
import { type AST, type ParseError, nearestWord, parse } from '../../src/query/parser';

function ok(input: string): AST {
  const r = parse(input);
  if ('kind' in r && r.kind === 'parse-error') throw new Error(`expected AST: ${(r as ParseError).message}`);
  return r as AST;
}

function err(input: string): ParseError {
  const r = parse(input);
  if (!('kind' in r) || r.kind !== 'parse-error') throw new Error(`expected parse error for: ${input}`);
  return r;
}

describe('parser: happy paths', () => {
  it('parses SHOW with WHERE, ORDER BY DESC, LIMIT', () => {
    expect(ok('SHOW failures WHERE costDays > 14 ORDER BY costDays DESC LIMIT 5')).toEqual({
      kind: 'show',
      collection: 'failures',
      filter: { kind: 'cond', field: 'costDays', op: '>', value: 14 },
      orderBy: { field: 'costDays', dir: 'DESC' },
      limit: 5,
    });
  });

  it('parses AND/OR precedence (AND binds tighter)', () => {
    const ast = ok('SHOW experiments WHERE stage = "ADOPTED" OR stage = "TESTED" AND kept = true');
    expect(ast).toMatchObject({ kind: 'show' });
    const f = (ast as Extract<AST, { kind: 'show' }>).filter;
    expect(f?.kind).toBe('or');
  });

  it('parses parenthesized groups and WITH UNVERIFIED', () => {
    const ast = ok('SHOW notes WHERE (venue = "memo" OR venue = "writeup") WITH UNVERIFIED');
    expect(ast).toMatchObject({ kind: 'show', collection: 'notes', withUnverified: true });
  });

  it('parses SCHEMA, LOG, COMPARE, WITHOUT, EXCLUDE', () => {
    expect(ok('SCHEMA work')).toEqual({ kind: 'schema', collection: 'work' });
    expect(ok('LOG')).toEqual({ kind: 'log' });
    expect(ok('COMPARE proj-contextd vs proj-shard')).toEqual({
      kind: 'compare',
      leftId: 'proj-contextd',
      rightId: 'proj-shard',
    });
    expect(ok('WITHOUT python')).toEqual({ kind: 'without', key: 'python' });
    expect(ok('EXCLUDE rust')).toEqual({ kind: 'without', key: 'rust' });
  });
});

describe('parser: typed errors with tokens and suggestions', () => {
  it('rejects empty input with a starter hint', () => {
    const e = err('');
    expect(e.token).toBe('');
    expect(e.message).toMatch(/SHOW highlights/);
  });

  it('rejects unknown verbs with a suggestion', () => {
    const e = err('SHWO work');
    expect(e.token).toBe('SHWO');
    expect(e.suggestion).toBe('SHOW');
  });

  it('rejects unknown tables with a suggestion', () => {
    const e = err('SHOW project');
    expect(e.token).toBe('project');
    expect(e.suggestion).toBe('projects');
  });

  it('rejects unknown fields with the valid field list', () => {
    const e = err('SHOW failures WHERE vibes = 1');
    expect(e.token).toBe('vibes');
    expect(e.message).toMatch(/costDays/);
  });

  it('rejects bad operators and trailing garbage', () => {
    expect(err('SHOW work WHERE era == "PAST"').token).toBe('=');
    expect(err('SHOW work extra').token).toBe('extra');
  });

  it('rejects malformed COMPARE and WITHOUT', () => {
    expect(err('COMPARE proj-contextd').message).toMatch(/two ids/);
    expect(err('WITHOUT').token).toBe('');
  });

  it('rejects SCHEMA on the highlights view', () => {
    expect(err('SCHEMA highlights').message).toMatch(/saved view/);
  });
});

describe('parser: fuzz — 10 hostile inputs, all typed errors', () => {
  const hostile = [
    'SHOW',
    'WHERE stage = 1',
    'SHOW experiments WHERE',
    'SHOW experiments WHERE stage =',
    'SHOW experiments WHERE stage = "UNCLOSED',
    'SHOW failures WHERE costDays > 14 LIMIT banana',
    'COMPARE vs vs vs',
    'WITHOUT "quoted key"',
    'SHOW notes WHERE (((venue = "x")',
    'DROP TABLE work; SHOW work',
  ];
  it.each(hostile)('`%s` returns a typed error naming a token', (input) => {
    const e = err(input);
    expect(e.kind).toBe('parse-error');
    expect(typeof e.pos).toBe('number');
    expect(e.message.length).toBeGreaterThan(0);
  });
});

describe('nearestWord', () => {
  it('suggests close matches, stays silent on noise', () => {
    expect(nearestWord('SHWO', ['SHOW', 'LOG'])).toBe('SHOW');
    expect(nearestWord('zzzzzzzz', ['SHOW', 'LOG'])).toBeUndefined();
  });
});
