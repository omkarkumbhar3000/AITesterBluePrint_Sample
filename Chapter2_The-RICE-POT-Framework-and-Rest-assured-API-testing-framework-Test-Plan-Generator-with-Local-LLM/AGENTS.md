# AGENTS.md

Prompt-engineering repo targeting the **Restful Booker API** (`https://restful-booker.herokuapp.com/apidoc/index.html`). **No build tooling, no code, no test runner** — planning phase only.

## Key files

| File | Role |
|---|---|
| `PRD.txt` | Source-of-truth — scope, strategy, environments, defect POCs |
| `salesforce-api-framework/` | Generated artifact from `/gen-api-framework` skill (separate use case) |
| `Test cases - Ultimate _ TheTestingAcademy.xlsx` | Reference template — General CRUD column layout |

## Skill triggers & TUI commands

| Trigger | Loads | Produces |
|---|---|---|
| `setup/test plan generator` or `/test-plan-gen` | `.opencode/skills/test-plan-generator/` | `testplanopencode.docx` |
| `setup/test case generator` or `/test-case-gen` | `.opencode/skills/test-case-generator/` | `testcasesopencode.xlsx` |
| `setup/gen-api-framework` or `/gen-api-framework` | `.opencode/skills/gen-api-framework/` | 3 modes: REST Assured (Java), Playwright (TS), or Salesforce framework generation |

These are the only skills that exist in this repo. Global skills registered in `~/.config/opencode/opencode.jsonc` (`restassured`) reference a separate copy not managed here.

## Workflow

1. `/test-plan-gen @PRD.txt` → `testplanopencode.docx`
2. `/test-case-gen @testplanopencode.docx` → `testcasesopencode.xlsx`
3. Execute manually in Postman
4. Automate via REST Assured *(future)*
5. Report bugs in JIRA (Frontend: Devesh, Backend: Sonal, DevOps: Prajeeth)

## Restful Booker API quirks (tested)

| Observation | Detail |
|---|---|
| `POST /booking` requires `Accept: application/json` | Returns 418 ("I'm a teapot") without it |
| `DELETE` returns 201 on success | Not 200 or 204 |
| `PUT`/`DELETE` auth | **Basic Auth** works; cookie (`token=...`) returns 403 |
| `PATCH` works; `PUT` can return 400 with no error body | Use PATCH as fallback |
| Auth payload | `{ username: "admin", password: "password123" }` |
| Basic Auth header | `Authorization: Basic base64("admin:password123")` |
| Generated output format (14 cols) | `Scenario TID | Description | PreCondition | TestSteps | Expected Result | Actual Result | Steps to Execute | Expected Result | Actual Result | Status | QA Name | Misc | Priority | Is Automated` |

## Environment

- Java 26.0.1, Maven 3.9.3 — available for future REST Assured phase
- Use `Invoke-RestMethod` (not `Invoke-WebRequest`) for ad-hoc API testing from PowerShell
- `salesforce-api-framework/` requires real Salesforce credentials to execute (not possible here)
