// useQueryEngine — F2. The only bridge between components and the frozen engine.
// Components never import src/query or src/db directly (except id lookups).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../db/dataset';
import { buildIndexes, type DBIndexes } from '../db/indexes';
import { parse, isParseError, type ParseError } from '../query/parser';
import { execute, type ExecResult } from '../query/executor';
import { explain } from '../query/explain';
import { encodeQueryUrl, decodeQueryUrl } from '../lib/nav';

export interface QueryState {
  input: string;
  result: ExecResult | null;
  plan: string[];
  parseError: ParseError | null;
  lastQuery: string;
}

let sharedIndexes: DBIndexes | null = null;
function getIndexes(): DBIndexes {
  if (!sharedIndexes) sharedIndexes = buildIndexes(db);
  return sharedIndexes;
}

export function runQueryText(text: string, includeUnverified: boolean): {
  result: ExecResult;
  plan: string[];
  parseError: ParseError | null;
} {
  const ast = parse(text);
  if (isParseError(ast)) {
    return { result: { ok: false, error: { message: ast.message, suggestion: ast.suggestion } }, plan: [], parseError: ast };
  }
  const result = execute(db, getIndexes(), ast, { query: text, includeUnverified });
  return { result, plan: result.ok ? explain(ast, result) : [], parseError: null };
}

export function useQueryEngine(bootQuery: string) {
  // Boot synchronously (lazy initializer) so first paint already contains
  // results. Booting in an effect would paint an empty surface, then grow it
  // once the effect fires — a layout shift (mobile CLS 0.225 in F5 gate).
  const [state, setState] = useState<QueryState>(() => {
    const fromUrl =
      typeof window !== 'undefined' ? decodeQueryUrl(window.location.hash) : null;
    const first = (fromUrl ?? bootQuery).trim();
    if (!first) {
      return { input: bootQuery, result: null, plan: [], parseError: null, lastQuery: '' };
    }
    const { result, plan, parseError } = runQueryText(first, false);
    return { input: first, result, plan, parseError, lastQuery: first };
  });

  const run = useCallback((text: string, includeUnverified = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { result, plan, parseError } = runQueryText(trimmed, includeUnverified);
    setState({ input: trimmed, result, plan, parseError, lastQuery: trimmed });
    window.history.pushState(null, '', encodeQueryUrl(trimmed));
  }, []);

  // Boot already happened in the state initializer above. This effect only
  // listens to back/forward navigation.
  useEffect(() => {
    const onHash = () => {
      const q = decodeQueryUrl(window.location.hash);
      if (q) run(q);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [run]);

  const api = useMemo(() => ({ state, run }), [state, run]);
  return api;
}
