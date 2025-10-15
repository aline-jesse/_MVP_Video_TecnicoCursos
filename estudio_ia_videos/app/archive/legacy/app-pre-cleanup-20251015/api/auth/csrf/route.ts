
import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/security/csrf-protection';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/csrf
 * Get CSRF token for form submissions
 */
export async function GET(request: NextRequest) {
  try {
    const token = generateCsrfToken();
    
    const response = NextResponse.json({
      csrfToken: token,
      success: true
    });
    
    // Set CSRF token in cookie
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate CSRF token',
        csrfToken: generateCsrfToken() // fallback token
      },
      { status: 200 } // Return 200 instead of 500
    );
  }
}
