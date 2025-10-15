
/**
 * SPRINT 36 - SSO TEST API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

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

    const ssoConfig = await prisma.organizationSSO.findUnique({
      where: { organizationId: params.orgId },
    });

    if (!ssoConfig) {
      return NextResponse.json({
        success: false,
        message: 'SSO não configurado',
      });
    }

    // Perform basic validation tests
    const tests = [];

    // Test 1: Configuration completeness
    if (ssoConfig.provider === 'SAML') {
      tests.push({
        name: 'Configuração SAML',
        passed: !!(ssoConfig.samlEntryPoint && ssoConfig.samlIssuer && ssoConfig.samlCert),
      });
    } else {
      tests.push({
        name: 'Configuração OAuth',
        passed: !!(ssoConfig.oauthClientId && ssoConfig.oauthClientSecret),
      });
    }

    // Test 2: URL validation
    if (ssoConfig.samlEntryPoint) {
      try {
        new URL(ssoConfig.samlEntryPoint);
        tests.push({
          name: 'SSO URL válida',
          passed: true,
        });
      } catch {
        tests.push({
          name: 'SSO URL válida',
          passed: false,
        });
      }
    }

    // Test 3: Certificate format (for SAML)
    if (ssoConfig.provider === 'SAML' && ssoConfig.samlCert) {
      const certRegex = /-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----/;
      tests.push({
        name: 'Certificado válido',
        passed: certRegex.test(ssoConfig.samlCert),
      });
    }

    const allPassed = tests.every(t => t.passed);

    // Update test status in database
    await prisma.organizationSSO.update({
      where: { organizationId: params.orgId },
      data: {
        lastTestedAt: new Date(),
        testStatus: allPassed ? 'success' : 'failed',
        testError: allPassed ? null : 'Alguns testes falharam',
      },
    });

    return NextResponse.json({
      success: allPassed,
      message: allPassed
        ? 'Todos os testes passaram! SSO está configurado corretamente.'
        : 'Alguns testes falharam. Verifique a configuração.',
      tests,
    });

  } catch (error) {
    console.error('SSO test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
