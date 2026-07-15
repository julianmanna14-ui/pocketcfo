import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken, getConnection } from '@/lib/quickbooks/tokens'
import { fetchQBTransactions } from '@/lib/quickbooks/api'
import { analyzeWithClaude } from '@/lib/ai-analyzer'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get stored connection
  const connection = await getConnection(supabase, user.id)
  if (!connection) {
    return NextResponse.json({ error: 'QuickBooks not connected' }, { status: 400 })
  }

  // Get a valid (possibly refreshed) access token
  const accessToken = await getValidAccessToken(supabase, user.id)
  if (!accessToken) {
    return NextResponse.json({ error: 'Could not get access token' }, { status: 400 })
  }

  // Fetch transactions from QuickBooks
  let summary
  try {
    summary = await fetchQBTransactions(accessToken, connection.realm_id)
    console.log('[qb/sync] transactions fetched:', summary.totalTransactions)
  } catch (err) {
    console.error('[qb/sync] fetch error:', err)
    return NextResponse.json({ error: `QuickBooks fetch failed: ${err instanceof Error ? err.message : err}` }, { status: 500 })
  }

  // Run AI analysis
  let findings
  try {
    findings = await analyzeWithClaude(summary)
    console.log('[qb/sync] analysis complete')
  } catch (err) {
    console.error('[qb/sync] analysis error:', err)
    return NextResponse.json({ error: `Analysis failed: ${err instanceof Error ? err.message : err}` }, { status: 500 })
  }

  // Save to analyses table
  const { error: saveError } = await supabase.from('analyses').insert({
    user_id: user.id,
    source: 'quickbooks',
    summary: findings.summary,
    savings: findings.savings,
    cash_flow: findings.cash_flow,
    revenue: findings.revenue,
    subscriptions: findings.subscriptions,
    vendors: findings.vendors,
    payroll: findings.payroll,
  })

  if (saveError) {
    console.error('[qb/sync] save error:', saveError)
    return NextResponse.json({ error: `Save failed: ${saveError.message}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, transactions: summary.totalTransactions })
}
