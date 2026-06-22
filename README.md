# AI Tester 3x

This repository contains multiple testing frameworks and AI-powered testing tools organized into chapters.

## Chapters

### Chapter 1: Playwright UI Automation Framework
- **Location**: `Chapter1_sample-playwright-framefork/`
- **Description**: Playwright Java test automation using Maven and JUnit 5. Page Object Model pattern for maintainable end-to-end tests.
- **Build**: `mvn clean compile && mvn test`
- **Note**: Requires app under test at `http://localhost:3000`

### Chapter 2: Test Plan Generation & API Framework
- **Location**: `Chapter2_The-RICE-POT-Framework-and-Rest-assured-API-testing-framework-Test-Plan-Generator-with-Local-LLM/`
- **Description**: OpenCode skills for test plan/test case generation + Salesforce REST Assured API automation framework.
- **Key Components**:
  - `.opencode/skills/` — Skills: `/test-plan-gen`, `/test-case-gen`, `/gen-api-framework`
  - `salesforce-api-framework/` — REST Assured framework for Salesforce CRUD APIs (Java 21, TestNG)
  - `AGENTS.md` — Restful Booker API quirks (418 teapot, DELETE→201, Basic Auth only)

### Chapter 3: BLAST Test Case Agent
- **Location**: `Chapter3_BLAST Test cases Agent/`
- **Description**: React Vite web app for mock test plan/case generation + BLAST skill definition.
- **Build**: `npm install && npm run dev` (default `:5173`)
- **Note**: Generation is mocked (simulated delay, no LLM call)

### Chapter 4: n8n AI Agents
- **Location**: `Chapter4_n8n_aiAgents/`
- **Status**: Placeholder (empty)

### Chapter 5: Langflow AI Agents
- **Location**: `Chapter5_langflow_aiAgents/`
- **Status**: Contains flakey test case execution reports only

### Chapter 6: Social Media Content Creation
- **Location**: `Chapter6_social media content creation/`
- **Status**: Placeholder (empty)

### Chapter 7: RAG
- **Location**: `Chapter7_RAG/`
- **Status**: Placeholder (empty)

### Chapter 8: MCP
- **Location**: `Chapter8_MCP/`
- **Status**: Placeholder (empty)

### Jira Ticket Buddy
- **Location**: `jira bugs creation/jira-ticket-buddy/`
- **Description**: React Vite app for generating Jira bug tickets using GROQ AI. Login + Dashboard UI with module and test-type selection. Creates tickets directly in Jira via REST API.
- **Build**: `npm install && npm run dev` (default `:5173`)
- **Deploy**: Vercel-ready with `vercel.json`

## Key Commands

| Directory | Command |
|---|---|
| `Chapter1_sample-playwright-framefork/` | `mvn clean test -Dtest=LoginTest#shouldLoginWithValidCredentials` |
| `Chapter2_*/salesforce-api-framework/` | `mvn clean test -Pqa -Dgroups=positive` |
| `Chapter3_*/test-generator-app/` | `npm install && npm run dev` |
| `jira bugs creation/jira-ticket-buddy/` | `npm install && npm run dev` |

## Repository Structure

```
AI Tester 3x/
├── Chapter1_sample-playwright-framefork/  # Playwright UI tests (Maven, JUnit 5)
├── Chapter2_*RICE-POT*/                   # OpenCode skills + Salesforce API framework
├── Chapter3_BLAST*/                       # React Vite mock test gen UI + BLAST skill
├── Chapter4_n8n_aiAgents/                 # Placeholder
├── Chapter5_langflow_aiAgents/            # Flakey test reports only
├── Chapter6_social media content creation/ # Placeholder
├── Chapter7_RAG/                          # Placeholder
├── Chapter8_MCP/                          # Placeholder
├── Project_Job_Tracker_AI/                # Resume files
├── jira bugs creation/                    # Jira config, BLAST framework, 30 sample tickets, Jira Ticket Buddy app
├── .claude/                               # Claude Code settings/git permissions
├── AGENTS.md                              # Quick-start guidance for agents
├── CLAUDE.md                              # Detailed commands & architecture
├── MEMORY.md                              # Index of memory/ files
├── memory/                                # Gitignored — stores tokens (GROQ, GitHub, etc.)
└── README.md                              # This file
```
