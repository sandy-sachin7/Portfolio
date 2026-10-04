// useQueryEngine — F2. The only bridge between components and the frozen engine.
// Components never import src/query or src/db directly (except id lookups).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [state, setState] = useState<QueryState>({
    input: bootQuery,
    result: null,
    plan: [],
    parseError: null,
    lastQuery: '',
  });
  const booted = useRef(false);

  const run = useCallback((text: string, includeUnverified = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { result, plan, parseError } = runQueryText(trimmed, includeUnverified);
    setState({ input: trimmed, result, plan, parseError, lastQuery: trimmed });
    window.history.pushState(null, '', encodeQueryUrl(trimmed));
  }, []);

  // Boot once: URL hash wins, else the starter query. Listens to back/forward.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const fromUrl = decodeQueryUrl(window.location.hash);
    run(fromUrl ?? bootQuery);
    const onHash = () => {
      const q = decodeQueryUrl(window.location.hash);
      if (q) run(q);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [bootQuery, run]);

  const api = useMemo(() => ({ state, run }), [state, run]);
  return api;
}
