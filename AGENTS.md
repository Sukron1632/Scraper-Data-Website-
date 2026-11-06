# AI Agent Operating Guidelines & Project Rules

This document establishes the binding guidelines, engineering standards, and execution protocols for all AI agents working within this workspace (`pricelist`).

---

## 1. Codebase Exploration & Navigation (CodeGraph Integration)
* **CodeGraph Knowledge Graph**: This repository has Colby McHenry's CodeGraph indexed in `.codegraph/`.
* **Prohibit Token-Wasting Loops**: Never run massive recursive `grep`, wild `glob`, or repetitive whole-file `read` loops to explore unfamiliar codebase architecture.
* **Structural Exploration Protocol**:
  1. Use `codegraph_explore` / `npx @colbymchenry/codegraph explore <task>` as the primary entry point.
  2. Use `codegraph_search` / `query` to locate symbol definitions.
  3. Use `codegraph_callers` and `codegraph_callees` to trace caller/callee paths.
  4. Always run `codegraph_impact` before modifying shared functions, classes, or interfaces to assess blast radius.
* **Syncing**: Run `npx @colbymchenry/codegraph sync` after generating or modifying files.

---

## 2. Web Crawling, Scrapling, & Playwright Rules
This project is an automated price intelligence and catalog extraction engine. Resilient crawling is mission-critical:
* **Locator Hierarchy (Zero Flakiness)**:
  - Prioritize user-facing, semantic locators: `page.getByRole()`, `page.getByLabel()`, `page.getByText()`, and `page.getByTestId()`.
  - Strictly avoid fragile CSS paths (e.g. `div > div:nth-child(3) > span`) and absolute XPath.
* **No Arbitrary Sleeping**:
  - Never use `page.waitForTimeout()` or `time.sleep()`.
  - Rely on built-in auto-waiting on actions, or explicit events (`waitForURL`, `waitForResponse`, `waitForSelector`).
* **Resource Optimization (5x Speedup)**:
  - When scraping product catalogs or price data, abort unnecessary resources (`image`, `media`, `font`, `stylesheet`) via route interception unless rendering screenshots is required.
* **Anti-Bot & Stealth Compliance**:
  - Use realistic viewport (`1920x1080`), user agents, and remove `navigator.webdriver` flags.
  - For Cloudflare or heavily protected sites, utilize the Scrapling stealth crawler (`python src/crawler/scrapling_mass_crawler.py --stealth`) with TLS fingerprint evasion.
* **Session Persistence**:
  - Save and load authentication/session cookies via `storageState` (`storage/auth_state.json`) rather than logging in on every invocation.
* **Resource Cleanup**:
  - Always clean up browser pages and contexts inside `try...finally` blocks to prevent zombie Chromium instances.

---

## 3. Tech Leads Club: Spec-Driven Development
Follow the Tech Leads Club (`tlc-spec-driven`) standard for any non-trivial features or refactors:
* **Phase 1: Specify**: Clarify requirements, inputs, outputs, edge cases, and acceptance criteria.
* **Phase 2: Design**: Document technical approach, schema changes, and architectural decisions (ADRs).
* **Phase 3: Tasks**: Break down execution into small, testable, atomic steps.
* **Phase 4: Execute & Verify**: Implement step-by-step, verify with tests/proofs, and maintain atomic commits.

---

## 4. Google Antigravity & GenAI Python SDK Rules
* **SDK Interfaces**:
  - Direct generative tasks: use `google-genai` (`from google import genai`).
  - Autonomous agent harnesses & orchestration: use `google-antigravity`.
* **Typed Structured Outputs**:
  - Always enforce Pydantic schemas (`BaseModel`) and `response_mime_type="application/json"` for data extraction and catalog normalization.
* **Async & Performance**:
  - Use `asyncio` for all network I/O-bound operations (crawling, API calls, file writes).
  - Handle rate limits (HTTP 429) using exponential backoff with jitter.
* **Security & Environment**:
  - All API keys, passwords, and tokens must be loaded from `.env`. Never commit secrets.

---

## 5. Google Labs Stitch UI Design Rules
* When creating or updating user interfaces, dashboards, or reports:
  - Adhere to the design system tokens defined in `DESIGN.md`.
  - Build modular, composable components following `stitch-build` and `react-components` patterns.
  - Ensure responsive, accessible (WCAG 2.2 compliant) layouts.

---

## 6. Installed Workspace Skills Quick Index
* **Code Intelligence**: `codegraph`
* **Crawling & Automation**: `advanced-crawler-playwright`, `playwright-skill`, `e2e-testing-patterns`
* **Engineering Process**: `tlc-spec-driven`, `antigravity-skills-manager`, `agent-orchestration-improve-agent`
* **Python & AI**: `google-antigravity-sdk`, `python-pro`, `async-python-patterns`, `python-performance-optimization`, `ai-engineer`, `prompt-engineer`
* **UI & Design**: `stitch-loop`, `design-md`, `enhance-prompt`, `react-components`, `code-to-design`

