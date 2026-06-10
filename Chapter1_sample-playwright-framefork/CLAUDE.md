# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright Java test automation project using Maven and JUnit 5. It follows the Page Object Model pattern for maintainable end-to-end tests.

## Common Commands

### Build and Test
- **Build the project**: `mvn clean compile`
- **Run all tests**: `mvn test`
- **Run a single test**: `mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials`
- **Run tests with verbose output**: `mvn test -Dsurefire.useFile=false`

### Development Workflow
1. Create/modify page objects in `src/main/java/pages/`
2. Write/modify test cases in `src/test/java/tests/`
3. Run tests frequently during development
4. Update locators in page objects when UI changes

## Code Architecture

### Page Object Model
- **BasePage.java**: Abstract base class encapsulating common page actions (navigation, waiting, title retrieval)
- **LoginPage.java**: Concrete page object for the login page using Playwright's recommended locator priority:
  1. `getByLabel()` for form inputs (highest priority)
  2. `getByRole()` for buttons, links, and alerts
  3. Other locators as needed

### Test Structure
- **LoginTest.java**: JUnit 5 test class with:
  - `@BeforeAll`/`@AfterAll`: Browser lifecycle management
  - `@BeforeEach`/`@AfterEach`: Test isolation with fresh browser contexts
  - Three test methods covering:
    - Valid login credentials
    - Invalid login credentials (error message validation)
    - Forgot password navigation

### Key Patterns
- **Locator Strategy**: Follows Playwright's recommended priority for resilient selectors
- **Soft Assertions**: Custom validation methods in page objects (e.g., `expectErrorMessage`)
- **Test Isolation**: Each test gets a fresh browser context
- **Base URL**: Configured in test setup (`http://localhost:3000`)

## Locator Guidelines
When updating or creating locators:
1. Prefer `getByLabel()` for form inputs
2. Use `getByRole()` for buttons, links, headings, and alerts
3. Avoid brittle selectors like CSS/XPath when possible
4. Make locators private final in page objects
5. Initialize locators in constructor using the provided Page instance

## Running Tests Locally
**Important**: The application under test must be running at `http://localhost:3000` before executing tests. The tests will fail with connection refused errors if the application is not available.

**To run tests successfully**:
1. Start your application under test (e.g., using `npm start`, `docker-compose up`, or your application's start command)
2. Verify it's accessible at `http://localhost:3000`
3. Then run: `mvn test`

**For CI/CD or automated environments**:
- Configure your build pipeline to start the application before running tests
- Use Maven plugins like `exec-maven-plugin` or `maven-failsafe-plugin` to manage application lifecycle
- Consider using testcontainers or similar tools for containerized test environments

The current test configuration assumes the application is already running at the base URL defined in LoginTest.java (line 26).

## Maintenance
- Update `playwright.version` and `junit.jupiter.version` in pom.xml when upgrading
- Modify BasePage.java when adding common page actions
- Extend LoginPage.java or create new page objects for additional pages
- Add new test methods in LoginTest.java or create new test classes as needed