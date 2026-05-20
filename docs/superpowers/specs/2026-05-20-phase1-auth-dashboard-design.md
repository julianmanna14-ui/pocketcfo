# PocketCFO Phase 1 — Auth & Dashboard Shell Design Spec
**Date:** 2026-05-20
**Status:** Approved

---

## Overview

Add user authentication and a dashboard shell to the existing PocketCFO landing page. When users click "Start Free Trial" they go to a real signup page, create an account, and land on a personal dashboard. This is Phase 1 — no AI analysis yet, just auth and the dashboard shell.

---

## Architecture

**Approach:** Supabase Auth + Next.js App Router middleware

**Route structure:**
```
/           → Landing page (existing, no changes except CTA links)
/signup     → Create account page
/login      → Login page
/dashboard  → Protected dashboard shell (redirects to /login if not logged in)
```

**How auth works:**
- Supabase manages users, sessions, and cookies
- Next.js middleware runs on every request to /dashboard — unauthenticated users are redirected to /login
- After signup/login, Supabase sets a session cookie the middleware reads
- Landing page CTA buttons updated from `#signup` → `/signup` and `#demo` stays as `mailto:` placeholder

---

## New Files

| File | Responsibility |
|---|---|
| `app/signup/page.tsx` | Signup form — email, password, confirm password |
| `app/login/page.tsx` | Login form — email, password |
| `app/dashboard/page.tsx` | Protected dashboard shell |
| `app/dashboard/layout.tsx` | Dashboard layout with nav (logo, links, logout) |
| `middleware.ts` | Protects /dashboard route, redirects unauthenticated users |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/supabase/server.ts` | Server-side Supabase client (for Server Components) |

**Modified Files:**
| File | Change |
|---|---|
| `components/Nav.tsx` | Update "Start Free Trial" href from `#pricing` to `/signup` |
| `components/TopBar.tsx` | Update "Start free →" href from `#pricing` to `/signup` |
| `components/Hero.tsx` | Update primary CTA href from `#pricing` to `/signup` |
| `components/FinalCTA.tsx` | Update primary CTA href from `#signup` to `/signup` |
| `components/Pricing.tsx` | Update all tier CTA hrefs from `#signup` to `/signup` |
| `components/ExitIntent.tsx` | Update CTA href from `#pricing` to `/signup` |

---

## Visual Design

Matches existing PocketCFO design system exactly:
- Background: `#0A0D14` (bg-primary)
- Card background: `#0F1320` (bg-secondary)
- Accent: `#00FF87` (electric green)
- Text: white / gray
- Font: Inter

---

## Signup Page (`/signup`)

**Layout:** Centered card on dark background

**Content:**
- Logo "PocketCFO" top center (links back to /)
- Headline: "Create your free account"
- Subheadline: "First month completely free — no credit card needed"
- Form fields:
  - Email (type="email", required)
  - Password (type="password", min 8 chars, required)
  - Confirm Password (type="password", must match, required)
- Submit button: "Start My Free Month →" (full width, green)
- Link below: "Already have an account? Log in →" → /login
- Error states: shown in red below the relevant field
- Loading state: button disabled + spinner while Supabase processes
- On success: redirect to /dashboard

---

## Login Page (`/login`)

**Layout:** Centered card on dark background

**Content:**
- Logo "PocketCFO" top center (links back to /)
- Headline: "Welcome back"
- Form fields:
  - Email (type="email", required)
  - Password (type="password", required)
- Submit button: "Log In →" (full width, green)
- Link below: "Don't have an account? Sign up free →" → /signup
- Error state: "Invalid email or password" shown below form
- Loading state: button disabled + spinner
- On success: redirect to /dashboard

---

## Dashboard Shell (`/dashboard`)

**Layout:** Full dark page with dashboard nav

**Dashboard Nav:**
- Logo "PocketCFO" left (links to /dashboard)
- Center links: "Dashboard" (active), "Settings" (placeholder)
- Right: "Log Out" button — signs out via Supabase, redirects to /

**Welcome banner:**
- "👋 Welcome, [user email]"

**Connect banner (green accent border):**
- Title: "Connect your books to get started"
- Body: "Your AI CFO is ready — it just needs access to your financials to get to work."
- Two buttons: "Connect QuickBooks" (placeholder, disabled for now) + "Upload CSV" (placeholder, disabled for now)
- Note: Both buttons show "Coming soon" tooltip — Phase 2 will wire these up

**Insight cards (3 cards, greyed out):**
- 💳 Savings Opportunities — "$0 · Connect to unlock"
- 💰 Cash Flow — "— · Connect to unlock"
- 📈 Revenue Leakage — "— · Connect to unlock"
- All cards: opacity-40, cursor-not-allowed, no hover effects

---

## Middleware

Protects all routes under /dashboard:
- Reads Supabase session from cookie
- If no session: redirect to /login
- If session exists: allow through
- Also handles: if logged-in user visits /login or /signup, redirect to /dashboard

---

## Supabase Setup Required

Before implementation, user must:
1. Create a free Supabase project at supabase.com
2. Copy Project URL and anon key
3. Add to .env.local:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

Email confirmation: **disabled** for now (users log in immediately after signup without verifying email — simplest for early stage)

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Email already registered | "An account with this email already exists. Log in instead." |
| Passwords don't match | "Passwords do not match" shown before submit |
| Wrong password on login | "Invalid email or password" |
| Network error | "Something went wrong. Please try again." |
| Session expired | Middleware redirects to /login |

---

## Tech Stack Additions

- `@supabase/supabase-js` — Supabase JavaScript client
- `@supabase/ssr` — Supabase server-side rendering helpers for Next.js

---

## Out of Scope (Phase 2+)

- QuickBooks OAuth integration
- CSV upload and parsing
- AI analysis
- Real dashboard data
- Password reset flow
- Email verification
- Settings page
