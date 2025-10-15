
'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Video,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Globe,
} from 'lucide-react'

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Agora em General Availability (GA)</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crie Vídeos de Treinamento com IA em Minutos
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plataforma low-code para criar vídeos profissionais de segurança do trabalho (NRs)
            com avatares 3D hiper-realistas e narração em múltiplas vozes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Começar Gratuitamente <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                Ver Planos e Preços
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>3 vídeos gratuitos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Suporte em português</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para criar vídeos profissionais
          </h2>
          <p className="text-lg text-gray-600">
            Plataforma completa, sem necessidade de edição complexa
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Avatares 3D Hiper-Realistas</h3>
              <p className="text-gray-600">
                Escolha entre avatares profissionais com movimentos e expressões naturais,
                sincronizados automaticamente com a narração.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Text-to-Speech Premium</h3>
              <p className="text-gray-600">
                Vozes naturais em português com ElevenLabs, Azure e Google. Múltiplos sotaques
                e estilos disponíveis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-500 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Templates de NRs</h3>
              <p className="text-gray-600">
                Biblioteca completa de templates para Normas Regulamentadoras brasileiras (NR12,
                NR33, NR35, etc).
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-orange-500 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compliance Automático</h3>
              <p className="text-gray-600">
                Garantia de conformidade com requisitos legais das NRs, com validação
                automática de conteúdo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-pink-500 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Colaboração em Tempo Real</h3>
              <p className="text-gray-600">
                Trabalhe em equipe com comentários, versionamento e compartilhamento de
                projetos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-colors">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multi-idioma</h3>
              <p className="text-gray-600">
                Crie vídeos em português, inglês, espanhol e mais de 50 idiomas com suporte
                completo.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Vídeos Criados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Satisfação dos Usuários</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10min</div>
              <div className="text-blue-100">Tempo Médio de Criação</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Suporte Disponível</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Casos de Uso
          </h2>
          <p className="text-lg text-gray-600">
            Empresas de todos os tamanhos confiam no Estúdio IA
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Treinamentos Corporativos</h3>
              <p className="text-gray-600 mb-4">
                Crie treinamentos de segurança do trabalho em escala para toda a empresa,
                garantindo compliance com NRs.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Templates de NRs pré-aprovados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Relatórios de conclusão</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Certificados automáticos</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Consultorias de Segurança</h3>
              <p className="text-gray-600 mb-4">
                Ofereça vídeos personalizados aos seus clientes de forma rápida e profissional.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>White-label disponível</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multi-cliente</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Painel de gestão</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para criar seu primeiro vídeo?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Comece gratuitamente agora, sem necessidade de cartão de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Começar Gratuitamente <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Falar com Vendas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/features">Funcionalidades</Link></li>
                <li><Link href="/pricing">Preços</Link></li>
                <li><Link href="/templates">Templates</Link></li>
                <li><Link href="/roadmap">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help">Central de Ajuda</Link></li>
                <li><Link href="/docs">Documentação</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/api">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about">Sobre Nós</Link></li>
                <li><Link href="/careers">Carreiras</Link></li>
                <li><Link href="/contact">Contato</Link></li>
                <li><Link href="/partners">Parceiros</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy">Privacidade</Link></li>
                <li><Link href="/terms">Termos de Uso</Link></li>
                <li><Link href="/security">Segurança</Link></li>
                <li><Link href="/compliance">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-gray-600">
            <p>© 2025 Estúdio IA de Vídeos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
