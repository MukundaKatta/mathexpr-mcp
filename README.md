# mathexpr-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/mathexpr-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/mathexpr-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: evaluate and symbolically simplify mathematical expressions.
Backed by `mathjs`.

## Tools

### `eval`

```json
{ "expression": "3 inch to cm" }
```

→ `{ "result": "7.62 cm" }`

```json
{ "expression": "x^2 + 2*x + 1", "scope": { "x": 4 } }
```

→ `{ "result": 25 }`

Supports arithmetic, functions (`sin`/`cos`/`log`/`sqrt`/...), constants
(`pi`, `e`), units, and a caller-supplied variable `scope`.

### `simplify`

```json
{ "expression": "2*x + x + 1" }
```

→ `{ "result": "3 * x + 1" }`

## Configure

```json
{ "mcpServers": { "mathexpr": { "command": "npx", "args": ["-y", "@mukundakatta/mathexpr-mcp"] } } }
```

## License

MIT.
