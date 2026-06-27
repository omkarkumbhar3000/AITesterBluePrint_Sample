# Playwright Test Report Analyzer

AI-powered Playwright test report comparison tool using Langflow + Groq (llama-3.1-8b-instant).

## Architecture

```
Browser (React 18 + Vite + Tailwind)
       │
       │ fetch() via Vite proxy (dev) or direct URL (prod)
       ▼
Langflow API (localhost:7860 or cloud URL)
       │
       ├── POST /api/v1/files/upload/{flow_id}   (upload report JSON)
       ├── POST /api/v1/run/{flow_id}?stream=false (run analysis)
       │
       ▼
Groq LLM (llama-3.1-8b-instant) inside Langflow flow
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 4, Tailwind CSS 3 |
| AI Backend | Langflow + Groq (llama-3.1-8b-instant) |

## Langflow API Flow

### Step 1 — Upload Report 1
```
POST /api/v1/files/upload/{flow_id}
Header: x-api-key: {api_key}
Body: multipart/form-data with key "file" = report1.json
Response: { "file_path": "..." }
```

### Step 2 — Upload Report 2
Same as Step 1 with report2.json.

### Step 3 — Run Analysis
```
POST /api/v1/run/{flow_id}?stream=false
Headers:
  Content-Type: application/json
  x-api-key: {api_key}
Body:
{
  "output_type": "chat",
  "input_type": "text",
  "input_value": "Compare the two Playwright test reports",
  "session_id": "omkar-report-session-01",
  "tweaks": {
    "ReadFile-1": { "path": "<file_path_1>" },
    "ReadFile-2": { "path": "<file_path_2>" }
  }
}
```

### Step 4 — Parse Response
```
response.outputs[0].outputs[0].results.message.text
```

Sections parsed from markdown output:
- `**FLAKY_TESTS**`
- `**CONSISTENT_FAILURES**`
- `**RERUN_RECOMMENDATION**`
- `**SUMMARY**`

Token usage:
```
response.outputs[0].outputs[0].results.message.data.properties.usage
```

## Configuration

Values are hardcoded in `src/services/langflowService.js`:

| Constant | Value |
|---|---|
| `LANGFLOW_BASE_URL` | `''` (empty — uses Vite proxy to localhost:7860) |
| `FLOW_ID` | Your Langlow flow UUID |
| `API_KEY` | Your Langlow API key |

## File Structure

```
playwright-report-analyzer-2/
├── index.html
├── vite.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── .env                          # Template for local config
├── PROJECT_DOCS.md
├── STUDENT_GUIDE.md
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── services/
    │   └── langflowService.js
    └── components/
        ├── FileUploadZone.jsx
        ├── ProgressSteps.jsx
        ├── SummaryCards.jsx
        ├── FullOutputPanel.jsx
        └── TokenUsage.jsx
```

## Local Development

```bash
npm install
npm run dev
# Opens at http://localhost:5173
# Vite proxies /api/* to http://localhost:7860
```

Ensure Langflow is running on `localhost:7860` with the configured flow.

## Components

| Component | Purpose |
|---|---|
| `App.jsx` | Main layout, state machine (idle → uploading → analyzing → done), error handling |
| `FileUploadZone.jsx` | Drag-and-drop .json file selector with size display |
| `ProgressSteps.jsx` | 3-step progress tracker with animated checkmarks |
| `SummaryCards.jsx` | 2×2 grid: Suite Health, Flaky Tests, Consistent Failures, Rerun Recommendation |
| `FullOutputPanel.jsx` | Collapsible raw markdown viewer with Copy + Download buttons |
| `TokenUsage.jsx` | Footer showing input/output/total token counts |
| `langflowService.js` | All Langflow API calls (upload ×2, run analysis) |

## Notes

- The `ReadFile-1` / `ReadFile-2` tweak node IDs must match the actual File component IDs in your Langflow flow. Check the browser console for the full API response and adjust if needed.
- The Vite proxy (`/api` → `localhost:7860`) handles CORS in development only.
- The `x-api-key` header must be sent with every request.
