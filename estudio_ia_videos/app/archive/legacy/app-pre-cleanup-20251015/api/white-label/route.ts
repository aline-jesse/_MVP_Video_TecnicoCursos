export const dynamic = 'force-dynamic';

/**
 * White-Label Settings API
 * Sprint 35: Customize branding, colors, domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/db';
import { getOrgContext, hasPermission } from '../../../lib/multi-tenancy/org-context';
import { createAuditLog, AuditActions } from '../../../lib/billing/audit-logger';

/**
 * GET /api/white-label?orgId=xxx - Get white-label settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const settings = await prisma.whiteLabelSettings.findUnique({
      where: { organizationId: orgId },
    });

    if (!settings) {
      // Return default settings
      return NextResponse.json({
        settings: {
          logoUrl: null,
          faviconUrl: null,
          companyName: null,
          primaryColor: '#0066cc',
          secondaryColor: '#f0f0f0',
          accentColor: '#ff6b35',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontFamily: 'Inter',
          isActive: false,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching white-label settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/white-label - Update white-label settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { organizationId, ...settingsData } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check permissions
    const orgContext = await getOrgContext(user.id, organizationId);
    if (!orgContext || !hasPermission(orgContext.role, 'settings:manage')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if organization has white-label feature
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || (org.tier !== 'PRO' && org.tier !== 'ENTERPRISE')) {
      return NextResponse.json(
        { error: 'White-label features require Pro or Enterprise plan' },
        { status: 403 }
      );
    }

    // Upsert settings
    const settings = await prisma.whiteLabelSettings.upsert({
      where: { organizationId },
      create: {
        organizationId,
        ...settingsData,
      },
      update: settingsData,
    });

    // Audit log
    await createAuditLog({
      organizationId,
      userId: user.id,
      userEmail: session.user.email,
      userName: user.name || undefined,
      action: AuditActions.WHITELABEL_UPDATED,
      resource: 'white-label',
      description: 'White-label settings updated',
      metadata: settingsData,
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating white-label settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', details: error.message },
      { status: 500 }
    );
  }
}
