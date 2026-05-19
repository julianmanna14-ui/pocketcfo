import { render, screen, fireEvent } from '@testing-library/react'
import FAQ from '@/components/FAQ'

describe('FAQ', () => {
  it('renders all questions', () => {
    render(<FAQ />)
    expect(screen.getByText('Is my financial data safe?')).toBeInTheDocument()
    expect(screen.getByText('Can I cancel anytime?')).toBeInTheDocument()
  })

  it('answers are hidden by default', () => {
    render(<FAQ />)
    const answer = screen.getByText(/Bank-level 256-bit encryption/)
    expect(answer.closest('div')).toHaveStyle({ maxHeight: '0px' })
  })

  it('clicking a question reveals the answer', () => {
    render(<FAQ />)
    fireEvent.click(screen.getByText('Is my financial data safe?'))
    const answer = screen.getByText(/Bank-level 256-bit encryption/)
    expect(answer.closest('div')).toHaveStyle({ maxHeight: '200px' })
  })

  it('clicking an open question closes it', () => {
    render(<FAQ />)
    fireEvent.click(screen.getByText('Is my financial data safe?'))
    fireEvent.click(screen.getByText('Is my financial data safe?'))
    const answer = screen.getByText(/Bank-level 256-bit encryption/)
    expect(answer.closest('div')).toHaveStyle({ maxHeight: '0px' })
  })
})
