# PocketCFO Phase 2 — CSV Upload & AI Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let logged-in users upload a CSV or Excel file, have Claude analyze their finances, and see real savings insights on their dashboard.

**Architecture:** User uploads file → Next.js API Route parses it with papaparse/xlsx → structured summary sent to Claude API via @anthropic-ai/sdk → findings saved to Supabase `analyses` table → dashboard re-renders with real data.

**Tech Stack:** Next.js 16, papaparse, xlsx, @anthropic-ai/sdk, Supabase, Tailwind v4, TypeScript

---

## CRITICAL: Next.js 16 Notes

- API Routes use `app/api/*/route.ts` with exported named HTTP method functions (`POST`, `GET`, etc.)
- `request.formData()` reads multipart file uploads
- Route handlers use Web `Request`/`Response` APIs (not Express-style)
- Node.js is at `/usr/local/bin/node` — always use `export PATH="/usr/local/bin:$PATH"`

---

## File Map

| File | Responsibility |
|---|---|
| `lib/csv-parser.ts` | Parse CSV/Excel buffer → TransactionSummary object |
| `lib/ai-analyzer.ts` | Send TransactionSummary to Claude API → findings JSON |
| `app/api/analyze/route.ts` | POST handler: validate file → parse → analyze → save to Supabase → return findings |
| `app/dashboard/upload.tsx` | Client component: file picker, upload state machine, error display |
| `app/dashboard/page.tsx` | Fetch latest analysis, pass to upload + show real insight cards |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install all required packages**

```bash
export PATH="/usr/local/bin:$PATH"
cd /Users/julianmanna/Desktop/ai-landing-page
npm install @anthropic-ai/sdk papaparse xlsx
npm install -D @types/papaparse
```

Expected: packages installed without errors.

- [ ] **Step 2: Verify build still passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: Build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install papaparse, xlsx, and anthropic SDK"
```

---

## Task 2: Create Supabase `analyses` Table

**Files:**
- No code files — SQL run directly in Supabase dashboard

- [ ] **Step 1: Run this SQL in Supabase**

Go to **supabase.com** → your pocketcfo project → **SQL Editor** → paste and run:

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

- [ ] **Step 2: Verify table exists**

In Supabase → **Table Editor** → confirm `analyses` table appears with all columns.

- [ ] **Step 3: Note — no code commit needed for this task**

The table is created in Supabase. Continue to Task 3.

---

## Task 3: CSV Parser

**Files:**
- Create: `lib/csv-parser.ts`
- Create: `__tests__/csv-parser.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/csv-parser.test.ts`:

```typescript
import { parseFinancialFile } from '@/lib/csv-parser'

