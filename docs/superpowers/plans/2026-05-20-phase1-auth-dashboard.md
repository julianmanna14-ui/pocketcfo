# PocketCFO Phase 1 — Auth & Dashboard Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase email/password auth and a dashboard shell to the existing PocketCFO Next.js landing page.

**Architecture:** Supabase SSR auth with Next.js 16 App Router. Route protection is handled by `proxy.ts` (Next.js 16's renamed middleware — file MUST be `proxy.ts`, function MUST be `proxy`). Auth forms use React Server Actions. Dashboard is a protected server component that reads the Supabase session server-side.

**Tech Stack:** Next.js 16, Supabase (@supabase/supabase-js + @supabase/ssr), Tailwind v4, TypeScript

---

## CRITICAL: Next.js 16 Breaking Change

In Next.js 16, Middleware was renamed to **Proxy**:
- File: `proxy.ts` (NOT `middleware.ts`)
- Export: `export function proxy(request)` (NOT `export function middleware`)
- Everything else (NextRequest, NextResponse, matcher config) works the same

---

## File Map

| File | Responsibility |
|---|---|
| `lib/supabase/client.ts` | Browser-side Supabase client (for Client Components) |
| `lib/supabase/server.ts` | Server-side Supabase client (reads cookies, for Server Components + Server Actions) |
| `proxy.ts` | Protects /dashboard, redirects unauthenticated → /login, logged-in users on /login or /signup → /dashboard |
| `app/signup/page.tsx` | Signup page — email, password, confirm password form |
| `app/login/page.tsx` | Login page — email, password form |
| `app/dashboard/layout.tsx` | Dashboard layout — dark nav with logo, links, logout button |
| `app/dashboard/page.tsx` | Dashboard shell — welcome banner, connect banner, greyed-out insight cards |
| `app/actions/auth.ts` | Server Actions for signup, login, logout |

**Modified Files:**
| File | Change |
|---|---|
| `components/Nav.tsx` | "Start Free Trial" href: `#pricing` → `/signup` |
| `components/TopBar.tsx` | "Start free →" href: `#pricing` → `/signup` |
| `components/Hero.tsx` | Primary CTA href: `#pricing` → `/signup` |
| `components/FinalCTA.tsx` | Primary CTA href: `#signup` → `/signup` |
| `components/Pricing.tsx` | All tier CTA hrefs: `#signup` → `/signup` |
| `components/ExitIntent.tsx` | CTA href: `#pricing` → `/signup` |

---

## Task 1: Install Supabase Dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install Supabase packages**

```bash
export PATH="/usr/local/bin:$PATH"
cd /Users/julianmanna/Desktop/ai-landing-page
npm install @supabase/supabase-js @supabase/ssr
```

Expected output: `added X packages`

- [ ] **Step 2: Verify .env.local has the credentials**

```bash
cat .env.local
```

Expected output:
```
NEXT_PUBLIC_SUPABASE_URL=https://ixiveyhjayhbbqwafffh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KFAivsRumploE2Twpy6waw_6DcbaGms
```

If missing, create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://ixiveyhjayhbbqwafffh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KFAivsRumploE2Twpy6waw_6DcbaGms
```

- [ ] **Step 3: Verify build still passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install Supabase auth dependencies"
```

---

## Task 2: Supabase Client Helpers

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Create browser client (`lib/supabase/client.ts`)**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server client (`lib/supabase/server.ts`)**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can't be set here, only in Server Actions/Route Handlers
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: Build completes without errors.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts
git commit -m "feat: add Supabase browser and server client helpers"
```

---

## Task 3: Server Actions for Auth

**Files:**
- Create: `app/actions/auth.ts`

- [ ] **Step 1: Create auth Server Actions**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/signup?error=passwords_mismatch')
  }

  if (password.length < 8) {
    redirect('/signup?error=password_too_short')
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
      redirect('/signup?error=email_exists')
    }
    redirect('/signup?error=unknown')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=invalid_credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
```

- [ ] **Step 2: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: Build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add app/actions/auth.ts
git commit -m "feat: add signup, login, logout Server Actions"
```

---

## Task 4: Proxy (Route Protection)

**Files:**
- Create: `proxy.ts` (NOT middleware.ts — Next.js 16 renamed it)

- [ ] **Step 1: Create `proxy.ts` in project root**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Unauthenticated user trying to access /dashboard → send to /login
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated user visiting /login or /signup → send to /dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
```

- [ ] **Step 2: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: Build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat: add proxy for dashboard route protection"
```

---

## Task 5: Signup Page

**Files:**
- Create: `app/signup/page.tsx`

- [ ] **Step 1: Create signup page**

```tsx
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

const errorMessages: Record<string, string> = {
  passwords_mismatch: 'Passwords do not match.',
  password_too_short: 'Password must be at least 8 characters.',
  email_exists: 'An account with this email already exists. Log in instead.',
  unknown: 'Something went wrong. Please try again.',
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const errorMessage = params.error ? errorMessages[params.error] : null

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white">
            Pocket<span className="text-accent">CFO</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-2">
            Create your free account
          </h1>
          <p className="text-text-secondary text-sm mb-8">
            First month completely free — no credit card needed
          </p>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          <form action={signup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-text-secondary mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="Repeat your password"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
            >
              Start My Free Month →
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Log in →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: Build completes, `/signup` route appears in output.

- [ ] **Step 3: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat: add signup page with email/password form"
```

---

## Task 6: Login Page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create login page**

```tsx
import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const hasError = params.error === 'invalid_credentials'

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white">
            Pocket<span className="text-accent">CFO</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-8">
            Welcome back
          </h1>

          {hasError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">Invalid email or password.</p>
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Your password"
                className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-bg-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
            >
              Log In →
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up free →
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: `/login` route appears in build output.

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add login page with email/password form"
```

---

## Task 7: Dashboard Layout

**Files:**
- Create: `app/dashboard/layout.tsx`

- [ ] **Step 1: Create dashboard layout with nav**

```tsx
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Dashboard Nav */}
      <nav className="bg-bg-secondary border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold text-white">
            Pocket<span className="text-accent">CFO</span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/dashboard" className="text-white font-semibold">
              Dashboard
            </Link>
            <span className="text-text-secondary cursor-not-allowed">
              Settings
            </span>
          </div>

          {/* Log Out */}
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-text-secondary hover:text-white transition-colors border border-white/10 rounded-lg px-4 py-2 hover:border-white/30"
            >
              Log Out
            </button>
          </form>
        </div>
      </nav>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat: add dashboard layout with nav and logout"
```

---

## Task 8: Dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard shell page**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const insightCards = [
  { icon: '💳', title: 'Savings Opportunities', value: '$0', sub: 'Connect to unlock' },
  { icon: '💰', title: 'Cash Flow', value: '—', sub: 'Connect to unlock' },
  { icon: '📈', title: 'Revenue Leakage', value: '—', sub: 'Connect to unlock' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          👋 Welcome, {user.email}
        </h1>
      </div>

      {/* Connect banner */}
      <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
        <h2 className="text-white font-bold text-xl mb-2">
          Connect your books to get started
        </h2>
        <p className="text-text-secondary mb-6">
          Your AI CFO is ready — it just needs access to your financials to get to work.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled
            title="Coming soon"
            className="bg-accent/20 text-accent font-semibold px-6 py-3 rounded-xl cursor-not-allowed opacity-60"
          >
            Connect QuickBooks
          </button>
          <button
            disabled
            title="Coming soon"
            className="border border-white/20 text-white/60 font-semibold px-6 py-3 rounded-xl cursor-not-allowed opacity-60"
          >
            Upload CSV
          </button>
        </div>
        <p className="text-text-secondary text-xs mt-4">
          ⚡ Integrations coming in Phase 2
        </p>
      </div>

      {/* Insight cards — locked */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Your Insights</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {insightCards.map((card) => (
            <div
              key={card.title}
              className="bg-bg-secondary border border-white/5 rounded-2xl p-6 opacity-40 cursor-not-allowed"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="text-white font-bold text-lg mb-1">{card.title}</h3>
              <p className="text-accent text-2xl font-black mb-1">{card.value}</p>
              <p className="text-text-secondary text-xs">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: `/dashboard` route appears in build output.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: add dashboard shell with connect banner and locked insight cards"
```

---

## Task 9: Update Landing Page CTAs

**Files:**
- Modify: `components/Nav.tsx`
- Modify: `components/TopBar.tsx`
- Modify: `components/Hero.tsx`
- Modify: `components/FinalCTA.tsx`
- Modify: `components/Pricing.tsx`
- Modify: `components/ExitIntent.tsx`

- [ ] **Step 1: Update Nav.tsx**

In `components/Nav.tsx`, change the "Start Free Trial" button href:

```tsx
// Change from:
href="#pricing"
// To:
href="/signup"
```

- [ ] **Step 2: Update TopBar.tsx**

In `components/TopBar.tsx`, change the "Start free →" link href:

```tsx
// Change from:
href="#pricing"
// To:
href="/signup"
```

- [ ] **Step 3: Update Hero.tsx**

In `components/Hero.tsx`, change the primary CTA href and its onClick tracking:

```tsx
// Change from:
href="#pricing"
onClick={() => track('cta_click_hero_trial')}
// To:
href="/signup"
onClick={() => track('cta_click_hero_trial')}
```

- [ ] **Step 4: Update FinalCTA.tsx**

In `components/FinalCTA.tsx`, change the primary CTA href:

```tsx
// Change from:
href="#signup"
// To:
href="/signup"
```

- [ ] **Step 5: Update Pricing.tsx**

In `components/Pricing.tsx`, change all tier CTA `<a>` hrefs:

```tsx
// Change from:
href="#signup"
// To:
href="/signup"
```

This appears once in the `tiers.map()` rendered `<a>` tag.

- [ ] **Step 6: Update ExitIntent.tsx**

In `components/ExitIntent.tsx`, change the CTA href:

```tsx
// Change from:
href="#pricing"
// To:
href="/signup"
```

- [ ] **Step 7: Verify build and run tests**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
npm test 2>&1 | tail -10
```

Expected: Build passes, all 10 tests pass.

- [ ] **Step 8: Commit**

```bash
git add components/Nav.tsx components/TopBar.tsx components/Hero.tsx components/FinalCTA.tsx components/Pricing.tsx components/ExitIntent.tsx
git commit -m "feat: update all landing page CTAs to link to /signup"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
export PATH="/usr/local/bin:$PATH"
npm test 2>&1
```

Expected: 10/10 tests pass.

- [ ] **Step 2: Run production build**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1
```

Expected: Build completes, routes visible:
- `/`
- `/signup`
- `/login`
- `/dashboard`

- [ ] **Step 3: Start dev server and manually test the full flow**

```bash
export PATH="/usr/local/bin:$PATH"
npm run dev
```

Open `http://localhost:3000` and verify:
1. Click "Start Free Trial" → goes to `/signup` ✓
2. Sign up with a real email → redirected to `/dashboard` ✓
3. Log out → redirected to `/` ✓
4. Visit `/dashboard` directly (logged out) → redirected to `/login` ✓
5. Log in → redirected to `/dashboard` ✓
6. Visit `/login` while logged in → redirected to `/dashboard` ✓

- [ ] **Step 4: Push to GitHub and verify Vercel redeploys**

```bash
export PATH="/usr/local/bin:$PATH"
git push origin main
```

Expected: Vercel automatically picks up the push and deploys.

**IMPORTANT:** Add the env vars to Vercel before testing live:
1. Go to vercel.com → pocketcfo project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_SUPABASE_URL` = `https://ixiveyhjayhbbqwafffh.supabase.co`
3. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_KFAivsRumploE2Twpy6waw_6DcbaGms`
4. Redeploy

- [ ] **Step 5: Final commit if any cleanup needed**

```bash
git add .
git status
# Only commit if there are actual changes
git commit -m "chore: Phase 1 auth complete"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Supabase browser client | Task 2 |
| Supabase server client | Task 2 |
| Proxy route protection for /dashboard | Task 4 |
| Redirect logged-in users away from /login /signup | Task 4 |
| Signup page — email, password, confirm password | Task 5 |
| Signup error states (mismatch, exists, too short, unknown) | Task 5 |
| Signup success → /dashboard | Task 3 |
| Login page — email, password | Task 6 |
| Login error state | Task 6 |
| Login success → /dashboard | Task 3 |
| Dashboard nav with logo, links, logout | Task 7 |
| Welcome banner with user email | Task 8 |
| Connect banner with disabled QuickBooks + CSV buttons | Task 8 |
| Greyed-out insight cards (opacity-40) | Task 8 |
| All landing page CTAs → /signup | Task 9 |
| Vercel env vars | Task 10 |
