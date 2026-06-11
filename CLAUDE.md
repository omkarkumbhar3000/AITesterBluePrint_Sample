# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains multiple testing frameworks and tools organized by chapter:

1. **Chapter1_sample-playwright-framefork** - Playwright Java UI automation framework
2. **Chapter2_The-RICE-POT-Framework-and-Rest-assured-API-testing-framework-Test-Plan-Generator-with-Local-LLM** - Test plan generation system with Salesforce API automation framework and reusable skills for test plan/test case generation
3. **Chapter3_BLAST Test cases Agent** - Lightweight React Vite web application providing a UI for generating test plans and test cases (mock implementation); actual skill-based generation resides in Chapter2

## Common Commands

### Playwright UI Tests (Chapter1)
```bash
# Build the project
mvn clean compile

# Run all tests
mvn test

# Run a specific test
mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials

# Run tests with verbose output
mvn test -Dsurefire.useFile=false
```

### REST Assured API Tests (Chapter2/salesforce-api-framework)
```bash
# Run all tests (QA environment default)
mvn clean test

# Run tests on specific environment
mvn clean test -Pdev
mvn clean test -Pqa
mvn clean test -Puat
mvn clean test -Pprod

# Run specific test groups
mvn clean test -Dgroups=positive
mvn clean test -Dgroups=negative
mvn clean test -Dgroups=security
mvn clean test -Dgroups=integration

# Generate reports
mvn allure:report
allure open target/site/allure-maven-plugin/index.html
```

### Test Plan/Case Generation Skills (Chapter2 skills)
Reusable skills for generating test plans and test cases are located in:
`Chapter2_The-RICE-POT-Framework-and-Rest-assured-API-testing-framework-Test-Plan-Generator-with-Local-LLM/.opencode/skills/`

- **Test Plan Generator**: `/test-plan-gen @PRD_file`  
  Generates a comprehensive test plan document (.docx) from a PRD or requirements document.  
  Input: PRD file (PDF, DOC, DOCX, TXT)  
  Output: `testplanopencode.docx` (Microsoft Word document)

- **Test Case Generator**: `/test-case-gen @test_plan_or_prd_file`  
  Generates detailed test cases (.xlsx) from a test plan document or PRD.  
  Input: Test plan (.docx) or PRD file  
  Output: `testcasesopencode.xlsx` (Microsoft Excel workbook following General CRUD template)

- **API Framework Generator**: `/gen-api-framework`  
  Generates starter API testing frameworks (REST Assured, Playwright, or Salesforce) with three modes: reference patterns, framework generation, and CI/CD setup.

These skills can be invoked via Claude Code's slash command interface when the appropriate context is provided.

### BLAST Test Case Agent UI (Chapter3)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
The UI allows users to:
- Upload a PRD document (PDF, DOC, DOCX, TXT)
- Enter GROQ API key (stored in localStorage)
- Select test types (positive, negative, boundary value, equivalence partitioning, decision table, state transition)
- Generate mock test plan and test cases in markdown format
- Download generated artifacts

> **Note**: The UI in Chapter3 provides a mock implementation for demonstration. Actual skill-based test plan and test case generation is performed using the skills in Chapter2/.opencode/skills.

## Code Architecture

### Chapter1: Playwright Framework
- **Architecture**: Page Object Model with Maven + JUnit 5
- **Key Components**:
  - `BasePage.java`: Abstract base class with common Playwright actions
  - `LoginPage.java`: Concrete page object using Playwright's locator priority (getByLabel > getByRole > others)
  - `LoginTest.java`: JUnit 5 test class with browser lifecycle management
- **Patterns**:
  - Locator strategy following Playwright recommendations
  - Soft assertions in page objects
  - Test isolation with fresh browser contexts per test
  - Base URL configured in test setup

### Chapter2: Test Generation System & Salesforce API Framework
- **Architecture**: Skill-based generation pipeline (test plan/test case generation) + Salesforce REST Assured API automation framework
- **Key Components**:
  - `.opencode/skills/test-plan-generator/`: Creates test plans from PRDs
  - `.opencode/skills/test-case-generator/`: Creates test cases from test plans
  - `.opencode/skills/gen-api-framework/`: Generates API testing frameworks
  - `salesforce-api-framework/`: Generated REST Assured framework for Salesforce APIs
