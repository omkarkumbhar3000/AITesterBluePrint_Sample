import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MultiSelect from '../components/MultiSelect.jsx'
import { createJiraIssue } from '../utils/jiraApi.js'
import { generateTicketContent } from '../utils/groqApi.js'
import './DashboardPage.css'

const ISSUE_TYPE_OPTIONS = ['Bug', 'Task', 'Story', 'Epic']

const MODULE_OPTIONS = [
  'Login', 'Dashboard', 'User Profile', 'Search',
  'Checkout', 'Payment', 'Notifications', 'Settings',
  'Admin Panel', 'Reports', 'Registration', 'Landing Page',
]

const TEST_TYPE_OPTIONS = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'boundary', label: 'Boundary Value' },
  { value: 'equivalence', label: 'Equivalence Partitioning' },
  { value: 'decisionTable', label: 'Decision Table' },
  { value: 'stateTransition', label: 'State Transition' },
  { value: 'functional', label: 'Functional' },
  { value: 'nonFunctional', label: 'Non-Functional' },
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
  { value: 'uiUx', label: 'UI/UX' },
  { value: 'integration', label: 'Integration' },
  { value: 'regression', label: 'Regression' },
  { value: 'smoke', label: 'Smoke/Sanity' },
  { value: 'errorGuessing', label: 'Error Guessing' },
  { value: 'usability', label: 'Usability' },
]

function buildDescription(issueType, t) {
  switch (issueType) {
    case 'Bug':
      return [
        t.description,
        '',
        '---',
        '**Steps to Reproduce:**',
        ...(t.stepsToReproduce || []).map((s, i) => `${i + 1}. ${s}`),
        '',
        `**Expected Result:** ${t.expectedResult || 'N/A'}`,
        `**Actual Result:** ${t.actualResult || 'N/A'}`,
      ].join('\n')
    case 'Task':
      return [
        t.description,
        '',
        '---',
        '**Acceptance Criteria:**',
        ...(t.acceptanceCriteria || []).map((s, i) => `${i + 1}. ${s}`),
        '',
        `**Estimated Hours:** ${t.estimatedHours || 'N/A'}`,
      ].join('\n')
    case 'Story':
      return [
        t.description,
        '',
        '---',
        '**Acceptance Criteria:**',
        ...(t.acceptanceCriteria || []).map((s, i) => `${i + 1}. ${s}`),
        '',
        `**Business Value:** ${t.businessValue || 'N/A'}`,
      ].join('\n')
    case 'Epic':
      return [
        t.description,
        '',
        '---',
        `**Scope:** ${t.scope || 'N/A'}`,
        `**Business Goal:** ${t.businessGoal || 'N/A'}`,
      ].join('\n')
    default:
      return t.description || ''
  }
}

function DashboardPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)

  const [issueType, setIssueType] = useState('Bug')
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
        issueType,
        module,
        testTypes,
        ticketCount,
      )

      setStatus('creating')
      setStatusMessage(`Creating ${tickets.length} ${issueType.toLowerCase()}s in Jira...`)

      const created = []
      const failed = []

      for (let i = 0; i < tickets.length; i++) {
        const t = tickets[i]
        try {
          setStatusMessage(`Creating ${issueType} ${i + 1} of ${tickets.length}: ${t.summary?.slice(0, 50)}...`)
          const result = await createJiraIssue(
            config.jiraUrl,
            config.auth,
            config.projectKey,
            issueType,
            {
              summary: t.summary,
              description: buildDescription(issueType, t),
              priority: t.priority || 'Medium',
              labels: [...(t.labels || []), module],
            },
          )
          created.push({ key: result.key, summary: t.summary, priority: t.priority, type: issueType })
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
          <div className="panel-row">
            <div className="panel-section">
              <h2>Issue Type</h2>
              <select
                className="form-select"
                value={issueType}
                onChange={e => setIssueType(e.target.value)}
              >
                {ISSUE_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="panel-section">
              <h2>Module / Page</h2>
              <select
                className="form-select"
                value={module}
                onChange={e => setModule(e.target.value)}
              >
                {MODULE_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="panel-section">
              <h2>Tickets</h2>
              <div className="count-control">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={ticketCount}
                  onChange={e => setTicketCount(Number(e.target.value))}
                />
                <span className="count-value">{ticketCount}</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h2>Test Coverage Areas</h2>
            <MultiSelect
              options={TEST_TYPE_OPTIONS}
              selected={testTypes}
              onChange={setTestTypes}
            />
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={status === 'generating' || status === 'creating' || testTypes.length === 0}
          >
            {status === 'generating' || status === 'creating'
              ? 'Working...'
              : `Generate & Create ${issueType}s`}
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
                  <th>Type</th>
                  <th>Summary</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.key}>
                    <td className="cell-key">{r.key}</td>
                    <td><span className="type-badge">{r.type}</span></td>
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
