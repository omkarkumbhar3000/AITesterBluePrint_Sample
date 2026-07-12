# AGENTS.md — AI Tester 3x (Consolidated)

Single-source-of-truth guidance for every sub-project in this repository. Consolidated from all `.md` files (CLAUDE.md, MEMORY.md, README.md, SKILL.md, B.L.A.S.T.md, objective/task/progress/findings/soph/prompt files, and per-chapter READMEs).

---

## Repository Structure

```
AI Tester 3x/
├── Chapter1_sample-playwright-framefork/    # Playwright Java UI tests (Maven, JUnit 5)
├── Chapter2_*RICE-POT*/                     # OpenCode skills + Salesforce API framework
│   ├── .opencode/skills/                    # test-plan-gen, test-case-gen, gen-api-framework
│   ├── salesforce-api-framework/            # REST Assured framework (Java 21, TestNG, Allure)
│   ├── PRD.txt                              # Source-of-truth for Restful Booker API planning
│   └── AGENTS.md                            # Restful Booker API quirks & skill triggers
├── Chapter3_BLAST Test cases Agent/         # BLAST protocol + React Vite mock test gen UI
│   ├── test-generator-app/                  # React 18 + Vite mock app
│   ├── B.L.A.S.T.md                         # Master system prompt (Blueprint→Link→Architect→Stylize→Trigger)
│   ├── docs/superpowers/specs/              # Design spec for test plan/case generator
│   └── SKILL.md                             # Test case generator skill definition
├── Chapter4_n8n_aiAgents/                   # Placeholder — n8n workflow integrations (planned)
├── Chapter5_langflow_aiAgents/
│   ├── Playwright Report Analyzer 2/        # React 18 + Vite 4 + Tailwind 3 Langflow app
│   └── Flakey test cases/                   # Sample flaky test JSON reports
├── Chapter6_social media content creation/  # Placeholder (empty)
├── Chapter7_RAG/
│   ├── Advance _RAG/                        # Advanced RAG: Flask + Qdrant + bge-m3 + Groq streaming
│   ├── RAG with Langflow/                   # Langflow-backed RAG Explorer (Flask + React)
│   ├── backend/                             # Basic RAG: Flask + ChromaDB + Nomic Embed + Groq Mixtral
│   └── frontend/                            # React 18 + Vite 4 frontend proxied to :8080
├── Chapter8_MCP/                            # Placeholder (empty)
├── Project_Job_Tracker_AI/                  # Resume .docx only
├── jira bugs creation/
│   ├── jira-ticket-buddy/                   # React 19 + Vite 8 app — GROQ + Jira REST API
│   ├── architecture/                        # Technical SOPs
│   ├── tools/                               # Python scripts (deterministic engines)
│   ├── .tmp/                                # Temporary workbench (gitignored)
│   ├── B.L.A.S.T.md                         # BLAST protocol (same as Ch3 copy)
│   ├── gemini.md                            # Project constitution — schemas, rules, invariants
│   ├── objective.md / task_plan.md / progress.md / findings.md / summary.md
│   └── .env                                 # Jira + GROQ creds (gitignored)
├── .claude/                                 # Claude Code settings & git permissions
├── memory/                                  # Gitignored — stores tokens (GROQ, GitHub, etc.)
├── AGENTS.md                                # This file
├── CLAUDE.md                                # Claude Code guidance (detailed commands & architecture)
├── MEMORY.md                                # Index of memory/ files
└── README.md                                # Top-level project overview
```

---

## Chapter 1: Playwright UI Automation Framework

**Location**: `Chapter1_sample-playwright-framefork/`
**Stack**: Java 11, Maven, Playwright, JUnit 5, Page Object Model

### Key Files
- `pom.xml` — Maven build config
- `CLAUDE.md` — Framework guidance for Claude Code
- `playwright-e2e.SKILL.md` — Comprehensive Playwright E2E skill (503 lines: POM patterns, fixtures, selectors, assertions, config, anti-patterns, debugging tips)

### Architecture
- `BasePage.java` — Abstract base class with common Playwright actions
- `LoginPage.java` — Concrete page object (getByLabel > getByRole > CSS/XPath)
- `LoginTest.java` — JUnit 5 test class, fresh browser context per test

### Locator Priority
`getByLabel()` > `getByRole()` > CSS/XPath

