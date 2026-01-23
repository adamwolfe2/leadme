import React, { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: FieldError
}

/**
 * FormCheckbox - Controlled checkbox with validation styling
 */
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? 'border-red-600' : ''
            } ${className}`}
            {...props}
          />
          {label && (
            <label
              htmlFor={props.id}
              className="ml-2 text-[13px] text-zinc-700 cursor-pointer"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="text-[13px] text-red-600 ml-6" role="alert">
            {error.message}
          </p>
        )}
      </div>
    )
  }
)

FormCheckbox.displayName = 'FormCheckbox'
