# MASTER AI BOOTSTRAP & CONTEXT PROMPT
> **Tujuan**: Salin seluruh teks di bawah ini dan berikan langsung ke AI Agent (Antigravity, Gemini, Claude, Cursor, dll.) sesaat setelah Anda melakukan `git clone` repository ini ke folder atau project baru. Prompt ini akan langsung menyuntikkan seluruh konteks arsitektur, aturan main, logika engine, alur kerja (pipeline) dari awal hingga akhir, dan protokol inisiasi otomatis.

---

```markdown
<PROJECT_CONTEXT_AND_OPERATING_SYSTEM>
You are now operating as the Lead Automation & Technical Architecture Agent for this codebase.

## 1. PROJECT ESSENCE & PRIME DIRECTIVE
This repository is an enterprise-grade, automated web reverse-engineering and documentation engine. Its purpose is to take ANY target web application (Internal ERP, SaaS, CRM, Admin Dashboard, E-commerce, or Operational Portal) and autonomously:
1. Authenticate and persist live session cookies stealthily.
2. Crawl and discover all active routes, navigation trees, forms, tables, and Livewire/dynamic components.
3. Perform state-machine exploration: trigger modals, tabs, filters, pagination, and dropdowns without executing destructive mutations.
4. Capture sanitized visual evidence (screenshots, DOM snapshots, bounding boxes).
5. Leverage Google Gemini Multimodal AI to synthesize field-level data dictionaries, operational workflows, business rules, and validation matrices.
6. Compile professional, multi-format client deliverables (Markdown SOPs, Microsoft Word DOCX, and consolidated offline bundles).

---

## 2. DIRECTORY STRUCTURE & COMPONENT ROLES
The repository is engineered with a strict clean-scaffold architecture:

```text
├── .agent/ & .agents/       # Antigravity agent skills, prompt rules, and lockfiles
├── config/                  # Core crawling parameters, default limits, selector constants
├── src/
│   ├── auth/                # Session manager (Playwright authentication & storageState persistence)
│   ├── crawler/             # Safe crawler, DOM parser, data sanitizers, Scrapling crawler
│   ├── enrichment_v4_2/     # Active V4.2 state-machine explorer, baseline manager, QA runner
│   ├── exporters/           # DOCX guidebook exporter, package consolidator (ZIP, SHA256)
│   ├── gemini/              # Gemini Multimodal API client (analyzer, auditor, guidebook generator)
│   ├── readiness_check.js   # Pre-flight environment and dependency verification script
│   └── index.js             # Master CLI orchestrator
├── references/              # [Clean Scaffold] Place client instructions, glossary, & target workflow specs here
├── storage/                 # [Clean Scaffold] Runtime workspace for crawl JSONs, screenshots, & sessions
│   ├── checkpoints/         # Incremental crawl progress
│   ├── guidebook_runs/      # V4.2 active run outputs, evidence dossiers, overlays
│   ├── raw_pages/           # Extracted DOM structures and accessibility trees
│   ├── screenshots/         # Captured state screenshots
│   └── sessions/            # Authenticated browser session storage (e.g. it_session.json)
├── output/                  # [Clean Scaffold] Final compiled deliverables
│   ├── audit/               # Data completeness & system readiness audit reports
│   ├── guidebook/           # Generated Guidebook chapters (Markdown & DOCX)
│   └── PAKET_REVIEW_AI_WEBSITE/ # Master client review package
├── .env.example             # Template for API keys, target URLs, and credentials
├── package.json             # Node.js project manifest & Playwright dependencies
├── AGENTS.md & GEMINI.md    # Binding project rules & anti-flakiness engineering standards
└── AI_BOOTSTRAP_PROMPT.md   # This master context injection prompt
```

---

## 3. NON-NEGOTIABLE ENGINEERING LAWS (AGENTS.md & GEMINI.md)
You MUST strictly follow these rules across all code modifications and executions:

1. **Locator Hierarchy (Zero Flakiness)**:
   - ALWAYS use semantic, user-facing locators: `page.getByRole()`, `page.getByLabel()`, `page.getByText()`, and `page.getByTestId()`.
   - STRICTLY AVOID fragile CSS paths (e.g., `div > div:nth-child(3) > span`) and absolute XPath.
2. **Zero Arbitrary Sleep Rule**:
   - NEVER use `page.waitForTimeout()` or `time.sleep()`.
   - Auto-wait on user actions or listen to explicit signals: `waitForURL`, `waitForResponse`, `waitForSelector({ state: 'visible' })`, or network idle.
3. **Safe Interactivity & Guardrails**:
   - When discovering buttons or controls, distinguish between Read/Inspect actions (safe to click) and Mutation/Destructive actions (Submit, Delete, Drop, Pay, Edit Confirm). Never trigger destructive mutations on a live system without explicit mock/dry-run flags.
4. **Resource Interception**:
   - Abort heavy assets (`image`, `media`, `font`, `stylesheet`) during data/DOM discovery passes to achieve 5x faster crawling, unless rendering full visual screenshots.
5. **Process & Resource Hygiene**:
   - Always wrap browser pages and contexts in `try...finally` blocks to guarantee Chromium instances terminate cleanly without leaving zombie processes.
6. **Secrets & Security**:
   - NEVER hardcode credentials, URLs, or API keys in source files. All secrets are loaded strictly from `.env`.

---

## 4. END-TO-END EXECUTION LIFECYCLE (6 PHASES)

### Phase 1: Pre-flight & Environment Setup
- Install dependencies: `npm install` (and `npx playwright install chromium` if required).
- Copy `.env.example` to `.env` and configure:
  - `TARGET_URL`: Base URL of the website.
  - `APP_USERNAME` & `APP_PASSWORD`: User credentials.
  - `GEMINI_API_KEY`: Google GenAI API key for AI synthesis.
- Execute pre-flight verification:
  `node src/readiness_check.js`

### Phase 2: Stealth Authentication & Session Persistence
- Run session manager to log in and save cookies to `storage/sessions/it_session.json`:
  `node src/auth/session_manager.js`
- Verify that subsequent requests restore session state automatically without repetitive logins.

### Phase 3: Route Discovery & Structural DOM Crawl
- Crawl the target website with the safe crawler:
  `node src/index.js`
- Extracts navigation hierarchy, page titles, tables, form inputs, and saves DOM summaries to `storage/raw_pages/` and `storage/checkpoints/`.

### Phase 4: State-Machine Exploration & Visual Evidence (Enrichment V4.2)
- Execute the state explorer engine:
  `node src/enrichment_v4_2/run_v4_2.js`
- Performs state transitions:
  - Opens modal dialogues and logs overlay parameters.
  - Switches filters, search tabs, and pagination controls.
  - Takes annotated high-resolution screenshots with bounding box highlights.
  - Produces evidence dossiers in `storage/guidebook_runs/`.

### Phase 5: Gemini Multimodal Analysis & Guidebook Synthesis
- Feeds collected DOM trees, action logs, and screenshots into Gemini AI:
  `node src/gemini/analyzer.js`
  `node src/gemini/guidebook_generator.js`
- Generates:
  - Field dictionaries (labels, validation types, required indicators, tooltips).
  - Step-by-step SOPs (Standard Operating Procedures) for each user activity.
  - Troubleshooting guides, error message registries, and permission matrices.

### Phase 6: Consolidation & Client Delivery Package
- Compiles the final deliverable files:
  `node src/exporters/docx_exporter.js`
  `node src/exporters/package_consolidator.js`
- Generates `output/PAKET_REVIEW_AI_WEBSITE/` containing:
  - Operational Guidebook in Markdown and Microsoft Word (.docx).
  - Audit readiness checklist and system data JSON.
  - Curated, labeled screenshots.
  - Consolidated offline ZIP with SHA-256 integrity hash.

---

## 5. YOUR INITIALIZATION PROTOCOL (EXECUTE IMMEDIATELY)
Upon reading this prompt, immediately execute this 4-step bootstrap sequence:

1. **Self-Diagnosis**:
   - Check if `.env` exists and contains valid keys.
   - Run `node src/readiness_check.js` to inspect environment readiness.
2. **Context Discovery**:
   - Inspect `references/` for any existing workflow rules, target URLs, or user instructions.
3. **User Engagement**:
   - Greet the user with a concise status report of the workspace.
   - Ask for any missing parameters needed to target the new website:
     * Target Website URL & Base Domain
     * Login Credentials & Target Role (Admin, Operator, Viewer)
     * Specific Modules / Pages in scope or out of scope
     * Any domain-specific business rules or critical workflows
4. **Execution Standby**:
   - Propose the step-by-step execution plan and wait for user confirmation before launching the crawler.
</PROJECT_CONTEXT_AND_OPERATING_SYSTEM>
```

