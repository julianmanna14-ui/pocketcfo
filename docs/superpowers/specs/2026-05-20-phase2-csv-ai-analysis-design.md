# PocketCFO Phase 2 — CSV Upload & AI Financial Analysis Design Spec
**Date:** 2026-05-20
**Status:** Approved

---

## Overview

Allow logged-in users to upload a CSV or Excel file of their financial transactions. The server parses the file, sends a structured summary to Claude API, and saves the resulting insights to Supabase. The dashboard then fills in with real findings across 6 insight categories.

---

## Architecture

**Flow:**
```
User picks CSV/Excel on dashboard
→ Browser POSTs file to /api/analyze (Next.js API Route)
→ Server validates file type and size (<10MB)
→ Server parses file into structured transaction summary
→ Server sends summary to Claude API (claude-sonnet-4-6)
→ Claude returns structured JSON findings
→ Server saves findings to Supabase analyses table (linked to user)
→ Dashboard re-renders with real data
```

**Key decisions:**
- File is NOT stored — parsed immediately, raw file discarded
- Previous analysis is replaced when user uploads again
- Claude model: `claude-sonnet-4-6`
- Max file size: 10MB
- Accepted formats: .csv, .xlsx

---

## Database

**New Supabase table: `analyses`**

```sql
create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  summary text not null,
  savings jsonb,
  cash_flow jsonb,
  revenue jsonb,
  subscriptions jsonb,
  vendors jsonb,
  payroll jsonb,
  raw_findings jsonb
);

-- Row Level Security: users can only see their own analyses
alter table analyses enable row level security;

create policy "Users can read own analyses"
  on analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own analyses"
  on analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on analyses for delete
  using (auth.uid() = user_id);
```

---

## New Files

| File | Responsibility |
|---|---|
| `app/api/analyze/route.ts` | API Route: receives file, orchestrates parsing → Claude → Supabase save |
| `lib/csv-parser.ts` | Parses CSV/Excel bytes into structured transaction summary |
| `lib/ai-analyzer.ts` | Sends transaction summary to Claude API, returns structured findings JSON |
| `app/dashboard/upload.tsx` | Client component: file picker, upload button, loading state |

**Modified Files:**
| File | Change |
|---|---|
| `app/dashboard/page.tsx` | Fetch latest analysis from Supabase, show real data if exists, locked cards if not |

---

## Upload UI (`app/dashboard/upload.tsx`)

**State 1 — No analysis yet (replaces current connect banner):**
- Title: "Connect your books to get started"
- Body: "Upload your QuickBooks CSV export or any accounting spreadsheet. Takes 30 seconds."
- Button: "📁 Upload CSV or Excel file" (green, opens file picker)
- Footer: "Works with: QuickBooks · Xero · FreshBooks · Excel · CSV"

**State 2 — Uploading/analyzing:**
- Title: "🧠 Your AI CFO is analyzing your finances..."
- Progress bar (animated, indeterminate)
- Body: "Scanning transactions... This takes about 15–30 seconds"
- Button disabled during analysis

**State 3 — Analysis complete:**
- Title: "✅ Analysis complete · Last run: [relative time]"
- Body: Claude's plain-English summary (e.g. "Found 4 cost issues totalling $2,840/month in potential savings.")
- Small secondary button: "Upload new file"

**Error states:**
- Wrong file type: "Please upload a CSV or Excel (.xlsx) file"
- File too large: "File too large. Please export a shorter date range (max 10MB)"
- No transactions found: "We couldn't find any transactions in this file. Try exporting from QuickBooks directly."
- Analysis failed: "Analysis failed. Please try again."

---

## CSV Parser (`lib/csv-parser.ts`)

Accepts file buffer + mime type. Returns a structured summary object:

```typescript
interface TransactionSummary {
  dateRange: { start: string; end: string }
  totalTransactions: number
  totalRevenue: number
  totalExpenses: number
  expenseCategories: { category: string; total: number }[]
  recurringCharges: { name: string; amount: number; frequency: string }[]
  largestExpenses: { description: string; amount: number; date: string }[]
  unpaidInvoices: { description: string; amount: number; daysOverdue: number }[]
}
```

