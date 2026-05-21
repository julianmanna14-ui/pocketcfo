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
