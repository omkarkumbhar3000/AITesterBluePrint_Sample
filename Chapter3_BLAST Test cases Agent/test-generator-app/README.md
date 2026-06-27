# BLAST Test Case Agent

React Vite web application providing a UI for generating test plans and test cases (mock implementation).

## Description

This app provides a frontend interface for:
- Uploading PRD documents (PDF, DOC, DOCX, TXT)
- Selecting test types (positive, negative, boundary value, equivalence partitioning, decision table, state transition)
- Generating mock test plans and test cases in markdown format
- Downloading generated artifacts

> **Note**: Generation is currently mocked (simulated delay, no actual LLM call). Integration with the Chapter2 OpenCode skills is planned.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build

```bash
npm run build
npm run lint
```

## Tech Stack

- React 18 + Vite
- JavaScript (JSX)
- ESLint (flat config)
- localStorage for API key persistence
