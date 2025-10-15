
/**
 * SPRINT 36 - SSO CONFIGURATION API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
        user: { email: session.user.email },
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ssoConfig = await prisma.organizationSSO.findUnique({
      where: { organizationId: params.orgId },
    });

    if (!ssoConfig) {
      return NextResponse.json({ config: null });
    }

    // Don't send sensitive data to client
    const sanitizedConfig = {
      id: ssoConfig.id,
      provider: ssoConfig.provider,
      isActive: ssoConfig.isActive,
      enforceSSO: ssoConfig.enforceSSO,
      samlEntryPoint: ssoConfig.samlEntryPoint,
      samlIssuer: ssoConfig.samlIssuer,
      // samlCert is sensitive, only show partial
      samlCert: ssoConfig.samlCert ? '****' : null,
      oauthClientId: ssoConfig.oauthClientId,
      // oauthClientSecret is sensitive
      oauthClientSecret: ssoConfig.oauthClientSecret ? '****' : null,
    };

    return NextResponse.json({ config: sanitizedConfig });

  } catch (error) {
    console.error('SSO config get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
        user: { email: session.user.email },
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await request.json();

    // Validate required fields based on provider
    if (config.provider === 'SAML') {
      if (!config.samlEntryPoint || !config.samlIssuer || !config.samlCert) {
        return NextResponse.json(
          { error: 'Missing required SAML fields' },
          { status: 400 }
        );
      }
    } else {
      if (!config.oauthClientId || !config.oauthClientSecret) {
        return NextResponse.json(
          { error: 'Missing required OAuth fields' },
          { status: 400 }
        );
      }
    }

    // Create or update SSO config
    const ssoConfig = await prisma.organizationSSO.upsert({
      where: { organizationId: params.orgId },
      create: {
        organizationId: params.orgId,
        provider: config.provider,
        isActive: config.isActive || false,
        enforceSSO: config.enforceSSO || false,
        samlEntryPoint: config.samlEntryPoint,
        samlIssuer: config.samlIssuer,
        samlCert: config.samlCert,
        oauthClientId: config.oauthClientId,
        oauthClientSecret: config.oauthClientSecret,
        oauthAuthUrl: config.oauthAuthUrl,
        oauthTokenUrl: config.oauthTokenUrl,
        oauthUserInfoUrl: config.oauthUserInfoUrl,
      },
      update: {
        provider: config.provider,
        isActive: config.isActive,
        enforceSSO: config.enforceSSO,
        samlEntryPoint: config.samlEntryPoint,
        samlIssuer: config.samlIssuer,
        samlCert: config.samlCert === '****' ? undefined : config.samlCert,
        oauthClientId: config.oauthClientId,
        oauthClientSecret: config.oauthClientSecret === '****' ? undefined : config.oauthClientSecret,
        oauthAuthUrl: config.oauthAuthUrl,
        oauthTokenUrl: config.oauthTokenUrl,
        oauthUserInfoUrl: config.oauthUserInfoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        id: ssoConfig.id,
        provider: ssoConfig.provider,
        isActive: ssoConfig.isActive,
      },
    });

  } catch (error) {
    console.error('SSO config save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
