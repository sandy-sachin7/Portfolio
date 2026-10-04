import { describe, expect, it } from 'vitest';
import { tokenize } from '../../src/query/tokenizer';

describe('tokenizer', () => {
  it('tokenizes a full SHOW query with keywords case-insensitively', () => {
    const kinds = tokenize('show failures where costDays > 14').map((t) => t.kind);
    expect(kinds).toEqual(['SHOW', 'IDENT', 'WHERE', 'IDENT', 'OP', 'NUMBER', 'EOF']);
  });

  it('reads quoted strings with escapes', () => {
    const toks = tokenize('stage = "ADOPTED"');
    expect(toks[2]).toMatchObject({ kind: 'STRING', text: 'ADOPTED' });
  });

  it('reads two-char operators', () => {
    expect(tokenize('a>=1')[1]).toMatchObject({ kind: 'OP', text: '>=' });
    expect(tokenize('a<=1')[1]).toMatchObject({ kind: 'OP', text: '<=' });
    expect(tokenize('a!=1')[1]).toMatchObject({ kind: 'OP', text: '!=' });
  });

  it('emits stray punctuation as IDENT so the parser fails loudly', () => {
    const toks = tokenize('SHOW work,');
    expect(toks.map((t) => t.kind)).toEqual(['SHOW', 'IDENT', 'IDENT', 'EOF']);
  });

  it('tracks character offsets', () => {
    const toks = tokenize('SHOW vibes');
    expect(toks[1]).toMatchObject({ text: 'vibes', pos: 5 });
  });
});
