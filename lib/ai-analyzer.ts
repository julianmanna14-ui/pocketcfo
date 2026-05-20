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
