
/**
 * 🛡️ CSRF Protection
 * 
 * Cross-Site Request Forgery protection
 */

import { NextRequest } from 'next/server'
import { randomBytes, createHash } from 'crypto'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Hash token for storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(request: NextRequest): boolean {
  try {
    // Get token from header
    const headerToken = request.headers.get(CSRF_HEADER_NAME)
    
    // Get token from cookie
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
    
    if (!headerToken || !cookieToken) {
      return false
    }
    
    // Compare tokens
    return hashToken(headerToken) === hashToken(cookieToken)
    
  } catch (error) {
    console.error('CSRF validation error:', error)
    return false
  }
}

/**
 * CSRF protection middleware
 */
export function requireCsrfToken(request: NextRequest): boolean {
  const { pathname } = request.nextUrl
  const method = request.method
  
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }
  
  // Skip CSRF for API authentication endpoints
  if (pathname.startsWith('/api/auth')) {
    return true
  }
  
  // Validate CSRF token
  return validateCsrfToken(request)
}

/**
 * Get CSRF token from request or generate new one
 */
export function getCsrfToken(request: NextRequest): string {
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (existingToken) {
    return existingToken
  }
  
  return generateCsrfToken()
}
