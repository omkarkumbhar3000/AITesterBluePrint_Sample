import { useState } from 'react'

function renderMarkdown(text) {
  if (!text) return ''
  const lines = text.split('\n')
  let html = ''
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false }
      html += '<br />'
      continue
    }

    const boldMatch = trimmed.match(/^\*\*(.+)\*\*$/)
    if (boldMatch) {
      if (inList) { html += '</ul>'; inList = false }
      html += `<h3 class="text-indigo-300 font-bold text-sm mt-4 mb-2 uppercase tracking-wider">${boldMatch[1]}</h3>`
      continue
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul class="space-y-1 mb-2">'; inList = true }
      const content = trimmed.replace(/^[-*]\s*/, '')
      html += `<li class="flex gap-2"><span class="text-gray-500 mt-0.5">•</span><span>${escapeHtml(content)}</span></li>`
      continue
    }

    if (inList) { html += '</ul>'; inList = false }

    const boldInline = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-100">$1</strong>')
    html += `<p class="text-sm text-gray-300 leading-relaxed mb-1">${boldInline}</p>`
  }

  if (inList) html += '</ul>'
  return html
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

export default function FullOutputPanel({ rawText, showToast }) {
  const [collapsed, setCollapsed] = useState(true)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText)
      showToast('Copied to clipboard!', 'success')
    } catch {
      showToast('Failed to copy.', 'error')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([rawText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'test-analysis-report.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!rawText) return null

  return (
    <section className="bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-white">Full AI Analysis</h2>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-6 pb-6">
          <div
            className="bg-[#0f172a] rounded-lg p-5 text-sm leading-relaxed max-h-96 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(rawText) }}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
