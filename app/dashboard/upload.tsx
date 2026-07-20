'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  hasAnalysis: boolean
  summary: string | null
  lastRun: string | null
}

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.pdf']
const ALLOWED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
]

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function UploadSection({ hasAnalysis, summary, lastRun }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a CSV, Excel (.xlsx), or PDF bank statement')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Please export a shorter date range (max 10MB).')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
        return
      }

      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
        <h2 className="text-white font-bold text-xl mb-2">
          🧠 Your AI CFO is analyzing your finances...
        </h2>
        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <div className="bg-accent h-2 rounded-full animate-pulse w-3/4" />
        </div>
        <p className="text-text-secondary text-sm">
          Scanning transactions... This takes about 15–30 seconds
        </p>
      </div>
    )
  }

  if (hasAnalysis && summary) {
    return (
      <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-xl">
            ✅ Analysis complete
          </h2>
          {lastRun && (
            <span className="text-text-secondary text-xs">
              Last run: {formatRelativeTime(lastRun)}
            </span>
          )}
        </div>
        <p className="text-text-secondary mb-4">{summary}</p>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-text-secondary hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-4 py-2 transition-colors"
        >
          Upload new file
        </button>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
      <h2 className="text-white font-bold text-xl mb-2">
        Connect your books to get started
      </h2>
      <p className="text-text-secondary mb-6">
        Upload your CSV export, Excel spreadsheet, or PDF bank statement. Takes 30 seconds.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-accent text-bg-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        📁 Upload CSV, Excel, or PDF
      </button>

      <p className="text-text-secondary text-xs mt-4">
        Works with: QuickBooks · Xero · FreshBooks · Excel · CSV · PDF bank statements
      </p>
    </div>
  )
}
