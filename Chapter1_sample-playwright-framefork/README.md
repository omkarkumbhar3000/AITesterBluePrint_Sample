# Chapter 1: Playwright UI Automation Framework

Playwright Java test automation framework using Maven and JUnit 5.

## Tech Stack

- **Java 11** — Language
- **Maven** — Build & dependency management
- **Playwright** — Browser automation engine
- **JUnit 5** — Test runner
- **Page Object Model** — Maintainable design pattern

## Project Structure

```
├── pom.xml                    # Maven build config
├── CLAUDE.md                  # Framework guidance
├── playwright-e2e.SKILL.md    # Playwright skill definition
└── src/
    ├── main/java/
    └── test/java/
```

## Prerequisites

- Java 11+
- Maven 3.8+
- Application under test at `http://localhost:3000`

## Build & Test

```bash
mvn clean compile
mvn test -Dtest=LoginTest#shouldLoginWithValidCredentials
```

## Key Patterns

- **Locator Priority**: `getByLabel()` > `getByRole()` > CSS/XPath
- **Test Isolation**: Fresh browser contexts per test
- **Soft Assertions**: In page objects for detailed failure reports
