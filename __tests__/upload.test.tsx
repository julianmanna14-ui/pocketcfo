import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UploadSection } from '@/app/dashboard/upload'

// Mock fetch
global.fetch = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}))

describe('UploadSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows upload button when no analysis exists', () => {
    render(<UploadSection hasAnalysis={false} summary={null} lastRun={null} />)
    expect(screen.getByText(/Upload CSV or Excel file/i)).toBeInTheDocument()
  })

  it('shows analysis complete state when analysis exists', () => {
    render(
      <UploadSection
        hasAnalysis={true}
        summary="Found 3 cost issues totalling $1,200/month."
        lastRun="2026-05-20T10:00:00Z"
      />
    )
    expect(screen.getByText(/Analysis complete/i)).toBeInTheDocument()
    expect(screen.getByText(/Found 3 cost issues/i)).toBeInTheDocument()
  })

  it('shows error when wrong file type selected', async () => {
    render(<UploadSection hasAnalysis={false} summary={null} lastRun={null} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText(/Please upload a CSV or Excel file/i)).toBeInTheDocument()
    })
  })
})
