
/**
 * 🧭 Main Navigation - Atualizada com Editor Animaker
 * Adicionando o novo editor ao menu principal
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home,
  Upload,
  Edit3,
  Video,
  Users,
  Settings,
  HelpCircle,
  Sparkles,
  FileText
} from 'lucide-react'

interface MainNavProps {
  className?: string
}

export function MainNav({ className = '' }: MainNavProps) {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: '/dashboard-home',
      label: 'Dashboard',
      icon: Home,
      description: 'Página inicial'
    },
    {
      href: '/editor-animaker',
      label: 'Editor Animaker',
      icon: Edit3,
      description: 'Editor visual profissional',
      badge: 'NOVO',
      badgeColor: 'bg-green-100 text-green-700'
    },
    {
      href: '/pptx-upload',
      label: 'Upload PPTX',
      icon: Upload,
      description: 'Importar apresentações'
    },
    {
      href: '/video-studio',
      label: 'Vídeo Studio',
      icon: Video,
      description: 'Criar vídeos'
    },
    {
      href: '/avatar-studio',
      label: 'Avatares',
      icon: Users,
      description: 'Gerenciar avatares'
    },
    {
      href: '/help',
      label: 'Ajuda',
      icon: HelpCircle,
      description: 'Central de ajuda'
    }
  ]

  return (
    <nav className={`space-y-2 ${className}`}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-2 py-0 ${item.badgeColor || 'bg-blue-100 text-blue-700'}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {item.description}
              </p>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
