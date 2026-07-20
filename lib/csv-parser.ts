import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import Anthropic from '@anthropic-ai/sdk'

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

  const date = headers[lower.findIndex((h) => h.includes('date'))] || headers[0]
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
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })

  // If Excel has a single column whose name looks like CSV (contains commas),
  // the user saved a CSV inside Excel — re-parse the cell values as CSV rows
  if (data.length > 0) {
    const headers = Object.keys(data[0])
    if (headers.length === 1 && headers[0].includes(',')) {
      const csvText = [headers[0], ...data.map((row) => row[headers[0]])].join('\n')
      const result = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
      })
      return result.data
    }
  }

  return data
}

async function parsePdf(buffer: Buffer): Promise<Record<string, string>[]> {
  // Dynamically import pdf-parse to avoid SSR issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParseModule = await import('pdf-parse') as any
  const pdfParse: (buf: Buffer) => Promise<{ text: string }> = pdfParseModule.default ?? pdfParseModule
  const data = await pdfParse(buffer)
  const text = data.text

  // Use Claude to extract transactions from the raw PDF text
  const client = new Anthropic()
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Extract all financial transactions from this bank statement or financial document. Return ONLY a JSON array of objects, each with: date (string), description (string), amount (number, negative for expenses/debits, positive for income/credits). No markdown, no explanation — just the raw JSON array.

Document text:
${text.slice(0, 50000)}`,
    }],
  })

  const content = msg.content[0]
  if (content.type !== 'text') throw new Error('Unexpected Claude response')

  const jsonText = content.text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '')
  const transactions: { date: string; description: string; amount: number }[] = JSON.parse(jsonText)

  return transactions.map(t => ({
    date: t.date,
    description: t.description,
    amount: String(t.amount),
  }))
}

export async function parseFinancialFile(buffer: Buffer, mimeType: string): Promise<TransactionSummary> {
  let rawData: Record<string, string>[]

  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel') {
    rawData = parseExcel(buffer)
  } else if (mimeType === 'application/pdf') {
    rawData = await parsePdf(buffer)
  } else {
    rawData = await parseCsv(buffer)
  }

  const rows = extractRows(rawData)

  if (rows.length === 0) {
    throw new Error('No transactions found')
  }

  console.log('[csv-parser] total rows:', rows.length)
  console.log('[csv-parser] sample row:', JSON.stringify(rows[0]))
  console.log('[csv-parser] sample amounts:', rows.slice(0, 5).map(r => r.amount))

  const dates = rows.map((r) => r.date).sort()
  const revenues = rows.filter((r) => r.amount > 0)
  const expenses = rows.filter((r) => r.amount < 0)

  console.log('[csv-parser] revenues:', revenues.length, 'expenses:', expenses.length)

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = Math.abs(expenses.reduce((sum, r) => sum + r.amount, 0))

  console.log('[csv-parser] totalRevenue:', totalRevenue, 'totalExpenses:', totalExpenses)

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
