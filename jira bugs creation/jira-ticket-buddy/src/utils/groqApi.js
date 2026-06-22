const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const TEST_TYPE_MAP = {
  positive: 'Positive', negative: 'Negative', boundary: 'Boundary Value',
  equivalence: 'Equivalence Partitioning', decisionTable: 'Decision Table',
  stateTransition: 'State Transition', functional: 'Functional',
  nonFunctional: 'Non-Functional', security: 'Security',
  performance: 'Performance', uiUx: 'UI/UX', integration: 'Integration',
  regression: 'Regression', smoke: 'Smoke/Sanity',
  errorGuessing: 'Error Guessing', usability: 'Usability',
}

const ISSUE_PROMPTS = {
  Bug: `You are an expert QA engineer generating Jira bug tickets.
Generate exactly {count} unique bug tickets for the "{module}" module covering: {types}.
Return ONLY a valid JSON array. No markdown, no explanation.
Each object must have:
- summary (string, max 80 chars, starts with "[Bug]")
- description (string, 2-4 sentences explaining the bug)
- priority (string: "Highest" / "High" / "Medium" / "Low")
- labels (array of strings)
- stepsToReproduce (array of strings, 3-6 steps)
- expectedResult (string)
- actualResult (string)`,

  Task: `You are a project manager generating Jira task tickets.
Generate exactly {count} unique tasks for the "{module}" module covering: {types}.
Return ONLY a valid JSON array. No markdown, no explanation.
Each object must have:
- summary (string, max 80 chars, starts with "[Task]")
- description (string, 2-4 sentences describing the task and its value)
- priority (string: "Highest" / "High" / "Medium" / "Low")
- labels (array of strings)
- acceptanceCriteria (array of strings, 3-5 items defining done)
- estimatedHours (string, e.g. "4h" or "8h")`,

  Story: `You are a product owner generating Jira user stories.
Generate exactly {count} unique user stories for the "{module}" module covering: {types}.
Return ONLY a valid JSON array. No markdown, no explanation.
Each object must have:
- summary (string, max 80 chars, starts with "[Story]")
- description (string, formatted as "As a <role>, I want <goal> so that <benefit>")
- priority (string: "Highest" / "High" / "Medium" / "Low")
- labels (array of strings)
- acceptanceCriteria (array of strings, 3-5 items)
- businessValue (string, e.g. "High" / "Medium" / "Low")`,

  Epic: `You are a product manager generating Jira epic tickets.
Generate exactly {count} unique epics for the "{module}" module covering: {types}.
Return ONLY a valid JSON array. No markdown, no explanation.
Each object must have:
- summary (string, max 80 chars, starts with "[Epic]")
- description (string, 3-5 sentences describing the epic scope and goals)
- priority (string: "Highest" / "High" / "Medium" / "Low")
- labels (array of strings)
- scope (string, what is in and out of scope)
- businessGoal (string)`,
}

export async function generateTicketContent(groqKey, issueType, moduleName, testTypes, count) {
  const testTypesList = testTypes.map(t => TEST_TYPE_MAP[t] || t).join(', ')

  const promptTemplate = ISSUE_PROMPTS[issueType] || ISSUE_PROMPTS.Bug
  const systemPrompt = promptTemplate
    .replace('{count}', count)
    .replace('{module}', moduleName)
    .replace('{types}', testTypesList)

  const userPrompt = `Generate ${count} unique, realistic ${issueType.toLowerCase()} tickets for the ${moduleName} module covering these test coverage areas: ${testTypesList}. Make them diverse and detailed.`

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GROQ API error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('GROQ returned empty response')

  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Could not parse JSON from GROQ response')

  const tickets = JSON.parse(jsonMatch[0])
  if (!Array.isArray(tickets)) throw new Error('GROQ did not return an array')

  return tickets
}
