export const dynamic = 'force-dynamic';

/**
 * Organizations API
 * Sprint 35: CRUD operations for organizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/db';
import { createDefaultOrganization, getUserOrganizations } from '../../../lib/multi-tenancy/org-context';
import { createAuditLog, AuditActions } from '../../../lib/billing/audit-logger';

/**
 * GET /api/org - List user's organizations
 */
export async function GET(request: NextRequest) {
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

    const organizations = await getUserOrganizations(user.id);

    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/org - Create new organization
 */
export async function POST(request: NextRequest) {
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
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    // Check if slug already exists
    if (slug) {
      const existing = await prisma.organization.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
      }
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug: slug || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        email: session.user.email,
        status: 'ACTIVE',
        tier: 'FREE',
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
            status: 'ACTIVE',
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: true,
      },
    });

    // Audit log
    await createAuditLog({
      organizationId: organization.id,
      userId: user.id,
      userEmail: session.user.email,
      userName: user.name || undefined,
      action: AuditActions.ORG_CREATED,
      resource: 'organization',
      resourceId: organization.id,
      description: `Organization "${name}" created`,
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization', details: error.message },
      { status: 500 }
    );
  }
}
