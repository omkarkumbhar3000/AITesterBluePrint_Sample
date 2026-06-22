export function encodeBasicAuth(email, token) {
  return btoa(`${email}:${token}`)
}

export async function testJiraConnection(jiraUrl, authHeader) {
  const url = `${jiraUrl.replace(/\/+$/, '')}/rest/api/2/myself`
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${authHeader}` },
  })
  if (!res.ok) {
    throw new Error(`Jira connection failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function createJiraIssue(jiraUrl, authHeader, projectKey, issueType, fields) {
  const url = `${jiraUrl.replace(/\/+$/, '')}/rest/api/2/issue`
  const body = {
    fields: {
      project: { key: projectKey },
      issuetype: { name: issueType },
      summary: fields.summary,
      description: fields.description,
      priority: fields.priority ? { name: fields.priority } : undefined,
      labels: fields.labels || [],
      ...(fields.customFields || {}),
    },
  }
  Object.keys(body.fields).forEach(k => body.fields[k] === undefined && delete body.fields[k])

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Jira create failed: ${res.status} — ${err}`)
  }
  return res.json()
}
