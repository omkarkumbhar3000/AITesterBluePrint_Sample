# Student Guide — Build Your Own Playwright Test Report Analyzer

A step-by-step guide to building a React + Vite app that analyzes Playwright test reports using Langflow + Groq AI.

---

## Prerequisites

- Node.js 18+ installed
- Langflow running locally (`http://localhost:7860`)
- A Langflow flow with Groq model configured and `ReadFile` components
- Basic React knowledge

---

## Step 1: Scaffold the Project

```bash
npm create vite@latest playwright-report-analyzer -- --template react
cd playwright-report-analyzer
npm install
```

Install Tailwind CSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 2: Create the API Service Layer

Create `src/services/langflowService.js`:

```js
const LANGFLOW_BASE_URL = ''
const FLOW_ID = 'your-flow-uuid-here'
const API_KEY = 'your-langflow-api-key-here'

export async function uploadReport(file) {
  const url = `${LANGFLOW_BASE_URL}/api/v1/files/upload/${FLOW_ID}`
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY },
    body: formData,
  })

  if (!response.ok) throw new Error(`Upload failed (${response.status})`)
  const data = await response.json()
  return data.file_path
}

export async function runAnalysis(filePath1, filePath2) {
  const url = `${LANGFLOW_BASE_URL}/api/v1/run/${FLOW_ID}?stream=false`

  const body = {
    output_type: 'chat',
    input_type: 'text',
    input_value: 'Compare the two Playwright test reports',
    session_id: 'student-session-01',
    tweaks: {
      'ReadFile-1': { path: filePath1 },
      'ReadFile-2': { path: filePath2 },
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error(`Analysis failed (${response.status})`)
  return response.json()
}
```

---

## Step 3: Configure Vite Proxy (for local development)

Update `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:7860',
        changeOrigin: true,
      },
    },
  },
})
```

This avoids CORS errors during development.

---

## Step 4: Build the UI Components

Create these components under `src/components/`:

### FileUploadZone.jsx
- Drag-and-drop zone accepting `.json` files
- Shows filename + file size after selection

### ProgressSteps.jsx
- 3-step tracker: Upload Report 1 → Upload Report 2 → Running AI Analysis
- Shows animated checkmark when each step completes

### SummaryCards.jsx
- 2×2 grid of cards: Suite Health, Flaky Tests, Consistent Failures, Rerun Recommendation
- Parses AI output sections: `**FLAKY_TESTS**`, `**CONSISTENT_FAILURES**`, `**RERUN_RECOMMENDATION**`, `**SUMMARY**`

### FullOutputPanel.jsx
- Collapsible panel showing raw AI markdown
- "Copy to Clipboard" and "Download Report" buttons

### TokenUsage.jsx
- Footer showing input/output/total token counts

---

## Step 5: Wire It Together in App.jsx

- Manage state: files, current step, results, errors
- Handle the 4-step flow: idle → uploading-1 → uploading-2 → analyzing → done
- Show error toasts on failure
- Display results after completion

---

## Step 6: Run Locally

```bash
npm run dev
```

Open `http://localhost:5173`, upload two Playwright `report.json` files, and click **Analyze Reports**.

---

## Langflow Flow Requirements

Your Langflow flow must have:
- Two **ReadFile** components (named `ReadFile-1` and `ReadFile-2`)
- A **GroqModel** component (llama-3.1-8b-instant or similar)
- A **ChatOutput** component
- The flow should accept `text` input and compare two Playwright report JSON files

---

## Troubleshooting

| Problem | Solution |
|---|---|
| CORS error in browser console | Use Vite proxy (Step 3) or add CORS headers to Langflow |
| "Failed to upload" toast | Check Langflow is running at localhost:7860 |
| "Analysis failed" toast | Check flow ID and API key in `langflowService.js` |
| Empty summary cards | Check that AI output contains `**FLAKY_TESTS**` etc. markers |
| Node names not matching | Check browser console for full API response, adjust tweak IDs |

---

## Key Concepts Learned

- React + Vite project setup with Tailwind CSS
- Drag-and-drop file uploads
- Multi-step async flow with progress indicators
- API integration with fetch() and async/await
- Vite proxy for CORS-free local development
- Markdown parsing and rendering in React
