# gemini.md — Project Constitution

## Architecture Invariants
- All credentials read from `.env` only — never hardcoded
- Jira REST API v3 at `https://{instance}.atlassian.net/rest/api/3/`
- Auth: Basic base64(email:token)
- Project key: `KAN`
- Sequential ticket creation, stop on error, no retries

## Input Schema (from `.env`)
```json
{
  "jira_url": "string",
  "jira_email": "string",
  "jira_token": "string",
  "project_key": "KAN"
}
```

## Ticket Definition Schema (30 items)
```json
{
  "tickets": [
    {
      "module": "Login | Dashboard",
      "scenario_type": "Positive | Negative | Boundary | Functional | UI",
      "summary": "string (short bug title)",
      "description": "string (detailed description)",
      "preconditions": "string",
      "steps": ["string"],
      "expected_result": "string",
      "actual_result": "string",
      "priority": "Highest | High | Medium | Low | Lowest",
      "severity": "Blocker | Critical | Major | Minor | Trivial",
      "labels": ["string"],
      "environment": "string (optional)"
    }
  ]
}
```

## Jira API Payload (POST /rest/api/3/issue)
```json
{
  "fields": {
    "project": { "key": "KAN" },
    "issuetype": { "name": "Bug" },
    "summary": "string",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        { "type": "paragraph", "content": [{ "type": "text", "text": "Description..." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "Preconditions: ..." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "Steps to Reproduce:\n1. ...\n2. ..." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "Expected: ..." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "Actual: ..." }] }
      ]
    },
    "priority": { "name": "Medium" },
    "labels": ["login", "bug"],
    "environment": "string (optional)"
  }
}
```

## Output Schema (summary.md)
```json
{
  "project": "KAN",
  "total_created": 30,
  "module_breakdown": { "Login": 15, "Dashboard": 15 },
  "tickets": [
    { "key": "KAN-1", "summary": "...", "module": "Login", "status": "created | failed" }
  ]
}
```

## Behavioral Rules
- Sequential creation (no parallelism)
- Stop on first auth/API failure
- No retry logic
- No duplicate ticket detection