### Commands
```bash
cd Chapter1_sample-playwright-framefork
mvn clean compile
mvn test                                          # all tests
mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials
mvn test -Dsurefire.useFile=false                 # verbose
```

### Prerequisites
- Application under test running at `http://localhost:3000`

### Playwright E2E Skill Highlights (from `playwright-e2e.SKILL.md`)
- Page Object Model with BasePage abstraction
- Custom fixtures for auth state reuse
- Selector priority: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` > CSS/XPath
- Web-first auto-retrying assertions
- Anti-patterns: never use `waitForTimeout`, never share mutable state, always use `test.describe` blocks
- Debugging: `--headed`, `--ui`, `--debug`, `npx playwright codegen`, trace viewer

---

## Chapter 2: RICE-POT Framework + Test Generation Skills + Salesforce API

**Location**: `Chapter2_The-RICE-POT-Framework-and-Rest-assured-API-testing-framework-Test-Plan-Generator-with-Local-LLM/`
**Stack**: Java 21, Maven, REST Assured 5.5.1, TestNG 7.10.2, Allure 2.27.0, Jackson 2.17.2, Lombok, Log4j2, Apache POI, JavaFaker, AssertJ

### OpenCode Skills (`.opencode/skills/`)

| Skill | Trigger | Input → Output |
|---|---|---|
| test-plan-generator | `/test-plan-gen @PRD_file` | PRD → `testplanopencode.docx` |
| test-case-generator | `/test-case-gen @plan_or_prd` | plan/PRD → `testcasesopencode.xlsx` |
| gen-api-framework | `/gen-api-framework` | 3 modes: REST Assured (Java), Playwright (TS), Salesforce |

Global copies at `~/.config/opencode/skills/` exist separately.

### Workflow
1. `/test-plan-gen @PRD.txt` → `testplanopencode.docx`
2. `/test-case-gen @testplanopencode.docx` → `testcasesopencode.xlsx`
3. Execute manually in Postman
4. Automate via REST Assured (future)
5. Report bugs in JIRA (Frontend: Devesh, Backend: Sonal, DevOps: Prajeeth)

### Salesforce API Framework (`salesforce-api-framework/`)
**Architecture**:
- Client layer: `BaseApiClient`, `AuthClient`, `SObjectClient`, `QueryClient` (singleton factory)
- Models: Request/Response POJOs (Lombok `@Builder`)
- Utils: `DataGenerator`, `ExcelReader`, `JsonUtils`
- Validators: `ResponseValidator`, `SchemaValidator`
- Listeners: `AllureListener`, `ExtentReportListener`
- Configuration: Environment-aware properties (`dev/qa/uat/prod`)

**Project Structure**:
```
src/main/java/com/salesforce/api/
  client/     config/     constants/     factory/
  models/     utils/      validators/    listeners/
src/test/java/com/salesforce/api/
  base/       payloads/   tests/ (positive/negative/security/integration)
src/main/resources/
  app.properties   environments/   testng.xml   schemas/
