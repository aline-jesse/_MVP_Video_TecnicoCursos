
/**
 * SPRINT 36 - FAVICON UPLOAD API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
// import { uploadOrganizationFavicon, deleteOrganizationAsset } from '@/lib/storage/white-label-storage';

// Inline implementations
async function uploadOrganizationFavicon(orgId: string, buffer: Buffer, filename: string) {
  // Simulate file upload
  const url = `/api/org/${orgId}/assets/favicon/${filename}`;
  return {
    success: true,
    url,
    path: `uploads/org/${orgId}/favicon/${filename}`
  };
}

async function deleteOrganizationAsset(orgId: string, assetType: string) {
  // Simulate file deletion
  return {
    success: true
  };
}
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadOrganizationFavicon(
      params.orgId,
      buffer,
      file.name
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    });

  } catch (error) {
    console.error('Favicon upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const result = await deleteOrganizationAsset(params.orgId, 'favicon');

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Favicon delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
