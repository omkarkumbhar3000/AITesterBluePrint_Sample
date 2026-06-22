# AGENTS.md

Repo-scoped guidance. See `CLAUDE.md` for detailed commands and architecture per chapter.

## Structure

8 chapters + ancillary dirs. Only **Ch1–Ch3** have meaningful content; Ch4–Ch8 are placeholders.
| Dir | Content | Build |
|---|---|---|
| `Chapter1_*` | Playwright Java UI tests (POM, JUnit 5, Java 11) | Maven |
| `Chapter2_*` | OpenCode skills (test-plan/test-case/API-framework gen) + Salesforce REST Assured framework (Java 21, TestNG) | Maven |
| `Chapter3_*` | React Vite app "B.L.A.S.T Test Case Agent" (mocked test gen UI) + standalone `SKILL.md` (same `test-case-generator` name as Ch2) | npm |
| `Chapter4_n8n_*` | README only — placeholder | — |
| `Chapter5_langflow_*` | Flakey test case execution reports | — |
| `Chapter6_*` – `Chapter8_MCP/` | Empty / placeholder | — |
| `Project_Job_Tracker_AI/` | Resume files (`.docx`) | — |
| `jira bugs creation/` | Jira config (URL, token in `.env`), BLAST framework files (`architecture/`, `tools/`, `gemini.md`), 30 sample tickets (KAN-2→KAN-31) in `summary.md` | — |
| `jira bugs creation/jira-ticket-buddy/` | Jira Ticket Buddy React app (Vite, Login + Dashboard, GROQ + Jira API integration) | npm (Vite) |

## Commands

```bash
# Ch1: Playwright UI tests (app must be at http://localhost:3000)
cd Chapter1_sample-playwright-framefork
mvn clean compile                    # build
mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials  # single test

# Ch2/salesforce-api-framework: REST Assured API tests
cd Chapter2_*/salesforce-api-framework
mvn clean test -Pqa                 # QA env (default)
mvn clean test -Pdev -Dgroups=positive  # specific env + group
mvn allure:report                   # generate Allure report

# Ch3: React Vite UI (deployed on Vercel as "testcasebuddy")
cd Chapter3_*/test-generator-app
npm install && npm run dev          # dev server (default :5173)
npm run build                       # production build
npm run lint                        # ESLint (flat config)

# jira bugs creation/jira-ticket-buddy: Jira + GROQ ticket generator
cd jira\ bugs\ creation\jira-ticket-buddy
npm install && npm run dev          # dev server (default :5173)
npm run build                       # production build
```

## OpenCode skills (Ch2)

Located at `Chapter2_*/.opencode/skills/`:
- **test-plan-generator**: `/test-plan-gen @PRD_file` → `testplanopencode.docx`
- **test-case-generator**: `/test-case-gen @plan_or_prd` → `testcasesopencode.xlsx`
- **gen-api-framework**: generates REST Assured / Playwright / Salesforce starter frameworks

The global skills at `~/.config/opencode/skills/` (e.g. `restassured`) are separate copies, not managed here.

**Note:** Ch3 also has a `SKILL.md` at its root with the same `test-case-generator` name — a standalone definition (ISTQB markdown output), not part of `.opencode/skills/`.

## Secrets & memory

- `memory/` stores tokens (GROQ, GitHub, Vercel, Jira) — **DO NOT commit** (gitignored)
- `MEMORY.md` indexes memory files
- `.claude/settings.local.json` allows git commands (add/commit/push/remote/restore/reset)
- `.env` and `.env.local` also gitignored

## Testing quirks

- Ch1 UI tests **require** the app under test at `http://localhost:3000` — no app, no tests
- Ch2 Salesforce framework **requires** real Salesforce credentials in `environments/<env>.properties` to execute
- Ch3 test generation is **mocked** (simulated delay, no actual LLM call)
- `jira bugs creation/.env` contains a live Jira token — handle with care
- `jira bugs creation/.env` uses non-standard format (`key = value` with spaces around `=`, not `KEY=VALUE`) — Python `dotenv` won't parse it; use regex or manual parsing
- Jira project key is `KAN` (from URL `omkar-kumbhar.atlassian.net/jira/software/projects/KAN/`)
- No CI workflows anywhere in the repo

## Conventions

- Playwright locator priority: `getByLabel()` > `getByRole()` > CSS/XPath
- `Chapter2_*/AGENTS.md` documents Restful Booker API-specific quirks (418 teapot, DELETE→201, Basic Auth only)
- No cross-chapter dependencies — each chapter is self-contained with its own build system
