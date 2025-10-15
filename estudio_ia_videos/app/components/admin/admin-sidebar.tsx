
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Video,
  BarChart3,
  Settings,
  DollarSign,
  TrendingUp,
  FileText,
  Gauge,
  FileSpreadsheet,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/admin/metrics',
    icon: <BarChart3 className="h-5 w-5" />,
    children: [
      {
        title: 'Geral',
        href: '/admin/metrics',
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        title: 'PPTX',
        href: '/admin/pptx-metrics',
        icon: <FileSpreadsheet className="h-4 w-4" />,
      },
      {
        title: 'Render',
        href: '/admin/render-metrics',
        icon: <Gauge className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Monitoramento',
    href: '/admin/production-monitor',
    icon: <Gauge className="h-5 w-5" />,
  },
  {
    title: 'Configurações',
    href: '/admin/configuracoes',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: 'Custos',
    href: '/admin/costs',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    title: 'Crescimento',
    href: '/admin/growth',
    icon: <TrendingUp className="h-5 w-5" />,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-card min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-bold">🎛️ Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Painel de Administração</p>
      </div>

      <nav className="space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>

              {/* Children/Submenu */}
              {hasChildren && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const isChildActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors',
                          isChildActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {child.icon}
                        <span>{child.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
