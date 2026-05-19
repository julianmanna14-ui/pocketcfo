# PocketCFO Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-converting, mobile-first landing page for PocketCFO — an AI financial analysis tool for SMB owners.

**Architecture:** Static Next.js 14 App Router site with Tailwind CSS for styling and Framer Motion for scroll-triggered animations. All sections are isolated React components assembled in a single page route. No backend — forms link to external signup/demo URLs (placeholder `#` until real URLs are provided).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, React Testing Library, Jest

---

## File Map

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Root layout — fonts, metadata, viewport |
| `app/page.tsx` | Assembles all sections in order |
| `app/globals.css` | CSS variables, global resets, Tailwind base |
| `components/TopBar.tsx` | Sticky risk reversal banner at very top |
| `components/Nav.tsx` | Sticky navigation with logo + links + CTAs |
| `components/Hero.tsx` | Hero section — headline, CTAs, ticker, dashboard mockup |
| `components/HowItWorks.tsx` | 3-step process with connecting line and stat bar |
| `components/Features.tsx` | Feature cards grid + hiring comparison table |
| `components/SocialProof.tsx` | Testimonial cards + stats bar |
| `components/Pricing.tsx` | Monthly/annual toggle + 3 pricing tier cards |
| `components/FAQ.tsx` | Accordion FAQ |
| `components/FinalCTA.tsx` | Closing CTA section |
| `components/Footer.tsx` | Footer with links and tagline |
| `components/ExitIntent.tsx` | Exit intent popup on mouse leave |
| `lib/analytics.ts` | Analytics event helper functions |
| `__tests__/Pricing.test.tsx` | Pricing toggle interaction test |
| `__tests__/FAQ.test.tsx` | Accordion open/close interaction test |
| `__tests__/ExitIntent.test.tsx` | Exit intent show/hide behavior test |

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json` (via CLI)
- Create: `app/globals.css`
- Create: `app/layout.tsx`

- [ ] **Step 1: Scaffold the Next.js project**

```bash
cd /Users/julianmanna/Desktop/ai-landing-page
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Expected output: Project files created, dependencies installed.

- [ ] **Step 2: Install Framer Motion and testing libraries**

```bash
npm install framer-motion
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

- [ ] **Step 3: Add Jest config**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

Create `jest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Replace `app/globals.css` with design system variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0A0D14;
  --bg-secondary: #0F1320;
  --accent: #00FF87;
  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --border: rgba(255, 255, 255, 0.08);
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-inter), sans-serif;
}
```

- [ ] **Step 6: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PocketCFO — Your AI CFO Works 24/7',
  description: "You're losing money right now. PocketCFO's AI agents scan every expense, subscription, and vendor contract to show you exactly where — and how to stop it.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:3000` with default Next.js page.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with Tailwind and Framer Motion"
```

---

## Task 2: Update Tailwind Config

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add brand colors to Tailwind config**

Replace content of `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0D14',
        'bg-secondary': '#0F1320',
        accent: '#00FF87',
        'text-secondary': '#9CA3AF',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: Build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add PocketCFO brand colors to Tailwind config"
```

---

## Task 3: TopBar Component

**Files:**
- Create: `components/TopBar.tsx`

- [ ] **Step 1: Create TopBar**

```tsx
export default function TopBar() {
  return (
    <div className="w-full bg-accent text-bg-primary text-sm font-semibold text-center py-2 px-4 sticky top-0 z-50">
      🎉 First month completely free — no credit card, no commitment, no risk.{' '}
      <a href="#pricing" className="underline hover:no-underline">
        Start free →
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Add TopBar to `app/page.tsx`**

```tsx
import TopBar from '@/components/TopBar'

export default function Home() {
  return (
    <main>
      <TopBar />
    </main>
  )
}
```

- [ ] **Step 3: Check in browser**

Open `http://localhost:3000`. You should see a green bar at the very top of the page.

- [ ] **Step 4: Commit**

```bash
git add components/TopBar.tsx app/page.tsx
git commit -m "feat: add sticky risk reversal TopBar"
```

---

## Task 4: Navigation

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Create Nav component**

```tsx
export default function Nav() {
  return (
    <nav className="sticky top-[36px] z-40 w-full bg-bg-primary/90 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-white">
          Pocket<span className="text-accent">CFO</span>
        </a>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="#demo"
            className="hidden md:inline-block text-sm text-white border border-white/20 rounded-lg px-4 py-2 hover:border-white/40 transition-colors"
          >
            Book a Demo
          </a>
          <a
            href="#pricing"
            className="text-sm font-semibold bg-accent text-bg-primary rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Add Nav to `app/page.tsx`**

```tsx
import TopBar from '@/components/TopBar'
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <main>
      <TopBar />
      <Nav />
    </main>
  )
}
```

- [ ] **Step 3: Check in browser**

Open `http://localhost:3000`. You should see a dark nav below the green TopBar. Scroll down (add temporary `h-screen` content to test stickiness if needed).

