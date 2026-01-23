// API Error Handler Utility
// Centralized error handling for API routes

import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Custom API Errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation error', details?: any) {
    super(message, 400, details)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Database error') {
    super(message, 500)
    this.name = 'DatabaseError'
  }
}

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]:', error)

  // Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    )
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    )
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Check for specific error messages that indicate auth issues
    if (
      error.message.includes('Unauthorized') ||
      error.message.includes('Not authenticated')
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for permission errors
    if (
      error.message.includes('Forbidden') ||
      error.message.includes('Insufficient permissions')
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check for not found errors
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

/**
 * Common response helpers
 */
export function unauthorized(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFound(message: string = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function badRequest(message: string, details?: any) {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status: 400 }
  )
}

export function success<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 })
}
