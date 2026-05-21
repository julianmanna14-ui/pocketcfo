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

  const recurringList = summary.recurringCharges.length > 0
    ? summary.recurringCharges.map((r) => `  * "${r.name}" — monthly cost: $${r.amount}`).join('\n')
    : '  None detected'

  const largestList = summary.largestExpenses.length > 0
    ? summary.largestExpenses.map((e) => `  * "${e.description}" — amount: $${e.amount} on ${e.date}`).join('\n')
    : '  None'

  const userMessage = `Analyze this small business financial data and return ONLY valid JSON.

FINANCIAL SUMMARY:
- Date range: ${summary.dateRange.start} to ${summary.dateRange.end}
- Number of transactions: ${summary.totalTransactions}
- Total income received: $${summary.totalRevenue.toLocaleString()}
- Total money spent (expenses): $${summary.totalExpenses.toLocaleString()}

RECURRING EXPENSE CHARGES (these repeat every month):
${recurringList}

TOP INDIVIDUAL EXPENSES:
${largestList}

INSTRUCTIONS:
- "subscriptions.total" means the NUMBER of distinct subscription services found, NOT a dollar amount
- "subscriptions.unused" means the count of subscriptions that appear to be duplicate or unused
- Look for duplicate tools (e.g. both Slack and Teams for messaging)
- All "amount" fields are dollar amounts, NOT counts
- Return ONLY the JSON object, no explanation text`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  // Strip markdown code fences if Claude wrapped the JSON
  const text = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(text) as AnalysisFindings
  } catch {
    console.error('[analyzer] raw response:', raw.substring(0, 500))
    throw new Error('Claude returned invalid JSON')
  }
}
