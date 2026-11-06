---
name: codegraph
description: >-
  Use CodeGraph (by Colby McHenry) to navigate and analyze codebases via pre-indexed AST graphs.
  Use when exploring unfamiliar project structures, tracing call flows (callers/callees), evaluating
  the blast radius of changes before editing, or avoiding expensive recursive grep/read routines.
---

# CodeGraph (by Colby McHenry)

CodeGraph provides local-first Abstract Syntax Tree (AST) code intelligence backed by Tree-Sitter and SQLite (`.codegraph/codegraph.db`).

## Core Principles
1. **Never Waste Tokens on Blind Grep/Glob Loops**:
   Instead of recursing through directories with `grep` or reading multiple large files sequentially, query the CodeGraph knowledge graph.
2. **Pre-Edit Blast Radius Check**:
   Before modifying any shared function, class, or interface, verify callers and impact with CodeGraph to avoid regressions.
3. **Keep Index Synchronized**:
   If substantial file additions or deletes occur, run `npx @colbymchenry/codegraph sync` or `codegraph index`.

## Available MCP Tools & CLI Commands
- `codegraph_explore` / `npx @colbymchenry/codegraph explore <query>`:
  Primary exploration tool. Returns relevant symbols' source code and call paths in a single response.
- `codegraph_search` / `npx @colbymchenry/codegraph query <symbol>`:
  Searches for symbol definitions (functions, classes, interfaces, types) across the entire codebase.
- `codegraph_callers` / `npx @colbymchenry/codegraph callers <symbol>`:
  Finds all functions/methods that invoke a specific symbol.
- `codegraph_callees` / `npx @colbymchenry/codegraph callees <symbol>`:
  Finds all functions/methods called by a specific symbol.
- `codegraph_impact` / `npx @colbymchenry/codegraph impact <symbol>`:
  Calculates downstream blast radius of modifying a symbol.
- `codegraph_node` / `npx @colbymchenry/codegraph node <symbol>`:
  Fetches full source and caller/callee trails for a single node.

## Quick CLI Reference
```bash
# Check status and node/edge count
npx --yes @colbymchenry/codegraph status

# Sync changes after writing files
npx --yes @colbymchenry/codegraph sync

# Rebuild index from scratch
npx --yes @colbymchenry/codegraph index
```
