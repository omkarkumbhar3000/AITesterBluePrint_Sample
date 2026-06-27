export default function TokenUsage({ tokenUsage }) {
  if (!tokenUsage || (tokenUsage.input == null && tokenUsage.output == null && tokenUsage.total == null)) {
    return null
  }

  return (
    <footer className="text-center text-xs text-gray-600 py-4 border-t border-gray-800">
      Input tokens: {tokenUsage.input ?? '—'} | Output tokens: {tokenUsage.output ?? '—'} | Total: {tokenUsage.total ?? '—'}
    </footer>
  )
}