describe('parseFinancialFile', () => {
  it('parses a basic CSV with Date, Description, Amount columns', async () => {
    const csv = `Date,Description,Amount,Type
2025-01-05,Slack subscription,-120,expense
2025-01-10,Client payment,5000,income
2025-01-15,Adobe license,-54,expense
2025-01-20,AWS services,-2800,expense
2025-02-05,Slack subscription,-120,expense
2025-02-10,Client payment,4500,income`

    const buffer = Buffer.from(csv)
    const result = await parseFinancialFile(buffer, 'text/csv')

    expect(result.totalTransactions).toBe(6)
    expect(result.totalRevenue).toBe(9500)
    expect(result.totalExpenses).toBe(3094)
    expect(result.recurringCharges.length).toBeGreaterThan(0)
    expect(result.recurringCharges[0].name).toContain('Slack')
  })

  it('returns dateRange from first to last transaction', async () => {
    const csv = `Date,Description,Amount
2025-01-05,Payment A,100
2025-03-20,Payment B,200`

    const buffer = Buffer.from(csv)
    const result = await parseFinancialFile(buffer, 'text/csv')

    expect(result.dateRange.start).toBe('2025-01-05')
    expect(result.dateRange.end).toBe('2025-03-20')
  })

  it('throws on empty CSV', async () => {
    const buffer = Buffer.from('Date,Description,Amount\n')
    await expect(parseFinancialFile(buffer, 'text/csv')).rejects.toThrow('No transactions found')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
export PATH="/usr/local/bin:$PATH"
npm test -- --testPathPattern=csv-parser 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module '@/lib/csv-parser'`

- [ ] **Step 3: Create `lib/csv-parser.ts`**

```typescript
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface TransactionSummary {
  dateRange: { start: string; end: string }
  totalTransactions: number
  totalRevenue: number
  totalExpenses: number
  expenseCategories: { category: string; total: number }[]
  recurringCharges: { name: string; amount: number; frequency: string }[]
  largestExpenses: { description: string; amount: number; date: string }[]
  unpaidInvoices: { description: string; amount: number; daysOverdue: number }[]
}

interface RawRow {
  date: string
  description: string
  amount: number
}

function detectColumns(headers: string[]): { date: string; description: string; amount: string } {
  const lower = headers.map((h) => h.toLowerCase())

  const date = headers[lower.findIndex((h) => h.includes('date') || h.includes('Date'))] || headers[0]
  const description = headers[lower.findIndex((h) =>
    h.includes('description') || h.includes('memo') || h.includes('name') || h.includes('payee')
  )] || headers[1]
  const amount = headers[lower.findIndex((h) =>
    h.includes('amount') || h.includes('total') || h.includes('debit') || h.includes('credit')
  )] || headers[2]

  return { date, description, amount }
}

function parseAmount(value: string | number): number {
  if (typeof value === 'number') return value
  const cleaned = String(value).replace(/[$,()]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function extractRows(rawData: Record<string, string>[]): RawRow[] {
  if (rawData.length === 0) return []
  const headers = Object.keys(rawData[0])
  const cols = detectColumns(headers)

  return rawData
    .map((row) => ({
      date: row[cols.date] || '',
      description: row[cols.description] || '',
      amount: parseAmount(row[cols.amount]),
    }))
    .filter((row) => row.date && row.description && row.amount !== 0)
}

function findRecurring(rows: RawRow[]): { name: string; amount: number; frequency: string }[] {
  const counts: Record<string, { amount: number; count: number }> = {}

  for (const row of rows) {
    const key = row.description.toLowerCase().trim()
    if (!counts[key]) counts[key] = { amount: Math.abs(row.amount), count: 0 }
    counts[key].count++
  }

  return Object.entries(counts)
    .filter(([, v]) => v.count >= 2)
    .map(([name, v]) => ({
      name,
      amount: v.amount,
      frequency: v.count >= 10 ? 'weekly' : v.count >= 3 ? 'monthly' : 'recurring',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
}

async function parseCsv(buffer: Buffer): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const text = buffer.toString('utf-8')
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err: Error) => reject(err),
    })
  })
}

function parseExcel(buffer: Buffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
}

export async function parseFinancialFile(buffer: Buffer, mimeType: string): Promise<TransactionSummary> {
  let rawData: Record<string, string>[]

  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel') {
    rawData = parseExcel(buffer)
  } else {
    rawData = await parseCsv(buffer)
  }

  const rows = extractRows(rawData)

  if (rows.length === 0) {
    throw new Error('No transactions found')
  }

  const dates = rows.map((r) => r.date).sort()
  const revenues = rows.filter((r) => r.amount > 0)
  const expenses = rows.filter((r) => r.amount < 0)

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = Math.abs(expenses.reduce((sum, r) => sum + r.amount, 0))

  const largestExpenses = expenses
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 10)
    .map((r) => ({ description: r.description, amount: Math.abs(r.amount), date: r.date }))

  return {
    dateRange: { start: dates[0], end: dates[dates.length - 1] },
    totalTransactions: rows.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    expenseCategories: [],
    recurringCharges: findRecurring(expenses),
    largestExpenses,
    unpaidInvoices: [],
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
export PATH="/usr/local/bin:$PATH"
npm test -- --testPathPattern=csv-parser 2>&1 | tail -15
```

Expected: 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/csv-parser.ts __tests__/csv-parser.test.ts
git commit -m "feat: add CSV/Excel parser with transaction summary"
```

---

## Task 4: AI Analyzer

**Files:**
- Create: `lib/ai-analyzer.ts`

- [ ] **Step 1: Create `lib/ai-analyzer.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { TransactionSummary } from './csv-parser'

export interface AnalysisFindings {
  summary: string
  savings: {
    total: number
    items: { title: string; amount: number; description: string }[]
  }
  cash_flow: {
    status: 'good' | 'warning' | 'critical'
    gap: number
    items: { title: string; amount: number; description: string }[]
  }
  revenue: {
    recoverable: number
    items: { title: string; amount: number; description: string }[]
  }
  subscriptions: {
    total: number
    unused: number
    items: { title: string; amount: number; description: string }[]
  }
  vendors: {
    issues: number
    items: { title: string; amount: number; description: string }[]
  }
  payroll: {
    overtime: number
    items: { title: string; amount: number; description: string }[]
  }
}

const SYSTEM_PROMPT = `You are a CFO AI analyzing financial data for a small business owner.
Analyze the provided transaction summary and identify savings opportunities and financial issues.
Return ONLY a valid JSON object — no markdown, no explanation, just the JSON.
Use this exact structure:
{
  "summary": "plain English 1-2 sentence summary of top findings",
  "savings": { "total": number, "items": [{ "title": string, "amount": number, "description": string }] },
  "cash_flow": { "status": "good" | "warning" | "critical", "gap": number, "items": [{ "title": string, "amount": number, "description": string }] },
  "revenue": { "recoverable": number, "items": [{ "title": string, "amount": number, "description": string }] },
  "subscriptions": { "total": number, "unused": number, "items": [{ "title": string, "amount": number, "description": string }] },
  "vendors": { "issues": number, "items": [{ "title": string, "amount": number, "description": string }] },
  "payroll": { "overtime": number, "items": [{ "title": string, "amount": number, "description": string }] }
}
If you find no issues in a category, return empty arrays and zero values for that category.`

export async function analyzeWithClaude(summary: TransactionSummary): Promise<AnalysisFindings> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const userMessage = `Analyze this financial data:

Date range: ${summary.dateRange.start} to ${summary.dateRange.end}
Total transactions: ${summary.totalTransactions}
Total revenue: $${summary.totalRevenue.toLocaleString()}
Total expenses: $${summary.totalExpenses.toLocaleString()}

Recurring charges detected:
${summary.recurringCharges.map((r) => `- ${r.name}: $${r.amount}/month (${r.frequency})`).join('\n') || 'None detected'}

Largest expenses:
${summary.largestExpenses.map((e) => `- ${e.description}: $${e.amount} on ${e.date}`).join('\n') || 'None'}

Return your analysis as JSON only.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    return JSON.parse(text) as AnalysisFindings
  } catch {
    throw new Error('Claude returned invalid JSON')
  }
}
```

- [ ] **Step 2: Verify build passes (TypeScript check)**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: Build passes — no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add lib/ai-analyzer.ts
git commit -m "feat: add Claude AI financial analyzer"
```

---

## Task 5: API Route

**Files:**
- Create: `app/api/analyze/route.ts`

- [ ] **Step 1: Create `app/api/analyze/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseFinancialFile } from '@/lib/csv-parser'
import { analyzeWithClaude } from '@/lib/ai-analyzer'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Read file from form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // 3. Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Please upload a CSV or Excel (.xlsx) file' },
      { status: 400 }
    )
  }

  // 4. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File too large. Please export a shorter date range (max 10MB).' },
      { status: 400 }
    )
  }

  // 5. Parse file
  const buffer = Buffer.from(await file.arrayBuffer())
  let summary
  try {
    summary = await parseFinancialFile(buffer, file.type)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse failed'
    if (message.includes('No transactions')) {
      return NextResponse.json(
        { error: "We couldn't find any transactions in this file. Try exporting from QuickBooks directly." },
        { status: 422 }
      )
    }
    return NextResponse.json({ error: 'Failed to read file. Please try again.' }, { status: 500 })
  }

  // 6. Analyze with Claude
  let findings
  try {
    findings = await analyzeWithClaude(summary)
  } catch {
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }

  // 7. Save to Supabase (upsert — replace previous analysis for this user)
  const { error: dbError } = await supabase
    .from('analyses')
    .upsert(
      {
        user_id: user.id,
        summary: findings.summary,
        savings: findings.savings,
        cash_flow: findings.cash_flow,
        revenue: findings.revenue,
        subscriptions: findings.subscriptions,
        vendors: findings.vendors,
        payroll: findings.payroll,
        raw_findings: findings,
      },
      { onConflict: 'user_id' }
    )

  if (dbError) {
    return NextResponse.json({ error: 'Failed to save analysis. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, findings })
}
```

- [ ] **Step 2: Verify build passes**

```bash
export PATH="/usr/local/bin:$PATH"
npm run build 2>&1 | tail -10
```

Expected: `/api/analyze` route appears in build output.

- [ ] **Step 3: Commit**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: add /api/analyze route for file upload and AI analysis"
```

---

## Task 6: Upload Component

**Files:**
- Create: `app/dashboard/upload.tsx`
- Create: `__tests__/upload.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/upload.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UploadSection } from '@/app/dashboard/upload'

