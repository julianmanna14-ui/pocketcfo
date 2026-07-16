'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function QBSyncButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSync = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/quickbooks/sync', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Sync failed. Please try again.')
        return
      }

      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-bg-secondary border border-green-500/30 rounded-2xl p-8">
        <h2 className="text-white font-bold text-xl mb-2">
          🧠 Syncing your QuickBooks data...
        </h2>
        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <div className="bg-accent h-2 rounded-full animate-pulse w-3/4" />
        </div>
        <p className="text-text-secondary text-sm">
          Fetching transactions and running AI analysis... ~15–30 seconds
        </p>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary border border-green-500/30 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded-full">
          Connected
        </span>
        <h2 className="text-white font-bold text-xl">QuickBooks Online</h2>
      </div>
      <p className="text-text-secondary mb-6">
        Pull the last 90 days of transactions and run your AI CFO analysis.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          {error.toLowerCase().includes('invalid') || error.toLowerCase().includes('token') || error.toLowerCase().includes('authorize') ? (
            <a
              href="/api/quickbooks/connect"
              className="inline-block mt-2 text-accent text-sm font-semibold hover:underline"
            >
              Reconnect QuickBooks →
            </a>
          ) : null}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleSync}
          className="bg-accent text-bg-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Sync QuickBooks Now
        </button>
        <a
          href="/api/quickbooks/connect"
          className="border border-white/20 text-text-secondary font-semibold px-6 py-3 rounded-xl hover:border-white/40 hover:text-white transition-colors text-sm flex items-center"
        >
          Reconnect
        </a>
      </div>
    </div>
  )
}
