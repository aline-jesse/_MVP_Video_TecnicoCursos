
/**
 * SPRINT 36 - TRIAL MANAGEMENT
 * Automatic trial activation and monitoring
 */

import { prisma } from '../db';
import { sendTrialActivationEmail, sendBillingAlertEmail } from '../emails/sendgrid';

interface TrialConfig {
  durationDays: number;
  tier: 'PRO' | 'ENTERPRISE';
  features: string[];
}

const DEFAULT_TRIAL_CONFIG: TrialConfig = {
  durationDays: 14,
  tier: 'PRO',
  features: [
    'unlimited_avatars',
    'premium_tts',
    'hd_export',
    '4k_export',
    'collaboration',
    'white_label',
    'priority_support',
  ],
};

/**
 * Activate trial for new organization
 */
export async function activateTrial(
  organizationId: string,
  userId: string,
  config: Partial<TrialConfig> = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const trialConfig = { ...DEFAULT_TRIAL_CONFIG, ...config };
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trialConfig.durationDays);

    // Update organization status to TRIAL
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'TRIAL',
        tier: trialConfig.tier,
      },
    });

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { organizationId },
      create: {
        organizationId,
        tier: trialConfig.tier,
        status: 'TRIALING',
        trialEnd,
        trialStart: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEnd,
        amount: 0,
      },
      update: {
        status: 'TRIALING',
        trialEnd,
        trialStart: new Date(),
      },
    });

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (user) {
      // Send trial activation email
      await sendTrialActivationEmail({
        to: user.email,
        userName: user.name || 'Usuário',
        organizationName: organization.name,
        trialDays: trialConfig.durationDays,
        dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      });
    }

    console.log(`✅ Trial activated for organization ${organizationId} (${trialConfig.durationDays} days)`);

    return { success: true };

  } catch (error) {
    console.error('Failed to activate trial:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao ativar trial',
    };
  }
}

/**
 * Check trial status and send alerts
 */
export async function checkTrialStatus(organizationId: string): Promise<{
  status: 'active' | 'ending_soon' | 'expired';
  daysRemaining?: number;
}> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!subscription || subscription.status !== 'TRIALING' || !subscription.trialEnd) {
      return { status: 'expired' };
    }

    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      // Trial expired
      await expireTrial(organizationId);
      return { status: 'expired', daysRemaining: 0 };
    }

    if (daysRemaining <= 3) {
      // Trial ending soon - send alert
      const owner = subscription.organization.members[0];
      if (owner && owner.user) {
        await sendBillingAlertEmail({
          to: owner.user.email,
          organizationName: subscription.organization.name,
          alertType: 'trial_ending',
          daysRemaining,
          billingUrl: `${process.env.NEXTAUTH_URL}/settings/billing`,
        });
      }
      
      return { status: 'ending_soon', daysRemaining };
    }

    return { status: 'active', daysRemaining };

  } catch (error) {
    console.error('Failed to check trial status:', error);
    return { status: 'expired' };
  }
}

/**
 * Expire trial and downgrade to FREE tier
 */
async function expireTrial(organizationId: string): Promise<void> {
  try {
    // Update organization to FREE tier
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'ACTIVE',
        tier: 'FREE',
      },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: { user: true },
          take: 1,
        },
      },
    });

    // Update subscription
    await prisma.subscription.update({
      where: { organizationId },
      data: {
        status: 'CANCELLED',
        tier: 'FREE',
      },
    });

    // Send trial expired email
    const owner = organization.members[0];
    if (owner && owner.user) {
      await sendBillingAlertEmail({
        to: owner.user.email,
        organizationName: organization.name,
        alertType: 'trial_ended',
        billingUrl: `${process.env.NEXTAUTH_URL}/settings/billing`,
      });
    }

    console.log(`❌ Trial expired for organization ${organizationId}`);

  } catch (error) {
    console.error('Failed to expire trial:', error);
  }
}

/**
 * Convert trial to paid subscription
 */
export async function convertTrialToPaid(
  organizationId: string,
  stripeSubscriptionId: string,
  tier: 'PRO' | 'ENTERPRISE'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'ACTIVE',
        tier,
        stripeSubscriptionId,
      },
    });

    // Update subscription
    await prisma.subscription.update({
      where: { organizationId },
      data: {
        status: 'ACTIVE',
        tier,
        stripeSubscriptionId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: undefined, // Will be set by Stripe webhook
        trialEnd: undefined,
      },
    });

    console.log(`✅ Trial converted to ${tier} subscription for organization ${organizationId}`);

    return { success: true };

  } catch (error) {
    console.error('Failed to convert trial:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao converter trial',
    };
  }
}

/**
 * Schedule trial checks (run daily via cron)
 */
export async function runTrialChecks(): Promise<void> {
  try {
    console.log('🔄 Running trial checks...');

    // Get all organizations with active trials
    const trialOrganizations = await prisma.organization.findMany({
      where: {
        status: 'TRIAL',
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`Found ${trialOrganizations.length} organizations with active trials`);

    for (const org of trialOrganizations) {
      await checkTrialStatus(org.id);
    }

    console.log('✅ Trial checks completed');

  } catch (error) {
    console.error('Failed to run trial checks:', error);
  }
}
