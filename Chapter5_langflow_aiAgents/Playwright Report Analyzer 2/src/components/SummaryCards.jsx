function Card({ title, icon, bgClass, children }) {
  return (
    <div className={`${bgClass} rounded-xl p-5 border border-gray-700/50`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-white text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
        {children || <span className="text-gray-500 italic">No data found</span>}
      </div>
    </div>
  )
}

function parseListItems(text) {
  if (!text || !text.trim()) return []
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('-') || l.startsWith('*') || /^\d+[.)]/.test(l))
    .map(l => l.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)
}

export default function SummaryCards({ parsedData, summaryNumbers }) {
  const { summary, flakyTests, consistentFailures, rerunRecommendation } = parsedData
  const { totalTests, passedPercent, failedPercent, flakyPercent } = summaryNumbers

  const flakyItems = parseListItems(flakyTests)
  const failureItems = parseListItems(consistentFailures)
  const rerunItems = parseListItems(rerunRecommendation)

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Suite Health" icon="📊" bgClass="bg-blue-900/20 border-blue-800/30">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{totalTests ?? '—'}</div>
            <div className="text-xs text-blue-400 mt-1">Total Tests</div>
          </div>
          <div className="bg-green-900/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{passedPercent != null ? `${passedPercent}%` : '—'}</div>
            <div className="text-xs text-green-400 mt-1">Passed</div>
          </div>
          <div className="bg-red-900/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-300">{failedPercent != null ? `${failedPercent}%` : '—'}</div>
            <div className="text-xs text-red-400 mt-1">Failed</div>
          </div>
          <div className="bg-yellow-900/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">{flakyPercent != null ? `${flakyPercent}%` : '—'}</div>
            <div className="text-xs text-yellow-400 mt-1">Flaky</div>
          </div>
        </div>
        {summary && (
          <div className="mt-4 pt-4 border-t border-blue-800/30 text-xs text-gray-400">
            <p className="leading-relaxed">{summary}</p>
          </div>
        )}
      </Card>

      <Card title="Flaky Tests" icon="⚠️" bgClass="bg-yellow-900/20 border-yellow-800/30">
        {flakyItems.length > 0 ? (
          <ul className="space-y-2">
            {flakyItems.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-400 mt-0.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500 italic">{flakyTests || 'No flaky tests detected.'}</span>
        )}
      </Card>

      <Card title="Consistent Failures" icon="❌" bgClass="bg-red-900/20 border-red-800/30">
        {failureItems.length > 0 ? (
          <ul className="space-y-2">
            {failureItems.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-400 mt-0.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500 italic">{consistentFailures || 'No consistent failures detected.'}</span>
        )}
      </Card>

      <Card title="Rerun Recommendation" icon="🔄" bgClass="bg-green-900/20 border-green-800/30">
        {rerunItems.length > 0 ? (
          <ul className="space-y-2">
            {rerunItems.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-400 mt-0.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-500 italic">{rerunRecommendation || 'No rerun recommendations.'}</span>
        )}
      </Card>
    </section>
  )
}
