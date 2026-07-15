import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get all users who have at least one analysis
  const { data: analyses } = await supabase
    .from('analyses')
    .select('user_id, summary, savings, cash_flow, revenue, subscriptions, created_at')
    .order('created_at', { ascending: false })

  if (!analyses || analyses.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No users with analyses' })
  }

  // Deduplicate — latest analysis per user
  const latestByUser = new Map<string, typeof analyses[0]>()
  for (const a of analyses) {
    if (!latestByUser.has(a.user_id)) {
      latestByUser.set(a.user_id, a)
    }
  }

  // Get user emails via admin client (requires service role key)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const userMap = new Map(users?.map((u) => [u.id, u.email]) ?? [])

  let sent = 0

  for (const [userId, analysis] of latestByUser) {
    const email = userMap.get(userId)
    if (!email) continue

    try {
      const digest = await generateDigest(analysis)
      if (!digest) continue

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: email,
        subject: digest.subject,
        html: buildEmailHtml(digest),
        replyTo: 'julianmanna14@gmail.com',
      })

      await supabase.from('digests').insert({
        user_id: userId,
        subject: digest.subject,
        content: JSON.stringify(digest),
      })

      sent++
    } catch (err) {
      console.error(`[digest] failed for user ${userId}:`, err)
    }
  }

  return NextResponse.json({ sent })
}

// Also allow manual trigger via POST for testing
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!analysis) {
    return NextResponse.json({ error: 'No analysis found' }, { status: 400 })
  }

  const digest = await generateDigest(analysis)
  if (!digest) {
    return NextResponse.json({ error: 'Could not generate digest' }, { status: 500 })
  }

  const { data: emailResult, error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to: user.email!,
    subject: digest.subject,
    html: buildEmailHtml(digest),
    replyTo: 'julianmanna14@gmail.com',
  })

  if (emailError) {
    console.error('[digest] send error:', emailError)
    return NextResponse.json({ error: emailError.message }, { status: 500 })
  }

  await supabase.from('digests').insert({
    user_id: user.id,
    subject: digest.subject,
    content: JSON.stringify(digest),
  })

  return NextResponse.json({ success: true, id: emailResult?.id })
}

interface DigestOutput {
  subject: string
  headline: string
  top_findings: { title: string; amount: number; action: string }[]
  one_action: string
  total_savings: number
}

async function generateDigest(analysis: Record<string, unknown>): Promise<DigestOutput | null> {
  const savings = analysis.savings as { total: number; items: {title: string; amount: number; description: string}[] } | null
  const cashFlow = analysis.cash_flow as { status: string; gap: number } | null
  const subs = analysis.subscriptions as { total: number; unused: number; items: {title: string; amount: number}[] } | null

  const totalSavings = savings?.total ?? 0
  if (totalSavings === 0 && !cashFlow) return null

  const prompt = `You are writing a weekly financial digest email for a small business owner. Use ONLY the numbers provided. Never invent figures.

FINANCIAL DATA:
- Total savings opportunities: $${totalSavings}/month
- Cash flow status: ${cashFlow?.status ?? 'unknown'}
- Top savings items: ${savings?.items?.slice(0, 3).map(i => `${i.title} ($${i.amount}/mo)`).join(', ') ?? 'none'}
- Active subscriptions: ${subs?.total ?? 0} (${subs?.unused ?? 0} unused)
- Summary: ${analysis.summary}

Return ONLY valid JSON with this structure:
{
  "subject": "one punchy sentence with the biggest dollar number",
  "headline": "one sentence plain English summary",
  "top_findings": [
    {"title": "...", "amount": 0, "action": "one specific action"}
  ],
  "one_action": "the single most important thing to do this week",
  "total_savings": ${totalSavings}
}

Rules:
- Subject must contain a dollar figure
- Keep it 2nd grade reading level
- Be specific, not generic`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  try {
    return JSON.parse(text) as DigestOutput
  } catch {
    console.error('[digest] invalid JSON from Claude:', raw.slice(0, 200))
    return null
  }
}

function buildEmailHtml(digest: DigestOutput): string {
  const findingsHtml = digest.top_findings
    .map(f => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;">
          <strong style="color:#ffffff;">${f.title}</strong>
          <span style="color:#00ff88;font-weight:bold;margin-left:8px;">$${f.amount}/mo</span>
          <br/><span style="color:#888;font-size:13px;">${f.action}</span>
        </td>
      </tr>`)
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#111;padding:32px 40px;border-bottom:1px solid #1e1e1e;">
          <span style="color:#00ff88;font-size:20px;font-weight:900;">Pocket<span style="color:#fff;">CFO</span></span>
          <span style="color:#555;font-size:13px;margin-left:12px;">Weekly Digest</span>
        </td></tr>

        <!-- Headline -->
        <tr><td style="padding:32px 40px;">
          <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">${digest.headline}</h1>
          <p style="color:#888;font-size:14px;margin:0;">Based on your latest financial data</p>
        </td></tr>

        <!-- Savings hero -->
        <tr><td style="padding:0 40px 32px;">
          <div style="background:#0d2b1a;border:1px solid #00ff8830;border-radius:12px;padding:24px;text-align:center;">
            <p style="color:#888;font-size:13px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Total savings identified</p>
            <p style="color:#00ff88;font-size:48px;font-weight:900;margin:0;">$${digest.total_savings.toLocaleString()}<span style="font-size:20px;">/mo</span></p>
          </div>
        </td></tr>

        <!-- Findings -->
        <tr><td style="padding:0 40px 32px;">
          <h2 style="color:#fff;font-size:16px;margin:0 0 16px;">Top findings</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${findingsHtml}
          </table>
        </td></tr>

        <!-- One action -->
        <tr><td style="padding:0 40px 32px;">
          <div style="background:#1a1a2e;border:1px solid #3333ff40;border-radius:12px;padding:20px;">
            <p style="color:#888;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your one action this week</p>
            <p style="color:#fff;font-size:15px;margin:0;font-weight:600;">${digest.one_action}</p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
          <p style="color:#555;font-size:12px;margin:0;">
            Reply to this email with any questions — your CFO is listening.<br/>
            PocketCFO · <a href="https://pocketcfo-jube.vercel.app/dashboard" style="color:#00ff88;">Open dashboard</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
