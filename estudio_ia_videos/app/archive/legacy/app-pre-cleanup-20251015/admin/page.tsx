
/**
 * 🎛️ Admin Overview Page - Página principal do painel administrativo
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LayoutDashboard, Users, Video, TrendingUp, DollarSign, Settings, BarChart3, Gauge } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Admin - Estúdio IA de Vídeos',
  description: 'Painel administrativo central'
}

const ADMIN_SECTIONS = [
  {
    title: 'Analytics',
    description: 'Métricas gerais do sistema',
    icon: BarChart3,
    href: '/admin/metrics',
    color: 'text-blue-600',
  },
  {
    title: 'Métricas PPTX',
    description: 'Análise de uploads PPTX',
    icon: BarChart3,
    href: '/admin/pptx-metrics',
    color: 'text-purple-600',
  },
  {
    title: 'Métricas Render',
    description: 'Performance de renderização',
    icon: Gauge,
    href: '/admin/render-metrics',
    color: 'text-green-600',
  },
  {
    title: 'Monitor Produção',
    description: 'Status do sistema em tempo real',
    icon: Gauge,
    href: '/admin/production-monitor',
    color: 'text-orange-600',
  },
  {
    title: 'Custos',
    description: 'Gestão de custos e billing',
    icon: DollarSign,
    href: '/admin/costs',
    color: 'text-emerald-600',
  },
  {
    title: 'Crescimento',
    description: 'Métricas de crescimento',
    icon: TrendingUp,
    href: '/admin/growth',
    color: 'text-indigo-600',
  },
  {
    title: 'Configurações',
    description: 'Configurações do sistema',
    icon: Settings,
    href: '/admin/configuracoes',
    color: 'text-gray-600',
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          Gestão centralizada do Estúdio IA de Vídeos
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">Todos os serviços operacionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total de usuários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vídeos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total de vídeos criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">--</div>
            <p className="text-xs text-muted-foreground">Tendência mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Sections Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Seções Administrativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADMIN_SECTIONS.map((section) => (
            <Card key={section.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={section.href}>
                    Acessar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
