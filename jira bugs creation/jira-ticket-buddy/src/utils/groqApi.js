const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function generateTicketContent(groqKey, moduleName, testTypes, count) {
  const testTypesList = testTypes
    .map(t => ({ positive: 'Positive', negative: 'Negative', boundary: 'Boundary Value', equivalence: 'Equivalence Partitioning', decisionTable: 'Decision Table', stateTransition: 'State Transition' }[t] || t))
    .join(', ')

  const systemPrompt = `You are an expert QA engineer generating Jira bug tickets. Generate exactly ${count} unique bug tickets for the "${moduleName}" module covering: ${testTypesList}.

Return ONLY a valid JSON array. No markdown, no explanation. Each object must have:
- summary (string, max 80 chars, starts with "[Bug]")
- description (string, 2-4 sentences explaining the bug)
- priority (string: "Highest" / "High" / "Medium" / "Low")
- labels (array of strings: module name and test type)
- stepsToReproduce (array of strings, 3-6 steps)
- expectedResult (string)
- actualResult (string)`

  const userPrompt = `Generate ${count} unique, realistic bug tickets for the ${moduleName} module covering these test types: ${testTypesList}. Include a mix of positive validations and negative/edge-case scenarios.`

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
