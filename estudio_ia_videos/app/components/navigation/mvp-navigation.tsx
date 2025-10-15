
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Video, Upload, Mic, User, FileText,
  Zap, CheckCircle, Play, Settings
} from 'lucide-react'

const mvpFeatures = [
  {
    id: 'video-studio',
    title: 'Video Studio MVP',
    description: 'Pipeline completo PPTX → TTS → Avatar → MP4',
    icon: Video,
    href: '/video-studio',
    badge: 'MVP CORE',
    color: 'green',
    status: 'ready'
  },
  {
    id: 'pptx-upload',
    title: 'Upload PPTX',
    description: 'Importar apresentações PowerPoint',
    icon: Upload,
    href: '/pptx-upload',
    badge: 'FOUNDATION',
    color: 'blue',
    status: 'ready'
  },
  {
    id: 'tts-test',
    title: 'TTS Engine',
    description: 'Teste de narração com IA',
    icon: Mic,
    href: '/tts-test',
    badge: 'VOICE AI',
    color: 'purple',
    status: 'ready'
  }
]

export default function MVPNavigation() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* MVP Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-green-500" />
          <h2 className="text-2xl font-bold">Sprint 1 MVP</h2>
          <Badge className="bg-green-500">FOUNDATION</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pipeline completo implementado: Parser PPTX → Engine TTS → Avatar 3D → Worker System → Render FFmpeg
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mvpFeatures.map((feature) => {
          const isActive = pathname === feature.href
          const Icon = feature.icon
          
          return (
            <Card 
              key={feature.id}
              className={`transition-all duration-200 hover:shadow-lg ${
                isActive ? 'border-green-500 shadow-md' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      feature.color === 'green' ? 'bg-green-100 text-green-700' :
                      feature.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      feature.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      feature.color === 'green' ? 'border-green-500 text-green-700' :
                      feature.color === 'blue' ? 'border-blue-500 text-blue-700' :
                      feature.color === 'purple' ? 'border-purple-500 text-purple-700' :
                      'border-gray-500 text-gray-700'
                    }`}
                  >
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Implementado</span>
                  </div>
                  <Link href={feature.href}>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      {feature.id === 'video-studio' ? (
                        <>
                          <Play className="w-4 h-4" />
                          Usar MVP
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4" />
                          Testar
                        </>
                      )}
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Implementation Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="w-5 h-5" />
            Sprint 1 - Status de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { component: 'PPTX Parser', status: '✅', detail: 'Upload e extração' },
              { component: 'TTS Engine', status: '✅', detail: 'ElevenLabs + Cache' },
              { component: 'Avatar 3D', status: '✅', detail: 'ReadyPlayerMe + Lipsync' },
              { component: 'Worker System', status: '✅', detail: 'BullMQ + Redis' },
              { component: 'Render Engine', status: '✅', detail: 'FFmpeg + MP4' }
            ].map((item) => (
              <div key={item.component} className="text-center space-y-1">
                <div className="text-2xl">{item.status}</div>
                <p className="text-sm font-medium">{item.component}</p>
                <p className="text-xs text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PRD Requirements Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Conformidade com PRD
          </CardTitle>
          <CardDescription>
            Requisitos implementados conforme Documento de Requisitos do Produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { req: 'Upload PPTX até 100MB', status: '✅', ref: 'Linha 459-460' },
              { req: 'TTS voz brasileira natural', status: '✅', ref: 'Linha 474-477' },
              { req: 'Avatar lipsync <100ms delay', status: '✅', ref: 'Linha 482-485' },
              { req: 'Worker jobs assíncronos', status: '✅', ref: 'Linha 194-200' },
              { req: 'MP4 1080p reproduzível', status: '✅', ref: 'Linha 521-525' },
              { req: '90% vídeos 5min <10min processing', status: '⚡', ref: 'Linha 531-532' }
            ].map((item) => (
              <div key={item.req} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{item.req}</p>
                  <p className="text-xs text-gray-600">{item.ref}</p>
                </div>
                <div className="text-lg">{item.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
