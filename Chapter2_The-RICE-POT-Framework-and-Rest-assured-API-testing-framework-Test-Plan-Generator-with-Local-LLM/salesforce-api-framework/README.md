# Salesforce API Automation Framework

Enterprise-grade API Automation Framework for Salesforce CRM APIs.

## Tech Stack

- **Java 21** — Language
- **Maven** — Build & dependency management
- **REST Assured 5.5.1** — Primary API testing engine
- **Playwright** — Secondary API client for Playwright-specific scenarios
- **TestNG 7.10.2** — Test runner with parallel execution
- **Jackson 2.17.2** — JSON serialization/deserialization
- **Lombok** — Boilerplate reduction
- **Log4j2** — Logging (request, response, error)
- **Allure Reports 2.27.0** — Rich test reporting with attachments
- **Extent Reports** — HTML dashboard
- **Apache POI** — Excel test data reader
- **JavaFaker** — Dynamic test data generation
- **AssertJ** — Fluent assertions

## Project Structure

```
src/
  main/java/com/salesforce/api/
    client/            BaseApiClient, AuthClient, SObjectClient, QueryClient
    config/            ConfigManager (environment-aware)
    constants/         APIConstants (endpoints)
    factory/           ClientFactory (singleton clients)
    models/            Request/Response POJOs
    utils/             DataGenerator, ExcelReader, JsonUtils
    validators/        ResponseValidator, SchemaValidator
    listeners/         AllureListener, ExtentReportListener
  test/java/com/salesforce/api/
    base/              BaseTest (setup, teardown, shared state)
    payloads/          Payload builders for test objects
    tests/
      positive/       Happy path and CRUD tests
      negative/       Error handling and validation tests
      security/       Auth, injection, data exposure tests
      integration/    E2E workflow and chained scenarios
  main/resources/
    app.properties     Base configuration
    environments/      Environment-specific properties (dev/qa/uat/prod)
    testng.xml         TestNG suite configuration
    schemas/           JSON schema files
ci/
  Jenkinsfile          Jenkins CI pipeline
.github/workflows/
  api-tests.yml        GitHub Actions workflow
```

## Prerequisites

- Java 21+
- Maven 3.9+
- Salesforce API credentials (username, password, client ID, client secret)

## Setup

1. Update `src/main/resources/environments/<env>.properties` with your Salesforce credentials
2. (Optional) Update `src/main/resources/app.properties` with base URI and API version

## Running Tests

```bash
# Run all tests on QA environment (default)
mvn clean test

# Run tests on specific environment
mvn clean test -Pdev
mvn clean test -Pqa
mvn clean test -Puat

# Run specific test group
mvn clean test -Dgroups=positive
mvn clean test -Dgroups=negative
mvn clean test -Dgroups=security
mvn clean test -Dgroups=integration

# Run with specific TestNG suite
mvn clean test -DsuiteXmlFile=src/main/resources/testng.xml
```

## Reports

```bash
# Generate and open Allure report
mvn allure:report
allure open target/site/allure-maven-plugin/index.html

# Extent report (auto-generated after test run)
open reports/extent-report.html
```

## CI/CD

- **Jenkins**: `ci/Jenkinsfile` — parameterized pipeline with environment and suite selection
- **GitHub Actions**: `.github/workflows/api-tests.yml` — triggered on push, PR, schedule, or manual dispatch

## Framework Patterns

- **Singleton Client Factory**: Thread-safe client instances with lazy initialization
- **Builder Pattern**: Request payloads built via Lombok `@Builder`
- **Page Object Model for API**: Each API domain has a dedicated client class
- **Environment-Aware Config**: Maven profiles select environment properties
- **Centralized Validation**: `ResponseValidator` for all assertions

## Security Tests

Security tests validate:
- Invalid/expired token rejection (401)
- Missing auth header rejection (401)
- SQL injection prevention in SOQL queries
- XSS injection handling in field values
- Sensitive data exposure in error responses
