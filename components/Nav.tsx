'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-[36px] z-40 w-full bg-bg-primary/90 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white">
          Pocket<span className="text-accent">CFO</span>
        </Link>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        {/* Right CTAs — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#demo"
            className="text-sm text-white border border-white/20 rounded-lg px-4 py-2 hover:border-white/40 transition-colors"
          >
            Book a Demo
          </a>
          <a
            href="/signup"
            className="text-sm font-semibold bg-accent text-bg-primary rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href="/signup"
            className="text-sm font-semibold bg-accent text-bg-primary rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="text-white p-1"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-bg-primary px-6 py-4 flex flex-col gap-4">
          <a href="#how-it-works" onClick={() => setOpen(false)} className="text-text-secondary hover:text-white transition-colors text-sm">How It Works</a>
          <a href="#features" onClick={() => setOpen(false)} className="text-text-secondary hover:text-white transition-colors text-sm">Features</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="text-text-secondary hover:text-white transition-colors text-sm">Pricing</a>
          <a href="#demo" onClick={() => setOpen(false)} className="text-text-secondary hover:text-white transition-colors text-sm">Book a Demo</a>
        </div>
      )}
    </nav>
  )
}
