import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message } = await request.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  // Load latest analysis for context
  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Load recent chat history (last 10 messages)
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentHistory = (history ?? []).reverse()

  // Build financial context
  let financialContext = 'No financial data available yet.'
  if (analysis) {
    const savings = analysis.savings
    const cashFlow = analysis.cash_flow
    const revenue = analysis.revenue
    const subs = analysis.subscriptions

    financialContext = `FINANCIAL ANALYSIS SUMMARY:
${analysis.summary}

SAVINGS OPPORTUNITIES: $${savings?.total ?? 0}/mo total
${savings?.items?.map((i: {title: string; amount: number; description: string}) => `- ${i.title}: $${i.amount}/mo — ${i.description}`).join('\n') ?? 'None'}

CASH FLOW STATUS: ${cashFlow?.status ?? 'unknown'} (gap: $${cashFlow?.gap ?? 0})
${cashFlow?.items?.map((i: {title: string}) => `- ${i.title}`).join('\n') ?? ''}

REVENUE LEAKAGE: $${revenue?.recoverable ?? 0} recoverable
${revenue?.items?.map((i: {title: string; amount: number}) => `- ${i.title}: $${i.amount}`).join('\n') ?? 'None'}

SUBSCRIPTIONS: ${subs?.total ?? 0} active, ${subs?.unused ?? 0} unused
${subs?.items?.map((i: {title: string; amount: number}) => `- ${i.title}: $${i.amount}/mo`).join('\n') ?? ''}

Analysis date: ${analysis.created_at}`
  }

  const systemPrompt = `You are PocketCFO, an AI financial advisor for small business owners. You have access to the owner's real financial data shown below. Answer questions in plain English — no jargon, no charts, just clear direct answers a business owner can act on.

RULES:
- Only cite numbers that appear in the financial data below. Never invent figures.
- If asked about something not in the data, say so honestly.
- Keep answers concise — 2-4 sentences max unless asked for detail.
- Always end with one specific action the owner can take.

${financialContext}`

  // Save user message
  await supabase.from('chat_messages').insert({
    user_id: user.id,
    role: 'user',
    content: message,
  })

  // Build message history for Claude
  const messages: Anthropic.MessageParam[] = [
    ...recentHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ]

  // Stream response
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  let fullResponse = ''

  const readable = new ReadableStream({
    async start(controller) {
      stream.on('text', (text) => {
        fullResponse += text
        controller.enqueue(new TextEncoder().encode(text))
      })

      stream.on('finalMessage', async () => {
        controller.close()
        // Save assistant response
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: fullResponse,
        })
      })

      stream.on('error', (err) => {
        console.error('[chat] stream error:', err)
        controller.error(err)
      })
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