- **Salesforce Framework Structure**:
  - Client layer: BaseApiClient, AuthClient, SObjectClient, QueryClient (singleton factory)
  - Models: Request/Response POJOs
  - Utils: DataGenerator, ExcelReader, JsonUtils
  - Validators: ResponseValidator, SchemaValidator
  - Listeners: AllureListener, ExtentReportListener
  - Configuration: Environment-aware properties (dev/qa/uat/prod)

### Chapter3: BLAST Test Case Agent UI
- **Architecture**: React Vite application with state management via React hooks
- **Key Components**:
  - `App.jsx`: Main application component handling file upload, API key storage, test type selection, generation triggers
  - `App.css`: Styling with responsive design, gradient headers, card-based layout
  - `main.jsx`: Entry point
  - `index.css`: Global styles
- **Features**:
  - Mock test plan/test case generation (simulated API delay)
  - LocalStorage persistence for GROQ API key
  - File upload handling for PRD documents
  - Responsive layout adapting to mobile and desktop
  - Markdown output ready for import into test management tools
- **Current Limitations**:
  - Generation is mocked (does not invoke actual skills from Chapter2)
  - Output format is markdown only
  - UI alignment may need refinement per user feedback

### Shared Infrastructure
- **.claude/**: Contains Claude Code permission settings (allows Bash access for claude plugin and git commands)
- **.opencode/**: Reusable skills across chapters (test plan generation, test case generation, API framework generation)
- **Maven**: Standard build tool across Java projects (Chapters 1 and 2)
- **Vite/npm**: Build tool for Chapter3 UI
- **TestNG/JUnit**: Test runners with reporting capabilities
- **Environment Configuration**: Properties files for different environments (Chapter2)
- **Memory System**: 
  - `.claude/memory/`: Stores persistent facts as markdown files with frontmatter
  - `MEMORY.md`: Index file listing all memories for quick reference
  - Used to store user-provided tokens, environment variables, and project-specific facts

## Development Guidelines

### When Working with UI Tests (Chapter1)
- Update page objects when UI changes
- Follow Playwright's locator priority: getByLabel() > getByRole() > CSS/XPath
- Keep tests independent with fresh browser contexts
- Ensure application under test is running at http://localhost:3000 before executing tests

### When Working with API Tests (Chapter2)
- Update environment properties in src/main/resources/environments/ for credentials
- Use singleton client factory for thread-safe API clients
- Leverage built-in validation methods in ResponseValidator
- Generate reports using mvn allure:report or mvn extent:reports

### When Working with Generation Skills (Chapter2)
- Always start with PRD.txt as source of truth
- Use /test-plan-gen to create test plan document (.docx)
- Use /test-case-gen to create executable test cases (.xlsx)
- For API automation, use /gen-api-framework to generate starter framework
- Validate generated test cases against requirements for traceability

### When Working with BLAST Test Case Agent UI (Chapter3)
- The app is lightweight and built with modern React/Vite stack
- To extend functionality:
  - Replace mock generation with actual skill invocations from Chapter2/.opencode/skills
  - Modify output format generators to produce Word (.docx) or Excel (.xlsx) as desired
  - Enhance UI with animations, improved alignment, and creative visual elements
  - Persist additional configuration beyond GROQ key (e.g., default test types, output preferences)
- Maintain responsiveness and performance when adding features
- Follow existing code style and component structure

### Cross-Chapter Considerations
- Each chapter is largely self-contained with its own build system
- Shared concepts: Maven build (Ch1/C2), Vite/npm build (C3), test reporting, environment configuration
- Skills in .opencode/ directories are reusable across chapters
- When switching contexts, check for chapter-specific README/PRD files for setup instructions
- The UI in Chapter3 serves as a frontend for the generation skills in Chapter2; integration would provide a seamless end-to-end experience