**Libraries:**
- CSV: `papaparse` — lightweight, browser and server compatible
- Excel: `xlsx` — standard Excel parsing library

**Column detection:** QuickBooks exports use "Date", "Description", "Amount", "Type" columns. The parser attempts to auto-detect common column patterns across different accounting tools.

---

## AI Analyzer (`lib/ai-analyzer.ts`)

Sends the `TransactionSummary` to Claude with a structured prompt:

**System prompt:**
```
You are a CFO AI analyzing financial data for a small business. 
Analyze the provided transaction summary and identify ALL of the following:
1. Savings opportunities (duplicate tools, unused subscriptions, overpriced vendors)
2. Cash flow gaps (timing mismatches, upcoming shortfalls)
3. Revenue leakage (unbilled work, partial invoices, missed revenue)
4. Subscription audit (active, unused, duplicate subscriptions)
5. Vendor cost issues (above-market rates, renegotiation opportunities)
6. Payroll efficiency (overtime patterns, scheduling issues)

Return ONLY a valid JSON object with this exact structure:
{
  "summary": "plain English summary of top findings",
  "savings": { "total": number, "items": [{ "title": string, "amount": number, "description": string }] },
  "cash_flow": { "status": "good"|"warning"|"critical", "gap": number, "items": [...] },
  "revenue": { "recoverable": number, "items": [...] },
  "subscriptions": { "total": number, "unused": number, "items": [...] },
  "vendors": { "issues": number, "items": [...] },
  "payroll": { "overtime": number, "items": [...] }
}
```

---

## API Route (`app/api/analyze/route.ts`)

**POST /api/analyze**

1. Verify user is authenticated (read session from Supabase)
2. Read file from multipart form data
3. Validate: file type must be .csv or .xlsx, size < 10MB
4. Call `parseCSV(fileBuffer, mimeType)` → TransactionSummary
5. Validate: TransactionSummary must have > 0 transactions
6. Call `analyzeWithClaude(summary)` → findings JSON
7. Upsert to Supabase `analyses` table (replace previous analysis for this user)
8. Return `{ success: true, analysis: findings }`

**Error responses:**
- 401: not authenticated
- 400: invalid file type
- 400: file too large
- 422: no transactions found
- 500: Claude API error

---

## Dashboard Updates (`app/dashboard/page.tsx`)

On load, fetch the latest analysis for the current user from Supabase:

```sql
select * from analyses 
where user_id = auth.uid() 
order by created_at desc 
limit 1
```

**If no analysis:** Show upload banner + locked insight cards (current behavior)

**If analysis exists:** Show:
1. Upload component in "complete" state with summary text
2. **Primary cards (always shown):**
   - 💳 Savings Opportunities — total amount + bullet list of items
   - 💰 Cash Flow — status badge (good/warning/critical) + gap amount + items
   - 📈 Revenue Leakage — recoverable amount + items
3. **Bonus cards (shown below primary cards):**
   - 📦 Subscriptions — total count, unused count, items
   - 🤝 Vendor Costs — issues count, items
   - 👥 Payroll — overtime amount, items

---

## Environment Variables Required

```
ANTHROPIC_API_KEY=sk-ant-...   (already saved to .env.local)
```

Must also be added to Vercel environment variables before deploying.

---

## Dependencies to Install

- `papaparse` + `@types/papaparse` — CSV parsing
- `xlsx` — Excel parsing
- `@anthropic-ai/sdk` — Claude API client

---

## Error Handling Summary

| Scenario | HTTP | User message |
|---|---|---|
| Not logged in | 401 | Redirect to /login |
| Wrong file type | 400 | "Please upload a CSV or Excel file" |
| File too large | 400 | "File too large. Max 10MB." |
| No transactions | 422 | "No transactions found. Try exporting from QuickBooks directly." |
| Claude API error | 500 | "Analysis failed. Please try again." |
| Supabase save error | 500 | "Analysis failed. Please try again." |

---

## Out of Scope (Phase 3+)

- QuickBooks OAuth direct connection
- Ongoing monitoring / scheduled re-analysis
- Email reminders and alerts
- AI chat about the findings
- Historical analysis comparison
