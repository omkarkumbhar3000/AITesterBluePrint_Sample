# Findings

## Initial
- Jira instance: omkar-kumbhar.atlassian.net, project KAN
- GROQ API: generates ticket content via LLM
- Vercel: deployment target (key provided)
- React Vite: chosen stack (lightweight, fast, easy Vercel deploy)
- Theme: light only (no dark mode)

## Build notes
- GROQ model used: `llama3-70b-8192` (good balance for structured JSON output)
- Jira REST API endpoint: `/rest/api/2/issue` for creation, `/rest/api/2/myself` for auth test
- Auth is Basic Auth with base64(email:token)
- `.env` must use `VITE_` prefix for Vite to expose vars to client code
- Vercel env vars must be set in project dashboard (not committed)
- The app is a single-page React app with react-router for login/dashboard navigation
- Dist output: ~220KB JS (70KB gzipped), ~6.5KB CSS
