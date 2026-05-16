#!/usr/bin/env node
/**
 * mathexpr MCP server. Two tools: `eval`, `simplify`.
 *
 * Evaluate or simplify mathematical expressions via `mathjs`. Supports
 * arithmetic, functions (sin/cos/log/sqrt/etc.), constants (pi, e), units
 * (`3 inch to cm`), and symbolic manipulation.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { evaluate, simplify, format as mathFormat } from 'mathjs';

const VERSION = '0.1.0';

export function evalExpr(expression: string, scope?: Record<string, unknown>): unknown {
  // mathjs evaluate handles units, complex numbers, vectors, etc.
  const r = evaluate(expression, (scope ?? {}) as Record<string, unknown>);
  // Many mathjs return types (BigNumber, Complex, Unit, Matrix) aren't directly
  // JSON-serializable. Use mathjs format to stringify them.
  return typeof r === 'number' || typeof r === 'string' || typeof r === 'boolean' || r === null
    ? r
    : mathFormat(r as unknown as object, { precision: 14 });
}

export function simplifyExpr(expression: string): string {
  return simplify(expression).toString();
}

const server = new Server({ name: 'mathexpr', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'eval',
    description:
      'Evaluate a math expression. Supports arithmetic, sin/cos/log/sqrt, pi/e, units (3 inch to cm), and an optional variable scope.',
    inputSchema: {
      type: 'object',
      properties: {
        expression: { type: 'string' },
        scope: { type: 'object', description: 'Optional variable bindings.' },
      },
      required: ['expression'],
    },
  },
  {
    name: 'simplify',
    description: 'Algebraically simplify a symbolic expression. Returns a string.',
    inputSchema: {
      type: 'object',
      properties: { expression: { type: 'string' } },
      required: ['expression'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name === 'eval') {
      const a = args as unknown as { expression: string; scope?: Record<string, unknown> };
      return jsonResult({ result: evalExpr(a.expression, a.scope) });
    }
    if (name === 'simplify') {
      const a = args as unknown as { expression: string };
      return jsonResult({ result: simplifyExpr(a.expression) });
    }
    return errorResult('unknown tool: ' + name);
  } catch (err) {
    return errorResult('mathexpr failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`mathexpr MCP server v${VERSION} ready on stdio\n`);
}
