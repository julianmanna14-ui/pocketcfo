'use client'

import { useState } from 'react'

export function SendDigestButton() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const send = async () => {
    setStatus('sending')
    try {
      const res = await fetch('/api/cron/weekly-digest', { method: 'POST' })
      if (res.ok) {
        setStatus('sent')
      } else {
        const data = await res.json()
        console.error(data)
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <button
      onClick={send}
      disabled={status === 'sending' || status === 'sent'}
      className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
    >
      {status === 'idle' && 'Send test digest email'}
      {status === 'sending' && 'Sending…'}
      {status === 'sent' && '✓ Check your inbox'}
      {status === 'error' && 'Failed — check console'}
    </button>
  )
}
