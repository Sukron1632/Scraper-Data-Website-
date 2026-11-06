# CodeGraph Structural Navigation Rules

1. **Prioritize AST Queries Over Grep**:
   - Query symbols, callers, and callees with CodeGraph tools first before reading files.
2. **Blast Radius Analysis**:
   - Before performing refactoring or modifications on core modules, run `codegraph_impact` or `npx @colbymchenry/codegraph impact <symbol>` to identify dependent components.
3. **Keep Graph Current**:
   - Run `npx @colbymchenry/codegraph sync` after generating new modules or updating function signatures.

