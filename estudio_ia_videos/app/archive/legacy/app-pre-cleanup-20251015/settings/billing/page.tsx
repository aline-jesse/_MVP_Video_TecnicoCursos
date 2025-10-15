
/**
 * Billing Settings Page
 * Sprint 35: Manage subscription, view invoices, upgrade/downgrade plans
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  CreditCard,
  Check,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface Organization {
  id: string;
  name: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
}

interface Subscription {
  tier: string;
  status: string;
  currentPeriodEnd: string;
  cancelAt: string | null;
  amount: number;
  currency: string;
}

const PLANS = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    features: [
      '5 membros',
      '10 projetos',
      '1GB de armazenamento',
      'Templates básicos',
      'Suporte da comunidade',
    ],
  },
  PRO: {
    name: 'Profissional',
    price: 199,
    features: [
      '50 membros',
      '100 projetos',
      '50GB de armazenamento',
      'Todos os templates',
      'Suporte prioritário',
      'White-label',
      'Domínio customizado',
      'Analytics avançado',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 499,
    features: [
      'Membros ilimitados',
      'Projetos ilimitados',
      '500GB de armazenamento',
      'Todos os templates',
      'Suporte dedicado',
      'White-label',
      'Domínio customizado',
      'SSO/SAML',
      'Analytics enterprise',
      'API customizada',
    ],
  },
};

export default function BillingSettingsPage() {
  const { data: session } = useSession() || {};
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [currentTier, setCurrentTier] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadSubscription(selectedOrgId);
    }
  }, [selectedOrgId]);

  async function loadOrganizations() {
    try {
      const res = await fetch('/api/org');
      if (!res.ok) throw new Error('Failed to fetch organizations');
      const data = await res.json();
      setOrganizations(data.organizations);
      if (data.organizations.length > 0) {
        setSelectedOrgId(data.organizations[0].id);
        setCurrentTier(data.organizations[0].tier);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  }

  async function loadSubscription(orgId: string) {
    try {
      const res = await fetch(`/api/org/${orgId}`);
      if (!res.ok) throw new Error('Failed to fetch subscription');
      const data = await res.json();
      setCurrentTier(data.organization.tier);
      setSubscription(data.organization.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  }

  async function handleUpgrade(tier: 'PRO' | 'ENTERPRISE') {
    if (!selectedOrgId) return;

    setUpgrading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          tier,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create checkout');
      }

      const data = await res.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      setUpgrading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Assinatura & Pagamento</h1>
            <p className="text-muted-foreground">
              Gerencie seu plano e métodos de pagamento
            </p>
          </div>
        </div>

        {/* Organization Selector */}
        {organizations.length > 1 && (
          <Card className="p-4">
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} ({org.tier})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {/* Current Plan */}
        {subscription && (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Plano Atual</h3>
                <p className="text-3xl font-bold mt-2">
                  {PLANS[currentTier].name}
                </p>
              </div>
              <Badge
                variant={
                  subscription.status === 'ACTIVE' ? 'default' : 'destructive'
                }
              >
                {subscription.status}
              </Badge>
            </div>

            {subscription.status === 'ACTIVE' && (
              <p className="text-sm text-muted-foreground">
                Próxima cobrança:{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                {' - '}
                R$ {(subscription.amount / 100).toFixed(2)}
              </p>
            )}

            {subscription.cancelAt && (
              <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Assinatura será cancelada
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Seu plano será cancelado em{' '}
                    {new Date(subscription.cancelAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(PLANS) as Array<'FREE' | 'PRO' | 'ENTERPRISE'>).map((tier) => {
            const plan = PLANS[tier];
            const isCurrent = tier === currentTier;

            return (
              <Card
                key={tier}
                className={`p-6 ${
                  isCurrent ? 'border-2 border-primary' : ''
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">
                      R$ {plan.price}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : tier === 'FREE' ? (
                  <Button variant="outline" className="w-full" disabled>
                    Fazer Downgrade
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(tier)}
                    disabled={upgrading}
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Fazer Upgrade'
                    )}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {/* Billing Portal Link */}
        {subscription && subscription.status === 'ACTIVE' && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-2">Portal de Pagamento</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie seus métodos de pagamento, visualize faturas e atualize
              informações de cobrança.
            </p>
            <Button variant="outline" disabled>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Portal Stripe
            </Button>
          </Card>
        )}

        {/* Stripe Not Configured Warning */}
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Stripe ainda não configurado
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Para habilitar pagamentos, configure as variáveis de ambiente STRIPE_SECRET_KEY,
                STRIPE_PRICE_ID_PRO e STRIPE_PRICE_ID_ENTERPRISE.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
