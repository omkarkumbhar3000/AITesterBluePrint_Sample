import { useCallback, useRef, useState } from 'react'

export default function FileUploadZone({ label, file, onFileSelect, accept }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleClick = () => inputRef.current?.click()

  const handleFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.name.endsWith('.json')) {
      onFileSelect(selectedFile)
    }
  }, [onFileSelect])

  const handleChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-indigo-400 bg-indigo-400/10'
          : file
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-gray-700 hover:border-gray-500 bg-transparent'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        <div className="space-y-2">
          <div className="text-3xl">📄</div>
          <p className="text-sm font-medium text-green-400 truncate max-w-full">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          <p className="text-xs text-gray-600 mt-1">Tap to replace</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-3xl">📂</div>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-xs text-gray-500">Drop a .json file here or tap to browse</p>
        </div>
      )}
    </div>
  )
}
