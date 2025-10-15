
'use client'

/**
 * 🍞 BREADCRUMBS - Navegação Semântica
 * Breadcrumbs inteligentes baseados na rota atual
 */

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  ChevronRight, 
  Home,
  Video,
  Upload,
  Edit3,
  Users,
  Mic,
  BarChart3,
  Settings,
  Building,
  Shield,
  Smartphone,
  Brain,
  Crown,
  Zap
} from 'lucide-react'

interface BreadcrumbItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

// Mapeamento de rotas para breadcrumbs
const routeMap: Record<string, BreadcrumbItem[]> = {
  '/': [
    { title: 'Dashboard', href: '/', icon: Home }
  ],
  
  // PPTX & Upload
  '/pptx-upload': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Upload PPTX', href: '/pptx-upload', icon: Upload }
  ],
  '/pptx-upload-real': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Upload Real', href: '/pptx-upload-real', icon: Zap }
  ],
  '/pptx-upload-production': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Upload Produção', href: '/pptx-upload-production', icon: Crown }
  ],
  
  // Editores
  '/pptx-editor': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Editor PPTX', href: '/pptx-editor', icon: Edit3 }
  ],
  '/pptx-editor-real': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Editor Real', href: '/pptx-editor-real', icon: Edit3 }
  ],
  '/canvas-editor-demo': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Canvas Editor', href: '/canvas-editor-demo', icon: Edit3 }
  ],
  '/editor-timeline-pro': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Timeline Pro', href: '/editor-timeline-pro', icon: Edit3 }
  ],
  
  // Avatares
  '/talking-photo': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Talking Photo', href: '/talking-photo', icon: Users }
  ],
  '/talking-photo-pro': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Talking Photo Pro', href: '/talking-photo-pro', icon: Crown }
  ],
  '/avatares-3d': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Avatares 3D', href: '/avatares-3d', icon: Users }
  ],
  '/avatar-studio-hyperreal': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Hyperreal Studio', href: '/avatar-studio-hyperreal', icon: Crown }
  ],
  
  // TTS & Voice
  '/tts-test': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Teste TTS', href: '/tts-test', icon: Mic }
  ],
  '/voice-cloning': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Estúdio', href: '#', icon: Video },
    { title: 'Clonagem de Voz', href: '/voice-cloning', icon: Brain }
  ],
  
  // Admin & Analytics
  '/admin/metrics': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Analytics', href: '#', icon: BarChart3 },
    { title: 'Métricas Admin', href: '/admin/metrics', icon: Settings }
  ],
  '/admin/pptx-metrics': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Analytics', href: '#', icon: BarChart3 },
    { title: 'Métricas PPTX', href: '/admin/pptx-metrics', icon: Video }
  ],
  '/admin/render-metrics': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Analytics', href: '#', icon: BarChart3 },
    { title: 'Métricas Render', href: '/admin/render-metrics', icon: Zap }
  ],
  '/admin/production-dashboard': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Analytics', href: '#', icon: BarChart3 },
    { title: 'Dashboard Produção', href: '/admin/production-dashboard', icon: Crown }
  ],
  '/admin/production-monitor': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Analytics', href: '#', icon: BarChart3 },
    { title: 'Monitor Produção', href: '/admin/production-monitor', icon: Crown }
  ],
  '/admin/configuracoes': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Configurações', href: '/admin/configuracoes', icon: Settings }
  ],
  
  // Performance
  '/performance/monitor': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Analytics', href: '#', icon: BarChart3 },
    { title: 'Monitor Performance', href: '/performance/monitor', icon: BarChart3 }
  ],
  
  // Enterprise
  '/enterprise': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Enterprise', href: '/enterprise', icon: Building }
  ],
  '/enterprise/analytics': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Enterprise', href: '/enterprise', icon: Building },
    { title: 'Analytics', href: '/enterprise/analytics', icon: BarChart3 }
  ],
  '/security-dashboard': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Enterprise', href: '#', icon: Building },
    { title: 'Segurança', href: '/security-dashboard', icon: Shield }
  ],
  
  // Mobile
  '/mobile-studio': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'Mobile & Cloud', href: '#', icon: Smartphone },
    { title: 'Mobile Studio', href: '/mobile-studio', icon: Smartphone }
  ],
  
  // IA & Automação
  '/ai-assistant': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'IA & Automação', href: '#', icon: Brain },
    { title: 'Assistente IA', href: '/ai-assistant', icon: Brain }
  ],
  '/automation': [
    { title: 'Dashboard', href: '/', icon: Home },
    { title: 'IA & Automação', href: '#', icon: Brain },
    { title: 'Automação', href: '/automation', icon: Zap }
  ]
}

// Gerar breadcrumbs dinamicamente se não estiver no mapa
function generateDynamicBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/', icon: Home }
  ]
  
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    
    // Formatear título do segmento
    const title = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    breadcrumbs.push({
      title,
      href: isLast ? currentPath : '#'
    })
  })
  
  return breadcrumbs
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  // Obter breadcrumbs da rota atual
  const breadcrumbs = routeMap[pathname || '/'] || generateDynamicBreadcrumbs(pathname || '/')
  
  // Se só tiver o dashboard, não mostrar breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-text-muted" aria-label="Breadcrumb">
      {breadcrumbs.map((item: any, index: number) => {
        const isLast = index === breadcrumbs.length - 1
        const Icon = item.icon
        
        return (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-text-muted flex-shrink-0" />
            )}
            
            <div className="flex items-center gap-1.5">
              {Icon && (
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isLast ? "text-primary" : "text-text-muted"
                )} />
              )}
              
              {isLast ? (
                <span 
                  className="font-medium text-text truncate"
                  aria-current="page"
                >
                  {item.title}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-text transition-colors truncate"
                >
                  {item.title}
                </Link>
              )}
            </div>
          </React.Fragment>
        )
      })}
    </nav>
  )
}

// Hook para obter breadcrumbs programaticamente
export function useBreadcrumbs() {
  const pathname = usePathname()
  return routeMap[pathname || '/'] || generateDynamicBreadcrumbs(pathname || '/')
}

// Componente para breadcrumbs customizados
interface CustomBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function CustomBreadcrumbs({ items, className }: CustomBreadcrumbsProps) {
  return (
    <nav 
      className={cn("flex items-center space-x-1 text-sm text-text-muted", className)} 
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const Icon = item.icon
        
        return (
          <React.Fragment key={`${item.href}-${index}`}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-text-muted flex-shrink-0" />
            )}
            
            <div className="flex items-center gap-1.5">
              {Icon && (
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isLast ? "text-primary" : "text-text-muted"
                )} />
              )}
              
              {isLast ? (
                <span 
                  className="font-medium text-text truncate"
                  aria-current="page"
                >
                  {item.title}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-text transition-colors truncate"
                >
                  {item.title}
                </Link>
              )}
            </div>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
