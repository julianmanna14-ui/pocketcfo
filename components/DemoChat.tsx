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

type Step = 'input' | 'contact' | 'loading' | 'results'

export default function DemoChat() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [findings, setFindings] = useState<Finding[] | null>(null)

  const handleAnalyze = () => {
    if (!message.trim()) return
    setStep('contact')
  }

  const handleContact = async () => {
    if (!email.trim()) return
    setStep('loading')

    // Fire both requests in parallel
    const [analysisRes] = await Promise.all([
      fetch('/api/demo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }),
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, businessDescription: message }),
      }),
    ])

    const data = await analysisRes.json()
    if (data.findings) setFindings(data.findings)
    setStep('results')
  }

  const reset = () => {
    setMessage('')
    setEmail('')
    setPhone('')
    setFindings(null)
    setStep('input')
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
          <div className="p-4 flex flex-col gap-4 max-h-[500px] overflow-y-auto">

            {/* Step 1: Business description */}
            {step === 'input' && (
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
                  onClick={handleAnalyze}
                  disabled={!message.trim()}
                  className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Analyze my business →
                </button>
              </>
            )}

            {/* Step 2: Contact info */}
            {step === 'contact' && (
              <>
                <div className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Enter your email to see your results. First month completely free — no credit card required.
                  </p>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address *"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-secondary focus:outline-none focus:border-accent/50 transition-colors"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-secondary focus:outline-none focus:border-accent/50 transition-colors"
                />
                <button
                  onClick={handleContact}
                  disabled={!email.trim()}
                  className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Show my results →
                </button>
                <button onClick={() => setStep('input')} className="text-text-secondary text-xs text-center hover:text-white transition-colors">
                  ← Go back
                </button>
              </>
            )}

            {/* Step 3: Loading */}
            {step === 'loading' && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm">Analyzing your business...</p>
              </div>
            )}

            {/* Step 4: Results */}
            {step === 'results' && findings && (
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <p className="text-white text-xs font-bold text-center">{findings.length - 1} more issues found</p>
                  </div>
                </div>

                <a
                  href="/signup"
                  className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-center text-sm"
                >
                  Start your free month — no card needed →
                </a>

                <button onClick={reset} className="text-text-secondary text-xs text-center hover:text-white transition-colors">
                  Try a different business
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
