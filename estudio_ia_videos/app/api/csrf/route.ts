
/**
 * 🛡️ CSRF Token Endpoint
 * 
 * Gera e retorna token CSRF para o cliente
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfToken } from '@/lib/security/csrf-protection'

/**
 * GET /api/csrf
 * Retorna novo token CSRF
 */
export async function GET(request: NextRequest) {
  const token = generateCsrfToken()
  
  const response = NextResponse.json({
    token,
  })
  
  // Set cookie
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  
  return response
}
