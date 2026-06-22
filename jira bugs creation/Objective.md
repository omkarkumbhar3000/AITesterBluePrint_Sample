# Objective

## Overview
Create a minimum of **30 sample Jira Bug Tickets** for **dummy validation and testing purposes**. The tickets should be generated for the **Login** and **Dashboard** modules and should cover a combination of **Positive**, **Negative**, **Boundary Value**, and other functional test scenarios.

## Goal
Automatically create Jira bug tickets using the Jira credentials and configuration details available in the **`.env`** file, including:

- Jira URL
- Jira Email ID
- Jira Access Token
- Project Key (if applicable)

## Scope

### Login Module
Create bug tickets covering:

- Valid login scenarios
- Invalid username validation
- Invalid password validation
- Empty field validation
- Username boundary value validation
- Password boundary value validation
- Special character validation
- Session timeout scenarios
- Remember Me functionality
- Authentication and authorization validations

### Dashboard Module
Create bug tickets covering:

- Dashboard page loading validation
- Widget visibility validation
- Data rendering validation
- Navigation functionality validation
- Role-based access validation
- Search and filter validation
- Refresh functionality validation
- UI responsiveness validation
- Boundary value scenarios
- Error handling scenarios

## Ticket Requirements

Each Jira bug ticket should contain the following fields:

- Issue Type: Bug
- Summary (Title)
- Description
- Preconditions (if applicable)
- Steps to Reproduce
- Expected Result
- Actual Result
- Priority
- Severity
- Labels
- Module Name
- Environment (if required)

## Distribution

Create a minimum of **30 Jira Bug Tickets** distributed across:

| Module | Minimum Tickets |
|----------|----------------|
| Login | 15 |
| Dashboard | 15 |
| Total | 30 |

The tickets should include a balanced mix of:

- Positive Test Scenarios
- Negative Test Scenarios
- Boundary Value Test Scenarios
- Functional Validation Scenarios
- UI Validation Scenarios

## Implementation Requirements

- Read all Jira configuration values from the `.env` file.
- Do not hardcode credentials or Jira configuration values.
- Validate Jira authentication before ticket creation.
- Create tickets programmatically using the Jira REST API.
- Log ticket creation status and generated Jira issue keys.
- Handle API failures gracefully with proper error messages.

## Expected Outcome

- Minimum 30 Jira Bug Tickets created successfully.
- Tickets available in the configured Jira project.
- Complete bug details populated for each ticket.
- Coverage of Login and Dashboard modules with positive, negative, and boundary value scenarios.
- Secure usage of Jira credentials through environment variables.