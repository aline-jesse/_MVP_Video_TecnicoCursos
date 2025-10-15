
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Shield, 
  Zap, 
  Users,
  Database,
  Cloud,
  Lock,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Settings
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function EnterpriseIntegration() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');

  const features = [
    { icon: Shield, title: "SSO Corporativo", description: "Single Sign-On com SAML/LDAP" },
    { icon: Database, title: "Database Dedicado", description: "PostgreSQL exclusivo com backup automático" },
    { icon: Cloud, title: "Multi-Cloud", description: "AWS, Azure, GCP suportados" },
    { icon: Users, title: "Usuários Ilimitados", description: "Sem limite de colaboradores" },
    { icon: Lock, title: "Compliance LGPD", description: "Conformidade total com privacidade" },
    { icon: BarChart3, title: "Analytics Avançado", description: "Dashboards personalizados" },
  ];

  const integrations = [
    { name: "Microsoft 365", status: "active", category: "Produtividade" },
    { name: "Slack", status: "active", category: "Comunicação" },
    { name: "Zoom", status: "active", category: "Videoconferência" },
    { name: "SAP", status: "available", category: "ERP" },
    { name: "Salesforce", status: "available", category: "CRM" },
    { name: "Teams", status: "active", category: "Colaboração" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Enterprise Integration
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Integre o Estúdio IA de Vídeos com sua infraestrutura corporativa
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Recursos Enterprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Partners */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Integrações Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-slate-500">{integration.category}</p>
                  </div>
                  <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                    {integration.status === 'active' ? 'Ativo' : 'Disponível'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Planos Enterprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className={`p-6 relative ${selectedPlan === 'starter' ? 'ring-2 ring-emerald-500' : ''}`}>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
                <div className="text-3xl font-bold text-emerald-600 mb-4">R$ 2.500/mês</div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Até 50 usuários</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">SSO básico</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Suporte por email</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">2 integrações</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant={selectedPlan === 'starter' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('starter')}
              >
                Selecionar Starter
              </Button>
            </Card>

            {/* Professional Plan */}
            <Card className={`p-6 relative ${selectedPlan === 'professional' ? 'ring-2 ring-emerald-500' : ''}`}>
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-emerald-500">
                Recomendado
              </Badge>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Professional</h3>
                <div className="text-3xl font-bold text-emerald-600 mb-4">R$ 7.500/mês</div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Até 200 usuários</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">SSO avançado + SAML</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Suporte prioritário</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Integrações ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Analytics personalizado</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant={selectedPlan === 'professional' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('professional')}
              >
                Selecionar Professional
              </Button>
            </Card>

            {/* Enterprise Plan */}
            <Card className={`p-6 relative ${selectedPlan === 'enterprise' ? 'ring-2 ring-emerald-500' : ''}`}>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-emerald-600 mb-4">Customizado</div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Usuários ilimitados</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Infraestrutura dedicada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Suporte 24/7 dedicado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">Customização completa</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm">On-premise disponível</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant={selectedPlan === 'enterprise' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('enterprise')}
              >
                Contatar Vendas
              </Button>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <Card className="p-8 text-center bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-emerald-950 dark:to-violet-950 border-0">
          <Globe className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Pronto para Enterprise?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Nossa equipe de especialistas está pronta para implementar a solução perfeita para sua empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                toast.success('Demo agendada! Nossa equipe entrará em contato em até 2 horas.')
                // Simular agendamento
                setTimeout(() => {
                  toast('📅 Demo confirmada para amanhã às 14:00', { duration: 3000 })
                }, 2000)
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Agendar Demo
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                toast.success('Abrindo documentação técnica...')
                // Simular abertura de docs
                setTimeout(() => {
                  toast('📚 Documentação carregada com sucesso!', { duration: 3000 })
                }, 1500)
              }}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Documentação Técnica
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