- [ ] **Step 4: Commit**

```bash
git add components/Nav.tsx app/page.tsx
git commit -m "feat: add sticky navigation with logo and CTAs"
```

---

## Task 5: Hero Section

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Create Hero with static content**

```tsx
'use client'

import { useEffect, useState } from 'react'

function SavingsTicker() {
  const [amount, setAmount] = useState(4832441)

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount((prev) => prev + Math.floor(Math.random() * 50 + 10))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-text-secondary mb-8">
      💸 Our AI has found{' '}
      <span className="text-accent font-bold">
        ${amount.toLocaleString()}
      </span>{' '}
      in savings for SMB owners this month
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="relative bg-bg-secondary border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-text-secondary">PocketCFO Dashboard</span>
      </div>
      <div className="space-y-3">
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-1">⚠ Savings Opportunity Found</p>
          <p className="text-white text-sm font-medium">You're overpaying $840/mo on SaaS subscriptions</p>
          <p className="text-text-secondary text-xs mt-1">3 duplicate tools identified · Renegotiation possible on 2 contracts</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">Cash Flow Alert</p>
          <p className="text-white text-sm">$12,400 gap detected in Week 3 of next month</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">Revenue Leakage</p>
          <p className="text-white text-sm">2 uninvoiced projects — $3,200 recoverable</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="bg-bg-primary min-h-screen flex items-center py-20 px-6">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <div>
          <SavingsTicker />

          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-accent text-sm font-medium mb-6">
            ⚡ AI-Powered Financial Analysis
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            You're Losing Money{' '}
            <span className="text-accent">Right Now.</span>{' '}
            We'll Show You Exactly Where.
          </h1>

          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            While you sleep, your AI CFO is finding money you didn't know you had. Connect QuickBooks or Xero in 60 seconds. Our AI scans every expense, subscription, and vendor contract — then shows you exactly how to save.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <a
              href="#pricing"
              className="bg-accent text-bg-primary font-bold text-lg rounded-xl px-8 py-4 text-center hover:opacity-90 transition-opacity"
            >
              Start Free — First Month On Us
            </a>
            <a
              href="#demo"
              className="border border-white/20 text-white font-semibold text-lg rounded-xl px-8 py-4 text-center hover:border-white/40 transition-colors"
            >
              See a Live Demo
            </a>
          </div>

          <p className="text-text-secondary text-sm">
            🔒 Bank-level encryption · No credit card required · Cancel anytime
          </p>
        </div>

        {/* Right: dashboard mockup */}
        <div className="hidden md:block">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Hero to `app/page.tsx`**

```tsx
import TopBar from '@/components/TopBar'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main>
      <TopBar />
      <Nav />
      <Hero />
    </main>
  )
}
```

- [ ] **Step 3: Check in browser**

Open `http://localhost:3000`. You should see the full hero with headline, two CTA buttons, the ticker incrementing every 2 seconds, and the dashboard mockup on the right.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "feat: add Hero section with savings ticker and dashboard mockup"
```

---

## Task 6: How It Works Section

**Files:**
- Create: `components/HowItWorks.tsx`

- [ ] **Step 1: Create HowItWorks component**

```tsx
const steps = [
  {
    number: '01',
    icon: '🔗',
    title: 'Connect Your Books',
    description: 'Link QuickBooks, Xero, FreshBooks, or upload a CSV. Takes 60 seconds.',
  },
  {
    number: '02',
    icon: '🧠',
    title: 'AI Scans Everything',
    description: 'Our agents comb through every transaction, subscription, vendor, and payroll line — nothing gets missed.',
  },
  {
    number: '03',
    icon: '💰',
    title: 'Get Your Savings Report',
    description: 'You receive a plain-English breakdown of exactly where you\'re overspending and what to do about it.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg-secondary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">How It Works</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
          From connected to saving in under 5 minutes.
        </h2>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-accent/20" />

          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="w-16 h-16 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-center text-2xl mb-6">
                {step.icon}
              </div>
              <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Step {step.number}</p>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Stat bar */}
        <div className="mt-16 bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
          <p className="text-white text-xl font-bold">
            📊 Average customer saves{' '}
            <span className="text-accent">$2,400/month</span>{' '}
            in the first 90 days
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add HowItWorks to `app/page.tsx`**

Add `<HowItWorks />` after `<Hero />` in the page. Import it at the top.

- [ ] **Step 3: Check in browser**

Scroll past the hero. You should see 3 steps with icons and descriptions, a faint green connecting line between them (desktop), and the stat bar below.

- [ ] **Step 4: Commit**

```bash
git add components/HowItWorks.tsx app/page.tsx
git commit -m "feat: add How It Works section with 3-step process"
```

---

## Task 7: Features Section

**Files:**
- Create: `components/Features.tsx`

- [ ] **Step 1: Create Features component**

```tsx
const features = [
  { icon: '💳', title: 'Subscription Audit', description: 'Finds duplicate, unused, or overpriced SaaS tools you forgot you\'re paying for.' },
  { icon: '🧾', title: 'Expense Analysis', description: 'Flags unusual spending patterns and categories bleeding cash.' },
  { icon: '🤝', title: 'Vendor Contracts', description: 'Compares your rates against market benchmarks and spots renegotiation opportunities.' },
  { icon: '💰', title: 'Cash Flow Gaps', description: 'Identifies timing mismatches between income and payments before they become a crisis.' },
  { icon: '👥', title: 'Payroll Efficiency', description: 'Surfaces overtime patterns, redundant roles, or scheduling inefficiencies.' },
  { icon: '📈', title: 'Revenue Leakage', description: 'Catches unbilled work, missed invoices, and lost revenue hiding in your books.' },
]

const comparisonRows = [
  { human: '$60,000–$120,000/year', ai: 'Starting at $79/month' },
  { human: '+ Health insurance', ai: 'No benefits package' },
  { human: '+ PTO & sick days', ai: 'Never takes a day off' },
  { human: '+ Payroll taxes', ai: 'No payroll taxes' },
  { human: '+ 401K / retirement', ai: 'No retirement contributions' },
  { human: '+ Onboarding & training', ai: 'Live in 60 seconds' },
  { human: 'Works 9–5, takes vacation', ai: 'Runs 24/7, 365 days a year' },
  { human: 'Reviews last month\'s data', ai: 'Real-time, always current' },
  { human: 'Misses patterns in volume', ai: 'Scans every single line' },
]

export default function Features() {
  return (
    <section id="features" className="bg-bg-primary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">What the AI Looks At</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
          Every dollar. Every line. Nothing hidden.
        </h2>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-bg-secondary border border-white/5 rounded-2xl p-6 hover:border-accent/20 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Callout box */}
        <div className="border-l-4 border-accent bg-accent/5 rounded-r-2xl p-6 mb-16">
          <p className="text-white font-medium">
            "Most SMBs have 3–5 fixable cost problems they don't know about. Our AI finds all of them."
          </p>
        </div>

        {/* Hiring comparison table */}
        <div className="bg-bg-secondary border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 bg-white/5">
            <div className="p-4 text-text-secondary text-sm font-semibold uppercase tracking-wide border-r border-white/10">
              Hiring a Bookkeeper / CFO
            </div>
            <div className="p-4 text-accent text-sm font-semibold uppercase tracking-wide">
              PocketCFO AI
            </div>
          </div>

          {comparisonRows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 border-t border-white/5">
              <div className="p-4 text-text-secondary text-sm border-r border-white/5">{row.human}</div>
              <div className="p-4 text-white text-sm">{row.ai}</div>
            </div>
          ))}

          {/* Total row */}
          <div className="grid grid-cols-2 border-t-2 border-white/20 bg-white/5">
            <div className="p-4 text-white font-bold text-sm border-r border-white/10">TRUE COST: $90K–$150K+/yr</div>
            <div className="p-4 text-accent font-bold text-sm">A fraction of that. Daily.</div>
          </div>
        </div>

        {/* Anchor callout */}
        <p className="text-center text-accent font-bold text-xl mt-8">
          Get CFO-level insight at 1% of the true cost of hiring.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Features to `app/page.tsx`**

Add `<Features />` after `<HowItWorks />`. Import at top.

- [ ] **Step 3: Check in browser**

Scroll to features. You should see 6 cards in a grid, the callout box, and the full comparison table with a highlighted total row.

- [ ] **Step 4: Commit**

```bash
git add components/Features.tsx app/page.tsx
git commit -m "feat: add Features section with cards and hiring comparison table"
```

---

## Task 8: Social Proof Section

**Files:**
- Create: `components/SocialProof.tsx`

- [ ] **Step 1: Create SocialProof component**

```tsx
const testimonials = [
  {
    quote: 'Within the first week, the AI found $1,200/month in overlapping software subscriptions we completely forgot about. That\'s $14,400 back in our pocket every year.',
    name: 'Marcus T.',
    role: 'Restaurant Owner',
    saved: 'Saved $14,400/yr',
  },
  {
    quote: 'I was overpaying three vendors by 20–30% compared to market rates. The AI flagged it with exact numbers. I renegotiated two contracts the same week.',
    name: 'Lisa R.',
    role: 'Retail Boutique Owner',
    saved: 'Saved $8,600/yr',
  },
  {
    quote: 'It found unbilled work from the past 6 months I never invoiced. Found $4,000 in revenue I just left on the table. Paid for itself in day one.',
    name: 'James K.',
    role: 'Freelance Contractor',
    saved: 'Recovered $4,000',
  },
]

const stats = [
  { value: '$2,400/mo', label: 'Average savings' },
  { value: '3–5 issues', label: 'Found per business' },
  { value: '60 seconds', label: 'To get started' },
]

export default function SocialProof() {
  return (
    <section className="bg-bg-secondary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Real Businesses. Real Savings.</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-16">
          SMB owners found money they didn't know they had.
        </h2>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-bg-primary border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-accent text-lg">★</span>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.quote}"</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-text-secondary text-xs">{t.role}</p>
                </div>
                <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full">
                  {t.saved}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-accent text-3xl md:text-4xl font-black mb-2">{s.value}</p>
              <p className="text-text-secondary text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add SocialProof to `app/page.tsx`**

Add `<SocialProof />` after `<Features />`. Import at top.

- [ ] **Step 3: Check in browser**

Scroll to testimonials. You should see 3 cards with 5 green stars each, quotes, names, and saved amounts. The stats bar should show 3 numbers below.

- [ ] **Step 4: Commit**

```bash
git add components/SocialProof.tsx app/page.tsx
git commit -m "feat: add Social Proof section with testimonials and stats"
```

---

## Task 9: Pricing Section

**Files:**
- Create: `components/Pricing.tsx`
- Create: `__tests__/Pricing.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/Pricing.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import Pricing from '@/components/Pricing'

describe('Pricing', () => {
  it('shows monthly prices by default', () => {
    render(<Pricing />)
    expect(screen.getByText('$79')).toBeInTheDocument()
    expect(screen.getByText('$149')).toBeInTheDocument()
    expect(screen.getByText('$299')).toBeInTheDocument()
  })

  it('switches to annual prices when toggle is clicked', () => {
    render(<Pricing />)
    fireEvent.click(screen.getByRole('button', { name: /annual/i }))
    expect(screen.getByText('$66')).toBeInTheDocument()
    expect(screen.getByText('$124')).toBeInTheDocument()
    expect(screen.getByText('$249')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=Pricing
```

Expected: FAIL — `Cannot find module '@/components/Pricing'`

- [ ] **Step 3: Create Pricing component**

```tsx
'use client'

import { useState } from 'react'

const tiers = [
  {
    name: 'Starter',
    monthlyPrice: 79,
    description: 'Find problems before they sink you.',
    features: [
      '1 accounting software connection',
      'Monthly AI financial report',
      'Subscription & expense audit',
      'Email support',
      'First month free',
    ],
    notIncluded: ['Vendor benchmarking', 'Cash flow detection', 'Payroll analysis', 'Multi-user access'],
    cta: 'Start Free Month',
    popular: false,
  },
  {
    name: 'Growth',
    monthlyPrice: 149,
    description: 'Monitor and fix problems in real time.',
    features: [
      'Multiple software connections',
      'Real-time AI monitoring',
      'Subscription & expense audit',
      'Vendor contract benchmarking',
      'Cash flow gap detection',
      'Revenue leakage detection',
      'Priority support',
      'First month free',
    ],
    notIncluded: ['Payroll efficiency analysis', 'Multi-user access', 'Quarterly strategy call'],
    cta: 'Start Free Month',
    popular: true,
  },
  {
    name: 'Pro',
    monthlyPrice: 299,
    description: 'Optimize everything + human backup.',
    features: [
      'Everything in Growth',
      'Payroll efficiency analysis',
      'Multi-user access',
      'Custom savings forecasting',
      'Quarterly strategy call',
      'Phone + priority support',
      'First month free',
    ],
    notIncluded: [],
    cta: 'Start Free Month',
    popular: false,
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  const displayPrice = (monthly: number) =>
    annual ? Math.floor(monthly * (10 / 12)) : monthly

  return (
    <section id="pricing" className="bg-bg-primary py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          Start free. Stay because it pays for itself.
        </h2>
        <p className="text-text-secondary text-lg mb-10">
          Your first month is completely free. No credit card required. Cancel anytime.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => setAnnual(false)}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${!annual ? 'bg-accent text-bg-primary' : 'text-text-secondary hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${annual ? 'bg-accent text-bg-primary' : 'text-text-secondary hover:text-white'}`}
          >
            Annual
          </button>
          {annual && (
            <span className="text-accent text-sm font-semibold bg-accent/10 px-3 py-1 rounded-full">
              2 months free
            </span>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-bg-secondary rounded-2xl p-8 border flex flex-col ${
                tier.popular ? 'border-accent' : 'border-white/10'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-bg-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-2">{tier.name}</h3>
                <p className="text-text-secondary text-sm mb-4">{tier.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-white text-5xl font-black">${displayPrice(tier.monthlyPrice)}</span>
                  <span className="text-text-secondary text-sm mb-2">/mo{annual ? ' billed annually' : ''}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white">
                    <span className="text-accent mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
                {tier.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary line-through">
                    <span className="mt-0.5">✕</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#signup"
                className={`text-center font-bold py-3 rounded-xl transition-opacity hover:opacity-90 ${
                  tier.popular
                    ? 'bg-accent text-bg-primary'
                    : 'border border-white/20 text-white hover:border-white/40'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-accent font-bold text-lg">
          Even Pro costs less per month than one day of an employee's salary.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=Pricing
```

Expected: PASS — 2 tests passing.

- [ ] **Step 5: Add Pricing to `app/page.tsx`**

Add `<Pricing />` after `<SocialProof />`. Import at top.

- [ ] **Step 6: Check in browser**

Scroll to pricing. You should see 3 cards, the Growth card highlighted with a green border and "Most Popular" badge. Click "Annual" — prices should drop (e.g., $79 → $66) and "2 months free" badge appears.

- [ ] **Step 7: Commit**

```bash
git add components/Pricing.tsx __tests__/Pricing.test.tsx app/page.tsx
git commit -m "feat: add Pricing section with monthly/annual toggle"
```

---

## Task 10: FAQ Section

**Files:**
- Create: `components/FAQ.tsx`
- Create: `__tests__/FAQ.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/FAQ.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import FAQ from '@/components/FAQ'

describe('FAQ', () => {
  it('renders all questions', () => {
    render(<FAQ />)
    expect(screen.getByText('Is my financial data safe?')).toBeInTheDocument()
    expect(screen.getByText('Can I cancel anytime?')).toBeInTheDocument()
  })

  it('answers are hidden by default', () => {
    render(<FAQ />)
    expect(screen.queryByText(/Bank-level 256-bit encryption/)).not.toBeVisible()
  })

  it('clicking a question reveals the answer', () => {
    render(<FAQ />)
    fireEvent.click(screen.getByText('Is my financial data safe?'))
    expect(screen.getByText(/Bank-level 256-bit encryption/)).toBeVisible()
  })

  it('clicking an open question closes it', () => {
    render(<FAQ />)
    fireEvent.click(screen.getByText('Is my financial data safe?'))
    fireEvent.click(screen.getByText('Is my financial data safe?'))
    expect(screen.queryByText(/Bank-level 256-bit encryption/)).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=FAQ
```

Expected: FAIL — `Cannot find module '@/components/FAQ'`

- [ ] **Step 3: Create FAQ component**

```tsx
'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'Is my financial data safe?',
    answer: 'Yes. We use bank-level 256-bit encryption. We never sell your data, never share it, and you can delete everything at any time. We connect via read-only access — we can see your numbers but we cannot move money or make any changes.',
  },
  {
    question: 'Which accounting software do you connect with?',
    answer: 'We connect with QuickBooks, Xero, FreshBooks, Wave, Sage, Zoho Books, Gusto, ADP, Paychex, Plaid, Expensify, Ramp, Brex, Shopify, and Stripe. Don\'t see yours? Use our CSV upload or contact us — we\'re adding integrations every month.',
  },
  {
    question: 'How accurate is the AI analysis?',
    answer: 'Our agents flag issues with confidence scores — you always see how certain the AI is before acting on a recommendation. Nothing is hidden or black-box.',
  },
  {
    question: 'What happens after my free month?',
    answer: "You'll get a reminder 5 days before your trial ends. If you choose to continue, you're billed on your chosen plan. If not, no charge — ever.",
  },
  {
    question: 'Do I need an accountant or finance background to use this?',
    answer: 'Not at all. Every report is written in plain English. If the AI finds a problem, it tells you exactly what it is and what to do about it — no jargon.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. No contracts, no cancellation fees, no questions asked.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-white font-semibold">{question}</span>
        <span className="text-accent text-xl ml-4 flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '200px' : '0px' }}
        aria-hidden={!open}
      >
        <p className="text-text-secondary text-sm leading-relaxed pb-5">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  return (
    <section className="bg-bg-secondary py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Common Questions</p>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-12">
          Everything you're wondering about.
        </h2>

        <div>
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=FAQ
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Add FAQ to `app/page.tsx`**

Add `<FAQ />` after `<Pricing />`. Import at top.

- [ ] **Step 6: Check in browser**

Scroll to FAQ. Click each question — the answer should expand smoothly. Click again — it should collapse.

- [ ] **Step 7: Commit**

```bash
git add components/FAQ.tsx __tests__/FAQ.test.tsx app/page.tsx
git commit -m "feat: add FAQ section with accordion interaction"
```

---

## Task 11: Final CTA Section

**Files:**
- Create: `components/FinalCTA.tsx`

- [ ] **Step 1: Create FinalCTA component**

```tsx
export default function FinalCTA() {
  return (
    <section className="relative bg-bg-primary py-32 px-6 overflow-hidden">
      {/* Green glow behind headline */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
          Stop guessing.{' '}
          <span className="text-accent">Start saving.</span>{' '}
          Today.
        </h2>
        <p className="text-text-secondary text-lg mb-10">
          Join hundreds of SMB owners who found money they didn't know they had — in the first week.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="#signup"
            className="bg-accent text-bg-primary font-bold text-lg rounded-xl px-10 py-4 text-center hover:opacity-90 transition-opacity"
          >
            Start My Free Month — No Card Needed
          </a>
          <a
            href="#demo"
            className="border border-white/20 text-white font-semibold text-lg rounded-xl px-10 py-4 text-center hover:border-white/40 transition-colors"
          >
            Book a Demo Instead
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-text-secondary text-sm">
          <span>🔒 Bank-level encryption</span>
          <span>✅ No credit card required</span>
          <span>❌ Cancel anytime</span>
          <span>⚡ Live in 60 seconds</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add FinalCTA to `app/page.tsx`**

Add `<FinalCTA />` after `<FAQ />`. Import at top.

- [ ] **Step 3: Check in browser**

Scroll to the bottom. You should see the headline with a soft green glow behind it, two CTA buttons, and the 4 trust signals.

- [ ] **Step 4: Commit**

```bash
git add components/FinalCTA.tsx app/page.tsx
git commit -m "feat: add Final CTA section with glow effect"
```

---

## Task 12: Footer

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Create Footer component**

```tsx
export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-white/5 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-white">
          Pocket<span className="text-accent">CFO</span>
        </a>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* Tagline */}
        <p className="text-text-secondary text-sm text-center md:text-right">
          Your AI CFO works 24/7 to make sure your business keeps every dollar it earns.
        </p>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5">
        <p className="text-text-secondary text-xs text-center">
          © 2026 PocketCFO. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Add Footer to `app/page.tsx`**

Add `<Footer />` as the last element inside `<main>`. Import at top.

- [ ] **Step 3: Check in browser**

Scroll to the very bottom. You should see the logo, links, tagline, and copyright line.

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx app/page.tsx
git commit -m "feat: add Footer with links and brand tagline"
```

---

## Task 13: Exit Intent Popup

**Files:**
- Create: `components/ExitIntent.tsx`
- Create: `__tests__/ExitIntent.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/ExitIntent.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import ExitIntent from '@/components/ExitIntent'

describe('ExitIntent', () => {
  it('is not visible initially', () => {
    render(<ExitIntent />)
    expect(screen.queryByText(/find out how much you're losing/i)).not.toBeInTheDocument()
  })

  it('shows when mouseleave fires near top of page', () => {
    render(<ExitIntent />)
    fireEvent.mouseLeave(document, { clientY: 0 })
    expect(screen.getByText(/find out how much you're losing/i)).toBeInTheDocument()
  })

  it('dismisses when close button is clicked', () => {
    render(<ExitIntent />)
    fireEvent.mouseLeave(document, { clientY: 0 })
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByText(/find out how much you're losing/i)).not.toBeInTheDocument()
  })

  it('does not show again after dismissal', () => {
    render(<ExitIntent />)
    fireEvent.mouseLeave(document, { clientY: 0 })
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    fireEvent.mouseLeave(document, { clientY: 0 })
    expect(screen.queryByText(/find out how much you're losing/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=ExitIntent
```

Expected: FAIL — `Cannot find module '@/components/ExitIntent'`

- [ ] **Step 3: Create ExitIntent component**

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function ExitIntent() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setVisible(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [dismissed])

  const dismiss = () => {
    setVisible(false)
    setDismissed(true)
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
            onClick={dismiss}
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=ExitIntent
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Add ExitIntent to `app/page.tsx`**

Add `<ExitIntent />` just before the closing `</main>`. Import at top.

- [ ] **Step 6: Check in browser**

Move your mouse quickly out of the top of the browser window. The popup should appear. Click "No thanks" or ✕ to dismiss. Moving mouse out again should NOT show it again.

- [ ] **Step 7: Commit**

```bash
git add components/ExitIntent.tsx __tests__/ExitIntent.test.tsx app/page.tsx
git commit -m "feat: add exit intent popup with one-time dismissal"
```

---

## Task 14: Scroll-Triggered Animations

**Files:**
- Modify: `components/HowItWorks.tsx`
- Modify: `components/Features.tsx`
- Modify: `components/SocialProof.tsx`
- Modify: `components/Pricing.tsx`

- [ ] **Step 1: Create a reusable FadeInUp wrapper**

Add this to the top of each component file that needs animation (or extract to `components/FadeInUp.tsx` if you prefer):

```tsx
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function FadeInUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

Create this as `components/FadeInUp.tsx`.

- [ ] **Step 2: Wrap cards in HowItWorks with FadeInUp**

In `components/HowItWorks.tsx`, add `'use client'` at the top. Import `FadeInUp`. Wrap each step `<div>` with `<FadeInUp delay={index * 0.15}>`:

```tsx
{steps.map((step, index) => (
  <FadeInUp key={step.number} delay={index * 0.15}>
    <div className="relative">
      {/* ...existing step content... */}
    </div>
  </FadeInUp>
))}
```

- [ ] **Step 3: Wrap feature cards in Features with FadeInUp**

In `components/Features.tsx`, add `'use client'` at the top. Import `FadeInUp`. Wrap each feature card:

```tsx
{features.map((f, index) => (
  <FadeInUp key={f.title} delay={index * 0.1}>
    <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6 hover:border-accent/20 transition-colors">
      {/* ...existing card content... */}
    </div>
  </FadeInUp>
))}
```

- [ ] **Step 4: Wrap testimonial cards in SocialProof with FadeInUp**

In `components/SocialProof.tsx`, add `'use client'` at the top. Import `FadeInUp`. Wrap each testimonial card:

```tsx
{testimonials.map((t, index) => (
  <FadeInUp key={t.name} delay={index * 0.15}>
    <div className="bg-bg-primary border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
      {/* ...existing testimonial content... */}
    </div>
  </FadeInUp>
))}
```

- [ ] **Step 5: Check in browser**

Scroll slowly through the page. Cards in each section should fade in and slide up as they enter the viewport. They should only animate once.

- [ ] **Step 6: Commit**

```bash
git add components/FadeInUp.tsx components/HowItWorks.tsx components/Features.tsx components/SocialProof.tsx
git commit -m "feat: add scroll-triggered fade-in animations to section cards"
```

---

## Task 15: Analytics Events

**Files:**
- Create: `lib/analytics.ts`
- Modify: `components/Hero.tsx`, `components/Pricing.tsx`, `components/FinalCTA.tsx`, `components/ExitIntent.tsx`

- [ ] **Step 1: Create analytics helper**

Create `lib/analytics.ts`:

```typescript
type EventName =
  | 'cta_click_hero_trial'
  | 'cta_click_hero_demo'
  | 'cta_click_pricing_trial'
  | 'cta_click_final_trial'
  | 'cta_click_final_demo'
  | 'exit_intent_shown'
  | 'exit_intent_dismissed'
  | 'exit_intent_converted'
  | 'pricing_toggle_annual'
  | 'pricing_toggle_monthly'

export function track(event: EventName, properties?: Record<string, string | number>) {
  if (typeof window === 'undefined') return
  // Replace with your analytics provider (e.g., Plausible, PostHog, GA4)
  console.log('[analytics]', event, properties)
  // Example PostHog: window.posthog?.capture(event, properties)
  // Example GA4: window.gtag?.('event', event, properties)
}
```

- [ ] **Step 2: Add tracking to Hero CTAs**

In `components/Hero.tsx`, import `track` and add `onClick` to each CTA button:

```tsx
import { track } from '@/lib/analytics'

// Primary CTA:
<a href="#pricing" onClick={() => track('cta_click_hero_trial')} ...>

// Secondary CTA:
<a href="#demo" onClick={() => track('cta_click_hero_demo')} ...>
```

- [ ] **Step 3: Add tracking to Pricing toggle and CTA buttons**

In `components/Pricing.tsx`, import `track` and add to toggle buttons and CTA links:

```tsx
import { track } from '@/lib/analytics'

// Annual toggle:
onClick={() => { setAnnual(true); track('pricing_toggle_annual') }}

// Monthly toggle:
onClick={() => { setAnnual(false); track('pricing_toggle_monthly') }}

// Each tier CTA link:
onClick={() => track('cta_click_pricing_trial', { tier: tier.name })}
```

- [ ] **Step 4: Add tracking to ExitIntent**

In `components/ExitIntent.tsx`, import `track`:

```tsx
import { track } from '@/lib/analytics'

// When popup becomes visible:
setVisible(true)
track('exit_intent_shown')

// When dismissed:
const dismiss = () => {
  setVisible(false)
  setDismissed(true)
  track('exit_intent_dismissed')
}

// When "Start My Free Month" clicked:
onClick={() => { dismiss(); track('exit_intent_converted') }}
```

- [ ] **Step 5: Verify events fire in browser console**

Open DevTools → Console. Interact with each CTA button, the pricing toggle, and trigger the exit intent. You should see `[analytics] event_name` logged for each action.

- [ ] **Step 6: Commit**

```bash
git add lib/analytics.ts components/Hero.tsx components/Pricing.tsx components/ExitIntent.tsx components/FinalCTA.tsx
git commit -m "feat: add analytics event tracking to all CTAs and interactions"
```

---

## Task 16: Mobile Responsiveness Audit

**Files:**
- Modify: any component that needs mobile fixes

- [ ] **Step 1: Test at 375px width (iPhone SE)**

Open DevTools → Toggle device toolbar → Select iPhone SE (375px). Check each section:

- TopBar: text should wrap cleanly, not overflow
- Nav: hamburger or stacked layout — desktop links should be hidden (`hidden md:flex` already handles this), only logo + green CTA visible
- Hero: single column, headline readable, both CTA buttons stacked vertically (`flex-col sm:flex-row` already handles this)
- HowItWorks: steps should stack vertically (grid changes to single col on mobile via `grid md:grid-cols-3`)
- Features: cards should stack to single column
- SocialProof: testimonial cards should stack vertically
- Pricing: cards should stack vertically, toggle should be visible
- FAQ: accordion should work on touch
- FinalCTA: buttons should stack vertically
- Footer: logo, links, tagline should stack centered

- [ ] **Step 2: Fix any overflow or layout issues found**

Common fixes — apply only if issues exist:

```tsx
// If hero headline is too large on mobile:
className="text-3xl md:text-6xl ..."  // reduce base size

// If comparison table overflows on mobile:
// Wrap table div in:
<div className="overflow-x-auto">
  {/* table */}
</div>

// If pricing cards don't stack properly:
className="grid grid-cols-1 md:grid-cols-3 ..."
```

- [ ] **Step 3: Test at 768px width (iPad)**

Verify 2-column layouts work cleanly at tablet width. Pricing cards should still show 3 columns at `md:` breakpoint or gracefully handle the middle state.

- [ ] **Step 4: Run full test suite to confirm no regressions**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "fix: mobile responsiveness audit and layout fixes"
```

---

## Task 17: Final Build and Verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass (Pricing, FAQ, ExitIntent).

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build completes with no errors or TypeScript issues.

- [ ] **Step 3: Run production server and do final walkthrough**

```bash
npm run start
```

Open `http://localhost:3000` and walk through the full page:
- TopBar visible and sticky ✓
- Nav sticky below TopBar with working anchor links ✓
- Hero headline visible, ticker incrementing, dashboard mockup showing ✓
- HowItWorks section with 3 steps ✓
- Features section with 6 cards and comparison table ✓
- Social proof with 3 testimonials and stats ✓
- Pricing with toggle, 3 tiers, Growth card highlighted ✓
- FAQ accordion opening and closing ✓
- Final CTA with glow effect ✓
- Footer with links and tagline ✓
- Exit intent popup on mouse leave ✓
- Animations firing on scroll ✓
- Analytics events logging in console ✓

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: PocketCFO landing page — complete"
```

---

## Spec Coverage Check

| Spec Requirement | Covered In |
|---|---|
| Sticky TopBar with free trial message | Task 3 |
| Sticky Nav with logo, links, dual CTAs | Task 4 |
| Hero — headline, subheadline, CTAs, trust line | Task 5 |
| Live savings ticker | Task 5 |
| Dashboard mockup visual | Task 5 |
| How It Works — 3 steps + stat bar | Task 6 |
| Feature cards 2x3 grid | Task 7 |
| Hiring comparison table with PTO/benefits | Task 7 |
| Social proof testimonials | Task 8 |
| Stats bar | Task 8 |
| Pricing tiers $79/$149/$299 | Task 9 |
| Monthly/annual toggle | Task 9 |
| First month free on all tiers | Task 9 |
| FAQ accordion | Task 10 |
| Final CTA with glow | Task 11 |
| Footer with tagline | Task 12 |
| Exit intent popup | Task 13 |
| Scroll-triggered animations | Task 14 |
| Analytics event tracking | Task 15 |
| Mobile-first responsive | Task 16 |
