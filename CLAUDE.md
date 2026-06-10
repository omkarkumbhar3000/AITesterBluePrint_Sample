# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains multiple testing frameworks and tools organized by chapter:

1. **Chapter1_sample-playwright-framefork** - Playwright Java UI automation framework
2. **Chapter2_The-RICE-POT-Framework-and-Rest-assured-API-testing-framework-Test-Plan-Generator-with-Local-LLM** - Test plan generation system with Salesforce API automation framework
3. **Chapter3_BLAST Test cases Agent** - Test case generation skill from documents

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

### Test Plan/Case Generation (Chapter2 skills)
```bash
# Generate test plan from PRD
/test-plan-gen @PRD.txt

# Generate test cases from test plan  
/test-case-gen @testplanopencode.docx

# Generate API framework (REST Assured, Playwright, or Salesforce)
/gen-api-framework
```

### BLAST Test Case Agent (Chapter3)
Use the test-case-generator skill when provided with development documents to produce structured test cases.

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

### Chapter2: Test Generation System
- **Architecture**: Skill-based generation pipeline
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

### Chapter3: BLAST Test Case Agent
- **Purpose**: Generates ISTQB/ISO-compliant test cases from development documents
- **Output**: Markdown table format traceable to requirements
- **Techniques**: Equivalence partitioning, boundary value analysis, decision tables, state transition, error guessing
- **Quality Rules**: Atomic, independent, verifiable test cases with clear expected results

### Shared Infrastructure
- **.claude/**: Contains Claude Code permission settings (allows Bash access for claude plugin and git commands)
- **Maven**: Standard build tool across Java projects
- **TestNG/JUnit**: Test runners with reporting capabilities
- **Environment Configuration**: Properties files for different environments

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

### When Generating Test Artifacts (Chapter2/3)
- Always start with PRD.txt as source of truth
- Use /test-plan-gen to create test plan document
- Use /test-case-gen to create executable test cases
- For API automation, use /gen-api-framework to generate starter framework
- Validate generated test cases against requirements for traceability

### Cross-Chapter Considerations
- Each chapter is largely self-contained with its own build system
- Shared concepts: Maven build, test reporting, environment configuration
- Skills in .opencode/ directories are reusable across chapters
- When switching contexts, check for chapter-specific README/PRD files for setup instructions