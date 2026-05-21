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
  console.log('[analyze] file type:', file.type, 'size:', file.size, 'name:', file.name)
  let summary
  try {
    summary = await parseFinancialFile(buffer, file.type)
    console.log('[analyze] parsed:', summary.totalTransactions, 'transactions')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse failed'
    console.error('[analyze] parse error:', message)
    if (message.includes('No transactions')) {
      return NextResponse.json(
        { error: "We couldn't find any transactions in this file. Try exporting from QuickBooks directly." },
        { status: 422 }
      )
    }
    return NextResponse.json({ error: `Failed to read file: ${message}` }, { status: 500 })
  }

  // 6. Analyze with Claude
  let findings
  try {
    findings = await analyzeWithClaude(summary)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[analyze] Claude error:', msg)
    return NextResponse.json({ error: `Analysis failed: ${msg}` }, { status: 500 })
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
