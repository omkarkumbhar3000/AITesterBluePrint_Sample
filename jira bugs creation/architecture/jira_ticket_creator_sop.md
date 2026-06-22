# Jira Ticket Creator — Technical SOP

## Goal
Create 30 bug tickets in Jira project KAN across Login (15) and Dashboard (15) modules via REST API v3.

## Inputs
- `.env` — Jira URL, email, token
- `gemini.md` — Data schemas
- 30 hardcoded ticket definitions in the script

## Tool Logic
1. Parse `.env` for credentials
2. Build Basic Auth header (base64(email:token))
3. For each ticket in order:
   a. Construct ADF-format description
   b. POST to `/rest/api/3/issue`
   c. Log result
4. Write `summary.md` with results

## Edge Cases
- **Auth failure**: Stop immediately, print error, do not create any tickets
- **Single ticket failure**: Stop the whole process (no skip-continue)
- **Network error**: Stop with error message
- **Rate limiting**: Not expected for 30 sequential requests; no special handling
- **No retry logic**: Per behavioral rules

## Ticket Distribution
| Module | Count | Scenario Types |
|--------|-------|----------------|
| Login | 15 | Positive(2), Negative(4), Boundary(4), Functional(3), UI(2) |
| Dashboard | 15 | Positive(2), Negative(3), Boundary(3), Functional(4), UI(3) |

## Priority Mapping
- Blocker/Critical: Auth, security, data loss scenarios
- Major: Functional failures
- Minor/Low: UI cosmetic, edge cases
