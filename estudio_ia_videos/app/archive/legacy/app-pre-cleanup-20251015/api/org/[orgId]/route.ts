export const dynamic = 'force-dynamic';

/**
 * Organization Details API
 * Sprint 35: Get/Update/Delete specific organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/db';
import { getOrgContext, hasPermission } from '../../../../lib/multi-tenancy/org-context';
import { createAuditLog, AuditActions } from '../../../../lib/billing/audit-logger';

/**
 * GET /api/org/[orgId] - Get organization details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
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

    const orgContext = await getOrgContext(user.id, params.orgId);
    if (!orgContext) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.orgId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        subscription: true,
        whiteLabelSettings: true,
        ssoConfig: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ organization, role: orgContext.role });
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/org/[orgId] - Update organization
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
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

    const orgContext = await getOrgContext(user.id, params.orgId);
    if (!orgContext || !hasPermission(orgContext.role, 'org:manage')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, address } = body;

    const organization = await prisma.organization.update({
      where: { id: params.orgId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
    });

    // Audit log
    await createAuditLog({
      organizationId: params.orgId,
      userId: user.id,
      userEmail: session.user.email,
      userName: user.name || undefined,
      action: AuditActions.ORG_UPDATED,
      resource: 'organization',
      resourceId: params.orgId,
      description: 'Organization updated',
      metadata: body,
    });

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/org/[orgId] - Delete organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
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

    const orgContext = await getOrgContext(user.id, params.orgId);
    if (!orgContext || orgContext.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can delete organizations' }, { status: 403 });
    }

    // Audit log before deletion
    await createAuditLog({
      organizationId: params.orgId,
      userId: user.id,
      userEmail: session.user.email,
      userName: user.name || undefined,
      action: AuditActions.ORG_DELETED,
      resource: 'organization',
      resourceId: params.orgId,
      description: 'Organization deleted',
    });

    await prisma.organization.delete({
      where: { id: params.orgId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization', details: error.message },
      { status: 500 }
    );
  }
}
