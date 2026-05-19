'use client'

import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'

export default function ExitIntent() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if ((e.clientY === undefined || e.clientY <= 0) && !dismissed) {
        setVisible(true)
        track('exit_intent_shown')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [dismissed])

  const dismiss = () => {
    setVisible(false)
    setDismissed(true)
    track('exit_intent_dismissed')
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-3xl mb-4">💸</div>
        <h3 className="text-white text-2xl font-black mb-3">
          Wait — find out how much you're losing before you go.
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          Takes 60 seconds. Your first month is completely free.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="#pricing"
            onClick={() => { dismiss(); track('exit_intent_converted') }}
            className="bg-accent text-bg-primary font-bold py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
          >
            Start My Free Month
          </a>
          <button
            onClick={dismiss}
            className="text-text-secondary text-sm hover:text-white transition-colors"
          >
            No thanks, I'll keep losing money
          </button>
        </div>
      </div>
    </div>
  )
}
