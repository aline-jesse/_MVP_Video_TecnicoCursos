

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
/**
 * SPRINT 34 - SSO/SAML AUTHENTICATION ENDPOINTS
 */

import { NextRequest, NextResponse } from 'next/server';

import { OAuthHelper } from '@/lib/auth/sso-saml';


export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider as 'okta' | 'azure' | 'google';
    const { searchParams } = new URL(request.url);

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    
    // Store state in session/cookie for validation
    const response = NextResponse.redirect(
      OAuthHelper.generateAuthUrl(provider, {
        clientId: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || '',
        redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/sso/${provider}/callback`,
        state,
      })
    );

    // Set state cookie for validation
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error('SSO initiation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'SSO initiation failed',
      },
      { status: 500 }
    );
  }
}
