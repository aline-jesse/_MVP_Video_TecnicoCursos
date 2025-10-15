

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Video, 
  Settings, 
  BarChart3, 
  Activity,
  Zap,
  Play,
  Monitor,
  Sparkles,
  Users,
  Eye,
  TestTube
} from 'lucide-react'
import { cn } from '../../lib/utils'

const renderNavigation = [
  {
    id: 'video-studio',
    title: 'Video Studio MVP',
    description: 'Pipeline básico: PPTX → TTS → Avatar → MP4',
    href: '/video-studio',
    icon: Play,
    badge: 'MVP',
    badgeColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'render-studio',
    title: 'Render Studio',
    description: 'Sistema intermediário com fila e métricas',
    href: '/render-studio',
    icon: Video,
    badge: 'Sprint 5',
    badgeColor: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'render-studio-advanced',
    title: 'Advanced Render Studio',
    description: 'Sistema profissional completo com IA avançada',
    href: '/render-studio-advanced',
    icon: Sparkles,
    badge: 'PRO',
    badgeColor: 'bg-green-100 text-green-700'
  },
  {
    id: 'render-analytics',
    title: 'Render Analytics',
    description: 'Dashboard de métricas e performance',
    href: '/render-analytics',
    icon: BarChart3,
    badge: 'Analytics',
    badgeColor: 'bg-orange-100 text-orange-700'
  }
]

const quickActions = [
  {
    id: 'quick-render',
    title: 'Render Rápido',
    description: 'Inicie uma renderização agora',
    href: '/video-studio',
    icon: Zap,
    color: 'text-yellow-600'
  },
  {
    id: 'monitor',
    title: 'Monitor Sistema',
    description: 'Status em tempo real',
    href: '/render-analytics',
    icon: Monitor,
    color: 'text-blue-600'
  },
  {
    id: 'test-system',
    title: 'Testar Sistema',
    description: 'Execute testes de qualidade',
    href: '/render-studio-advanced',
    icon: TestTube,
    color: 'text-purple-600'
  },
  {
    id: 'avatars',
    title: 'Gerenciar Avatares',
    description: 'Configure avatares 3D',
    href: '/render-studio',
    icon: Users,
    color: 'text-green-600'
  }
]

export default function RenderNavigation() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Video className="w-8 h-8 text-purple-600" />
          Sistema de Renderização
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suite completa de ferramentas para renderização de vídeos com IA, 
          desde MVP básico até sistema profissional avançado
        </p>
      </div>

      {/* Main Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.id} href={item.href}>
              <div className={cn(
                "group p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-lg",
                isActive 
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/50" 
                  : "border-gray-200 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      isActive ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground group-hover:bg-purple-100 group-hover:text-purple-600"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge className={item.badgeColor}>
                          {item.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Ações Rápidas</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            
            return (
              <Link key={action.id} href={action.href}>
                <div className="group p-4 border rounded-lg text-center hover:shadow-md transition-all duration-200 hover:border-purple-300">
                  <div className={cn("w-8 h-8 mx-auto mb-2", action.color)}>
                    <Icon className="w-full h-full" />
                  </div>
                  <h4 className="font-medium text-sm">{action.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Status do Sistema
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">✅ Ativo</div>
            <div className="text-sm text-muted-foreground">Pipeline</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">3/3</div>
            <div className="text-sm text-muted-foreground">Workers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">97.3%</div>
            <div className="text-sm text-muted-foreground">Sucesso</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">42s</div>
            <div className="text-sm text-muted-foreground">Tempo Médio</div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">Comparação de Recursos</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Recurso</th>
                <th className="text-center p-3 font-medium">MVP</th>
                <th className="text-center p-3 font-medium">Studio</th>
                <th className="text-center p-3 font-medium">Advanced</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3">Upload PPTX</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅</td>
              </tr>
              <tr>
                <td className="p-3">TTS Brasileiro</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅ Premium</td>
              </tr>
              <tr>
                <td className="p-3">Avatares 3D</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅ Ultra-realistas</td>
              </tr>
              <tr>
                <td className="p-3">Fila de Render</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
                <td className="text-center p-3">✅ Avançada</td>
              </tr>
              <tr>
                <td className="p-3">Métricas & Analytics</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅ Básicas</td>
                <td className="text-center p-3">✅ Completas</td>
              </tr>
              <tr>
                <td className="p-3">Processamento em Lote</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
              </tr>
              <tr>
                <td className="p-3">Otimização GPU</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">❌</td>
                <td className="text-center p-3">✅</td>
              </tr>
              <tr>
                <td className="p-3">Resolução Máxima</td>
                <td className="text-center p-3">1080p</td>
                <td className="text-center p-3">1080p</td>
                <td className="text-center p-3">4K</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

