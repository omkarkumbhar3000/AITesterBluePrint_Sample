# AGENTS.md

Repo-scoped guidance — only what an agent would likely miss.

## Structure

| Dir | What's inside | Build |
|---|---|---|
| `Chapter1_sample-playwright-framefork/` | Playwright Java UI tests (POM, JUnit 5, Java 11) | Maven |
| `Chapter2_*RICE-POT*/` | OpenCode skills (test-plan/test-case/API-framework gen) + Salesforce REST Assured (Java 21, TestNG 7.10.2, Allure 2.27.0) | Maven (`-Pqa` default) |
| `Chapter3_BLAST*/test-generator-app/` | React Vite "BLAST Test Case Agent" — mocked test gen UI (React 19, Vite 8, ESLint flat config) | npm (Vite) |
| `Chapter5_langflow_aiAgents/Playwright Report Analyzer 2/` | React 18, Vite 4, Tailwind 3 — Langflow + Groq to compare Playwright report JSONs | npm (Vite) |
| `Chapter7_RAG/` | RAG Explorer: Flask + ChromaDB + Nomic Embed (nomic-ai/nomic-embed-text-v1.5) + Groq Mixtral (mixtral-8x7b-32768) on :8080; React 18 / Vite 4 frontend proxied to :8080 | Python venv + npm (Vite) |
| `jira bugs creation/jira-ticket-buddy/` | React 19 / Vite 8 / react-router-dom 6 — Generate Jira tickets (Epic/Bug/Story/Task) via GROQ + Jira REST API. Login → Dashboard (sessionStorage). Deployed to Vercel. | npm (Vite) |
| `Chapter4_n8n_aiAgents/`, `Chapter6_*`, `Chapter8_MCP/`, `Project_Job_Tracker_AI/` | Empty or resume .docx only | — |

`Chapters 1–3, 5, 7`, and `jira-ticket-buddy` have runnable code. No cross-chapter dependencies.

## Commands

```bash
# Ch1 — requires app at :3000
cd Chapter1_sample-playwright-framefork
mvn clean compile && mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials

# Ch2/salesforce — requires real Salesforce creds in environments/<env>.properties
cd Chapter2_*/salesforce-api-framework
mvn clean test -Pqa -Dgroups=positive   # QA (default); -Pdev, -Pprod available
mvn allure:report                        # Allure report

# Ch3 — mocked test gen (simulated delay, no LLM)
cd Chapter3_BLAST*/test-generator-app
npm install && npm run dev               # :5173
npm run lint                              # ESLint flat config

# Ch5 — requires Langflow at :7860 with matching flow ID + API key
cd "Chapter5_langflow_aiAgents/Playwright Report Analyzer 2"
npm install && npm run dev               # :5173, proxies /api → localhost:7860

# Ch7 — start backend first, then frontend
cd Chapter7_RAG/backend
python -m venv .venv; .venv\Scripts\activate; pip install -r requirements.txt
$env:GROQ_API_KEY="gsk_..."; python app.py  # :8080 — Nomic Embed ~500MB download on first run

cd Chapter7_RAG/frontend
npm install && npm run dev               # :5173, proxies /api → localhost:8080

# jira-ticket-buddy — GROQ + Jira API
cd "jira bugs creation/jira-ticket-buddy"
npm install && npm run dev               # :5173
npm run build                             # no lint script
```

`npm run preview` works for all Vite apps. No `opencode.json` exists anywhere in the repo.

## OpenCode skills (in `Chapter2_*/.opencode/skills/`)

| Skill | Trigger | Input → Output |
|---|---|---|
| test-plan-generator | `/test-plan-gen @PRD_file` | PRD → `testplanopencode.docx` |
| test-case-generator | `/test-case-gen @plan_or_prd` | plan/PRD → `testcasesopencode.xlsx` |
| gen-api-framework | `/gen-api-framework` | 3 modes: REST Assured (Java), Playwright (TS), Salesforce |

Global copies at `~/.config/opencode/skills/` exist separately.

## Credentials & secrets

- `.env` files **on disk** contain real credentials (GROQ, Jira, Langflow API keys) but are **gitignored** by root `.gitignore` (`.env`, `.env.local`, `memory/`). They have never been committed.
- `memory/` stores tokens — gitignored, **do not commit**.
- **But**: `jira bugs creation/jira-ticket-buddy/.gitignore` and `Chapter5_langflow_aiAgents/Playwright Report Analyzer 2/.gitignore` each list `.env`. If you create a new Vite project, ensure its `.gitignore` includes `.env`.
- `jira bugs creation/.env` uses `key = value` (spaces around `=`) — Python `dotenv` won't parse it; use regex.
- `jira bugs creation/jira-ticket-buddy/.env` uses standard `VITE_KEY=VALUE`.
- `.claude/settings.local.json` grants git add/commit/push/restore/reset/remote permissions.

## Quirks

- Ch1: Requires app at `http://localhost:3000` (Java 11). Ch2: Java 21 — watch `maven.compiler.source` mismatches.
- Ch2/salesforce: Has a CI workflow at `salesforce-api-framework/.github/workflows/api-tests.yml`. The `AGENTS.md` there documents Restful Booker API quirks (418 teapot, DELETE→201, Basic Auth only).
- Ch5: Proxies `/api` → `localhost:7860` (Langflow). Langflow must be running with matching `FLOW_ID` and `API_KEY` in `.env`.
- Ch7 backend: Expects PDFs in `Chapter7_RAG/data/data/` (nested `data/data`). Same PDF also in `Basic_RAG/data/`. Requires `GROQ_API_KEY` env var. Nomic Embed model downloads on first run (~500MB).
- Ch7 frontend `.gitignore`: Has `node_modules`, but does **not** list `.env`. Root `.gitignore` still covers `.env` though.
- jira-ticket-buddy: Login → Dashboard route-protected via `sessionStorage`. Has `vercel.json` for Vercel deployment.
- No CI workflows at repo root.

## Playwright locator priority

`getByLabel()` > `getByRole()` > CSS/XPath (applies to Ch1 and any generated Playwright code).
