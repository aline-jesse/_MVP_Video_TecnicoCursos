
/**
 * 🎬 Avatar Local Render - Página de Teste
 * Demonstração da renderização local de avatares
 */

'use client'

import React from 'react'
import AppShell from '@/components/layouts/AppShell'
import LocalRenderPanel from '@/components/avatars/local-render-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Video, Zap, Server } from 'lucide-react'

export default function AvatarLocalRenderPage() {
  return (
    <AppShell
      title="Renderização Local de Avatar"
      description="Pipeline de renderização integrado com TTS premium e upload S3"
    >
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
              <Video className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Avatar Pipeline Integrado
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Renderização local de avatares 3D com sincronização labial, 
            usando TTS premium (ElevenLabs/Azure) e armazenamento S3.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-bold text-lg mb-2">TTS Premium</h3>
              <p className="text-sm text-muted-foreground">
                ElevenLabs + Azure com vozes naturais em PT-BR
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <Server className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-lg mb-2">Pipeline Local</h3>
              <p className="text-sm text-muted-foreground">
                Processamento integrado sem Docker/Redis
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-bold text-lg mb-2">Upload S3</h3>
              <p className="text-sm text-muted-foreground">
                Armazenamento cloud automático e seguro
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Render Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LocalRenderPanel />
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pipeline de Renderização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Geração de Áudio</p>
                    <p className="text-xs text-muted-foreground">
                      TTS premium com vozes naturais
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lip Sync</p>
                    <p className="text-xs text-muted-foreground">
                      Sincronização labial inteligente
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Renderização</p>
                    <p className="text-xs text-muted-foreground">
                      Geração de frames e composição
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-sm">Upload S3</p>
                    <p className="text-xs text-muted-foreground">
                      Armazenamento cloud seguro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recursos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avatares</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vozes TTS</span>
                  <Badge variant="secondary">4</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resoluções</span>
                  <Badge variant="secondary">HD/FHD/4K</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Máx. Caracteres</span>
                  <Badge variant="secondary">800</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Sparkles className="h-8 w-8 mx-auto text-purple-600" />
                  <h3 className="font-bold">Pipeline Integrado</h3>
                  <p className="text-xs text-muted-foreground">
                    Sem necessidade de Docker, Redis ou GPU standalone. 
                    Usa toda a infraestrutura do Estúdio IA.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">~20-50s</p>
                <p className="text-xs text-muted-foreground">Tempo de Renderização</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">30 FPS</p>
                <p className="text-xs text-muted-foreground">Taxa de Quadros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">FFmpeg</p>
                <p className="text-xs text-muted-foreground">Engine de Vídeo</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">S3</p>
                <p className="text-xs text-muted-foreground">Cloud Storage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
