
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  ArrowLeft,
  Zap,
  Crown,
  Sparkles,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handleCheckout = (plan: string) => {
    toast.success(`Redirecionando para checkout do plano ${plan}...`)
    // Em produção, redirecionar para Stripe Checkout
    // window.location.href = `/api/stripe/checkout?plan=${plan}&period=${billingPeriod}`
  }

  const plans = [
    {
      name: 'Gratuito',
      description: 'Para testar a plataforma',
      icon: Sparkles,
      price: { monthly: 0, yearly: 0 },
      features: [
        { text: '3 vídeos por mês', included: true },
        { text: '5 minutos de TTS', included: true },
        { text: '1GB de storage', included: true },
        { text: 'Templates básicos de NRs', included: true },
        { text: 'Marca d\'água', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'Avatares 3D', included: false },
        { text: 'Renderização HD', included: false },
        { text: 'Colaboração', included: false },
      ],
      cta: 'Começar Gratuitamente',
      popular: false,
    },
    {
      name: 'Pro',
      description: 'Para profissionais e pequenas equipes',
      icon: Zap,
      price: { monthly: 29, yearly: 290 },
      features: [
        { text: 'Vídeos ilimitados', included: true },
        { text: '60 minutos de TTS', included: true },
        { text: '10GB de storage', included: true },
        { text: 'Todos os templates de NRs', included: true },
        { text: 'Sem marca d\'água', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Avatares 3D hiper-realistas', included: true },
        { text: 'Renderização Full HD', included: true },
        { text: 'Colaboração em tempo real', included: true },
        { text: 'Análise de compliance NR', included: true },
        { text: 'Exportação em múltiplos formatos', included: true },
        { text: 'White-label', included: false },
        { text: 'SLA garantido', included: false },
      ],
      cta: 'Começar Teste Gratuito',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'Para grandes empresas',
      icon: Crown,
      price: { monthly: null, yearly: null },
      features: [
        { text: 'Tudo do Pro', included: true },
        { text: 'TTS ilimitado', included: true },
        { text: 'Storage ilimitado', included: true },
        { text: 'Usuários ilimitados', included: true },
        { text: 'White-label completo', included: true },
        { text: 'SLA 99.9% garantido', included: true },
        { text: 'Suporte dedicado 24/7', included: true },
        { text: 'Gerente de sucesso', included: true },
        { text: 'Treinamento personalizado', included: true },
        { text: 'Integração via API', included: true },
        { text: 'Auditoria e compliance', included: true },
        { text: 'Deploy on-premise', included: true },
      ],
      cta: 'Falar com Vendas',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>

          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Planos e Preços
            </h1>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para suas necessidades. Sem surpresas, sem taxas ocultas.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Anual
              <Badge className="ml-2 bg-green-500">Economize 17%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = plan.price[billingPeriod]

            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? 'border-4 border-blue-500 shadow-xl scale-105'
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>

                  <div className="mt-4">
                    {price !== null ? (
                      <>
                        <div className="text-4xl font-bold">
                          R$ {price}
                        </div>
                        <div className="text-sm text-gray-600">
                          /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl font-bold">Sob consulta</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    onClick={() => handleCheckout(plan.name.toLowerCase())}
                    className={`w-full mb-6 ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included
                              ? 'text-gray-700'
                              : 'text-gray-400'
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-gray-600">
                  Sim! Não há período de fidelidade. Você pode cancelar sua assinatura a qualquer
                  momento pelo painel de configurações.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Como funciona o período de teste?</h3>
                <p className="text-gray-600">
                  Ao se inscrever no plano Pro, você tem 14 dias de teste gratuito. Não cobramos
                  nada durante este período, e você pode cancelar sem custo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Posso fazer upgrade ou downgrade?</h3>
                <p className="text-gray-600">
                  Sim! Você pode alterar seu plano a qualquer momento. O valor será ajustado
                  proporcionalmente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Quais formas de pagamento são aceitas?</h3>
                <p className="text-gray-600">
                  Aceitamos todas as principais bandeiras de cartão de crédito via Stripe. Para
                  planos Enterprise, também oferecemos pagamento via boleto e transferência
                  bancária.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Há desconto para ONGs ou educação?</h3>
                <p className="text-gray-600">
                  Sim! Oferecemos 50% de desconto para instituições educacionais e organizações
                  sem fins lucrativos. Entre em contato para mais informações.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-gray-600 mb-6">
            Nossa equipe está pronta para ajudar você a escolher o melhor plano.
          </p>
          <Link href="/help">
            <Button size="lg" variant="outline">
              Falar com Especialista
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
