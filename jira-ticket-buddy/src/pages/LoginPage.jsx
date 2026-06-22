import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { encodeBasicAuth, testJiraConnection } from '../utils/jiraApi.js'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const [jiraUrl, setJiraUrl] = useState(import.meta.env.VITE_JIRA_URL || '')
  const [email, setEmail] = useState(import.meta.env.VITE_JIRA_EMAIL || '')
  const [token, setToken] = useState(import.meta.env.VITE_JIRA_TOKEN || '')
  const [groqKey, setGroqKey] = useState(import.meta.env.VITE_GROQ_API_KEY || '')
  const [projectKey, setProjectKey] = useState(import.meta.env.VITE_JIRA_PROJECT_KEY || 'KAN')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  async function handleConnect(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const auth = encodeBasicAuth(email, token)
      const myself = await testJiraConnection(jiraUrl, auth)
      setUser(myself)
      sessionStorage.setItem('jiraConfig', JSON.stringify({
        jiraUrl, email, token, auth, groqKey, projectKey,
      }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🎫</div>
          <h1>Jira Ticket Buddy</h1>
          <p className="login-subtitle">
            Connect to Jira and generate bug tickets with AI
          </p>
        </div>

        <form onSubmit={handleConnect} className="login-form">
          <div className="form-group">
            <label htmlFor="jiraUrl">Jira Instance URL</label>
            <input
              id="jiraUrl"
              type="url"
              value={jiraUrl}
              onChange={e => setJiraUrl(e.target.value)}
              placeholder="https://your-domain.atlassian.net"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectKey">Project Key</label>
              <input
                id="projectKey"
                type="text"
                value={projectKey}
                onChange={e => setProjectKey(e.target.value)}
                placeholder="KAN"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="token">Jira API Token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="your-jira-api-token"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="groqKey">GROQ API Key</label>
            <input
              id="groqKey"
              type="password"
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              placeholder="gsk_..."
            />
            <span className="form-hint">Used to generate ticket content via LLM</span>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connecting...' : 'Connect to Jira'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
