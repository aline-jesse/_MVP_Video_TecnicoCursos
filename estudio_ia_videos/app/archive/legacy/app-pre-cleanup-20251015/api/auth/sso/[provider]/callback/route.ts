

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
/**
 * SPRINT 34 - SSO CALLBACK HANDLER
 */

import { NextRequest, NextResponse } from 'next/server';

import { OAuthHelper } from '@/lib/auth/sso-saml';

import { auditLog } from '@/lib/audit/audit-logger';

import { prisma } from '@/lib/db';


export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider as 'okta' | 'azure' | 'google';
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = request.cookies.get('oauth_state')?.value;

    // Validate state
    if (!state || !storedState || state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    if (!code) {
      throw new Error('Authorization code not provided');
    }

    // Exchange code for token
    const tokenData = await OAuthHelper.exchangeCodeForToken(provider, code, {
      clientId: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || '',
      clientSecret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || '',
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/sso/${provider}/callback`,
    });

    // Get user info from provider
    const userInfo = await fetchUserInfo(provider, tokenData.access_token);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          image: userInfo.picture,
          emailVerified: new Date(),
          role: 'user',
        },
      });
    }

    // Log SSO login
    await auditLog.login(user.id, user.email, request.headers.get('x-forwarded-for') || '');

    // Create session and redirect
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
    
    // Clear state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error: any) {
    console.error('SSO callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/error?error=${encodeURIComponent(error.message)}`
    );
  }
}

async function fetchUserInfo(provider: string, accessToken: string): Promise<any> {
  const userInfoUrls: Record<string, string> = {
    okta: process.env.OKTA_DOMAIN
      ? `https://${process.env.OKTA_DOMAIN}/oauth2/v1/userinfo`
      : '',
    azure: 'https://graph.microsoft.com/v1.0/me',
    google: 'https://www.googleapis.com/oauth2/v1/userinfo',
  };

  const response = await fetch(userInfoUrls[provider], {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();

  // Normalize user info across providers
  return {
    email: data.email || data.userPrincipalName,
    name: data.name || data.displayName,
    picture: data.picture || data.photo,
  };
}
