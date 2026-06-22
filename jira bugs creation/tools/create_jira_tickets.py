#!/usr/bin/env python3
"""Phase 3: Architect — Create 30 Jira bug tickets for Login & Dashboard modules."""

import base64
import json
import os
import re
import sys
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ENV_PATH = os.path.join(PROJECT_DIR, '.env')
SUMMARY_PATH = os.path.join(PROJECT_DIR, 'summary.md')

TICKETS = [
    # ── Login Module (15) ──────────────────────────────────────────
    {
        "module": "Login", "type": "Positive",
        "summary": "Valid user login with correct credentials redirects to dashboard",
        "desc": "Verify that a user with valid credentials can successfully log in and is redirected to the dashboard.",
        "preconds": "User is registered with valid credentials in the system",
        "steps": ["Navigate to login page", "Enter valid username", "Enter valid password", "Click Login button"],
        "expected": "User is redirected to the dashboard page with welcome message",
        "actual": "After clicking Login, page redirects to /dashboard but welcome message is truncated",
        "priority": "Highest", "severity": "Critical",
        "labels": ["login", "authentication", "positive", "critical"]
    },
    {
        "module": "Login", "type": "Positive",
        "summary": "Login with Remember Me preserves session across browser restart",
        "desc": "Verify that checking Remember Me during login persists the authentication token across browser sessions.",
        "preconds": "User has valid credentials, browser cookies enabled",
        "steps": ["Navigate to login page", "Enter valid credentials", "Check 'Remember Me' checkbox", "Click Login", "Close and reopen browser", "Navigate to dashboard URL"],
        "expected": "User remains authenticated and dashboard loads without re-login",
        "actual": "After reopening browser, user is prompted to log in again — session cookie not persisted",
        "priority": "High", "severity": "Major",
        "labels": ["login", "remember-me", "session", "functional"]
    },
    {
        "module": "Login", "type": "Negative",
        "summary": "Login with invalid username shows appropriate error",
        "desc": "Verify that entering a non-existent username displays a clear error message without revealing whether the username exists.",
        "preconds": "User is on login page",
        "steps": ["Navigate to login page", "Enter non-existent username", "Enter any password", "Click Login"],
        "expected": "Error message 'Invalid username or password' displayed, user stays on login page",
        "actual": "Error message shows 'Username not found' revealing valid usernames",
        "priority": "High", "severity": "Major",
        "labels": ["login", "authentication", "negative", "security"]
    },
    {
        "module": "Login", "type": "Negative",
        "summary": "Login with invalid password shows appropriate error",
        "desc": "Verify that entering a wrong password for a valid username displays a generic error.",
        "preconds": "User has valid username, is on login page",
        "steps": ["Navigate to login page", "Enter valid username", "Enter incorrect password", "Click Login"],
        "expected": "Error message 'Invalid username or password' displayed",
        "actual": "Error message displays 'Password incorrect' revealing which field is wrong",
        "priority": "High", "severity": "Major",
        "labels": ["login", "authentication", "negative", "security"]
    },
    {
        "module": "Login", "type": "Negative",
        "summary": "Login with empty username and password shows validation errors",
        "desc": "Verify that submitting the login form with both fields empty triggers field-level validation.",
        "preconds": "User is on login page",
        "steps": ["Navigate to login page", "Leave username field empty", "Leave password field empty", "Click Login button"],
        "expected": "Inline validation errors: 'Username is required' and 'Password is required'. Form not submitted.",
        "actual": "Form submits and page refreshes with generic 'Please fill all fields' message — no inline validation",
        "priority": "Medium", "severity": "Major",
        "labels": ["login", "validation", "negative", "ui"]
    },
    {
        "module": "Login", "type": "Negative",
        "summary": "SQL injection in username field is rejected",
        "desc": "Verify that SQL injection attempts in the username field are sanitized and rejected.",
        "preconds": "User is on login page",
        "steps": ["Navigate to login page", "Enter SQL injection string in username", "Enter any password", "Click Login"],
        "expected": "Input is sanitized, login fails with generic error, no SQL error leaked",
        "actual": "Page displays database error with SQL query snippet in the response",
        "priority": "Highest", "severity": "Critical",
        "labels": ["login", "security", "negative", "sql-injection", "critical"]
    },
    {
        "module": "Login", "type": "Boundary",
        "summary": "Username maximum length boundary (50 characters) truncation issue",
        "desc": "Verify that a username at the maximum allowed length (50 chars) is handled correctly without truncation or error.",
        "preconds": "User is on login page, a 50-char username exists in system",
        "steps": ["Navigate to login page", "Enter username of exactly 50 characters", "Enter valid password", "Click Login"],
        "expected": "Login succeeds, username displayed in full on dashboard",
        "actual": "Login succeeds but username is truncated to 40 characters on dashboard display",
        "priority": "Medium", "severity": "Minor",
        "labels": ["login", "boundary", "username", "ui"]
    },
    {
        "module": "Login", "type": "Boundary",
        "summary": "Username minimum length boundary (1 character) login fails",
        "desc": "Verify that a single-character username is handled according to system requirements.",
        "preconds": "User is on login page",
        "steps": ["Navigate to login page", "Enter single character as username", "Enter valid password", "Click Login"],
        "expected": "System either accepts 1-char username or shows 'Minimum 3 characters required' validation",
        "actual": "Form accepts 1 character without validation but login fails with unclear error",
        "priority": "Low", "severity": "Minor",
        "labels": ["login", "boundary", "username", "validation"]
    },
    {
        "module": "Login", "type": "Boundary",
        "summary": "Password maximum length boundary (128 characters) fails silently",
        "desc": "Verify that a password at maximum length (128 chars) is accepted without truncation.",
        "preconds": "User is on login page, valid username exists",
        "steps": ["Navigate to login page", "Enter valid username", "Enter password of exactly 128 characters (valid)", "Click Login"],
        "expected": "Password accepted, login succeeds",
        "actual": "Password field truncates input at 100 characters without warning, login fails",
        "priority": "High", "severity": "Major",
        "labels": ["login", "boundary", "password", "validation"]
    },
    {
        "module": "Login", "type": "Boundary",
        "summary": "Password minimum length boundary (6 characters) not enforced",
        "desc": "Verify that a password below minimum length (less than 6 chars) triggers validation.",
        "preconds": "User is on login page",
        "steps": ["Navigate to login page", "Enter valid username", "Enter 4-character password", "Click Login"],
        "expected": "Validation error: 'Password must be at least 6 characters'",
        "actual": "Form accepts and submits the short password, no validation error shown",
        "priority": "Medium", "severity": "Major",
        "labels": ["login", "boundary", "password", "validation"]
    },
    {
        "module": "Login", "type": "Functional",
        "summary": "Session timeout after inactivity redirects to login page",
        "desc": "Verify that an idle session expires after the configured timeout period and redirects to login.",
        "preconds": "User is logged in and on dashboard",
        "steps": ["Log in successfully", "Remain idle for the session timeout duration (e.g., 30 min)", "Click any link on dashboard"],
        "expected": "User is redirected to login page with message 'Session expired. Please log in again.'",
        "actual": "Page becomes unresponsive after timeout, no redirect — user must manually refresh",
        "priority": "High", "severity": "Major",
        "labels": ["login", "session", "timeout", "functional"]
    },
    {
        "module": "Login", "type": "Functional",
        "summary": "Multiple failed login attempts trigger temporary account lockout",
        "desc": "Verify that repeated failed login attempts lock the account temporarily as a security measure.",
        "preconds": "Valid username exists in the system, incorrect password known",
        "steps": ["Navigate to login page", "Attempt login with wrong password 5 times consecutively", "On 6th attempt, use correct password"],
        "expected": "After 5 failed attempts, account is locked for 15 minutes. 6th attempt with correct password fails with 'Account temporarily locked' message.",
        "actual": "No lockout mechanism — 6th attempt with correct password succeeds immediately",
        "priority": "High", "severity": "Major",
        "labels": ["login", "security", "lockout", "functional"]
    },
    {
        "module": "Login", "type": "Functional",
        "summary": "Logout button terminates session and clears cached data",
        "desc": "Verify that clicking Logout ends the session and prevents access to authenticated pages via browser back.",
        "preconds": "User is logged in and on dashboard",
        "steps": ["Click Logout button", "Click browser back button"],
        "expected": "User is logged out and redirected to login page. Browser back does not reveal cached dashboard.",
        "actual": "Logout works but pressing browser back shows cached dashboard page for 2 seconds before redirect",
        "priority": "Medium", "severity": "Major",
        "labels": ["login", "logout", "session", "functional"]
    },
    {
        "module": "Login", "type": "UI",
        "summary": "Password field does not mask characters visibly",
        "desc": "Verify that the password input field masks characters to prevent shoulder-surfing.",
        "preconds": "User is on login page",
        "steps": ["Navigate to login page", "Type any text in the password field"],
        "expected": "Characters are masked as bullets or asterisks",
        "actual": "Password field shows plain text characters, no masking applied",
        "priority": "Medium", "severity": "Minor",
        "labels": ["login", "ui", "password", "security"]
    },
    {
        "module": "Login", "type": "UI",
        "summary": "Login page does not scale correctly on mobile viewport (375px)",
        "desc": "Verify that the login page renders correctly on mobile screen sizes.",
        "preconds": "Mobile browser or viewport set to 375px width",
        "steps": ["Open login page on mobile viewport", "Observe layout and element positioning"],
        "expected": "All elements are visible, properly spaced, and buttons are tappable without zooming",
        "actual": "Login button extends beyond viewport, form fields overlap on 375px width",
        "priority": "Low", "severity": "Minor",
        "labels": ["login", "ui", "responsive", "mobile"]
    },
    # ── Dashboard Module (15) ──────────────────────────────────────
    {
        "module": "Dashboard", "type": "Positive",
        "summary": "Dashboard loads all default widgets correctly",
        "desc": "Verify that the dashboard page loads with all configured default widgets displayed.",
        "preconds": "User is logged in with standard user role",
        "steps": ["Log in with valid credentials", "Navigate to dashboard URL"],
        "expected": "Dashboard loads with all default widgets: Summary Stats, Recent Activity, Notifications, Quick Actions",
        "actual": "Dashboard loads but 'Recent Activity' widget shows spinner indefinitely",
        "priority": "High", "severity": "Critical",
        "labels": ["dashboard", "widgets", "positive", "critical"]
    },
    {
        "module": "Dashboard", "type": "Positive",
        "summary": "Dashboard data refreshes after performing an action",
        "desc": "Verify that dashboard widgets update to reflect data changes after a user action.",
        "preconds": "User is logged in, dashboard displays initial data",
        "steps": ["Note current count in Summary Stats widget", "Perform an action that changes data (e.g., create a record)", "Return to dashboard and observe updated stats"],
        "expected": "Summary Stats widget updates to reflect the newly created record",
        "actual": "Dashboard shows stale data — requires manual page refresh to see the new record count",
        "priority": "High", "severity": "Major",
        "labels": ["dashboard", "data", "refresh", "positive"]
    },
    {
        "module": "Dashboard", "type": "Negative",
        "summary": "Dashboard displays graceful empty state when no data exists",
        "desc": "Verify that the dashboard handles the empty data state with a user-friendly message instead of errors or blank sections.",
        "preconds": "New user account with no data in the system",
        "steps": ["Log in with a newly created account with zero records", "Observe dashboard widgets"],
        "expected": "Each widget shows 'No data available' or a friendly empty state illustration",
        "actual": "Some widgets show 'Error loading data' while others display empty boxes with no message",
        "priority": "Medium", "severity": "Major",
        "labels": ["dashboard", "empty-state", "negative", "ui"]
    },
    {
        "module": "Dashboard", "type": "Negative",
        "summary": "Unauthorized user accessing dashboard via direct URL is blocked",
        "desc": "Verify that a user without dashboard permission cannot access the dashboard via direct URL.",
        "preconds": "User with restricted role (e.g., Viewer-only) logged in",
        "steps": ["Log in with restricted role user", "Enter dashboard URL directly in browser address bar"],
        "expected": "Access denied page or redirect to home with 'Insufficient permissions' message",
        "actual": "Page loads partially but widgets show 'Access Denied' errors in place of content",
        "priority": "High", "severity": "Critical",
        "labels": ["dashboard", "security", "authorization", "negative", "critical"]
    },
    {
        "module": "Dashboard", "type": "Negative",
        "summary": "Backend API timeout shows user-friendly error on dashboard",
        "desc": "Verify that when the backend API is unreachable, the dashboard displays a friendly error message.",
        "preconds": "Backend API service is stopped or network disconnected",
        "steps": ["Log in while backend API is down", "Observe dashboard loading behavior"],
        "expected": "Dashboard shows 'Service temporarily unavailable. Please try again later.' with retry button",
        "actual": "Dashboard shows raw error JSON in a white box with no actionable message",
        "priority": "High", "severity": "Major",
        "labels": ["dashboard", "error-handling", "api", "negative"]
    },
    {
        "module": "Dashboard", "type": "Boundary",
        "summary": "Dashboard search field accepts maximum 200 characters — truncation issue",
        "desc": "Verify that the dashboard search field handles input at maximum character limit correctly.",
        "preconds": "User is logged in, search field is visible",
        "steps": ["Click on dashboard search bar", "Enter a query of exactly 200 characters", "Execute search"],
        "expected": "Search executes with full 200-character query, results shown or 'No results' message",
        "actual": "Search truncates query at 150 characters without indicating truncation, returns mismatched results",
        "priority": "Medium", "severity": "Minor",
        "labels": ["dashboard", "search", "boundary", "validation"]
    },
    {
        "module": "Dashboard", "type": "Boundary",
        "summary": "Date range filter with invalid date boundary (year 1900) accepted",
        "desc": "Verify that date range filter rejects clearly invalid dates outside expected range.",
        "preconds": "User is logged in, date filter widget is visible",
        "steps": ["Open date range filter on dashboard", "Set Start Date to 01/01/1900", "Set End Date to today", "Apply filter"],
        "expected": "Validation error: 'Start date must be after 01/01/2000' or similar boundary check",
        "actual": "Filter accepts year 1900, returns empty results with no explanation",
        "priority": "Low", "severity": "Minor",
        "labels": ["dashboard", "filter", "boundary", "date", "validation"]
    },
    {
        "module": "Dashboard", "type": "Boundary",
        "summary": "Pagination with 1000+ records — page navigation slows down",
        "desc": "Verify that pagination handles large datasets (1000+ records) without performance degradation.",
        "preconds": "Dashboard list view contains 1000+ records",
        "steps": ["Navigate to list view with 1000+ records", "Click page 50", "Click 'Last Page'"],
        "expected": "Page loads within 3 seconds, navigation is smooth",
        "actual": "Page takes 8+ seconds to load page 50, 'Last Page' shows loading spinner for 15 seconds",
        "priority": "Medium", "severity": "Major",
        "labels": ["dashboard", "pagination", "boundary", "performance"]
    },
    {
        "module": "Dashboard", "type": "Functional",
        "summary": "Widget visibility respects user role permissions",
        "desc": "Verify that widgets are shown/hidden according to the logged-in user's role permissions.",
        "preconds": "Two user accounts: Admin and Viewer",
        "steps": ["Log in as Admin — note visible widgets", "Log out", "Log in as Viewer — compare visible widgets"],
        "expected": "Admin sees all widgets including Admin Panel. Viewer does not see Admin Panel or sensitive data widgets.",
        "actual": "Viewer sees Admin Panel widget but gets 'Access Denied' when clicking it",
        "priority": "High", "severity": "Critical",
        "labels": ["dashboard", "role-based", "authorization", "functional", "critical"]
    },
    {
        "module": "Dashboard", "type": "Functional",
        "summary": "Sidebar navigation links redirect to correct pages",
        "desc": "Verify that all navigation links in the dashboard sidebar lead to the correct pages.",
        "preconds": "User is logged in and on dashboard",
        "steps": ["Click each link in the sidebar navigation", "Verify the URL and page content for each"],
        "expected": "Each link redirects to the corresponding page with correct content and breadcrumb",
        "actual": "'Settings' link redirects to a blank page with no content or error message",
        "priority": "High", "severity": "Major",
        "labels": ["dashboard", "navigation", "functional"]
    },
    {
        "module": "Dashboard", "type": "Functional",
        "summary": "Dashboard search filter returns mismatched results for partial matches",
        "desc": "Verify that the search filter accurately returns results matching the query string.",
        "preconds": "Dashboard contains records with names 'Project Alpha', 'Project Beta', 'Task Alpha'",
        "steps": ["Enter 'Alpha' in search filter", "Observe returned results"],
        "expected": "Results include both 'Project Alpha' and 'Task Alpha' (partial match across fields)",
        "actual": "Search only returns exact matches — 'Task Alpha' is missing from results",
        "priority": "Medium", "severity": "Major",
        "labels": ["dashboard", "search", "filter", "functional"]
    },
    {
        "module": "Dashboard", "type": "Functional",
        "summary": "Dashboard refresh button does not update widget data",
        "desc": "Verify that the manual refresh button updates all widget data on the dashboard.",
        "preconds": "User is logged in, data changes have been made externally",
        "steps": ["Note current values on dashboard widgets", "Click the Refresh button", "Observe widget values"],
        "expected": "All widgets refresh with latest data from the server",
        "actual": "Clicking Refresh does nothing — only widgets that auto-refresh show updated data",
        "priority": "Medium", "severity": "Major",
        "labels": ["dashboard", "refresh", "functional"]
    },
    {
        "module": "Dashboard", "type": "UI",
        "summary": "Dashboard layout breaks on 1024px tablet viewport",
        "desc": "Verify that the dashboard is responsive and displays correctly on tablet-sized screens.",
        "preconds": "Browser viewport set to 1024px width (tablet portrait)",
        "steps": ["Open dashboard on 1024px viewport", "Observe widget grid layout"],
        "expected": "Widgets reflow into 2-column grid, all content accessible without horizontal scrolling",
        "actual": "Widgets overlap and 3-column layout persists causing horizontal scroll",
        "priority": "Medium", "severity": "Minor",
        "labels": ["dashboard", "ui", "responsive", "tablet"]
    },
    {
        "module": "Dashboard", "type": "UI",
        "summary": "Dashboard chart widgets display incorrect color contrast for accessibility",
        "desc": "Verify that chart colors meet WCAG AA contrast ratio standards for accessibility.",
        "preconds": "User is logged in, dashboard has chart widgets with data",
        "steps": ["Observe color scheme of pie chart and bar graph widgets", "Check contrast ratios using dev tools"],
        "expected": "All chart colors meet WCAG AA contrast ratio of at least 4.5:1 for text and 3:1 for graphics",
        "actual": "Light yellow (#FFF3CD) on white background in bar chart has contrast ratio of 1.2:1 — fails WCAG AA",
        "priority": "Low", "severity": "Minor",
        "labels": ["dashboard", "ui", "accessibility", "charts"]
    },
    {
        "module": "Dashboard", "type": "UI",
        "summary": "Dashboard data table column resizing resets after page refresh",
        "desc": "Verify that user-customized column widths in data tables persist across page refreshes.",
        "preconds": "User is logged in with a data table on dashboard",
        "steps": ["Resize a column in the data table", "Refresh the page", "Observe column width"],
        "expected": "Custom column width is preserved after page refresh (saved to user preferences)",
        "actual": "Column width resets to default after page refresh",
        "priority": "Low", "severity": "Trivial",
        "labels": ["dashboard", "ui", "table", "persistence"]
    },
]


