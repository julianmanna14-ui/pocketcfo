import type { TransactionSummary } from '@/lib/csv-parser'

const SANDBOX_BASE = 'https://sandbox-quickbooks.api.intuit.com'
const PRODUCTION_BASE = 'https://quickbooks.api.intuit.com'

function getBaseUrl(): string {
  return process.env.INTUIT_ENVIRONMENT === 'production' ? PRODUCTION_BASE : SANDBOX_BASE
}

async function qbFetch(path: string, accessToken: string): Promise<unknown> {
  const url = `${getBaseUrl()}${path}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`QB API ${res.status}: ${text.slice(0, 300)}`)
  }

  return res.json()
}

interface ColData { value: string }
interface ReportRow { type: string; ColData: ColData[] }
interface TransactionListReport {
  Rows?: { Row?: ReportRow[] }
}

function findRecurring(rows: { description: string; amount: number }[]) {
  const counts: Record<string, { amount: number; count: number }> = {}
  for (const row of rows) {
    const key = row.description.toLowerCase().trim()
    if (!counts[key]) counts[key] = { amount: Math.abs(row.amount), count: 0 }
    counts[key].count++
  }
  return Object.entries(counts)
    .filter(([, v]) => v.count >= 2)
    .map(([name, v]) => ({ name, amount: v.amount, frequency: v.count >= 10 ? 'weekly' : 'monthly' }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
}

export async function fetchQBTransactions(
  accessToken: string,
  realmId: string
): Promise<TransactionSummary> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90)

  const start = startDate.toISOString().split('T')[0]
  const end = endDate.toISOString().split('T')[0]

  const report = (await qbFetch(
    `/v3/company/${realmId}/reports/TransactionList?start_date=${start}&end_date=${end}&minorversion=65`,
    accessToken
  )) as TransactionListReport

  const rows = (report.Rows?.Row ?? []).filter((r) => r.type === 'Data')

  const transactions = rows.map((row) => {
    const cols = row.ColData
    // Columns: 0=Date, 1=TxnType, 2=No, 3=Name, 4=Memo, 5=Account, 6=Split, 7=Amount
    const date = cols[0]?.value ?? ''
    const txnType = cols[1]?.value ?? ''
    const name = cols[3]?.value ?? ''
    const memo = cols[4]?.value ?? ''
    const amountStr = cols[7]?.value ?? '0'
    const amount = parseFloat(amountStr.replace(/,/g, '')) || 0
    const description = name || memo || txnType

    return { date, description, amount }
  }).filter((r) => r.date && r.description && r.amount !== 0)

  if (transactions.length === 0) {
    throw new Error('No transactions found in QuickBooks for the last 90 days')
  }

  const revenues = transactions.filter((r) => r.amount > 0)
  const expenses = transactions.filter((r) => r.amount < 0)
  const dates = transactions.map((r) => r.date).sort()

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = Math.abs(expenses.reduce((sum, r) => sum + r.amount, 0))

  const largestExpenses = [...expenses]
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 10)
    .map((r) => ({ description: r.description, amount: Math.abs(r.amount), date: r.date }))

  return {
    dateRange: { start: dates[0], end: dates[dates.length - 1] },
    totalTransactions: transactions.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    expenseCategories: [],
    recurringCharges: findRecurring(expenses),
    largestExpenses,
    unpaidInvoices: [],
  }
}