```

**Commands**:
```bash
cd Chapter2_*/salesforce-api-framework
mvn clean test                                    # QA (default)
mvn clean test -Pdev / -Pqa / -Puat / -Pprod     # specific env
mvn clean test -Dgroups=positive / negative / security / integration
mvn allure:report
allure open target/site/allure-maven-plugin/index.html
```

**CI/CD**: `ci/Jenkinsfile` (Jenkins), `.github/workflows/api-tests.yml` (GitHub Actions)

### Restful Booker API Quirks (tested)
| Observation | Detail |
|---|---|
| `POST /booking` requires `Accept: application/json` | Returns 418 ("I'm a teapot") without it |
| `DELETE` returns 201 on success | Not 200 or 204 |
| `PUT`/`DELETE` auth | **Basic Auth** works; cookie (`token=...`) returns 403 |
| `PATCH` works; `PUT` can return 400 with no error body | Use PATCH as fallback |
| Auth payload | `{ username: "admin", password: "password123" }` |
| Basic Auth header | `Authorization: Basic base64("admin:password123")` |

### Key Files
- `PRD.txt` — Source-of-truth for scope, strategy, environments
- `Test cases - Ultimate _ TheTestingAcademy.xlsx` — Reference template (General CRUD column layout)
- `AGENTS.md` — Skill triggers, workflow, Restful Booker quirks

---

## Chapter 3: BLAST Test Case Agent

**Location**: `Chapter3_BLAST Test cases Agent/`
**Stack**: React 18, Vite 8, ESLint flat config, JavaScript (JSX)

### B.L.A.S.T. Protocol (from `B.L.A.S.T.md`)
**Identity**: System Pilot — deterministic, self-healing automation using the BLAST protocol and ANT 3-layer architecture.

**Phases**:
1. **Blueprint** — Discovery (5 questions: North Star, Integrations, Source of Truth, Delivery Payload, Behavioral Rules), define JSON Data Schema in `gemini.md`, research
2. **Link** — Verify all API connections and `.env` credentials, build minimal handshake scripts in `tools/`
3. **Architect** — 3-layer build:
   - Layer 1: Architecture (`architecture/`) — Technical SOPs in Markdown
   - Layer 2: Navigation — Reasoning/routing layer
   - Layer 3: Tools (`tools/`) — Deterministic Python scripts
4. **Stylize** — Payload refinement, UI/UX, feedback
5. **Trigger** — Cloud transfer, automation triggers, maintenance log

**Operating Principles**:
- Data-First Rule: define schema in `gemini.md` before coding
- Self-Annealing: Analyze → Patch → Test → Update Architecture on failures
- `gemini.md` is *law*; planning files are *memory*

### Test Generator App (`test-generator-app/`)
**Features**:
- Upload PRD documents (PDF, DOC, DOCX, TXT)
- Multiselect test types: Positive, Negative, Boundary Value, Equivalence Partitioning, Decision Table, State Transition
- GROQ API key management (localStorage persistence)
- Mock test plan/case generation (simulated delay, no LLM)
- Download generated artifacts as markdown

**Commands**:
```bash
cd Chapter3_BLAST*/test-generator-app
npm install && npm run dev            # :5173
npm run build
npm run lint                          # ESLint flat config
```

### Test Case Generator Skill (`SKILL.md`)
- ISTQB/ISO 29119-compliant test case generation
- Naming: `TC_[FEATURE]_[SCENARIO]_[NUMBER]`
- Columns: Test Case ID, Description, Preconditions, Steps, Data, Expected, Actual, Status, Priority, Type, Related Requirement
- Techniques: Equivalence Partitioning, BVA, Decision Tables, State Transition, Error Guessing

### Design Spec (`docs/superpowers/specs/2026-06-10-test-plan-test-case-generator-design.md`)
- Frontend: React app (file upload, multiselect, GROQ settings, generate/download)
- Backend: Node.js/Express (file upload, GROQ API integration, document extraction, file generation)
- GROQ config: `mixtral-8x7b-32768`, temperature 0.3, max 4000 tokens
- Input: PDF/Word (max 10MB); Output: PDF/Word/Excel

---

## Chapter 4: n8n AI Agents

**Location**: `Chapter4_n8n_aiAgents/`
**Status**: Placeholder — planned for n8n workflow integrations (automated test execution, AI-powered analysis, Jira triage, CI/CD triggers)

---

## Chapter 5: Langflow AI Agents — Playwright Report Analyzer

**Location**: `Chapter5_langflow_aiAgents/Playwright Report Analyzer 2/`
**Stack**: React 18, Vite 4, Tailwind CSS 3, Langflow + Groq (llama-3.1-8b-instant)

### Architecture
```
Browser (React 18 + Vite + Tailwind)
  → POST /api/v1/files/upload/{flow_id} (upload report JSON)
  → POST /api/v1/run/{flow_id}?stream=false (run analysis)
  → Groq LLM inside Langflow flow
```

### Components
| Component | Purpose |
|---|---|
| `App.jsx` | Main layout, state machine (idle → uploading → analyzing → done) |
| `FileUploadZone.jsx` | Drag-and-drop .json file selector |
| `ProgressSteps.jsx` | 3-step progress tracker with animated checkmarks |
| `SummaryCards.jsx` | 2x2 grid: Suite Health, Flaky Tests, Consistent Failures, Rerun Recommendation |
| `FullOutputPanel.jsx` | Collapsible raw markdown viewer with Copy + Download |
| `TokenUsage.jsx` | Footer showing input/output/total token counts |
| `langflowService.js` | All Langflow API calls |

### Langflow Flow Requirements
- **ReadFile-1**, **ReadFile-2** — File components for two reports
- **Prompt Template** — receives `{file1}` and `{file2}`
- **GroqModel** — llama-3.1-8b-instant (requires `GROQ_API_KEY`)
- **ChatOutput** — displays AI response

### Configuration (hardcoded in `src/services/langflowService.js`)
```js
const LANGFLOW_BASE_URL = ''    // empty = uses Vite proxy to localhost:7860
const FLOW_ID = 'c194e71a-...'  // Langflow flow UUID
const API_KEY = 'sk-...'        // Langflow API key
```

### Response Parsing
AI output sections: `**FLAKY_TESTS**`, `**CONSISTENT_FAILURES**`, `**RERUN_RECOMMENDATION**`, `**SUMMARY**`
Token usage: `response.outputs[0].outputs[0].results.message.data.properties.usage`

### Commands
```bash
cd "Chapter5_langflow_aiAgents/Playwright Report Analyzer 2"
npm install && npm run dev        # :5173, proxies /api → localhost:7860
```

### Start After Reboot (from `startlocalhost.md`)
1. Terminal 1: `langflow run --host 0.0.0.0 --port 7860`
2. Terminal 2: `npm run dev`
3. Open `http://localhost:5173`

