export const dynamic = 'force-dynamic';

/**
 * Organization Members API
 * Sprint 35: Manage organization members
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../../lib/db';
import { getOrgContext, hasPermission, validateOrgLimits, updateOrgUsage } from '../../../../../lib/multi-tenancy/org-context';
import { createAuditLog, AuditActions } from '../../../../../lib/billing/audit-logger';

/**
 * GET /api/org/[orgId]/members - List organization members
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

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: params.orgId },
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
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/org/[orgId]/members - Invite new member
 */
export async function POST(
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
    if (!orgContext || !hasPermission(orgContext.role, 'members:manage')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check limits
    const limits = await validateOrgLimits(params.orgId);
    if (!limits.canAddMember) {
      return NextResponse.json(
        { error: 'Member limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role = 'MEMBER' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find or create user
    let invitedUser = await prisma.user.findUnique({ where: { email } });

    if (!invitedUser) {
      // Create placeholder user for invitation
      invitedUser = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
        },
      });
    }

    // Check if already member
    const existing = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.orgId,
          userId: invitedUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    // Create membership
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: params.orgId,
        userId: invitedUser.id,
        role,
        status: 'INVITED',
        invitedBy: user.id,
      },
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
    });

    // Update org usage
    await updateOrgUsage(params.orgId, { members: 1 });

    // Audit log
    await createAuditLog({
      organizationId: params.orgId,
      userId: user.id,
      userEmail: session.user.email,
      userName: user.name || undefined,
      action: AuditActions.MEMBER_INVITED,
      resource: 'member',
      resourceId: member.id,
      description: `Invited ${email} as ${role}`,
      metadata: { invitedEmail: email, role },
    });

    // TODO: Send invitation email

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member', details: error.message },
      { status: 500 }
    );
  }
}
