/**
 * Toast Component Tests
 *
 * Tests for the toast notification system.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Toast, ToastProps } from '../toast'

describe('Toast', () => {
  let mockOnClose: ReturnType<typeof vi.fn>
  let defaultProps: ToastProps

  beforeEach(() => {
    mockOnClose = vi.fn()
    defaultProps = {
      id: 'test-toast',
      type: 'success',
      message: 'Test message',
      onClose: mockOnClose,
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders success toast with correct styling', () => {
    render(<Toast {...defaultProps} />)

    const toast = screen.getByRole('alert')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('bg-emerald-50', 'border-emerald-200')
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders error toast with correct styling', () => {
    render(<Toast {...defaultProps} type="error" />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-red-50', 'border-red-200')
  })

  it('renders warning toast with correct styling', () => {
    render(<Toast {...defaultProps} type="warning" />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-amber-50', 'border-amber-200')
  })

  it('renders info toast with correct styling', () => {
    render(<Toast {...defaultProps} type="info" />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveClass('bg-zinc-50', 'border-zinc-200')
  })

  it('renders title when provided', () => {
    render(<Toast {...defaultProps} title="Test Title" />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    render(<Toast {...defaultProps} />)

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const mockAction = vi.fn()
    render(
      <Toast
        {...defaultProps}
        action={{ label: 'Undo', onClick: mockAction }}
      />
    )

    const button = screen.getByText('Undo')
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(mockAction).toHaveBeenCalledTimes(1)
    expect(mockOnClose).toHaveBeenCalledWith('test-toast')
  })

  it('calls onClose when close button is clicked', () => {
    render(<Toast {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close notification')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledWith('test-toast')
  })

  it('auto-dismisses after duration', async () => {
    vi.useFakeTimers()

    render(<Toast {...defaultProps} duration={1000} />)

    // Fast-forward time
    vi.advanceTimersByTime(1300) // Duration + exit animation

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast')
    })

    vi.useRealTimers()
  })

  it('does not auto-dismiss when duration is 0', async () => {
    vi.useFakeTimers()

    render(<Toast {...defaultProps} duration={0} />)

    // Fast-forward time
    vi.advanceTimersByTime(10000)

    expect(mockOnClose).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('pauses auto-dismiss on hover', async () => {
    vi.useFakeTimers()

    render(<Toast {...defaultProps} duration={2000} />)

    const toast = screen.getByRole('alert')

    // Hover after 1 second
    vi.advanceTimersByTime(1000)
    fireEvent.mouseEnter(toast)

    // Wait another 2 seconds (should not dismiss)
    vi.advanceTimersByTime(2000)
    expect(mockOnClose).not.toHaveBeenCalled()

    // Mouse leave and wait for remaining time
    fireEvent.mouseLeave(toast)
    vi.advanceTimersByTime(1300)

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast')
    })

    vi.useRealTimers()
  })

  it('applies exit animation before closing', async () => {
    vi.useFakeTimers()

    const { rerender } = render(<Toast {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close notification')
    fireEvent.click(closeButton)

    const toast = screen.getByRole('alert')

    // Should have exit animation class immediately
    expect(toast).toHaveClass('translate-x-[400px]', 'opacity-0')

    // Should call onClose after animation duration
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast')
    })

    vi.useRealTimers()
  })

  it('renders with correct accessibility attributes', () => {
    render(<Toast {...defaultProps} />)

    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'polite')

    const closeButton = screen.getByLabelText('Close notification')
    expect(closeButton).toBeInTheDocument()
  })

  it('handles long messages gracefully', () => {
    const longMessage = 'This is a very long message that should be displayed properly without breaking the layout or causing any visual issues in the toast notification component.'

    render(<Toast {...defaultProps} message={longMessage} />)

    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })
})
