import { useState, useCallback } from 'react'
import FileUploadZone from './components/FileUploadZone.jsx'
import ProgressSteps from './components/ProgressSteps.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import FullOutputPanel from './components/FullOutputPanel.jsx'
import TokenUsage from './components/TokenUsage.jsx'
import { uploadReport, runAnalysis } from './services/langflowService.js'

function parseSummaryMarkdown(text) {
  const sections = {}
  const currentLabels = {
    'FLAKY_TESTS': 'flakyTests',
    'CONSISTENT_FAILURES': 'consistentFailures',
    'RERUN_RECOMMENDATION': 'rerunRecommendation',
    'SUMMARY': 'summary',
  }

  let currentKey = null
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(/\*\*(\w+)\*\*/)
    if (match) {
      const label = match[1].toUpperCase()
      if (currentLabels[label]) {
        currentKey = currentLabels[label]
        sections[currentKey] = sections[currentKey] || []
        continue
      }
    }
    if (currentKey && trimmed) {
      sections[currentKey].push(trimmed)
    }
  }

  return {
    flakyTests: (sections.flakyTests || []).join('\n'),
    consistentFailures: (sections.consistentFailures || []).join('\n'),
    rerunRecommendation: (sections.rerunRecommendation || []).join('\n'),
    summary: (sections.summary || []).join('\n'),
  }
}

function parseSummaryNumbers(summaryText) {
  const numbers = {
    totalTests: null,
    passedPercent: null,
    failedPercent: null,
    flakyPercent: null,
  }

  const totalMatch = summaryText.match(/total\s*tests?[:\s]*(\d+)/i)
  if (totalMatch) numbers.totalTests = parseInt(totalMatch[1], 10)

  const passMatch = summaryText.match(/passed[:\s]*(\d+(?:\.\d+)?)%?/i)
  if (passMatch) numbers.passedPercent = parseFloat(passMatch[1])

  const failMatch = summaryText.match(/failed[:\s]*(\d+(?:\.\d+)?)%?/i)
  if (failMatch) numbers.failedPercent = parseFloat(failMatch[1])

  const flakyMatch = summaryText.match(/flaky[:\s]*(\d+(?:\.\d+)?)%?/i)
  if (flakyMatch) numbers.flakyPercent = parseFloat(flakyMatch[1])

  return numbers
}

export default function App() {
  const [file1, setFile1] = useState(null)
  const [file2, setFile2] = useState(null)

  const [step, setStep] = useState('idle')
  const [stepCompleted, setStepCompleted] = useState({ 1: false, 2: false, 3: false })

  const [result, setResult] = useState(null)
  const [rawText, setRawText] = useState('')
  const [parsedData, setParsedData] = useState({ flakyTests: '', consistentFailures: '', rerunRecommendation: '', summary: '' })
  const [summaryNumbers, setSummaryNumbers] = useState({ totalTests: null, passedPercent: null, failedPercent: null, flakyPercent: null })
  const [tokenUsage, setTokenUsage] = useState({ input: null, output: null, total: null })

  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file1 || !file2) return

    setStep('uploading-1')
    setStepCompleted({ 1: false, 2: false, 3: false })
    setError(null)
    setResult(null)
    setRawText('')
    setParsedData({ flakyTests: '', consistentFailures: '', rerunRecommendation: '', summary: '' })
    setSummaryNumbers({ totalTests: null, passedPercent: null, failedPercent: null, flakyPercent: null })
    setTokenUsage({ input: null, output: null, total: null })

    try {
      setStep('uploading-1')
      const path1 = await uploadReport(file1)
      setStepCompleted(prev => ({ ...prev, 1: true }))

      setStep('uploading-2')
      const path2 = await uploadReport(file2)
      setStepCompleted(prev => ({ ...prev, 2: true }))

      setStep('analyzing')
      const data = await runAnalysis(path1, path2)
      setStepCompleted(prev => ({ ...prev, 3: true }))
      setStep('done')

      const outputs = data?.outputs?.[0]?.outputs?.[0]?.results?.message
      const text = outputs?.text || outputs?.data?.text || ''
      setRawText(text)
      setResult(data)

      if (text) {
        const parsed = parseSummaryMarkdown(text)
        setParsedData(parsed)
        setSummaryNumbers(parseSummaryNumbers(parsed.summary))
      }

      const usage = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.properties?.usage
      if (usage) {
        setTokenUsage({
          input: usage.input_tokens || usage.prompt_tokens || usage['input_tokens'],
          output: usage.output_tokens || usage.completion_tokens || usage['output_tokens'],
          total: usage.total_tokens || usage['total_tokens'],
        })
      }
    } catch (err) {
      setStep('idle')
      setStepCompleted({ 1: false, 2: false, 3: false })

      if (step === 'uploading-1' || step === 'uploading-2') {
        showToast(`Failed to upload ${step === 'uploading-1' ? (file1?.name || 'report1.json') : (file2?.name || 'report2.json')}. Check Langflow is running.`, 'error')
      } else {
        showToast('Analysis failed. Check your API key or flow ID.', 'error')
      }
      setError(err.message)
    }
  }, [file1, file2, step, showToast])

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-medium transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🧪</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Playwright Test Report Analyzer
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                AI-powered test intelligence via Langflow + Groq
              </p>
            </div>
            <span className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
              llama-3.1-8b-instant
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-[#1e293b] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-6">Upload Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadZone
              label="Report 1 (Baseline)"
              file={file1}
              onFileSelect={setFile1}
              accept=".json"
            />
            <FileUploadZone
              label="Report 2 (Latest Run)"
              file={file2}
              onFileSelect={setFile2}
              accept=".json"
            />
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!file1 || !file2 || step === 'uploading-1' || step === 'uploading-2' || step === 'analyzing'}
              className={`px-10 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-3 ${
                !file1 || !file2 || step === 'uploading-1' || step === 'uploading-2' || step === 'analyzing'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
              }`}
            >
              {(step === 'uploading-1' || step === 'uploading-2' || step === 'analyzing') && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {(step === 'uploading-1' || step === 'uploading-2' || step === 'analyzing')
                ? 'Analyzing...'
                : 'Analyze Reports'}
            </button>
          </div>
        </section>

        {(step === 'uploading-1' || step === 'uploading-2' || step === 'analyzing') && (
          <ProgressSteps stepCompleted={stepCompleted} currentStep={step} />
        )}

        {step === 'done' && result && (
          <>
            <SummaryCards
              parsedData={parsedData}
              summaryNumbers={summaryNumbers}
            />

            <FullOutputPanel rawText={rawText} showToast={showToast} />

            <TokenUsage tokenUsage={tokenUsage} />
          </>
        )}
      </main>
    </div>
  )
}
