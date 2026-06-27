# AGENTS.md

Repo-scoped guidance only — content that took multiple reads to verify.

## Structure

| Dir | What's inside | Build |
|---|---|---|
| `Chapter1_sample-playwright-framefork/` | Playwright Java UI tests (POM, JUnit 5, Java 11) | Maven |
| `Chapter2_*RICE-POT*/` | OpenCode skills (test-plan/test-case/API-framework gen) + Salesforce REST Assured (Java 21, TestNG 7.10.2, Allure 2.27.0) | Maven (`-Pqa` default) |
| `Chapter3_BLAST*/test-generator-app/` | React Vite "BLAST Test Case Agent" — mocked test gen UI | npm (Vite) |
| `Chapter4_n8n_aiAgents/` | Placeholder (empty README only) | — |
| `Chapter5_langflow_aiAgents/` | Langflow flow export JSON + two Vite apps (playwright-report-analyzer scaffold, Playwright Report Analyzer 2 full app) | npm (Vite) |
| `Chapter6_social media content creation/` | Empty placeholder | — |
| `Chapter7_RAG/` | Empty placeholder | — |
| `Chapter8_MCP/` | Empty placeholder | — |
| `Project_Job_Tracker_AI/` | Resume files only (.docx) | — |
| `jira bugs creation/jira-ticket-buddy/` | React Vite app (Login + Dashboard, GROQ + Jira API, react-router-dom v6) | npm → [jiraticketbuddy.vercel.app](https://jiraticketbuddy.vercel.app) |
| `jira bugs creation/` | Jira config, BLAST framework docs, architecture docs, 30 sample tickets (KAN-2→KAN-31) | — |

Only Ch1–Ch3, Ch5, and `jira-ticket-buddy` have runnable code. Ch4, Ch6–Ch8 are empty.

## Commands

```bash
# Ch1: Playwright UI tests (requires app at http://localhost:3000)
cd Chapter1_sample-playwright-framefork
mvn clean compile
mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials

# Ch2/salesforce-api-framework: REST Assured API tests
cd Chapter2_*/salesforce-api-framework
mvn clean test -Pqa                          # QA (default)
mvn clean test -Pdev -Dgroups=positive       # dev + positive group
mvn allure:report                            # Allure report

# Ch3: React Vite UI
cd Chapter3_*/test-generator-app
npm install && npm run dev                   # :5173
npm run build
npm run lint                                 # ESLint flat config

# Ch5/playwright-report-analyzer (empty scaffold, no src/ yet)
cd "Chapter5_langflow_aiAgents/playwright-report-analyzer"
npm install && npm run dev                   # :5173

# Ch5/Playwright Report Analyzer 2 (full app — requires Langflow at localhost:7860)
# Start Langflow first: langflow run --host 0.0.0.0 --port 7860
cd "Chapter5_langflow_aiAgents/Playwright Report Analyzer 2"
npm install && npm run dev                   # :5173
# See startlocalhost.md in the app directory for full restart steps

# jira-ticket-buddy (deployed at jiraticketbuddy.vercel.app)
cd jira\ bugs\ creation\jira-ticket-buddy
npm install && npm run dev                   # :5173
npm run build                                # no lint script
```

## OpenCode skills (Ch2)

Each at `Chapter2_*/.opencode/skills/<name>/SKILL.md`:
- **test-plan-generator**: `/test-plan-gen @PRD_file` → `testplanopencode.docx`
- **test-case-generator**: `/test-case-gen @plan_or_prd` → `testcasesopencode.xlsx`
- **gen-api-framework**: REST Assured / Playwright / Salesforce starter framework

Global skills at `~/.config/opencode/skills/` are separate copies.

## Quirks & gotchas

- Ch1 UI tests **require** app at `http://localhost:3000`
- Ch2 Salesforce framework **requires** real Salesforce credentials in `environments/<env>.properties`
- Ch3 test generation is **mocked** (simulated delay, no LLM call)
- Ch5 Playwright Report Analyzer 2 **requires** Langflow at `http://localhost:7860` with matching flow ID and API key
- `jira bugs creation/.env` uses `key = value` (spaces around `=`) — Python `dotenv` won't parse it; use regex
- `jira bugs creation/jira-ticket-buddy/.env` uses standard `VITE_KEY=VALUE`
- Ch1 Java 11; Ch2 Java 21 — watch `maven.compiler.source` mismatches
- node_modules gitignored only at `jira-ticket-buddy/.gitignore`
- No CI workflows, no `opencode.json` in repo
- `Chapter2_*/AGENTS.md` documents Restful Booker API quirks (418 teapot, DELETE→201, Basic Auth only)
- jira-ticket-buddy flow: Login → Dashboard (route-protected via `sessionStorage`)

## Secrets (important)

- `memory/` is gitignored and stores tokens — **DO NOT commit**
- **However**: `jira bugs creation/.env` and `jira bugs creation/jira-ticket-buddy/.env` **have real committed credentials** (Jira URL/email/token, GROQ key). These are already in git history. Do not add new `.env` files without `.gitignore` entries.
- `.claude/settings.local.json` allows git commands (add/commit/push/remote/restore/reset)

## Conventions

- Playwright locator priority: `getByLabel()` > `getByRole()` > CSS/XPath
- No cross-chapter dependencies — each chapter is self-contained
