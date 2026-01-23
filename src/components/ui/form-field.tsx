import React from 'react'
import { FieldError } from 'react-hook-form'

interface FormFieldProps {
  children: React.ReactNode
  error?: FieldError
  className?: string
}

/**
 * FormField wrapper component
 * Wraps a form input with consistent spacing and error display
 */
export function FormField({ children, error, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
      {error && (
        <p className="text-[13px] text-red-600 mt-1" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
