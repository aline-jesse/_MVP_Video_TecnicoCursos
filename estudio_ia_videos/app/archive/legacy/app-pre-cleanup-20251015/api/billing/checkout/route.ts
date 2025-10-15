export const dynamic = 'force-dynamic';

/**
 * Billing Checkout API
 * Sprint 35: Create Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/db';
import { getOrgContext, hasPermission } from '../../../../lib/multi-tenancy/org-context';
import { createCheckoutSession, createStripeCustomer, getPlan } from '../../../../lib/billing/stripe-config';
import { createAuditLog, AuditActions } from '../../../../lib/billing/audit-logger';

/**
 * POST /api/billing/checkout - Create checkout session
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
    const { organizationId, tier } = body;

    if (!organizationId || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check permissions
    const orgContext = await getOrgContext(user.id, organizationId);
    if (!orgContext || !hasPermission(orgContext.role, 'billing:manage')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const plan = getPlan(tier);
    if (tier === 'FREE' || !('stripePriceId' in plan) || !plan.stripePriceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create or get Stripe customer
    let customerId = organization.stripeCustomerId;

    if (!customerId) {
      const customer = await createStripeCustomer({
        email: organization.email || session.user.email,
        name: organization.name,
        organizationId: organization.id,
      });
      customerId = customer.id;

      // Save customer ID
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const checkoutSession = await createCheckoutSession({
      customerId: customerId || '',
      priceId: (plan as any).stripePriceId,
      organizationId,
      successUrl: `${baseUrl}/settings/billing?success=true`,
      cancelUrl: `${baseUrl}/settings/billing?cancelled=true`,
    });

    // Audit log
    await createAuditLog({
      organizationId,
      userId: user.id,
      userEmail: session.user.email,
      userName: user.name || undefined,
      action: 'billing:checkout_started',
      resource: 'billing',
      description: `Started checkout for ${tier} plan`,
      metadata: { tier, sessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
