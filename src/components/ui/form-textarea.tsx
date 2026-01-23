import React, { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: FieldError
}

/**
 * FormTextarea - Controlled textarea with validation styling
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 text-[13px] text-zinc-900 placeholder:text-zinc-400 bg-white border rounded-lg transition-all duration-150 focus:outline-none focus:ring-1 resize-y ${
          error
            ? 'border-red-600 focus:border-red-600 focus:ring-red-200'
            : 'border-zinc-300 focus:border-zinc-500 focus:ring-zinc-200'
        } disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
