# AGENTS.md

Repo-scoped guidance. See `CLAUDE.md` for detailed commands and architecture per chapter.

## Structure

8 chapters + ancillary dirs. Only **Ch1–Ch3** have real content; Ch4–Ch8 are empty stubs:
| Dir | Content | Build |
|---|---|---|
| `Chapter1_*` | Playwright Java UI tests (POM, JUnit 5) | Maven (Java 11) |
| `Chapter2_*` | OpenCode skills (test-plan/test-case/API-framework gen) + Salesforce REST Assured framework | Maven (Java 21, TestNG) |
| `Chapter3_*` | React Vite app (mock test gen UI) + BLAST skill definition | npm |
| `Chapter4_n8n_*` — `Chapter8_MCP/` | Empty / placeholder | — |
| `Project_Job_Tracker_AI/` | Resume files only | — |
| `jira bugs creation/` | Empty | — |

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

# Ch3: React Vite UI
cd Chapter3_*/test-generator-app
npm install && npm run dev          # dev server (default :5173)
npm run build                       # production build
npm run lint                        # ESLint
```

## OpenCode skills (Ch2)

Located at `Chapter2_*/.opencode/skills/`:
- **test-plan-generator**: `/test-plan-gen @PRD_file` → `testplanopencode.docx`
- **test-case-generator**: `/test-case-gen @plan_or_prd` → `testcasesopencode.xlsx`
- **gen-api-framework**: generates REST Assured / Playwright / Salesforce starter frameworks

The global skills at `~/.config/opencode/skills/` (e.g. `restassured`) are separate copies, not managed here.

## Secrets & memory

- `memory/` stores tokens (GROQ, GitHub, Vercel, Jira) — **DO NOT commit** (gitignored)
- `MEMORY.md` indexes memory files
- `.claude/settings.local.json` allows git commands (add/commit/push/remote/restore/reset)
- `.env` and `.env.local` also gitignored

## Testing quirks

- Ch1 UI tests **require** the app under test at `http://localhost:3000` — no app, no tests
- Ch2 Salesforce framework **requires** real Salesforce credentials in `environments/<env>.properties` to execute
- Ch3 test generation is **mocked** (simulated delay, no actual LLM call)
- No CI workflows in root `.github/workflows/` (Ch2 has its own at `salesforce-api-framework/.github/workflows/`)

## Conventions

- Playwright locator priority: `getByLabel()` > `getByRole()` > CSS/XPath
- Chapter2 AGENTS.md exists for Restful Booker API-specific quirks (418 teapot, DELETE→201, Basic Auth only)
- No cross-chapter dependencies — each chapter is self-contained with its own build system
