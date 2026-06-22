import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MultiSelect from '../components/MultiSelect.jsx'
import { createJiraIssue } from '../utils/jiraApi.js'
import { generateTicketContent } from '../utils/groqApi.js'
import './DashboardPage.css'

const TEST_TYPE_OPTIONS = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'boundary', label: 'Boundary Value' },
  { value: 'equivalence', label: 'Equivalence Partitioning' },
  { value: 'decisionTable', label: 'Decision Table' },
  { value: 'stateTransition', label: 'State Transition' },
]

const MODULE_OPTIONS = ['Login', 'Dashboard']

function DashboardPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)

  const [module, setModule] = useState('Login')
  const [testTypes, setTestTypes] = useState([])
  const [ticketCount, setTicketCount] = useState(5)
  const [status, setStatus] = useState('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [results, setResults] = useState([])
  const [errors, setErrors] = useState([])

  useEffect(() => {
    const raw = sessionStorage.getItem('jiraConfig')
    if (!raw) {
      navigate('/', { replace: true })
      return
    }
    setConfig(JSON.parse(raw))
  }, [navigate])

  async function handleGenerate() {
    if (!config || testTypes.length === 0) return

    setStatus('generating')
    setStatusMessage('Calling GROQ to generate ticket content...')
    setResults([])
    setErrors([])

    try {
      const tickets = await generateTicketContent(
        config.groqKey,
        module,
        testTypes,
        ticketCount,
      )

      setStatus('creating')
      setStatusMessage(`Creating ${tickets.length} tickets in Jira...`)

      const created = []
      const failed = []

      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i]
        try {
          setStatusMessage(`Creating ticket ${i + 1} of ${tickets.length}: ${t.summary?.slice(0, 50)}...`)
          const result = await createJiraIssue(
            config.jiraUrl,
            config.auth,
            config.projectKey,
            {
              summary: t.summary,
              description: [
                t.description,
                '',
                '---',
                '**Steps to Reproduce:**',
                ...(t.stepsToReproduce || []).map((s, idx) => `${idx + 1}. ${s}`),
                '',
                `**Expected Result:** ${t.expectedResult || 'N/A'}`,
                `**Actual Result:** ${t.actualResult || 'N/A'}`,
              ].join('\n'),
              priority: t.priority || 'Medium',
              labels: [...(t.labels || []), module],
            },
          )
          created.push({ key: result.key, summary: t.summary, priority: t.priority })
        } catch (err) {
          failed.push({ summary: t.summary, error: err.message })
        }
      }

      setResults(created)
      setErrors(failed)
      setStatus('done')
      setStatusMessage(
        `Done — ${created.length} created, ${failed.length} failed`,
      )
    } catch (err) {
      setErrors(prev => [...prev, { summary: 'GROQ generation', error: err.message }])
      setStatus('done')
      setStatusMessage('Generation failed')
    }
  }

  function handleDisconnect() {
    sessionStorage.removeItem('jiraConfig')
    navigate('/', { replace: true })
  }

  if (!config) return null

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="header-icon">🎫</span>
          <h1>Jira Ticket Buddy</h1>
        </div>
        <div className="header-right">
          <span className="connected-badge">Connected: {config.email}</span>
          <button className="btn-outline" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="config-panel">
          <div className="panel-section">
            <h2>Module</h2>
            <div className="module-tabs">
              {MODULE_OPTIONS.map(m => (
                <button
                  key={m}
                  className={`module-tab ${module === m ? 'active' : ''}`}
                  onClick={() => setModule(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h2>Test Types</h2>
            <MultiSelect
              options={TEST_TYPE_OPTIONS}
              selected={testTypes}
              onChange={setTestTypes}
            />
          </div>

          <div className="panel-section">
            <h2>Tickets to Generate</h2>
            <div className="count-control">
              <input
                type="range"
                min="1"
                max="15"
                value={ticketCount}
                onChange={e => setTicketCount(Number(e.target.value))}
              />
              <span className="count-value">{ticketCount}</span>
            </div>
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={status === 'generating' || status === 'creating' || testTypes.length === 0}
          >
            {status === 'generating' || status === 'creating'
              ? 'Working...'
              : 'Generate & Create Tickets'}
          </button>

          {statusMessage && (
            <div className={`status-bar ${status === 'done' ? (errors.length > 0 && results.length === 0 ? 'error' : 'success') : ''}`}>
              {statusMessage}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="results-panel">
            <h2>Created Tickets</h2>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Summary</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.key}>
                    <td className="cell-key">{r.key}</td>
                    <td>{r.summary}</td>
                    <td>
                      <span className={`priority-badge priority-${(r.priority || '').toLowerCase()}`}>
                        {r.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {errors.length > 0 && (
          <div className="errors-panel">
            <h2>Errors</h2>
            <ul className="error-list">
              {errors.map((e, i) => (
                <li key={i}>
                  <strong>{e.summary}:</strong> {e.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
