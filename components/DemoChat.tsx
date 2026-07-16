'use client'

import { useState } from 'react'

const categoryIcons: Record<string, string> = {
  subscriptions: '💳',
  cash_flow: '💰',
  revenue: '📈',
  vendors: '🤝',
}

interface Finding {
  title: string
  detail: string
  category: string
}

export default function DemoChat() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim() || loading) return
    setLoading(true)
    setSubmitted(true)

    try {
      const res = await fetch('/api/demo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (data.findings) setFindings(data.findings)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMessage('')
    setFindings(null)
    setSubmitted(false)
  }

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-accent text-bg-primary w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="Open AI demo"
      >
        {open ? (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-bg-primary border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-accent/10 border-b border-white/10 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg-primary text-sm font-black">P</div>
            <div>
              <p className="text-white text-sm font-bold">PocketCFO AI</p>
              <p className="text-accent text-xs">Free instant analysis</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-4 max-h-[480px] overflow-y-auto">
            {!submitted ? (
              <>
                <div className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Tell me about your business — what you do and roughly what you spend monthly. I'll find your top savings opportunities.
                  </p>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. I run a 10-person marketing agency, about $40k/month in expenses including software, contractors, and office space..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-secondary resize-none focus:outline-none focus:border-accent/50 transition-colors"
                  rows={4}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Analyze my business →
                </button>
              </>
            ) : loading ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm">Analyzing your business...</p>
              </div>
            ) : findings ? (
              <>
                <p className="text-accent text-xs font-semibold uppercase tracking-widest">
                  Found {findings.length} issues
                </p>

                {/* First finding — fully visible */}
                <div className="bg-white/5 border border-accent/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{categoryIcons[findings[0].category] ?? '⚠️'}</span>
                    <div>
                      <p className="text-white text-sm font-bold mb-1">{findings[0].title}</p>
                      <p className="text-text-secondary text-xs leading-relaxed">{findings[0].detail}</p>
                    </div>
                  </div>
                </div>

                {/* Remaining findings — blurred */}
                <div className="relative">
                  <div className="flex flex-col gap-3 blur-sm select-none pointer-events-none">
                    {findings.slice(1).map((f, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{categoryIcons[f.category] ?? '⚠️'}</span>
                          <div>
                            <p className="text-white text-sm font-bold mb-1">{f.title}</p>
                            <p className="text-text-secondary text-xs leading-relaxed">{f.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <p className="text-white text-xs font-bold text-center">{findings.length - 1} more issues found</p>
                  </div>
                </div>

                <a
                  href="/signup"
                  className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-center text-sm"
                >
                  Unlock all insights — Start free →
                </a>

                <button onClick={reset} className="text-text-secondary text-xs text-center hover:text-white transition-colors">
                  Try a different business
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}
