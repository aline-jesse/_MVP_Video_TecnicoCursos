
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  projetos: 'Projetos',
  templates: 'Templates',
  analytics: 'Analytics',
  collaboration: 'Colaboração',
  settings: 'Configurações',
  editor: 'Editor',
  admin: 'Administração',
  users: 'Usuários',
  uploads: 'Uploads',
  pptx: 'PPTX'
}

export function AppBreadcrumbs() {
  const pathname = usePathname()
  
  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Início', href: '/dashboard' }
  ]

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    
    breadcrumbs.push({
      label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath
    })
  })

  if (breadcrumbs.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {index === 0 && <Home className="w-4 h-4 mr-1 inline" />}
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
