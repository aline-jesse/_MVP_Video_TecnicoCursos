
/**
 * SPRINT 36 - ORGANIZATION INVITATION API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
// import { sendInvitationEmail } from '@/lib/emails/sendgrid';

// Inline implementation
async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
  role: string;
}) {
  // Simulate email sending
  console.log('Sending invitation email to:', params.to);
  console.log('Invite URL:', params.inviteUrl);
  return true;
}
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, email, role } = await request.json();

    if (!organizationId || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get inviter
    const inviter = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!inviter) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if inviter has permission
    const inviterMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: inviter.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!inviterMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if user already exists
    let invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create a placeholder
    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          // emailVerified will be null until they sign up
        },
      });
    }

    // Check if already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: invitedUser.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Create invitation
    const member = await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: invitedUser.id,
        role: role as any,
        status: 'INVITED',
        invitedBy: inviter.id,
      },
    });

    // Generate invite URL with token
    const token = Buffer.from(`${member.id}:${Date.now()}`).toString('base64');
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;

    // Send invitation email
    const emailSent = await sendInvitationEmail({
      to: email,
      inviterName: inviter.name || inviter.email,
      organizationName: organization.name,
      inviteUrl,
      role,
    });

    if (!emailSent) {
      console.error('Failed to send invitation email');
      // Don't fail the request, invitation is created
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        email,
        role,
        status: member.status,
      },
    });

  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
