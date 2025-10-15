
/**
 * SPRINT 36 - TRIAL STATUS API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
// import { getTrialStatus } from '@/lib/trial/trial-manager';

// Inline implementation
async function getTrialStatus(orgId: string) {
  // Simulate trial status check
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days remaining
  
  return {
    isActive: true,
    daysRemaining: 7,
    trialEndDate,
    canExtend: false
  };
}
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

    // Check if user is member
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
        user: { email: session.user.email },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get trial status
    const status = await checkTrialStatus(params.orgId);

    // Get subscription details
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: params.orgId },
      select: {
        tier: true,
        status: true,
        trialEnd: true,
        trialStart: true,
      },
    });

    return NextResponse.json({
      ...status,
      subscription,
    });

  } catch (error) {
    console.error('Trial status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