def make_adf_description(ticket):
    """Build Atlassian Document Format description."""
    lines = [
        f"Description: {ticket['desc']}",
        "",
        f"Preconditions: {ticket['preconds']}",
        "",
        "Steps to Reproduce:",
    ]
    for i, step in enumerate(ticket['steps'], 1):
        lines.append(f"{i}. {step}")
    lines.extend([
        "",
        f"Expected Result: {ticket['expected']}",
        "",
        f"Actual Result: {ticket['actual']}",
    ])
    return {
        "type": "doc",
        "version": 1,
        "content": [
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": line}]
            }
            for line in lines
        ]
    }


def parse_env(path):
    """Parse non-standard .env format."""
    creds = {}
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            m = re.match(r'^([^=]+?)\s*=\s*(.+)$', line)
            if m:
                key = m.group(1).strip().lower().replace(' ', '_')
                val = m.group(2).strip()
                creds[key] = val
    return creds


def main():
    print("=" * 60)
    print("B.L.A.S.T. — Phase 3: Architect (Create 30 Tickets)")
    print("=" * 60)

    # Load credentials
    creds = parse_env(ENV_PATH)
    jira_url = creds.get('jira_url', '')
    jira_email = creds.get('mail_id', '')
    jira_token = creds.get('jira_token', '')

    m = re.match(r'https?://([^.]+)\.atlassian\.net', jira_url)
    if not m:
        print("[FAIL] Could not parse Jira instance from URL")
        sys.exit(1)
    instance = m.group(1)
    base_api = f"https://{instance}.atlassian.net/rest/api/3"

    auth_str = f"{jira_email}:{jira_token}"
    b64 = base64.b64encode(auth_str.encode()).decode()
    headers = {
        'Authorization': f'Basic {b64}',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }

    created = []
    failed = []

    for i, ticket in enumerate(TICKETS, 1):
        summary = f"[Bug] {ticket['summary']}"
        labels = ticket['labels'] + [ticket['module'].lower(), ticket['type'].lower()]

        payload = {
            "fields": {
                "project": {"key": "KAN"},
                "issuetype": {"name": "Bug"},
                "summary": summary,
                "description": make_adf_description(ticket),
                "priority": {"name": ticket['priority']},
                "labels": labels,
            }
        }

        # Add environment field if present
        if ticket.get('environment'):
            payload['fields']['environment'] = ticket['environment']

        print(f"\n[{i:02d}/30] Creating: {summary[:70]}...")
        try:
            req = urllib.request.Request(
                f"{base_api}/issue",
                data=json.dumps(payload).encode(),
                headers=headers,
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode())
                key = result.get('key', '?')
                print(f"  -> Created: {key}")
                created.append({"key": key, "summary": summary, "module": ticket['module']})
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"  -> FAILED (HTTP {e.code}): {body[:200]}")
            failed.append({"summary": summary, "error": f"HTTP {e.code}: {body[:100]}"})
            # Stop on first failure per behavioral rules
            break
        except Exception as e:
            print(f"  -> FAILED: {e}")
            failed.append({"summary": summary, "error": str(e)})
            break

    # Write summary
    print("\n" + "=" * 60)
    print(f"Created: {len(created)}, Failed: {len(failed)}")

    with open(SUMMARY_PATH, 'w', encoding='utf-8') as f:
        f.write("# Jira Bug Tickets — Summary\n\n")
        f.write(f"**Project:** KAN  \n")
        f.write(f"**Total Created:** {len(created)}  \n")
        f.write(f"**Failed:** {len(failed)}  \n\n")

        if created:
            f.write("| # | Key | Module | Summary |\n")
            f.write("|---|---|---|---|\n")
            for idx, t in enumerate(created, 1):
                f.write(f"| {idx} | {t['key']} | {t['module']} | {t['summary']} |\n")

        if failed:
            f.write("\n## Failed\n\n")
            for t in failed:
                f.write(f"- {t['summary']}: {t['error']}\n")

    print(f"Summary written to: {SUMMARY_PATH}")
    print("=" * 60)
    return 0 if not failed else 1


if __name__ == '__main__':
    sys.exit(main())
