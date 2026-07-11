import { useState, useEffect, useRef } from 'react'
import './App.css'

const PIPELINE_STEPS = [
  { id: 'pdf', label: 'PDF', icon: '📄', desc: 'Extract text from PDF' },
  { id: 'chunk', label: 'Chunking', icon: '✂️', desc: 'Split into passages' },
  { id: 'embed', label: 'Embeddings', icon: '🧬', desc: 'Nomic Embed vectors' },
  { id: 'store', label: 'ChromaDB', icon: '🗄️', desc: 'Vector storage' },
  { id: 'retrieve', label: 'Retrieval', icon: '🔍', desc: 'Top-4 similar chunks' },
  { id: 'generate', label: 'Generation', icon: '🤖', desc: 'Groq + Mixtral 8x7B' },
]

function StatusDot({ active, done }) {
  const cls = done ? 'dot dot-done' : active ? 'dot dot-active' : 'dot dot-pending'
  return <span className={cls} />
}

export default function App() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [querying, setQuerying] = useState(false)
  const [result, setResult] = useState(null)
  const [activeStep, setActiveStep] = useState(-1)
  const [error, setError] = useState(null)
  const resultRef = useRef(null)

  useEffect(() => { pollStatus() }, [])

  async function pollStatus() {
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      setStatus(data)
      if (data.ingested) setActiveStep(4)
      if (data.model_loaded && !data.error) setActiveStep(prev => prev < 0 ? 0 : prev)
    } catch {
      setStatus(null)
    }
  }

  async function handleIngest() {
    setIngesting(true)
    setError(null)
    setResult(null)
    setActiveStep(0)
    try {
      const res = await fetch('/api/ingest', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setActiveStep(4)
      pollStatus()
    } catch (e) {
      setError(e.message)
    } finally {
      setIngesting(false)
    }
  }

  async function handleQuery(e) {
    e.preventDefault()
    if (!queryText.trim()) return
    setQuerying(true)
    setError(null)
    setResult(null)
    setActiveStep(5)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setError(e.message)
    } finally {
      setQuerying(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>RAG Explorer</h1>
        <p className="subtitle">End-to-end Retrieval-Augmented Generation pipeline — PDF → Chunks → Embeddings → ChromaDB → Retrieval → LLM</p>
      </header>

      {/* Pipeline Visualization */}
      <section className="pipeline-card">
        <h2>Pipeline</h2>
        <div className="pipeline-flow">
          {PIPELINE_STEPS.map((step, idx) => (
            <div key={step.id} className="pipeline-step">
              <div className={`step-icon ${activeStep >= idx ? 'step-active' : ''} ${result && idx >= 4 ? 'step-highlight' : ''}`}>
                <span className="step-emoji">{step.icon}</span>
              </div>
              <div className="step-label">{step.label}</div>
              <div className="step-desc">{step.desc}</div>
              {idx < PIPELINE_STEPS.length - 1 && <div className={`step-arrow ${activeStep >= idx ? 'arrow-active' : ''}`} />}
            </div>
          ))}
        </div>
      </section>

      {/* Status + Ingest */}
      <section className="card">
        <h2>Document</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Model (Nomic Embed)</span>
            <span className={`status-value ${status?.model_loaded ? 'text-green' : 'text-red'}`}>
              {status?.model_loaded ? 'Loaded' : status ? 'Not loaded' : '...'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">ChromaDB</span>
            <span className={`status-value ${status?.ingested ? 'text-green' : status?.error?.includes('ChromaDB') ? 'text-red' : 'text-muted'}`}>
              {status?.ingested ? `${status.chunk_count} chunks` : 'Empty'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">PDF File</span>
            <span className="status-value">{status?.pdf_name || '—'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Pages</span>
            <span className="status-value">{status?.pages || '—'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">PDFs in data/data/</span>
            <span className="status-value">{status?.pdfs_found ?? '?'}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleIngest} disabled={ingesting}>
          {ingesting ? 'Ingesting...' : ingesting === null ? 'Ingesting...' : 'Ingest PDF'}
        </button>
        {status?.error && <p className="error-msg">{status.error}</p>}
      </section>

      {/* Query */}
      <section className="card">
        <h2>Ask a Question</h2>
        <form onSubmit={handleQuery} className="query-form">
          <input
            type="text"
            className="query-input"
            placeholder="e.g. What are the key features of VWO?"
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            disabled={!status?.ingested || querying}
          />
          <button type="submit" className="btn btn-secondary" disabled={!status?.ingested || querying || !queryText.trim()}>
            {querying ? 'Thinking...' : 'Ask'}
          </button>
        </form>
        {!status?.ingested && <p className="hint">Ingest a PDF first to enable queries.</p>}
      </section>

      {error && <section className="card card-error"><p className="error-msg">{error}</p></section>}

      {/* Results */}
      {result && (
        <section ref={resultRef} className="card">
          <h2>Results</h2>

          <div className="answer-card">
            <div className="answer-header">
              <span className="answer-icon">🤖</span>
              <span>Answer (via {result.model})</span>
            </div>
            <div className="answer-body">{result.answer}</div>
          </div>

          <h3 className="chunks-title">Retrieved Chunks (top 4)</h3>
          <div className="chunks-list">
            {result.chunks.map(chunk => (
              <div key={chunk.id} className="chunk-card">
                <div className="chunk-header">
                  <span className="chunk-id">Chunk #{chunk.chunk_index + 1}</span>
                  <span className="chunk-score" style={{ color: chunk.relevance > 70 ? '#22c55e' : chunk.relevance > 40 ? '#eab308' : '#ef4444' }}>
                    {chunk.relevance}% relevant
                  </span>
                </div>
                <div className="chunk-body">{chunk.content}</div>
                <div className="chunk-footer">
                  <span>{chunk.char_length} chars</span>
                  <span>Source: {chunk.source}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="db-stats">{result.total_chunks_in_db} chunks in ChromaDB</p>
        </section>
      )}

      {/* Pipeline explanation */}
      <section className="card card-narrow">
        <h2>How This Works</h2>
        <ol className="steps-list">
          <li><strong>PDF Ingestion</strong> — Extract raw text using PyMuPDF</li>
          <li><strong>Chunking</strong> — Split into 500-char passages with 100-char overlap</li>
          <li><strong>Embeddings</strong> — Encode each chunk as a vector using Nomic Embed (sentence-transformers)</li>
          <li><strong>ChromaDB</strong> — Store vectors in a local persistent ChromaDB instance</li>
          <li><strong>Retrieval</strong> — On query, embed the question and find the top-4 most similar chunks</li>
          <li><strong>Generation</strong> — Feed chunks + question to Groq (Mixtral 8x7B) for a grounded answer</li>
        </ol>
      </section>
    </div>
  )
}
