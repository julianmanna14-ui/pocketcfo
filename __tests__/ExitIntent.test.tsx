import { render, screen, fireEvent } from '@testing-library/react'
import ExitIntent from '@/components/ExitIntent'

describe('ExitIntent', () => {
  it('is not visible initially', () => {
    render(<ExitIntent />)
    expect(screen.queryByText(/find out how much you're losing/i)).not.toBeInTheDocument()
  })

  it('shows when mouseleave fires near top of page', () => {
    render(<ExitIntent />)
    fireEvent.mouseLeave(document, { clientY: 0 })
    expect(screen.getByText(/find out how much you're losing/i)).toBeInTheDocument()
  })

  it('dismisses when close button is clicked', () => {
    render(<ExitIntent />)
    fireEvent.mouseLeave(document, { clientY: 0 })
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByText(/find out how much you're losing/i)).not.toBeInTheDocument()
  })

  it('does not show again after dismissal', () => {
    render(<ExitIntent />)
    fireEvent.mouseLeave(document, { clientY: 0 })
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    fireEvent.mouseLeave(document, { clientY: 0 })
    expect(screen.queryByText(/find out how much you're losing/i)).not.toBeInTheDocument()
  })
})
