export const dynamic = 'force-dynamic';

/**
 * Stripe Webhooks API
 * Sprint 35: Handle Stripe events (payment success, subscription updates, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../../../../lib/billing/stripe-config';
import { createAuditLog, AuditActions } from '../../../../lib/billing/audit-logger';

// Importação condicional do tipo Stripe
type StripeEvent = any;

/**
 * POST /api/billing/webhook - Handle Stripe webhooks
 */
export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    console.log('Stripe webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 400 }
    );
  }
}

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId;
  if (!organizationId) return;

  console.log('Checkout completed for organization:', organizationId);

  // Update organization with customer and subscription IDs
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    },
  });
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organizationId;
  if (!organizationId) return;

  const tier = determineTier(subscription);
  const plan = getPlanForTier(tier);

  console.log('Subscription created:', { organizationId, tier });

  // Create subscription record
  await prisma.subscription.create({
    data: {
      organizationId,
      tier,
      status: subscription.status === 'active' ? 'ACTIVE' : 'TRIALING',
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCustomerId: subscription.customer as string,
      billingCycle: subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'ANNUAL' : 'MONTHLY',
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      amount: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.currency.toUpperCase(),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
  });

  // Update organization tier and limits
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      tier,
      status: 'ACTIVE',
      maxMembers: plan.features.maxMembers,
      maxProjects: plan.features.maxProjects,
      maxStorage: BigInt(plan.features.maxStorage),
    },
  });

  // Audit log
  await createAuditLog({
    organizationId,
    action: AuditActions.BILLING_PLAN_CHANGED,
    resource: 'billing',
    description: `Subscription activated: ${tier}`,
    metadata: { tier, subscriptionId: subscription.id },
  });
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organizationId;
  if (!organizationId) return;

  const tier = determineTier(subscription);
  const plan = getPlanForTier(tier);

  console.log('Subscription updated:', { organizationId, tier, status: subscription.status });

  // Update subscription record
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      tier,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    },
  });

  // Update organization tier and limits
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      tier,
      status: subscription.status === 'active' ? 'ACTIVE' : 'SUSPENDED',
      maxMembers: plan.features.maxMembers,
      maxProjects: plan.features.maxProjects,
      maxStorage: BigInt(plan.features.maxStorage),
    },
  });

  // Audit log
  await createAuditLog({
    organizationId,
    action: AuditActions.BILLING_PLAN_CHANGED,
    resource: 'billing',
    description: `Subscription updated: ${tier}`,
    metadata: { tier, status: subscription.status },
  });
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organizationId;
  if (!organizationId) return;

  console.log('Subscription deleted:', organizationId);

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELLED',
      canceledAt: new Date(),
    },
  });

  // Downgrade organization to FREE tier
  const freePlan = getPlanForTier('FREE');
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      tier: 'FREE',
      status: 'ACTIVE',
      maxMembers: freePlan.features.maxMembers,
      maxProjects: freePlan.features.maxProjects,
      maxStorage: BigInt(freePlan.features.maxStorage),
    },
  });

  // Audit log
  await createAuditLog({
    organizationId,
    action: AuditActions.BILLING_SUBSCRIPTION_CANCELLED,
    resource: 'billing',
    description: 'Subscription cancelled, downgraded to FREE',
  });
}

/**
 * Handle invoice.payment_succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  console.log('Payment succeeded:', subscriptionId);

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) return;

  // Update payment info
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      lastPaymentDate: new Date(),
      nextPaymentDate: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000)
        : null,
    },
  });

  // Audit log
  await createAuditLog({
    organizationId: subscription.organizationId,
    action: AuditActions.BILLING_PAYMENT_SUCCESS,
    resource: 'billing',
    description: `Payment succeeded: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`,
    metadata: { amount: invoice.amount_paid, currency: invoice.currency },
  });
}

/**
 * Handle invoice.payment_failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  console.log('Payment failed:', subscriptionId);

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) return;

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'PAST_DUE',
    },
  });

  // Audit log
  await createAuditLog({
    organizationId: subscription.organizationId,
    action: AuditActions.BILLING_PAYMENT_FAILED,
    resource: 'billing',
    description: 'Payment failed',
    status: 'failed',
    metadata: { amount: invoice.amount_due, currency: invoice.currency },
  });
}

/**
 * Helper: Determine tier from subscription
 */
function determineTier(subscription: Stripe.Subscription): 'FREE' | 'PRO' | 'ENTERPRISE' {
  const priceId = subscription.items.data[0]?.price.id;

  if (priceId === process.env.STRIPE_PRICE_ID_ENTERPRISE) return 'ENTERPRISE';
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return 'PRO';
  return 'FREE';
}

/**
 * Helper: Map Stripe status to our status
 */
function mapStripeStatus(status: string): 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED' | 'UNPAID' {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'trialing': return 'TRIALING';
    case 'past_due': return 'PAST_DUE';
    case 'canceled': return 'CANCELLED';
    case 'unpaid': return 'UNPAID';
    default: return 'ACTIVE';
  }
}

/**
 * Helper: Get plan for tier
 */
function getPlanForTier(tier: 'FREE' | 'PRO' | 'ENTERPRISE') {
  const plans = {
    FREE: {
      features: {
        maxMembers: 5,
        maxProjects: 10,
        maxStorage: 1 * 1024 * 1024 * 1024, // 1GB
      },
    },
    PRO: {
      features: {
        maxMembers: 50,
        maxProjects: 100,
        maxStorage: 50 * 1024 * 1024 * 1024, // 50GB
      },
    },
    ENTERPRISE: {
      features: {
        maxMembers: 999999,
        maxProjects: 999999,
        maxStorage: 500 * 1024 * 1024 * 1024, // 500GB
      },
    },
  };

  return plans[tier];
}
