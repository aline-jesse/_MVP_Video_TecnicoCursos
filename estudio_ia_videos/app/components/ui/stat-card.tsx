
'use client'

/**
 * 📊 STAT CARD - Card de Estatísticas/KPIs
 * Componente padronizado para exibir métricas e indicadores
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Info
} from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label?: string
    period?: string
    direction?: 'up' | 'down' | 'stable'
    isPositive?: boolean
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    color?: string
  }
  loading?: boolean
  className?: string
  onClick?: () => void
  variant?: 'default' | 'compact' | 'detailed' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'accent'
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  loading = false,
  className,
  onClick,
  variant = 'default',
  size = 'md',
  color = 'default',
  ...props
}: StatCardProps) {
  
  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  const sizeStyles = {
    sm: {
      card: "p-4",
      title: "text-xs",
      value: "text-lg",
      icon: "h-4 w-4"
    },
    md: {
      card: "p-5",
      title: "text-sm",
      value: "text-2xl",
      icon: "h-5 w-5"
    },
    lg: {
      card: "p-6",
      title: "text-base",
      value: "text-3xl",
      icon: "h-6 w-6"
    }
  }

  const colorStyles = {
    default: {
      card: "",
      icon: "text-text-secondary",
      accent: "text-text-muted"
    },
    primary: {
      card: "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
      icon: "text-primary",
      accent: "text-primary"
    },
    success: {
      card: "border-success/20 bg-gradient-to-br from-success/5 to-transparent",
      icon: "text-success",
      accent: "text-success"
    },
    warning: {
      card: "border-warning/20 bg-gradient-to-br from-warning/5 to-transparent",
      icon: "text-warning",
      accent: "text-warning"
    },
    danger: {
      card: "border-danger/20 bg-gradient-to-br from-danger/5 to-transparent",
      icon: "text-danger",
      accent: "text-danger"
    },
    accent: {
      card: "border-accent/20 bg-gradient-to-br from-accent/5 to-transparent",
      icon: "text-accent",
      accent: "text-accent"
    }
  }

  const styles = sizeStyles[size]
  const colors = colorStyles[color]

  const getTrendIcon = () => {
    if (!trend) return null
    
    const direction = trend.direction || (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'stable')
    const IconComponent = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus
    
    let colorClass = 'text-text-muted'
    if (trend.isPositive !== undefined) {
      colorClass = trend.isPositive ? 'text-success' : 'text-danger'
    } else if (direction === 'up') {
      colorClass = 'text-success'
    } else if (direction === 'down') {
      colorClass = 'text-danger'
    }

    return (
      <IconComponent className={cn("h-3 w-3", colorClass)} />
    )
  }

  const formatTrendValue = (value: number) => {
    const absValue = Math.abs(value)
    const sign = value > 0 ? '+' : ''
    return `${sign}${absValue}%`
  }

  const renderCompact = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn(
            "flex items-center justify-center rounded-lg p-2",
            color !== 'default' ? `bg-${color}/10` : "bg-bg-secondary"
          )}>
            <Icon className={cn(styles.icon, colors.icon)} />
          </div>
        )}
        <div>
          <p className={cn("font-semibold", styles.value)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className={cn("text-text-muted font-medium", styles.title)}>
            {title}
          </p>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className="text-xs font-medium">
            {formatTrendValue(trend.value)}
          </span>
        </div>
      )}
    </div>
  )

  const renderMinimal = () => (
    <div className="text-center">
      <p className={cn("font-bold text-text", styles.value)}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className={cn("text-text-muted", styles.title)}>
        {title}
      </p>
    </div>
  )

  const renderDefault = () => (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-semibold text-text tracking-tight",
            styles.title
          )}>
            {title}
          </h3>
          {badge && (
            <Badge 
              variant={badge.variant || "secondary"}
              className="text-xs"
              style={badge.color ? { backgroundColor: badge.color } : undefined}
            >
              {badge.text}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className={cn(styles.icon, colors.icon)} />
          )}
          {onClick && (
            <button className="text-text-muted hover:text-text transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Value */}
      <div>
        <p className={cn(
          "font-bold text-text tracking-tight",
          styles.value
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        
        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive !== undefined 
                  ? (trend.isPositive ? 'text-success' : 'text-danger')
                  : 'text-text-secondary'
              )}>
                {formatTrendValue(trend.value)}
              </span>
            </div>
            {trend.label && (
              <span className="text-xs text-text-muted">
                {trend.label}
                {trend.period && ` (${trend.period})`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-text-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )

  const renderContent = () => {
    switch (variant) {
      case 'compact': return renderCompact()
      case 'minimal': return renderMinimal()
      case 'detailed': return renderDefault()
      default: return renderDefault()
    }
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 cursor-default",
        colors.card,
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className={styles.card}>
        {renderContent()}
      </div>
      
      {/* Accent Line */}
      {color !== 'default' && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          `bg-gradient-to-r from-${color} to-${color}/50`
        )} />
      )}
    </Card>
  )
}

// Grid de StatCards
interface StatCardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 6
  className?: string
}

export function StatCardGrid({ 
  children, 
  columns = 4, 
  className 
}: StatCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  }

  return (
    <div className={cn(
      "grid gap-4",
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  )
}

// Componente para loading state de múltiplos cards
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <StatCardGrid columns={count as 1 | 2 | 3 | 4 | 6}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCard
          key={i}
          title=""
          value=""
          loading={true}
        />
      ))}
    </StatCardGrid>
  )
}

// Componente para exibir múltiplas estatísticas
interface StatsOverviewProps {
  stats: Omit<StatCardProps, 'loading'>[]
  loading?: boolean
  columns?: 1 | 2 | 3 | 4 | 6
  className?: string
}

export function StatsOverview({ 
  stats, 
  loading = false, 
  columns = 4,
  className 
}: StatsOverviewProps) {
  if (loading) {
    return <StatCardsSkeleton count={stats.length} />
  }

  return (
    <StatCardGrid columns={columns} className={className}>
      {stats.map((stat, index) => (
        <StatCard key={stat.title || index} {...stat} />
      ))}
    </StatCardGrid>
  )
}
