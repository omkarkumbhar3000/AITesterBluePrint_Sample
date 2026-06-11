# AI Tester 3x

This repository contains multiple testing frameworks and AI-powered testing tools organized into chapters:

## Chapters

### Chapter 1: Playwright UI Automation Framework
- **Location**: `Chapter1_sample-playwright-framefork/`
- **Description**: A Playwright Java test automation project using Maven and JUnit 5. Follows the Page Object Model pattern for maintainable end-to-end tests.
- **Key Features**:
  - Page Object Model architecture
  - Playwright's recommended locator strategies
  - JUnit 5 test structure with browser lifecycle management
  - Soft assertions and test isolation

### Chapter 2: Test Plan Generation & API Framework
- **Location**: `Chapter2_The-RICE-POT-Framework-and-Rest-assured-API-testing-framework-Test-Plan-Generator-with-Local-LLM/`
- **Description**: A test plan generation system that includes:
  - Test plan and test case generation skills
  - Salesforce API automation framework (REST Assured-based)
  - PRD documentation for Restful Booker API testing
- **Key Components**:
  - `.opencode/skills/` - Skills for generating test plans, test cases, and API frameworks
  - `salesforce-api-framework/` - Enterprise-grade API automation framework for Salesforce CRM APIs

### Chapter 3: BLAST Test Case Agent
- **Location**: `Chapter3_BLAST Test cases Agent/`
- **Description**: A test case generation skill that creates comprehensive, production-level test cases from development documents, user stories, BRDs, feature specs, or acceptance criteria.
- **Key Features**:
  - ISTQB- and ISO/IEC 29119-compliant test case generation
  - Supports various test design techniques (equivalence partitioning, boundary value analysis, decision tables, state transition, error guessing)
  - Outputs production-ready markdown tables compatible with Jira, TestRail, and Zephyr

## Shared Infrastructure

- **.claude/** - Claude Code permission settings
- **Maven** - Standard build tool used across Java projects
- **Environment Configuration** - Properties files for different environments (dev/qa/uat/prod)

## Getting Started

Each chapter is largely self-contained with its own specific setup instructions. Please refer to the respective chapter directories for detailed README files and setup instructions.

## Common Commands

See `CLAUDE.md` in the root directory for comprehensive guidance on:
- Building and running tests for each framework
- Using the test generation skills
- Development workflows for each chapter
- Code architecture and patterns

## Repository Structure

```
AI Tester 3x/
├── Chapter1_sample-playwright-framefork/          # Playwright UI tests
├── Chapter2_The-RICE-POT-Framework-and-Rest-assured-API-testing-framework-Test-Plan-Generator-with-Local-LLM/  # Test generation + API framework
├── Chapter3_BLAST Test cases Agent/               # Test case generation skill
├── .claude/                                       # Claude Code settings
├── .git                                           # Git repository
├── .gitignore                                     # Git ignore rules
├── CLAUDE.md                                      # Claude Code guidance
└── README.md                                        # This file
```
```