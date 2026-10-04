// CAREER.DB parser — F1. Recursive descent over tokenizer output.
// Grammar:
//   query    := show | schema | log | compare | without
//   show     := SHOW collection [WHERE expr] [ORDER BY field [ASC|DESC]] [LIMIT n] [WITH UNVERIFIED]
//   expr     := or (OR or)* ; or := and (AND and)* ; and := '(' expr ')' | field op value
//   schema   := SCHEMA collection
//   log      := LOG
//   compare  := COMPARE id VS id
//   without  := (WITHOUT | EXCLUDE) ident
// Collections: work projects decisions failures experiments notes beliefs
// skills interests achievements education, plus virtual `highlights`.

import type { CollectionName } from '../db/schema';
import { type Token, tokenize } from './tokenizer';

export type FilterOp = '=' | '!=' | '>' | '>=' | '<' | '<=';

export type FilterNode =
  | { kind: 'and'; left: FilterNode; right: FilterNode }
  | { kind: 'or'; left: FilterNode; right: FilterNode }
  | { kind: 'cond'; field: string; op: FilterOp; value: string | number };

export type AST =
  | {
      kind: 'show';
      collection: CollectionName | 'highlights';
      filter?: FilterNode;
      orderBy?: { field: string; dir: 'ASC' | 'DESC' };
      limit?: number;
      withUnverified?: boolean;
    }
  | { kind: 'schema'; collection: CollectionName }
  | { kind: 'log' }
  | { kind: 'compare'; leftId: string; rightId: string }
  | { kind: 'without'; key: string };

export interface ParseError {
  kind: 'parse-error';
  /** Exact token text that failed ('' for unexpected end of input). */
  token: string;
  pos: number;
  message: string;
  /** Nearest valid alternative, when one exists. */
  suggestion?: string;
}

export function isParseError(value: unknown): value is ParseError {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { kind?: unknown }).kind === 'parse-error'
  );
}

export const COLLECTIONS: Array<CollectionName | 'highlights'> = [

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
  'highlights',
];

/** Filterable / sortable fields per collection. Unknown field = typed error. */
export const FIELDS: Record<string, string[]> = {
  work: ['id', 'org', 'role', 'era', 'current', 'start', 'verification'],
  projects: ['id', 'title', 'status', 'era', 'flagship', 'start', 'stack', 'verification'],
  decisions: ['id', 'title', 'source', 'verification'],
  failures: ['id', 'title', 'costDays', 'verification'],
  experiments: ['id', 'title', 'technology', 'category', 'stage', 'kept', 'date', 'verification'],
  notes: ['id', 'title', 'venue', 'status', 'topics', 'date', 'verification'],
  beliefs: ['id', 'statement', 'strength', 'origin', 'status', 'date', 'verification'],
  skills: ['id', 'name', 'category'],
  interests: ['id', 'label', 'direction', 'era'],
  achievements: ['id', 'title', 'date', 'verification'],
  education: ['id', 'school', 'program', 'start', 'verification'],
  highlights: ['id', 'title'],
};

