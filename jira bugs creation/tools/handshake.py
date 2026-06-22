#!/usr/bin/env python3
"""Phase 2: Link — Verify Jira credentials and test API connection."""

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


def parse_env(path):
    """Parse non-standard .env (key = value format)."""
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
    print("B.L.A.S.T. — Phase 2: Link (Handshake)")
    print("=" * 60)

    if not os.path.exists(ENV_PATH):
        print(f"[FAIL] .env not found at {ENV_PATH}")
        sys.exit(1)

    creds = parse_env(ENV_PATH)

    jira_url = creds.get('jira_url', '')
    jira_email = creds.get('mail_id', '')
    jira_token = creds.get('jira_token', '')

    if not all([jira_url, jira_email, jira_token]):
        print("[FAIL] Missing one or more credentials in .env")
        print(f"  jira_url:  {'OK' if jira_url else 'MISS'}")
        print(f"  mail_id:   {'OK' if jira_email else 'MISS'}")
        print(f"  jira_token: {'OK' if jira_token else 'MISS'}")
        sys.exit(1)

    # Derive base API URL from the Jira URL
    m = re.match(r'https?://([^.]+)\.atlassian\.net', jira_url)
    if not m:
        print(f"[FAIL] Could not parse Jira instance from URL: {jira_url}")
        sys.exit(1)

    instance = m.group(1)
    base_api = f"https://{instance}.atlassian.net/rest/api/3"

    # Basic Auth
    auth_str = f"{jira_email}:{jira_token}"
    b64 = base64.b64encode(auth_str.encode()).decode()
    headers = {
        'Authorization': f'Basic {b64}',
        'Accept': 'application/json',
    }

    print(f"\n  Instance:    {instance}.atlassian.net")
    print(f"  Email:       {jira_email}")
    print(f"  Token:       {'***' + jira_token[-4:] if len(jira_token) > 4 else '***'}")
    print(f"  Project Key: KAN")
    print()

    # Test 1: Get project info
    print("[1/2] Testing authentication — GET /rest/api/3/project/KAN ...")
    try:
        req = urllib.request.Request(f"{base_api}/project/KAN", headers=headers, method='GET')
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            print(f"  [OK] Authenticated. Project: {data.get('name', 'Unknown')} (id={data.get('id', '?')})")
    except urllib.error.HTTPError as e:
        print(f"  [FAIL] HTTP {e.code}: {e.reason}")
        body = e.read().decode()
        print(f"    Response: {body[:300]}")
        sys.exit(1)
    except Exception as e:
        print(f"  [FAIL] {e}")
        sys.exit(1)

    # Test 2: Verify issue creation metadata
    print("[2/2] Checking issue type metadata for Bug issuetype ...")
    try:
        req = urllib.request.Request(
            f"{base_api}/issue/createmeta/KAN/issuetypes",
            headers=headers,
            method='GET'
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            bug_type = next((it for it in data.get('values', []) if it.get('name') == 'Bug'), None)
            if bug_type:
                print(f"  [OK] Bug issuetype available (id={bug_type.get('id')})")
            else:
                print(f"  [WARN] Bug issuetype not found. Available: {[it['name'] for it in data.get('values', [])]}")
    except urllib.error.HTTPError as e:
        # createmeta may not be available in all Jira plans, that's ok
        print(f"  [SKIP] HTTP {e.code} — not critical for create")
    except Exception as e:
        print(f"  [SKIP] {e}")

    print()
    print("=" * 60)
    print("Handshake complete. Jira connection is working.")
    print("=" * 60)
    return 0


if __name__ == '__main__':
    sys.exit(main())
