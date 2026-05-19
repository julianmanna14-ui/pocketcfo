import { render, screen, fireEvent } from '@testing-library/react'
import Pricing from '@/components/Pricing'

describe('Pricing', () => {
  it('shows monthly prices by default', () => {
    render(<Pricing />)
    expect(screen.getByText('$79')).toBeInTheDocument()
    expect(screen.getByText('$149')).toBeInTheDocument()
    expect(screen.getByText('$299')).toBeInTheDocument()
  })

  it('switches to annual prices when toggle is clicked', () => {
    render(<Pricing />)
    fireEvent.click(screen.getByRole('button', { name: /annual/i }))
    expect(screen.getByText('$66')).toBeInTheDocument()
    expect(screen.getByText('$124')).toBeInTheDocument()
    expect(screen.getByText('$249')).toBeInTheDocument()
  })
})
