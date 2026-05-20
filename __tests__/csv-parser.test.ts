import { parseFinancialFile } from '@/lib/csv-parser'

describe('parseFinancialFile', () => {
  it('parses a basic CSV with Date, Description, Amount columns', async () => {
    const csv = `Date,Description,Amount,Type
2025-01-05,Slack subscription,-120,expense
2025-01-10,Client payment,5000,income
2025-01-15,Adobe license,-54,expense
2025-01-20,AWS services,-2800,expense
2025-02-05,Slack subscription,-120,expense
2025-02-10,Client payment,4500,income`

    const buffer = Buffer.from(csv)
    const result = await parseFinancialFile(buffer, 'text/csv')

    expect(result.totalTransactions).toBe(6)
    expect(result.totalRevenue).toBe(9500)
    expect(result.totalExpenses).toBe(3094)
    expect(result.recurringCharges.length).toBeGreaterThan(0)
    expect(result.recurringCharges[0].name).toContain('slack')
  })

  it('returns dateRange from first to last transaction', async () => {
    const csv = `Date,Description,Amount
2025-01-05,Payment A,100
2025-03-20,Payment B,200`

    const buffer = Buffer.from(csv)
    const result = await parseFinancialFile(buffer, 'text/csv')

    expect(result.dateRange.start).toBe('2025-01-05')
    expect(result.dateRange.end).toBe('2025-03-20')
  })

  it('throws on empty CSV', async () => {
    const buffer = Buffer.from('Date,Description,Amount\n')
    await expect(parseFinancialFile(buffer, 'text/csv')).rejects.toThrow('No transactions found')
  })
})
