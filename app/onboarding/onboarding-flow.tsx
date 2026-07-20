'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'chat' | 'plan' | 'connect'

interface Action {
  icon: string
  title: string
  detail: string
}

interface Plan {
  greeting: string
  actions: Action[]
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>('chat')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (data.plan) {
        setPlan(data.plan)
        setStep('plan')
      }
    } catch {
      // fall through to connect
      setStep('connect')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Chat
  if (step === 'chat') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="max-w-lg w-full">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-3xl font-black text-white mb-2">Welcome to PocketCFO</h1>
            <p className="text-text-secondary">Let's build your custom action plan in 30 seconds.</p>
          </div>

          {/* Chat bubble from AI */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-bg-primary font-black text-sm flex-shrink-0 mt-1">P</div>
            <div className="bg-bg-secondary border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex-1">
              <p className="text-text-secondary text-sm leading-relaxed">
                Hey! Tell me about your business — what you do and roughly how much you spend per month. I'll put together a personalized plan for exactly what I'll find for you.
              </p>
            </div>
          </div>

          {/* User input */}
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSubmit() }}
              placeholder="e.g. I run a 6-person design agency, about $25k/month in expenses — software, contractors, and rent..."
              className="w-full bg-bg-secondary border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-text-secondary resize-none focus:outline-none focus:border-accent/50 transition-colors"
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!message.trim() || loading}
            className="w-full bg-accent text-bg-primary font-bold text-lg rounded-xl px-8 py-4 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                Building your plan...
              </>
            ) : (
              'Build my action plan →'
            )}
          </button>

          <button
            onClick={() => setStep('connect')}
            className="w-full text-center text-text-secondary text-xs mt-4 hover:text-white transition-colors"
          >
            Skip — take me straight to the dashboard
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Plan
  if (step === 'plan' && plan) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="max-w-lg w-full">

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-2xl font-black text-white mb-2">Your custom action plan</h1>
            <p className="text-text-secondary text-sm">{plan.greeting}</p>
          </div>

          {/* AI response bubble */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-bg-primary font-black text-sm flex-shrink-0 mt-1">P</div>
            <div className="bg-bg-secondary border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex-1">
              <p className="text-text-secondary text-xs mb-4">Here's exactly what I'll dig into for your business:</p>
              <div className="space-y-4">
                {plan.actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{action.icon}</span>
                    <div>
                      <p className="text-white text-sm font-bold mb-0.5">{action.title}</p>
                      <p className="text-text-secondary text-xs leading-relaxed">{action.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('connect')}
            className="w-full bg-accent text-bg-primary font-bold text-lg rounded-xl px-8 py-4 hover:opacity-90 transition-opacity"
          >
            Let's do this — connect my data →
          </button>

          <p className="text-center text-text-secondary text-xs mt-4">Takes less than 60 seconds</p>
        </div>
      </div>
    )
  }

  // Step 3: Connect
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
            Connect your financial data
          </h1>
          <p className="text-text-secondary">
            Choose how you want to bring in your numbers. You can add more later.
          </p>
        </div>

        <div className="space-y-4">
          {/* QuickBooks */}
          <a
            href="/api/quickbooks/connect"
            className="flex items-center gap-5 bg-bg-secondary border border-white/10 hover:border-accent/40 rounded-2xl p-6 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2CA01C]/15 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                <circle cx="16" cy="16" r="14" fill="#2CA01C" />
                <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Q</text>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">Connect QuickBooks</p>
              <p className="text-text-secondary text-sm">Automatic sync — we pull everything for you</p>
            </div>
            <span className="text-accent text-lg group-hover:translate-x-1 transition-transform">→</span>
          </a>

          {/* CSV / Excel / PDF */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-5 bg-bg-secondary border border-white/10 hover:border-accent/40 rounded-2xl p-6 transition-colors group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 text-2xl">
              📁
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">Upload a file</p>
              <p className="text-text-secondary text-sm">CSV, Excel, or PDF bank statement — any format works</p>
            </div>
            <span className="text-accent text-lg group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Skip */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-center text-text-secondary text-sm hover:text-white transition-colors py-3"
          >
            Skip for now — I'll do this later
          </button>
        </div>

        <p className="text-center text-text-secondary text-xs mt-6">
          🔒 Read-only access · We never move money or make changes
        </p>
      </div>
    </div>
  )
}
