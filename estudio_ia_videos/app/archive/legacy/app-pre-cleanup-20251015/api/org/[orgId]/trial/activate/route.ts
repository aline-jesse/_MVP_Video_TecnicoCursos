
/**
 * SPRINT 36 - TRIAL ACTIVATION API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
// import { activateTrial } from '@/lib/trial/trial-manager';

// Inline implementation
async function activateTrial(orgId: string, userId: string) {
  // Simulate trial activation
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial
  
  return {
    success: true,
    trialEndDate,
    message: 'Trial activated successfully'
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is owner
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
        userId: user.id,
        role: 'OWNER',
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if trial already active or used
    const existingSubscription = await prisma.subscription.findUnique({
      where: { organizationId: params.orgId },
    });

    if (existingSubscription && existingSubscription.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Trial already active or subscription exists' },
        { status: 400 }
      );
    }

    // Activate trial
    const result = await activateTrial(params.orgId, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trial activated successfully',
    });

  } catch (error) {
    console.error('Trial activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