### Student Guide (from `STUDENT_GUIDE.md`)
Step-by-step build guide covering: Vite scaffold, Tailwind setup, API service layer, Vite proxy config, UI components, wiring in App.jsx, Langflow flow requirements, troubleshooting table, key concepts learned.

---

## Chapter 6: Social Media Content Creation

**Location**: `Chapter6_social media content creation/`
**Status**: Placeholder (empty)

---

## Chapter 7: RAG (Retrieval-Augmented Generation)

### 7a. Advanced RAG Explorer

**Location**: `Chapter7_RAG/Advance _RAG/`
**Stack**: Flask, Qdrant (embedded, no Docker), BAAI/bge-m3 (dense+sparse), BAAI/bge-reranker-v2-m3, Groq llama-3.1-8b-instant, SSE streaming
**Port**: `http://127.0.0.1:5050`

**Pipeline**:
```
Stage 1 (Ingest): CSV → rows → docs → chunk → bge-m3 (dense+sparse) → Qdrant 'vwo_test_cases'
Stage 2 (Chat): Question → rewrite (Groq) → embed → dense+sparse search → RRF fuse → rerank → Groq → answer
```

**Features**:
- Hybrid retrieval (dense + sparse vectors from bge-m3)
- Re-ranking with cross-encoder (bge-reranker-v2-m3)
- Query rewriting via Groq (3 alternate phrasings)
- Token-by-token streaming answers
- Claude-inspired UI (warm cream #FAF7F2 + coral #E8734A)
- Two-pane layout with animated pipeline tracker
- Upload & ingest CSV/XLSX, chat, browse chunks

**Test Data**: `testcase/test_cases.csv` (5,000 rows), `testcase/test_cases_50.csv` (50 rows quick test)

**Settings (`.env`)**:
| Key | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | required | Groq API key |
| `QDRANT_URL` | empty (embedded) | Remote Qdrant URL |
| `CHUNK_SIZE` | 1000 | Max chars per chunk |
| `CHUNK_OVERLAP` | 150 | Overlap between chunks |
| `TOP_N_HYBRID` | 20 | Candidates per search type |
| `TOP_K_RERANK` | 4 | Final chunks to LLM |
| `RRF_K` | 60 | RRF smoothing constant |
| `REWRITE_ENABLED` | true | Query rewriting via Groq |
| `PORT` | 5050 | Server port |
| `INGEST_BATCH` | 32 | Qdrant upsert batch size |
| `BGE_USE_FP16` | 1 | FP16 for bge-m3 |

**Commands**:
```bash
cd "Chapter7_RAG/Advance _RAG"
uv venv .venv
.venv\Scripts\activate
uv pip install -r requirements.txt
# create .env with GROQ_API_KEY=gsk_...
python app.py                    # http://127.0.0.1:5050
```

**First run**: Models download ~3 GB to HuggingFace cache. Subsequent runs are fast.

### 7b. RAG with Langflow

**Location**: `Chapter7_RAG/RAG with Langflow/`
**Stack**: Flask backend + React 18/Vite 4 frontend, Langflow (Docker), ChromaDB, MistralAI embeddings, Groq

**Features**:
- One search bar, answers with sources, dark mode toggle
- Backend proxy (`/api/query`) — query → Langflow → answer + chunks + scores + metadata
- Retrieval fallback: queries local ChromaDB directly if Langflow not wired for chunk output

**API**:
```json
POST /api/query
Request:  { "query": "What is the refund policy?" }
Response: { "answer": "...", "chunks": [{ "text": "...", "score": 87.0, "source": "policy.pdf" }], "meta": { "response_time_ms": 842, "num_chunks": 4 } }
```

**Commands**:
```bash
cd "Chapter7_RAG/RAG with Langflow/backend"
uv sync && uv run python app.py      # :8080

cd "Chapter7_RAG/RAG with Langflow/frontend"
npm install && npm run dev           # :5173, proxies /api → :8080
```

### 7c. Basic RAG (Chapter7 backend + frontend)

**Location**: `Chapter7_RAG/backend/` + `Chapter7_RAG/frontend/`
**Stack**: Flask + ChromaDB + Nomic Embed (nomic-ai/nomic-embed-text-v1.5) + Groq Mixtral (mixtral-8x7b-32768)
**Port**: Backend `:8080`, Frontend `:5173`

**Commands**:
```bash
cd Chapter7_RAG/backend
python -m venv .venv; .venv\Scripts\activate; pip install -r requirements.txt
$env:GROQ_API_KEY="gsk_..."; python app.py    # :8080

cd Chapter7_RAG/frontend
npm install && npm run dev                     # :5173, proxies /api → :8080
```

**Notes**: Expects PDFs in `Chapter7_RAG/data/data/` (nested). Nomic Embed ~500MB download on first run.

---

## Jira Bug Creation & Ticket Buddy

### 30 Jira Bug Tickets (scripted creation)

**Location**: `jira bugs creation/`
**Objective**: Create 30 sample Jira Bug Tickets (15 Login + 15 Dashboard) for validation/testing.

**B.L.A.S.T. Phases** (from `task_plan.md`):
1. Blueprint — Discovery, schema in `gemini.md`
2. Link — Verify Jira credentials, test API connection
3. Architect — Build `tools/create_jira_tickets.py`, execute 30 tickets
4. Stylize — Generate summary.md
5. Trigger — Deliver final payload

**Result** (from `progress.md`): All 30 tickets created successfully (KAN-2 through KAN-31).
- Login: 15 tickets (Positive 2, Negative 4, Boundary 4, Functional 3, UI 2)
- Dashboard: 15 tickets (Positive 2, Negative 3, Boundary 3, Functional 4, UI 3)

**Project Constitution** (from `gemini.md`):
- Jira REST API v3 at `https://{instance}.atlassian.net/rest/api/3/`
- Auth: Basic base64(email:token)
- Project key: `KAN`
- Sequential creation, stop on error, no retries, no duplicate detection

**Technical SOP** (from `architecture/jira_ticket_creator_sop.md`):
- Parse `.env` → Build Basic Auth header → For each ticket: construct ADF description → POST `/rest/api/3/issue` → Log result → Write `summary.md`
- Auth failure: stop immediately. Single ticket failure: stop whole process.

**Key Files**:
- `gemini.md` — Project constitution (schemas, rules, invariants)
- `objective.md` — Scope and requirements
- `task_plan.md` — Phase checklist
- `progress.md` — What was done
- `findings.md` — Research discoveries
- `summary.md` — All 30 ticket keys and summaries
- `architecture/jira_ticket_creator_sop.md` — Technical SOP

### Jira Ticket Buddy (React App)

**Location**: `jira bugs creation/jira-ticket-buddy/`
**Stack**: React 19, Vite 8, react-router-dom 6, GROQ (llama3-70b-8192), Jira REST API v2
**Deployed**: [jiraticketbuddy.vercel.app](https://jiraticketbuddy.vercel.app)

**Flow**: Login (Jira URL, email, token, GROQ key) → Dashboard (Module selector, Multi-select test types, Count slider, Generate via GROQ, Create in Jira)

**Features**:
- LoginPage: credential form with connection test
- DashboardPage: module selector (12 options), multi-select test types (16 types), count slider (1-20), GROQ generation, Jira creation
- MultiSelect component with tag chips
- Utilities: `jiraApi.js` (test/connect/create), `groqApi.js` (GROQ LLM ticket generation)
- Light theme only, professional styling
- Login → Dashboard route-protected via `sessionStorage`
- `vercel.json` for Vercel deployment

**Build Notes** (from `findings.md`):
- GROQ model: `llama3-70b-8192`
- Jira API: `/rest/api/2/issue` (creation), `/rest/api/2/myself` (auth test)
- `.env` must use `VITE_` prefix for Vite client exposure
- Dist: ~220KB JS (70KB gzipped), ~6.5KB CSS

**Commands**:
```bash
cd "jira bugs creation/jira-ticket-buddy"
npm install && npm run dev        # :5173
npm run build                     # production build
```

---

## BLAST Protocol (shared across Ch3 + Jira)

The **B.L.A.S.T.** (Blueprint, Link, Architect, Stylize, Trigger) protocol is used in both Chapter 3 and the Jira Bug Creation project. It defines:

**3-Layer Architecture (ANT)**:
- **Layer 1: Architecture** (`architecture/`) — Technical SOPs in Markdown. Golden Rule: update SOP before code.
- **Layer 2: Navigation** — Reasoning layer, routes data between SOPs and Tools.
- **Layer 3: Tools** (`tools/`) — Deterministic Python scripts, atomic and testable.

**File Structure**:
```
├── gemini.md          # Project Map & State Tracking (THE LAW)
├── .env               # API Keys/Secrets
├── architecture/      # Layer 1: SOPs
├── tools/             # Layer 3: Python Scripts
└── .tmp/              # Temporary Workbench (intermediates)
```

**Self-Annealing Repair Loop**: Analyze stack trace → Patch tool → Test fix → Update architecture SOP.

---

## OpenCode Skills

### Available Skills

| Skill | Location | Trigger | Input → Output |
|---|---|---|---|
| test-plan-generator | Ch2 `.opencode/skills/` + `~/.config/opencode/skills/` | `/test-plan-gen @PRD_file` | PRD → `testplanopencode.docx` |
| test-case-generator | Ch2 `.opencode/skills/` + `~/.config/opencode/skills/` | `/test-case-gen @plan_or_prd` | plan/PRD → `testcasesopencode.xlsx` |
| gen-api-framework | Ch2 `.opencode/skills/` | `/gen-api-framework` | REST Assured (Java), Playwright (TS), Salesforce |
| test-case-generator (Ch3 SKILL.md) | Ch3 `SKILL.md` | ISTQB/ISO 29119 test case gen | Dev doc → markdown table (Jira/TestRail/Zephyr compatible) |

### Test Case Generator Skill Output Format
| Column | Description |
|---|---|
| Test Case ID | `TC_[FEATURE]_[SCENARIO]_[NUMBER]` |
| Test Case Description | Clear, concise objective |
| Preconditions | Setup required |
| Test Steps | Numbered, actionable (use `<br>` for line breaks) |
| Test Data | Specific inputs |
| Expected Result | Measurable, observable |
| Actual Result | `[To be filled during execution]` |
| Status | `[To be filled during execution]` |
| Priority | High / Medium / Low |
| Test Type | Functional / Regression / UI / Integration / Security / Performance |
| Related Requirement | Traceability ID |

---

## Credentials & Secrets

- `.env` files **on disk** contain real credentials (GROQ, Jira, Langflow API keys) but are **gitignored** by root `.gitignore` (`.env`, `.env.local`, `memory/`). They have never been committed.
- `memory/` stores tokens — gitignored, **do not commit**.
- `jira bugs creation/jira-ticket-buddy/.gitignore` and `Chapter5_langflow_aiAgents/Playwright Report Analyzer 2/.gitignore` each list `.env`.
- `jira bugs creation/.env` uses `key = value` (spaces around `=`) — Python `dotenv` won't parse it; use regex.
- `jira bugs creation/jira-ticket-buddy/.env` uses standard `VITE_KEY=VALUE`.
- `.claude/settings.local.json` grants git add/commit/push/restore/reset/remote permissions.
- MEMORY.md references: GitHub token (`github-token-provided-by-user.md`) and `.env` file for API tokens.

---

## Commands — Quick Reference

| Directory | Command |
|---|---|
| `Chapter1_sample-playwright-framefork/` | `mvn clean compile && mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials` |
| `Chapter2_*/salesforce-api-framework/` | `mvn clean test -Pqa -Dgroups=positive` |
| `Chapter2_*/salesforce-api-framework/` | `mvn allure:report` |
| `Chapter3_BLAST*/test-generator-app/` | `npm install && npm run dev` |
| `Chapter5_*/Playwright Report Analyzer 2/` | `npm install && npm run dev` |
| `Chapter7_RAG/Advance _RAG/` | `uv venv .venv; .venv\Scripts\activate; uv pip install -r requirements.txt; python app.py` |
| `Chapter7_RAG/RAG with Langflow/backend/` | `uv sync && uv run python app.py` |
| `Chapter7_RAG/RAG with Langflow/frontend/` | `npm install && npm run dev` |
| `Chapter7_RAG/backend/` | `pip install -r requirements.txt; $env:GROQ_API_KEY="gsk_..."; python app.py` |
| `Chapter7_RAG/frontend/` | `npm install && npm run dev` |
| `jira bugs creation/jira-ticket-buddy/` | `npm install && npm run dev` |
| `jira bugs creation/jira-ticket-buddy/` | `npm run build` |

`npm run preview` works for all Vite apps. No `opencode.json` exists anywhere in the repo.

---

## Quirks & Notes

- **Java version mismatch**: Ch1 uses Java 11, Ch2 uses Java 21. Watch `maven.compiler.source` mismatches.
- **Ch1**: Requires app at `http://localhost:3000` (Java 11).
- **Ch2/salesforce**: CI workflow at `salesforce-api-framework/.github/workflows/api-tests.yml`. Restful Booker API quirks: 418 teapot, DELETE→201, Basic Auth only.
- **Ch3**: Mock implementation (simulated delay, no LLM call). Actual skill-based generation in Ch2.
- **Ch5**: Proxies `/api` → `localhost:7860` (Langflow). Langflow must be running with matching `FLOW_ID` and `API_KEY` in `.env`.
- **Ch7 backend**: Expects PDFs in `Chapter7_RAG/data/data/` (nested `data/data`). Same PDF also in `Basic_RAG/data/`. Requires `GROQ_API_KEY` env var. Nomic Embed model downloads on first run (~500MB).
- **Ch7 frontend `.gitignore`**: Has `node_modules`, but does **not** list `.env`. Root `.gitignore` still covers `.env`.
- **Ch7 Advance_RAG**: Models download ~3 GB on first run (bge-m3 ~2.3GB + bge-reranker ~570MB). Set `BGE_USE_FP16=1` and `INGEST_BATCH=16` on low-RAM machines.
- **jira-ticket-buddy**: Login → Dashboard route-protected via `sessionStorage`. Has `vercel.json` for Vercel deployment. Uses Jira API v2 (`/rest/api/2/`).
- **No CI workflows at repo root.**
- **Playwright locator priority**: `getByLabel()` > `getByRole()` > CSS/XPath (applies to Ch1 and any generated Playwright code).

---

## Development Guidelines

### When Working with UI Tests (Ch1)
- Update page objects when UI changes
- Follow Playwright locator priority
- Keep tests independent with fresh browser contexts
- Ensure app under test is running at `http://localhost:3000`

### When Working with API Tests (Ch2)
- Update environment properties in `src/main/resources/environments/`
- Use singleton client factory for thread-safe API clients
- Leverage `ResponseValidator` for assertions
- Generate reports: `mvn allure:report` or `mvn extent:reports`

### When Working with Generation Skills (Ch2)
- Start with `PRD.txt` as source of truth
- Use `/test-plan-gen` → `testplanopencode.docx`
- Use `/test-case-gen` → `testcasesopencode.xlsx`
- For API automation: `/gen-api-framework`
- Validate generated test cases against requirements

### When Working with BLAST UI (Ch3)
- Replace mock generation with actual skill invocations from Ch2 `.opencode/skills/`
- Modify output format generators for .docx/.xlsx
- Enhance UI with animations and improved layout
- Maintain responsiveness and performance

### When Working with Langflow Apps (Ch5, Ch7 RAG with Langflow)
- Ensure Langflow is running with matching flow ID and API key
- Vite proxy handles CORS in development
- Check `ReadFile-1`/`ReadFile-2` tweak node IDs match Langflow flow

### When Working with Advanced RAG (Ch7 Advance_RAG)
- First run downloads ~3 GB of models
- Use `INGEST_BATCH=8` and `BGE_USE_FP16=1` for low RAM
- Delete `qdrant_data/` folder to reset indexed data
- Port 5050 configurable via `PORT` in `.env`

### Cross-Chapter Considerations
- Each chapter is largely self-contained with its own build system
- Shared concepts: Maven (Ch1/Ch2), Vite/npm (Ch3/Ch5/Ch7/Jira), test reporting, environment config
- Skills in `.opencode/` directories are reusable across chapters
- When switching contexts, check chapter-specific README/PRD files
