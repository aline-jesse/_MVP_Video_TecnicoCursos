

/**
 * 🚀 Sprint 28 Demo Page
 * Demonstração das novas funcionalidades
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Zap, 
  Palette, 
  FileText, 
  Activity,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Sprint28DemoPage() {
  const features = [
    {
      icon: Zap,
      title: 'TTS com Redis Cache',
      description: 'Geração de áudio com cache Redis, fallback automático e preview',
      status: 'Completo',
      link: '/sprint28-tts-demo',
      color: 'text-blue-500'
    },
    {
      icon: Palette,
      title: 'Canvas Editor Professional',
      description: 'Editor avançado com snap/grid, layers, alinhamento e ferramentas profissionais',
      status: 'Completo',
      link: '/sprint28-canvas-demo',
      color: 'text-purple-500'
    },
    {
      icon: FileText,
      title: 'Templates NR Certificados',
      description: '5 templates completos: NR12, NR33, NR35, NR10, NR6 com quiz e certificação',
      status: 'Completo',
      link: '/sprint28-templates-demo',
      color: 'text-green-500'
    },
    {
      icon: Activity,
      title: 'Sistema de Monitoramento',
      description: 'Dashboard de saúde dos serviços e estatísticas de cache',
      status: 'Completo',
      link: '/sprint28-monitor',
      color: 'text-orange-500'
    }
  ]

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="text-lg px-4 py-2">
          Sprint 28 - Editor Canvas + TTS + Templates NR
        </Badge>
        <h1 className="text-4xl font-bold">
          Demonstração do Sprint 28
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Sistema completo de edição profissional, geração de áudio inteligente e templates certificados MTE
        </p>
      </div>

      <Separator className="my-8" />

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <Badge variant="secondary">{feature.status}</Badge>
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={feature.link}>
                <Button className="w-full">
                  Testar Funcionalidade
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      {/* Technical Specs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Especificações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">TTS Multi-Provider</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ ElevenLabs (Premium)</li>
                <li>✅ Azure Speech</li>
                <li>✅ Google Cloud TTS</li>
                <li>✅ Fallback automático</li>
                <li>✅ Redis cache (7 dias)</li>
                <li>✅ Preview de áudio</li>
                <li>✅ Barra de progresso</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Canvas Editor</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ Fabric.js</li>
                <li>✅ Undo/Redo (50 estados)</li>
                <li>✅ Layers management</li>
                <li>✅ Snap to grid</li>
                <li>✅ Alinhamento automático</li>
                <li>✅ Zoom (25% - 200%)</li>
                <li>✅ Export PNG/JPG/JSON</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Templates NR</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✅ NR12 (Máquinas)</li>
                <li>✅ NR33 (Espaços Confinados)</li>
                <li>✅ NR35 (Trabalho em Altura)</li>
                <li>✅ NR10 (Eletricidade)</li>
                <li>✅ NR6 (EPIs)</li>
                <li>✅ Quiz de avaliação</li>
                <li>✅ Certificação MTE</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Performance & Observabilidade</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{'<'}12s</div>
                <div className="text-sm text-muted-foreground">Geração TTS</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">60 FPS</div>
                <div className="text-sm text-muted-foreground">Canvas Editor</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">7 dias</div>
                <div className="text-sm text-muted-foreground">Cache TTL</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Templates NR</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Link href="/">
          <Button variant="outline">
            Voltar ao Início
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button>
            Ir para Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
