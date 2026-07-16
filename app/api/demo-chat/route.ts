import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { message } = await request.json()

  if (!message || message.length > 1000) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `You are PocketCFO, an AI financial advisor for small businesses. A potential customer just described their business. Analyze it and find exactly 4 financial issues or savings opportunities.

Business description: "${message}"

Respond with ONLY a JSON array of exactly 4 objects. Each object has:
- "title": short title of the issue (5-8 words)
- "detail": one sentence explaining the issue and approximate impact
- "category": one of: "subscriptions", "cash_flow", "revenue", "vendors"

Focus on realistic issues for a business like theirs. Be specific and concrete. The first finding should be the most obvious/impactful one.

Return ONLY the JSON array, no other text.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const findings = JSON.parse(text)
    return NextResponse.json({ findings })
  } catch {
    return NextResponse.json({ error: 'Failed to parse findings' }, { status: 500 })
  }
}
