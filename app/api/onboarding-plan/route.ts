import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { message } = await request.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `A small business owner just signed up for PocketCFO (an AI CFO tool). They described their business as: "${message}"

Generate a personalized 3-item action plan showing exactly what PocketCFO will find for them. Be specific to their business type and size.

Return ONLY valid JSON:
{
  "greeting": "one sentence that feels personal and specific to their business (mention what they do)",
  "actions": [
    { "icon": "💳", "title": "short action title", "detail": "one specific sentence about what we'll find for their type of business" },
    { "icon": "💰", "title": "short action title", "detail": "one specific sentence" },
    { "icon": "📈", "title": "short action title", "detail": "one specific sentence" }
  ]
}

Rules:
- Icons should vary: use 💳 💰 📈 🤝 👥 📦 🔍 based on what fits
- Be specific to their industry/size — not generic
- Keep titles under 5 words
- Sound like a smart CFO, not a chatbot`,
    }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  try {
    const plan = JSON.parse(text)
    return NextResponse.json({ plan })
  } catch {
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
