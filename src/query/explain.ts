// CAREER.DB EXPLAIN — F1. Formats executor stats + AST into Postgres-style
// plan lines. Numbers snap; nothing here animates. Pure, no JSX.

import type { AST } from './parser';
import type { ExecResult } from './executor';

function describeAST(ast: AST): string[] {
  switch (ast.kind) {
    case 'show': {
      const parts = [`TABLE=${ast.collection}`];
      if (ast.filter) parts.push(`FILTER=${describeFilter(ast.filter)}`);
      else parts.push('FILTER=none');
      if (ast.orderBy) parts.push(`SORT=${ast.orderBy.field} ${ast.orderBy.dir}`);
      if (ast.limit !== undefined) parts.push(`LIMIT=${ast.limit}`);
      if (ast.withUnverified) parts.push('INCLUDE=unverified (badged)');
      return parts;
    }
    case 'schema':
      return [`DESCRIBE TABLE=${ast.collection}`];
    case 'log':
      return ['SOURCE=session query log'];
    case 'compare':
      return [`COMPARE left=${ast.leftId}`, `COMPARE right=${ast.rightId}`];
    case 'without':
      return [`ABLATE skill=${ast.key}`, 'MODE=evidence coverage (not capability)'];
  }
}

function describeFilter(node: import('./parser').FilterNode): string {
  if (node.kind === 'and') return `(${describeFilter(node.left)} AND ${describeFilter(node.right)})`;
  if (node.kind === 'or') return `(${describeFilter(node.left)} OR ${describeFilter(node.right)})`;
  const v = typeof node.value === 'string' ? `"${node.value}"` : String(node.value);
  return `${node.field} ${node.op} ${v}`;
}

/**
 * Render plan lines for a parsed query + its execution result.
 * Every line is either measured (ms, rows) or structural (AST, index).
 * Nothing is invented.
 */
export function explain(ast: AST, result: ExecResult): string[] {
  const lines = describeAST(ast);
  if (!result.ok) {
    lines.push(`ERROR=${result.error.message}`);
    if (result.error.suggestion) lines.push(`TRY=${result.error.suggestion}`);
    return lines;
  }
  const s = result.stats;
  lines.push(`PLAN=${s.index}`);
  lines.push(
    `scanned ${s.scanned} / returned ${s.returned} / excluded ${s.excluded} · ${s.ms.toFixed(2)}ms · ${s.cacheHit ? 'cache hit' : 'cache miss, now cached'}`,
  );
  if (result.kind === 'rows' && result.excluded.length > 0) {
    const reasons = result.excluded.map((e) => `${e.id} (${e.reason})`).join(', ');
    lines.push(`EXCLUDED=${reasons} · run WITH UNVERIFIED to include (badged)`);
  }
  if (result.kind === 'ablation') {
    lines.push(
      `COVERAGE projects ${result.coverage.before['projects']} > ${result.coverage.after['projects']} · decisions ${result.coverage.before['decisions']} > ${result.coverage.after['decisions']}`,
    );
    if (result.orphanedDecisions.length > 0) {
      lines.push(`ORPHANED=${result.orphanedDecisions.join(', ')} (lost all evidence)`);
    } else {
      lines.push('ORPHANED=none (all decisions keep support)');
    }
  }
  if (result.kind === 'compare') {
    lines.push(
      result.differingFields.length > 0
        ? `DIFFERS=${result.differingFields.join(', ')}`
        : 'DIFFERS=none (identical on compared fields)',
    );
  }
  return lines;
}