/** Tiny edit distance for "did you mean" suggestions. */
export function nearestWord(input: string, options: string[]): string | undefined {
  const a = input.toLowerCase();
  let best: string | undefined;
  let bestDist = Infinity;
  for (const opt of options) {
    const b = opt.toLowerCase();
    const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i2 = 1; i2 <= a.length; i2++) {
      let prev = dp[0];
      dp[0] = i2;
      for (let j = 1; j <= b.length; j++) {
        const cur = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i2 - 1] === b[j - 1] ? 0 : 1));
        prev = cur;
      }
    }
    if (dp[b.length] < bestDist) {
      bestDist = dp[b.length];
      best = opt;
    }
  }
  if (best === undefined) return undefined;
  // Only suggest when plausibly close; otherwise the guess is noise.
  return bestDist <= Math.max(2, Math.floor(best.length / 2)) ? best : undefined;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  peek(): Token {
    return this.tokens[this.pos];
  }

  private next(): Token {
    const t = this.tokens[this.pos];
    this.pos++;
    return t;
  }

  private err(token: Token, message: string, suggestion?: string): ParseError {
    return { kind: 'parse-error', token: token.text, pos: token.pos, message, suggestion };
  }

  parseQuery(): AST | ParseError {
    const t = this.peek();
    switch (t.kind) {
      case 'SHOW':
        return this.parseShow();
      case 'SCHEMA':
        return this.parseSchema();
      case 'LOG':
        this.next();
        return this.expectEnd({ kind: 'log' });
      case 'COMPARE':
        return this.parseCompare();
      case 'WITHOUT':
      case 'EXCLUDE':
        return this.parseWithout();
      case 'EOF':
        return this.err(t, 'empty query. try: SHOW highlights LIMIT 3');
      default:
        return this.err(
          t,
          `expected SHOW, SCHEMA, LOG, COMPARE, WITHOUT. got '${t.text}'.`,
          nearestWord(t.text, ['SHOW', 'SCHEMA', 'LOG', 'COMPARE', 'WITHOUT']),
        );
    }
  }

  private expectEnd<T>(node: T): T | ParseError {
    const t = this.peek();
    if (t.kind !== 'EOF') {
      return this.err(t, `unexpected '${t.text}'. query is complete before this token.`);
    }
    return node;
  }

  private parseCollection(t: Token): (CollectionName | 'highlights') | ParseError {
    const name = t.text.toLowerCase();
    const found = COLLECTIONS.find((c) => c === name);
    if (!found) {
      return this.err(
        t,
        `no table called '${t.text}'. tables: ${COLLECTIONS.join(', ')}.`,
        nearestWord(t.text, [...COLLECTIONS]),
      );
    }
    return found;
  }

  private parseShow(): AST | ParseError {
    this.next(); // SHOW
    const ct = this.next();
    if (ct.kind !== 'IDENT' && ct.kind !== 'SHOW') {
      return this.err(ct, `expected a table after SHOW. got '${ct.text}'.`);
    }
    const collection = this.parseCollection(ct);
    if (isParseError(collection)) return collection;
    const node: Extract<AST, { kind: 'show' }> = { kind: 'show', collection };

    if (this.peek().kind === 'WHERE') {
      this.next();
      const filter = this.parseOr();
      if ('kind' in filter && filter.kind === 'parse-error') return filter;
      node.filter = filter as FilterNode;
    }
    if (this.peek().kind === 'ORDER') {
      this.next();
      const by = this.next();
      if (by.kind !== 'BY') return this.err(by, `expected BY after ORDER. got '${by.text}'.`);
      const ft = this.next();
      if (ft.kind !== 'IDENT') return this.err(ft, `expected a field after ORDER BY. got '${ft.text}'.`);
      const fields = FIELDS[collection] ?? [];
      if (!fields.includes(ft.text)) {
        return this.err(
          ft,
          `no field '${ft.text}' on ${collection}. fields: ${fields.join(', ')}.`,
          nearestWord(ft.text, fields),
        );
      }
      node.orderBy = { field: ft.text, dir: 'ASC' };
      const maybeDir = this.peek();
      if (maybeDir.kind === 'ASC' || maybeDir.kind === 'DESC') {
        node.orderBy.dir = maybeDir.kind;
        this.next();
      }
    }
    if (this.peek().kind === 'LIMIT') {
      this.next();
      const nt = this.next();
      if (nt.kind !== 'NUMBER') return this.err(nt, `expected a number after LIMIT. got '${nt.text}'.`);
      node.limit = nt.num;
    }
    if (this.peek().kind === 'WITH') {
      this.next();
      const ut = this.next();
      if (ut.kind !== 'UNVERIFIED')
        return this.err(ut, `expected UNVERIFIED after WITH. got '${ut.text}'.`);
      node.withUnverified = true;
    }
    return this.expectEnd(node);
  }

  private parseOr(): FilterNode | ParseError {
    const left = this.parseAnd();
    if ('kind' in left && left.kind === 'parse-error') return left;
    let node = left as FilterNode;
    while (this.peek().kind === 'OR') {
      this.next();
      const right = this.parseAnd();
      if ('kind' in right && right.kind === 'parse-error') return right;
      node = { kind: 'or', left: node, right: right as FilterNode };
    }
    return node;
  }

  private parseAnd(): FilterNode | ParseError {
    const left = this.parsePrimary();
    if ('kind' in left && left.kind === 'parse-error') return left;
    let node = left as FilterNode;
    while (this.peek().kind === 'AND') {
      this.next();
      const right = this.parsePrimary();
      if ('kind' in right && right.kind === 'parse-error') return right;
      node = { kind: 'and', left: node, right: right as FilterNode };
    }
    return node;
  }

  private collectionForFilter(): string {
    // Set by parseShow before parsing the filter; defaults defensively.
    return this.filterCollection;
  }
  /** Collection context for field validation, preset by parse(). */
  filterCollection = 'work';

  private parsePrimary(): FilterNode | ParseError {
    const t = this.peek();
    if (t.kind === 'LPAREN') {
      this.next();
      const inner = this.parseOr();
      if ('kind' in inner && inner.kind === 'parse-error') return inner;
      const close = this.next();
      if (close.kind !== 'RPAREN')
        return this.err(close, `expected ')'. got '${close.text}'.`);
      return inner;
    }
    if (t.kind !== 'IDENT') {
      return this.err(t, `expected field op value. got '${t.text}'. try: stage = "ADOPTED".`);
    }
    const field = t.text;
    const fields = FIELDS[this.collectionForFilter()] ?? [];
    if (!fields.includes(field)) {
      return this.err(
        t,
        `no field '${field}'. fields here: ${fields.join(', ')}.`,
        nearestWord(field, fields),
      );
    }
    this.next();
    const op = this.next();
    if (op.kind !== 'OP' || !['=', '!=', '>', '>=', '<', '<='].includes(op.text)) {
      return this.err(op, `expected =, !=, >, >=, <, <= after '${field}'. got '${op.text}'.`);
    }
    const vt = this.next();
    if (vt.unterminated) {
      return this.err(vt, 'unterminated string. close the quote: stage = "ADOPTED".');
    }
    if (vt.kind !== 'STRING' && vt.kind !== 'NUMBER' && vt.kind !== 'IDENT') {
      return this.err(vt, `expected a value after '${op.text}'. got '${vt.text}'.`);
    }
    return {
      kind: 'cond',
      field,
      op: op.text as FilterOp,
      value: vt.kind === 'NUMBER' ? (vt.num as number) : vt.text,
    };
  }

  private parseSchema(): AST | ParseError {
    this.next(); // SCHEMA
    const ct = this.next();
    if (ct.kind !== 'IDENT') return this.err(ct, `expected a table after SCHEMA. got '${ct.text}'.`);
    const collection = this.parseCollection(ct);
    if (isParseError(collection)) return collection;
    if (collection === 'highlights')
      return this.err(ct, 'highlights is a saved view, not a table. try: SCHEMA projects.');
    return this.expectEnd({ kind: 'schema', collection });
  }

  private parseCompare(): AST | ParseError {
    this.next(); // COMPARE
    const left = this.next();
    const vs = this.next();
    const right = this.next();
    if (left.kind !== 'IDENT' || vs.kind !== 'VS' || right.kind !== 'IDENT') {
      return this.err(
        vs.kind === 'VS' ? left : vs,
        'COMPARE needs two ids: COMPARE proj-contextd vs proj-shard.',
      );
    }
    return this.expectEnd({ kind: 'compare', leftId: left.text, rightId: right.text });
  }

  private parseWithout(): AST | ParseError {
    this.next(); // WITHOUT | EXCLUDE
    const kt = this.next();
    if (kt.kind !== 'IDENT') {
      return this.err(kt, `WITHOUT needs a skill key. got '${kt.text}'. try: WITHOUT python.`);
    }
    return this.expectEnd({ kind: 'without', key: kt.text.toLowerCase() });
  }
}

export function parse(input: string): AST | ParseError {
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  // Field validation needs the collection before the WHERE clause is parsed.
  if (tokens[0]?.kind === 'SHOW' && tokens[1]) {
    const name = tokens[1].text.toLowerCase();
    if ((COLLECTIONS as string[]).includes(name)) parser.filterCollection = name;
  }
  return parser.parseQuery();
}
