
/**
 * Multi-Tenancy Middleware
 * Sprint 35: Automatically inject org context into requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function orgMiddleware(request: NextRequest) {
  const token = await getToken({ req: request as any });

  if (!token?.sub) {
    return NextResponse.next();
  }

  // Get org from header, cookie, or subdomain
  const orgId = 
    request.headers.get('x-organization-id') ||
    request.cookies.get('org-id')?.value ||
    extractOrgFromSubdomain(request.url);

  if (orgId) {
    // Inject org into request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-organization-id', orgId);
    requestHeaders.set('x-user-id', token.sub);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

/**
 * Extract organization from subdomain
 * Example: acme.estudioai.com.br -> look up org by custom domain
 */
function extractOrgFromSubdomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Skip localhost and main domain
    if (hostname === 'localhost' || hostname.startsWith('192.168.')) {
      return null;
    }

    // Extract subdomain
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const subdomain = parts[0];
      // You would look up org by custom domain in DB here
      return subdomain;
    }

    return null;
  } catch {
    return null;
  }
}
