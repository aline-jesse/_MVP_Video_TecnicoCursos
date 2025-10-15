
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, FileEdit, Eye, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Stat {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface StatsCardsProps {
  loading?: boolean
  stats?: {
    totalVideos: number
    drafts: number
    totalViews: number
    avgQuality: number
  }
}

export function StatsCards({ loading, stats }: StatsCardsProps) {
  const defaultStats = stats || {
    totalVideos: 0,
    drafts: 0,
    totalViews: 0,
    avgQuality: 0,
  }

  const statsData: Stat[] = [
    {
      title: 'Vídeos',
      value: defaultStats.totalVideos,
      description: 'Total de vídeos criados',
      icon: <Video className="h-5 w-5 text-blue-600" />,
    },
    {
      title: 'Rascunhos',
      value: defaultStats.drafts,
      description: 'Em desenvolvimento',
      icon: <FileEdit className="h-5 w-5 text-amber-600" />,
    },
    {
      title: 'Visualizações',
      value: defaultStats.totalViews.toLocaleString('pt-BR'),
      description: 'Total de visualizações',
      icon: <Eye className="h-5 w-5 text-green-600" />,
    },
    {
      title: 'Qualidade',
      value: `${defaultStats.avgQuality}%`,
      description: 'Média de qualidade',
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
