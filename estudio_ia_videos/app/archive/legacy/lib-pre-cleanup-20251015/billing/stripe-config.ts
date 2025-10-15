
/**
 * Stripe Configuration & Helpers
 * Sprint 35: Billing Integration
 */

// Importação condicional do Stripe
let Stripe: any = null;
try {
  Stripe = require('stripe').default || require('stripe');
} catch (error) {
  console.warn('⚠️ Stripe não instalado. Funcionalidades de billing desabilitadas.');
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not configured - billing features will be disabled');
}

export const stripe = (process.env.STRIPE_SECRET_KEY && Stripe)
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null;

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Subscription Plans
 */
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'BRL',
    interval: 'month' as const,
    features: {
      maxMembers: 5,
      maxProjects: 10,
      maxStorage: 1 * 1024 * 1024 * 1024, // 1GB
      templates: 'basic',
      support: 'community',
      whiteLabel: false,
      customDomain: false,
      sso: false,
      analytics: 'basic',
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 19900, // R$ 199.00
    currency: 'BRL',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || '',
    features: {
      maxMembers: 50,
      maxProjects: 100,
      maxStorage: 50 * 1024 * 1024 * 1024, // 50GB
      templates: 'all',
      support: 'priority',
      whiteLabel: true,
      customDomain: true,
      sso: false,
      analytics: 'advanced',
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49900, // R$ 499.00
    currency: 'BRL',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    features: {
      maxMembers: 999999, // Unlimited
      maxProjects: 999999, // Unlimited
      maxStorage: 500 * 1024 * 1024 * 1024, // 500GB
      templates: 'all',
      support: 'dedicated',
      whiteLabel: true,
      customDomain: true,
      sso: true,
      analytics: 'enterprise',
    },
  },
} as const;

/**
 * Get plan by tier
 */
export function getPlan(tier: 'FREE' | 'PRO' | 'ENTERPRISE') {
  return PLANS[tier];
}

/**
 * Create Stripe customer
 */
export async function createStripeCustomer(params: {
  email: string;
  name: string;
  organizationId: string;
}) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      organizationId: params.organizationId,
    },
  });

  return customer;
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      organizationId: params.organizationId,
    },
    subscription_data: {
      metadata: {
        organizationId: params.organizationId,
      },
    },
  });

  return session;
}

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}