// Mock fetch
global.fetch = jest.fn()

describe('UploadSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows upload button when no analysis exists', () => {
    render(<UploadSection hasAnalysis={false} summary={null} lastRun={null} />)
    expect(screen.getByText(/Upload CSV or Excel file/i)).toBeInTheDocument()
  })

  it('shows analysis complete state when analysis exists', () => {
    render(
      <UploadSection
        hasAnalysis={true}
        summary="Found 3 cost issues totalling $1,200/month."
        lastRun="2026-05-20T10:00:00Z"
      />
    )
    expect(screen.getByText(/Analysis complete/i)).toBeInTheDocument()
    expect(screen.getByText(/Found 3 cost issues/i)).toBeInTheDocument()
  })

  it('shows error when wrong file type selected', async () => {
    render(<UploadSection hasAnalysis={false} summary={null} lastRun={null} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Please upload a CSV or Excel file/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
export PATH="/usr/local/bin:$PATH"
npm test -- --testPathPattern=upload 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module '@/app/dashboard/upload'`

- [ ] **Step 3: Create `app/dashboard/upload.tsx`**

```tsx
'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  hasAnalysis: boolean
  summary: string | null
  lastRun: string | null
}

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls']
const ALLOWED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function UploadSection({ hasAnalysis, summary, lastRun }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a CSV or Excel file (.csv or .xlsx)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Please export a shorter date range (max 10MB).')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
        return
      }

      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
        <h2 className="text-white font-bold text-xl mb-2">
          🧠 Your AI CFO is analyzing your finances...
        </h2>
        <div className="w-full bg-white/10 rounded-full h-2 mb-4">
          <div className="bg-accent h-2 rounded-full animate-pulse w-3/4" />
        </div>
        <p className="text-text-secondary text-sm">
          Scanning transactions... This takes about 15–30 seconds
        </p>
      </div>
    )
  }

  if (hasAnalysis && summary) {
    return (
      <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-xl">
            ✅ Analysis complete
          </h2>
          {lastRun && (
            <span className="text-text-secondary text-xs">
              Last run: {formatRelativeTime(lastRun)}
            </span>
          )}
        </div>
        <p className="text-text-secondary mb-4">{summary}</p>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-text-secondary hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-4 py-2 transition-colors"
        >
          Upload new file
        </button>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-8">
      <h2 className="text-white font-bold text-xl mb-2">
        Connect your books to get started
      </h2>
      <p className="text-text-secondary mb-6">
        Upload your QuickBooks CSV export or any accounting spreadsheet. Takes 30 seconds.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-accent text-bg-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        📁 Upload CSV or Excel file
      </button>

      <p className="text-text-secondary text-xs mt-4">
        Works with: QuickBooks · Xero · FreshBooks · Excel · CSV
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
export PATH="/usr/local/bin:$PATH"
npm test -- --testPathPattern=upload 2>&1 | tail -15
```

Expected: 3 tests passing.

- [ ] **Step 5: Run full test suite**

```bash
export PATH="/usr/local/bin:$PATH"
npm test 2>&1 | tail -10
```

Expected: All 13 tests pass (10 existing + 3 new).

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/upload.tsx __tests__/upload.test.tsx
git commit -m "feat: add file upload component with loading and error states"
```

---

## Task 7: Update Dashboard Page

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Replace `app/dashboard/page.tsx` with this content**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UploadSection } from './upload'
import type { AnalysisFindings } from '@/lib/ai-analyzer'

interface Analysis {
  id: string
  created_at: string
  summary: string
  savings: AnalysisFindings['savings'] | null
  cash_flow: AnalysisFindings['cash_flow'] | null
  revenue: AnalysisFindings['revenue'] | null
  subscriptions: AnalysisFindings['subscriptions'] | null
  vendors: AnalysisFindings['vendors'] | null
  payroll: AnalysisFindings['payroll'] | null
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`
}

function InsightCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-secondary border border-white/10 rounded-2xl p-6">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
      {children}
    </div>
  )
}

function LockedCard({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="bg-bg-secondary border border-white/5 rounded-2xl p-6 opacity-40 cursor-not-allowed">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
      <p className="text-accent text-2xl font-black mb-1">—</p>
      <p className="text-text-secondary text-xs">Connect to unlock</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: Analysis | null }

  const hasAnalysis = !!analysis

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          👋 Welcome, {user.email}
        </h1>
      </div>

      {/* Upload section */}
      <UploadSection
        hasAnalysis={hasAnalysis}
        summary={analysis?.summary ?? null}
        lastRun={analysis?.created_at ?? null}
      />

      {/* Insight cards */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Your Insights</h2>

        {/* Primary cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {hasAnalysis && analysis.savings ? (
            <InsightCard icon="💳" title="Savings Opportunities">
              <p className="text-accent text-2xl font-black mb-2">
                {formatCurrency(analysis.savings.total)}/mo
              </p>
              <ul className="space-y-1">
                {analysis.savings.items.slice(0, 4).map((item, i) => (
                  <li key={i} className="text-text-secondary text-xs">
                    • {item.title} — {formatCurrency(item.amount)}
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="💳" title="Savings Opportunities" />
          )}

          {hasAnalysis && analysis.cash_flow ? (
            <InsightCard icon="💰" title="Cash Flow">
              <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${
                analysis.cash_flow.status === 'good' ? 'bg-green-500/20 text-green-400' :
                analysis.cash_flow.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {analysis.cash_flow.status.toUpperCase()}
              </span>
              {analysis.cash_flow.gap > 0 && (
                <p className="text-accent text-2xl font-black mb-2">
                  {formatCurrency(analysis.cash_flow.gap)} gap
                </p>
              )}
              <ul className="space-y-1">
                {analysis.cash_flow.items.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-text-secondary text-xs">
                    • {item.title}
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="💰" title="Cash Flow" />
          )}

          {hasAnalysis && analysis.revenue ? (
            <InsightCard icon="📈" title="Revenue Leakage">
              <p className="text-accent text-2xl font-black mb-2">
                {formatCurrency(analysis.revenue.recoverable)} recoverable
              </p>
              <ul className="space-y-1">
                {analysis.revenue.items.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-text-secondary text-xs">
                    • {item.title}
                  </li>
                ))}
              </ul>
            </InsightCard>
          ) : (
            <LockedCard icon="📈" title="Revenue Leakage" />
          )}
        </div>

        {/* Bonus cards — only shown when analysis exists */}
        {hasAnalysis && (
          <div className="grid md:grid-cols-3 gap-6">
            {analysis.subscriptions && (
              <InsightCard icon="📦" title="Subscriptions">
                <p className="text-white text-lg font-bold mb-1">
                  {analysis.subscriptions.total} active · {analysis.subscriptions.unused} unused
                </p>
                <ul className="space-y-1">
                  {analysis.subscriptions.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-text-secondary text-xs">
                      • {item.title} — {formatCurrency(item.amount)}
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}

            {analysis.vendors && analysis.vendors.issues > 0 && (
              <InsightCard icon="🤝" title="Vendor Costs">
                <p className="text-white text-lg font-bold mb-1">
                  {analysis.vendors.issues} above market rate
                </p>
                <ul className="space-y-1">
                  {analysis.vendors.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-text-secondary text-xs">
                      • {item.title}
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}

            {analysis.payroll && analysis.payroll.overtime > 0 && (
              <InsightCard icon="👥" title="Payroll">
                <p className="text-accent text-2xl font-black mb-1">
                  {formatCurrency(analysis.payroll.overtime)} overtime
                </p>
                <ul className="space-y-1">
                  {analysis.payroll.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-text-secondary text-xs">
                      • {item.title}
                    </li>
                  ))}
                </ul>
              </InsightCard>
            )}
          </div>
        )}
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

Expected: Build completes without TypeScript errors.

- [ ] **Step 3: Run full test suite**

```bash
export PATH="/usr/local/bin:$PATH"
npm test 2>&1 | tail -10
```

Expected: All 13 tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: update dashboard to show real AI analysis findings"
```

---

## Task 8: Add Anthropic API Key to Vercel + Final Verification

**Files:**
- No code files — Vercel configuration

- [ ] **Step 1: Add ANTHROPIC_API_KEY to Vercel**

1. Go to **vercel.com/dashboard** → pocketcfo → **Settings** → **Environments**
2. Add variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `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`
3. Save

- [ ] **Step 2: Push to GitHub (triggers Vercel redeploy)**

```bash
export PATH="/usr/local/bin:$PATH"
git push origin main
```

- [ ] **Step 3: Run full test suite locally**

```bash
export PATH="/usr/local/bin:$PATH"
npm test 2>&1
```

Expected: 13/13 tests pass.

- [ ] **Step 4: Test locally with dev server**

```bash
export PATH="/usr/local/bin:$PATH"
npm run dev
```

Open `http://localhost:3000` → click "Start Free Trial" → log in → try uploading a CSV file.

To create a test CSV, create a file called `test.csv`:
```csv
Date,Description,Amount
2025-01-05,Slack subscription,-120
2025-01-10,Client payment,5000
2025-01-15,Adobe license,-54
2025-01-20,AWS services,-2800
2025-02-05,Slack subscription,-120
2025-02-10,Client payment,4500
2025-02-15,Adobe license,-54
2025-02-20,AWS services,-2800
```

Upload it and verify:
- Loading state shows ✓
- Dashboard fills in with real findings ✓
- All 3 primary cards show real data ✓

- [ ] **Step 5: Final commit if any cleanup needed**

```bash
git status
# Only commit if there are actual changes
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| Install papaparse, xlsx, @anthropic-ai/sdk | Task 1 |
| Supabase analyses table with RLS | Task 2 |
| CSV parsing with column auto-detection | Task 3 |
| Excel (.xlsx) parsing | Task 3 |
| Recurring charge detection | Task 3 |
| Claude API integration with structured prompt | Task 4 |
| Structured JSON response parsing | Task 4 |
| POST /api/analyze route | Task 5 |
| File type validation (.csv, .xlsx only) | Task 5 |
| File size validation (10MB max) | Task 5 |
| No-transactions error (422) | Task 5 |
| Auth check in API route (401) | Task 5 |
| Upsert analysis (replace previous) | Task 5 |
| Upload component — no-analysis state | Task 6 |
| Upload component — loading state | Task 6 |
| Upload component — complete state with summary | Task 6 |
| Upload component — error display | Task 6 |
| Upload component — "Upload new file" button | Task 6 |
| Dashboard fetches latest analysis | Task 7 |
| Primary cards show real data | Task 7 |
| Bonus cards (subscriptions, vendors, payroll) | Task 7 |
| Locked cards when no analysis | Task 7 |
| ANTHROPIC_API_KEY in Vercel | Task 8 |
