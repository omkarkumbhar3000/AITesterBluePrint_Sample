const steps = [
  { key: 1, label: 'Uploading Report 1...', doneLabel: 'Report 1 uploaded' },
  { key: 2, label: 'Uploading Report 2...', doneLabel: 'Report 2 uploaded' },
  { key: 3, label: 'Running AI Analysis...', doneLabel: 'Analysis complete' },
]

export default function ProgressSteps({ stepCompleted, currentStep }) {
  const getState = (key) => {
    if (stepCompleted[key]) return 'done'
    if (
      (key === 1 && currentStep === 'uploading-1') ||
      (key === 2 && currentStep === 'uploading-2') ||
      (key === 3 && currentStep === 'analyzing')
    ) return 'active'
    return 'pending'
  }

  return (
    <section className="bg-[#1e293b] rounded-xl p-6 border border-gray-800">
      <div className="space-y-4">
        {steps.map((step) => {
          const state = getState(step.key)
          return (
            <div key={step.key} className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                  state === 'done'
                    ? 'bg-green-500 text-white'
                    : state === 'active'
                      ? 'bg-indigo-500 text-white animate-pulse'
                      : 'bg-gray-700 text-gray-500'
                }`}
              >
                {state === 'done' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.key
                )}
              </div>
              <span
                className={`text-sm ${
                  state === 'done'
                    ? 'text-green-400'
                    : state === 'active'
                      ? 'text-indigo-300 font-medium'
                      : 'text-gray-500'
                }`}
              >
                {state === 'done' ? step.doneLabel : step.label}
              </span>
              {state === 'done' && (
                <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
