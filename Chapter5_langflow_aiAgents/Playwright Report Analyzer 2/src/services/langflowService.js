const LANGFLOW_BASE_URL = ''
const FLOW_ID = 'c194e71a-e44b-4e44-99bb-d94e2673a5c7'
const API_KEY = 'sk-ChSrThOtynBUwvrZ-ULZ8PU-6NUxcsVwD_DVmdXkIp8'

export async function uploadReport(file) {
  const url = `${LANGFLOW_BASE_URL}/api/v1/files/upload/${FLOW_ID}`
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Upload failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  return data.file_path
}

export async function runAnalysis(filePath1, filePath2) {
  const url = `${LANGFLOW_BASE_URL}/api/v1/run/${FLOW_ID}?stream=false`

  const body = {
    output_type: 'chat',
    input_type: 'text',
    input_value: 'Compare the two Playwright test reports',
    session_id: 'omkar-report-session-01',
    tweaks: {
      'ReadFile-1': { path: filePath1 },
      'ReadFile-2': { path: filePath2 },
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Analysis failed (${response.status}): ${text}`)
  }

  const data = await response.json()

  console.log('Full Langflow response:', JSON.stringify(data, null, 2))

  return data
}
