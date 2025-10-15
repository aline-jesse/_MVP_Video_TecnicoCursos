
/**
 * 🎛️ SISTEMA REAL - Página Principal do Sistema Completo
 * Interface unificada para todas as funcionalidades reais
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import UnifiedControlPanel from '@/components/real-system/unified-control-panel'
import AppShell from '@/components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  Volume2, 
  Image, 
  Video,
  Sparkles,
  Rocket,
  Settings,
  Info
} from 'lucide-react'

function SystemContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('projectId')

  return (
    <div className="space-y-8">
      {/* Header com informações do sistema */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Sistema Real Integrado
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Plataforma completa com funcionalidades reais para criação profissional de conteúdo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            PPTX Real
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            TTS Integrado
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Processamento de Imagens
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Exportação de Vídeo
          </Badge>
        </div>
      </div>

      {/* Painel de controle principal */}
      <UnifiedControlPanel projectId={projectId || undefined} />

      {/* Seção de recursos disponíveis */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Recursos Implementados
          </h2>
          <p className="text-muted-foreground">
            Todas as funcionalidades foram substituídas por sistemas reais de produção
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="h-5 w-5" />
                PPTX Real
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-green-600">
                Geração real de apresentações usando PptxGenJS com templates profissionais
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Templates corporativos
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Layouts customizáveis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Animações e transições
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Volume2 className="h-5 w-5" />
                TTS Integrado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-blue-600">
                Text-to-Speech real com ElevenLabs e Azure Speech, sincronizado com slides
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-500" />
                  Múltiplos providers
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-500" />
                  Vozes naturais
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-500" />
                  Sincronização automática
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Image className="h-5 w-5" />
                Processamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-600">
                Processamento real de imagens com Sharp, otimização e efeitos
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-purple-500" />
                  Sharp + AWS S3
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-purple-500" />
                  Múltiplos formatos
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-purple-500" />
                  Otimização web
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Video className="h-5 w-5" />
                Exportação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-orange-600">
                Pipeline completo de renderização de vídeo com FFmpeg e Canvas
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-orange-500" />
                  FFmpeg + Canvas
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-orange-500" />
                  Múltiplas qualidades
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-orange-500" />
                  Processamento assíncrono
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informações técnicas */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Infraestrutura</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• NextAuth.js para autenticação</li>
              <li>• Prisma ORM com PostgreSQL</li>
              <li>• AWS S3 para armazenamento</li>
              <li>• Redis para cache e filas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">APIs Integradas</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• ElevenLabs TTS API</li>
              <li>• Azure Speech Services</li>
              <li>• Google TTS (opcional)</li>
              <li>• Sharp para processamento</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Tecnologias</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• PptxGenJS para PPTX</li>
              <li>• FFmpeg para vídeo</li>
              <li>• Canvas API para renderização</li>
              <li>• TypeScript + React</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Footer da página */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Sistema Real Integrado • Todas as simulações foram substituídas por funcionalidades reais de produção
        </p>
        <p className="mt-1">
          Desenvolvido para o Estúdio IA de Vídeos • Versão 2.0
        </p>
      </div>
    </div>
  )
}

export default function SistemaRealPage() {
  return (
    <AppShell 
      title="Sistema Real Integrado"
      description="Plataforma completa com funcionalidades reais para criação de conteúdo"
      showBreadcrumbs={false}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando Sistema Real...</p>
          </div>
        </div>
      }>
        <SystemContent />
      </Suspense>
    </AppShell>
  )
}
