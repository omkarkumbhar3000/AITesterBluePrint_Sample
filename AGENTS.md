# AGENTS.md

Repo-scoped guidance. See `CLAUDE.md` for detailed architecture per chapter.

## Structure

8 chapters + ancillary dirs. Only **Ch1–Ch3** + **jira-ticket-buddy** have meaningful content.
| Dir | Tech | Build |
|---|---|---|
| `Chapter1_*` | Playwright Java UI tests (POM, JUnit 5, Java 11) | Maven |
| `Chapter2_*` | OpenCode skills (test-plan/test-case/API-framework gen) + Salesforce REST Assured (Java 21, TestNG 7.10.2, Allure 2.27.0) | Maven (`-Pqa` is default profile) |
| `Chapter3_*` | React Vite app "B.L.A.S.T Test Case Agent" (mocked test gen UI) + standalone `SKILL.md` | npm (Vite) |
| `jira bugs creation/jira-ticket-buddy/` | React Vite app (Login + Dashboard, GROQ + Jira API, react-router-dom v6) | npm (Vite) → [jiraticketbuddy.vercel.app](https://jiraticketbuddy.vercel.app) |
| `jira bugs creation/` | Jira config (non-standard `.env`), BLAST framework files, 30 sample tickets (KAN-2→KAN-31) | — |

## Commands

```bash
# Ch1: Playwright UI tests (app must be at http://localhost:3000)
cd Chapter1_sample-playwright-framefork
mvn clean compile                    # build
mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials  # single test

# Ch2/salesforce-api-framework: REST Assured API tests
cd Chapter2_*/salesforce-api-framework
mvn clean test -Pqa                 # QA env (default, activeByDefault)
mvn clean test -Pdev -Dgroups=positive  # dev + positive group
mvn allure:report                   # generate Allure report

# Ch3: React Vite UI
cd Chapter3_*/test-generator-app
npm install && npm run dev          # dev server (:5173)
npm run build                       # build
npm run lint                        # ESLint (flat config)

# jira-ticket-buddy: deployed at https://jiraticketbuddy.vercel.app
cd jira\ bugs\ creation\jira-ticket-buddy
npm install && npm run dev          # dev server (:5173)
npm run build                       # build
# no lint script available
```

## OpenCode skills (Ch2)

Located at `Chapter2_*/.opencode/skills/`:
- **test-plan-generator**: `/test-plan-gen @PRD_file` → `testplanopencode.docx`
- **test-case-generator**: `/test-case-gen @plan_or_prd` → `testcasesopencode.xlsx`
- **gen-api-framework**: generates REST Assured / Playwright / Salesforce starter frameworks

Global skills at `~/.config/opencode/skills/` are separate copies, not managed here.

## Testing quirks

- Ch1 UI tests **require** the app under test at `http://localhost:3000`
- Ch2 Salesforce framework **requires** real Salesforce credentials in `environments/<env>.properties`
- Ch3 test generation is **mocked** (simulated delay, no actual LLM call)
- `jira bugs creation/.env` uses non-standard format (`key = value` with spaces around `=`) — Python `dotenv` won't parse it; use regex or manual parsing
- `jira bugs creation/jira-ticket-buddy/.env` uses standard `VITE_KEY=VALUE` format (parsed normally)
- Jira project key is `KAN` (from URL `omkar-kumbhar.atlassian.net/jira/software/projects/KAN/`)
- Ch1 Java 11; Ch2 Java 21 — watch for `maven.compiler.source` mismatches
- node_modules gitignored only at the jira-ticket-buddy subdirectory level
- No CI workflows, no opencode.json in repo

## Secrets & git

- `memory/` stores tokens (GROQ, GitHub, Vercel, Jira) — **DO NOT commit** (gitignored)
- `MEMORY.md` indexes memory files
- `.env` and `.env.local` are gitignored at root
- `.claude/settings.local.json` allows git commands (add/commit/push/remote/restore/reset)

## Conventions

- Playwright locator priority: `getByLabel()` > `getByRole()` > CSS/XPath
- `Chapter2_*/AGENTS.md` documents Restful Booker API quirks (418 teapot, DELETE→201, Basic Auth only)
- jira-ticket-buddy flow: Login (Jira + GROQ credentials) → Dashboard (selectors + generate) — route-protected via `sessionStorage`
- No cross-chapter dependencies — each chapter is self-contained
