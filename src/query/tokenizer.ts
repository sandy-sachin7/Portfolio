// CAREER.DB tokenizer — F1. Keywords case-insensitive, strings double-quoted.

export type TokenKind =
  | 'SHOW'
  | 'WHERE'
  | 'AND'
  | 'OR'
  | 'ORDER'
  | 'BY'
  | 'LIMIT'
  | 'SCHEMA'
  | 'LOG'
  | 'COMPARE'
  | 'VS'
  | 'WITHOUT'
  | 'EXCLUDE'
  | 'WITH'
  | 'UNVERIFIED'
  | 'ASC'
  | 'DESC'
  | 'IDENT'
  | 'STRING'
  | 'NUMBER'
  | 'OP'
  | 'LPAREN'
  | 'RPAREN'
  | 'EOF';

export interface Token {
  kind: TokenKind;
  /** Raw text as written (identifiers keep case for ids like proj-contextd). */
  text: string;
  /** Numeric value for NUMBER tokens. */
  num?: number;
  /** 0-based char offset in the input. */
  pos: number;
  /** Set on STRING tokens missing the closing quote. */
  unterminated?: boolean;
}

const KEYWORDS: Record<string, TokenKind> = {
  SHOW: 'SHOW',
  WHERE: 'WHERE',
  AND: 'AND',
  OR: 'OR',
  ORDER: 'ORDER',
  BY: 'BY',
  LIMIT: 'LIMIT',
  SCHEMA: 'SCHEMA',
  LOG: 'LOG',
  COMPARE: 'COMPARE',
  VS: 'VS',
  WITHOUT: 'WITHOUT',
  EXCLUDE: 'EXCLUDE',
  WITH: 'WITH',
  UNVERIFIED: 'UNVERIFIED',
  ASC: 'ASC',
  DESC: 'DESC',
};

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const push = (kind: TokenKind, text: string, pos: number, num?: number): void => {
    tokens.push(num === undefined ? { kind, text, pos } : { kind, text, pos, num });
  };

  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '(') {
      push('LPAREN', ch, i);
      i++;
      continue;
    }
    if (ch === ')') {
      push('RPAREN', ch, i);
      i++;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      let out = '';
      while (j < input.length && input[j] !== '"') {
        if (input[j] === '\\' && j + 1 < input.length) {
          out += input[j + 1];
          j += 2;
        } else {
          out += input[j];
          j++;
        }
      }
      // Unterminated string: emit what we have flagged; parser reports it.
      const terminated = j < input.length;
      const tok: Token = { kind: 'STRING', text: out, pos: i };
      if (!terminated) tok.unterminated = true;
      tokens.push(tok);
      i = terminated ? j + 1 : j;
      continue;
    }
    const op2 = input.slice(i, i + 2);
    if (op2 === '>=' || op2 === '<=' || op2 === '!=') {
      push('OP', op2, i);
      i += 2;
      continue;
    }
    if (ch === '=' || ch === '>' || ch === '<') {
      push('OP', ch, i);
      i++;
      continue;
    }
    const numMatch = /^[0-9]+(?:\.[0-9]+)?/.exec(input.slice(i));
    if (numMatch) {
      push('NUMBER', numMatch[0], i, Number(numMatch[0]));
      i += numMatch[0].length;
      continue;
    }
    const wordMatch = /^[A-Za-z_][A-Za-z0-9_\-./]*/.exec(input.slice(i));
    if (wordMatch) {
      const word = wordMatch[0];
      const upper = word.toUpperCase();
      push(KEYWORDS[upper] ?? 'IDENT', word, i);
      i += word.length;
      continue;
    }
    // Anything else (commas, stray punctuation): emit as IDENT so the
    // parser can fail loudly with an exact token instead of going silent.
    push('IDENT', ch, i);
    i++;
  }
  push('EOF', '', input.length);
  return tokens;
}
