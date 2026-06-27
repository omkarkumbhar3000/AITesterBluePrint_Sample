# Playwright Test Report Analyzer

AI-powered tool that compares two Playwright test report JSON files and surfaces flaky tests, consistent failures, and rerun recommendations using Langflow + Groq (llama-3.1-8b-instant).

## Prerequisites

- Node.js 18+
- Langflow running at `http://localhost:7860`
- A Langlow flow with ID `c194e71a-e44b-4e44-99bb-d94e2673a5c7` containing two **File** components (`ReadFile-1`, `ReadFile-2`), a **Prompt Template**, a **GroqModel**, and a **ChatOutput**

## Setup

```bash
npm install
```

## Configuration

All values are hardcoded in `src/services/langflowService.js`:

```js
const LANGFLOW_BASE_URL = ''           // empty = uses Vite proxy to localhost:7860
const FLOW_ID = 'c194e71a-...'         // your Langflow flow UUID
const API_KEY = 'sk-ChSrThOtynB...'    // your Langflow API key
```

Edit these three constants to match your Langflow instance.

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/api/*` requests to `http://localhost:7860` to avoid CORS issues.

## Usage

1. Upload two Playwright `report.json` files (Baseline and Latest Run)
2. Click **Analyze Reports**
3. View results: Suite Health, Flaky Tests, Consistent Failures, Rerun Recommendation
4. Copy or download the full AI analysis from the collapsible panel

## Langflow Flow Requirements

Your Langflow flow must contain:
- **ReadFile-1** — File component for the first report
- **ReadFile-2** — File component for the second report
- **Prompt Template** — receives `{file1}` and `{file2}` variables
- **GroqModel** — llama-3.1-8b-instant (requires `GROQ_API_KEY` env var)
- **ChatOutput** — displays the AI response

## Project Structure

```
├── index.html
├── package.json
├── vite.config.js          # Vite config with /api proxy → localhost:7860
├── tailwind.config.js
├── postcss.config.js
├── .env                    # Template for local config values
├── README.md
├── PROJECT_DOCS.md         # Detailed project documentation
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx             # Main layout + state machine
    ├── services/
    │   └── langflowService.js   # All Langflow API calls
    └── components/
        ├── FileUploadZone.jsx
        ├── ProgressSteps.jsx
        ├── SummaryCards.jsx
        ├── FullOutputPanel.jsx
        └── TokenUsage.jsx
```

## Troubleshooting

| Problem | Fix |
|---|---|
| CORS error | Vite proxy handles this in dev — ensure `localhost:7860` is reachable |
| Upload fails | Check Langflow is running and the API key is correct |
| Analysis fails | Verify flow ID and `ReadFile-1`/`ReadFile-2` node names match your flow |
| Empty results | Check AI output contains `**FLAKY_TESTS**`, `**SUMMARY**` etc. section headers |

See `PROJECT_DOCS.md` for full API flow details. See `STUDENT_GUIDE.md` for a step-by-step build guide.
