

/**
 * 🤝 Real-Time Collaboration Page
 * Sprint 28 - Collaboration features
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, MessageSquare, Eye, Clock, CheckCircle2, Video } from 'lucide-react'

export default function RealTimeCollaborationPage() {
  const features = [
    {
      icon: Users,
      title: 'Edição Colaborativa',
      description: 'Múltiplos usuários editando o mesmo projeto simultaneamente',
      status: 'Em Desenvolvimento',
      color: 'text-blue-500'
    },
    {
      icon: MessageSquare,
      title: 'Chat em Tempo Real',
      description: 'Comunicação instantânea entre membros da equipe',
      status: 'Em Desenvolvimento',
      color: 'text-green-500'
    },
    {
      icon: Eye,
      title: 'Visualização Compartilhada',
      description: 'Veja o que outros membros estão editando em tempo real',
      status: 'Em Desenvolvimento',
      color: 'text-purple-500'
    },
    {
      icon: Clock,
      title: 'Histórico de Versões',
      description: 'Controle completo de versões com rollback',
      status: 'Planejado',
      color: 'text-orange-500'
    },
    {
      icon: CheckCircle2,
      title: 'Aprovações e Revisões',
      description: 'Sistema de aprovação de alterações',
      status: 'Planejado',
      color: 'text-indigo-500'
    },
    {
      icon: Video,
      title: 'Videoconferência Integrada',
      description: 'Reuniões de equipe direto na plataforma',
      status: 'Planejado',
      color: 'text-pink-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Colaboração em Tempo Real
          </Badge>
          <h1 className="text-4xl font-bold">
            Trabalhe em Equipe com Eficiência
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ferramentas colaborativas avançadas para criar vídeos de treinamento em equipe
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  <Badge variant={feature.status === 'Planejado' ? 'outline' : 'secondary'}>
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Em Breve!</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estamos trabalhando arduamente para trazer recursos de colaboração em tempo real 
                para o Estúdio IA de Vídeos. Em breve você poderá trabalhar em equipe de forma 
                mais eficiente e produtiva!
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard">
                  <Button>
                    Voltar ao Dashboard
                  </Button>
                </Link>
                <Link href="/sprint28-demo">
                  <Button variant="outline">
                    Ver Demo Sprint 28
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Roadmap de Desenvolvimento</CardTitle>
            <CardDescription>Próximas funcionalidades planejadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Fase 1: Edição Colaborativa</h4>
                  <p className="text-sm text-muted-foreground">
                    Sistema básico de edição simultânea com locks de objetos
                  </p>
                  <Badge variant="outline" className="mt-2">Sprint 29</Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Fase 2: Comunicação</h4>
                  <p className="text-sm text-muted-foreground">
                    Chat em tempo real e notificações push
                  </p>
                  <Badge variant="outline" className="mt-2">Sprint 30</Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Fase 3: Controle de Versões</h4>
                  <p className="text-sm text-muted-foreground">
                    Histórico completo com comparação e rollback
                  </p>
                  <Badge variant="outline" className="mt-2">Sprint 31</Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Fase 4: Integração com Videoconferência</h4>
                  <p className="text-sm text-muted-foreground">
                    Reuniões integradas com compartilhamento de tela
                  </p>
                  <Badge variant="outline" className="mt-2">Sprint 32</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
