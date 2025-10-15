
'use client'

/**
 * 🧭 SIDEBAR - Navegação Hierárquica Principal
 * Organiza todas as funcionalidades do app em uma estrutura consistente
 */

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { navigationUnified, getStatusConfig } from './navigation-unified'
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Zap
} from 'lucide-react'

// Importar interface NavItem da navegação unificada
interface NavItem {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string | number
  status?: 'production' | 'active' | 'beta' | 'lab'
  children?: NavItem[]
  description?: string
}

interface SidebarProps {
  collapsed: boolean
  onCollapse: () => void
  mobile?: boolean
}

// Usar navegação unificada importada
const navigation = navigationUnified

export default function Sidebar({ collapsed, onCollapse, mobile = false }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['studio']))

  // Auto-expandir baseado na rota atual
  React.useEffect(() => {
    const findParentIds = (items: NavItem[], targetPath: string, parents: string[] = []): string[] => {
      for (const item of items) {
        const currentPath = [...parents, item.id]
        
        if (item.href === targetPath) {
          return currentPath
        }
        
        if (item.children) {
          const found = findParentIds(item.children, targetPath, currentPath)
          if (found.length > 0) return found
        }
      }
      return []
    }

    const parentIds = findParentIds(navigation, pathname || '/')
    if (parentIds.length > 0) {
      setExpandedItems(new Set([...expandedItems, ...parentIds]))
    }
  }, [pathname])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getStatusColor = (status?: string) => {
    const config = getStatusConfig(status)
    return config.color
  }

  const getStatusText = (status?: string) => {
    const config = getStatusConfig(status)
    return config.text
  }

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const isActive = item.href === pathname
    const hasChildren = item.children && item.children.length > 0
    
    const itemContent = (
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <item.icon className={cn(
          "flex-shrink-0",
          level === 0 ? "h-5 w-5" : "h-4 w-4",
          isActive ? "text-primary" : "text-text-secondary"
        )} />
        
        {!collapsed && (
          <>
            <span className={cn(
              "flex-1 truncate text-sm",
              level === 0 ? "font-medium" : "font-normal",
              isActive ? "text-primary font-medium" : "text-text"
            )}>
              {item.title}
            </span>
            
            {/* Status Badge */}
            {item.status && (
              <div className={cn(
                "w-5 h-5 rounded-full border text-xs flex items-center justify-center font-medium",
                getStatusColor(item.status)
              )}>
                {getStatusText(item.status)}
              </div>
            )}
            
            {/* Expand Icon */}
            {hasChildren && (
              <div
                className="h-4 w-4 p-0 text-text-secondary hover:text-text cursor-pointer flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleExpanded(item.id)
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    )

    const navItemElement = (
      <div className="relative">
        {item.href ? (
          <Link 
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200",
              "hover:bg-bg-hover active:bg-bg-active",
              isActive && "bg-primary/10 text-primary shadow-sm border-l-2 border-primary",
              level > 0 && "ml-6"
            )}
          >
            {itemContent}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200",
              "hover:bg-bg-hover active:bg-bg-active text-left",
              level > 0 && "ml-6"
            )}
          >
            {itemContent}
          </button>
        )}
        
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l" />
        )}
      </div>
    )

    // Tooltip para sidebar colapsado
    if (collapsed && level === 0) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {navItemElement}
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <div className="space-y-1">
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-text-muted">{item.description}</p>
                )}
                {item.status && (
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
        {navItemElement}
        
        {hasChildren && !collapsed && (
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child: NavItem) => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        )}
      </Collapsible>
    )
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-border",
        collapsed && "justify-center"
      )}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <h2 className="font-semibold text-sm text-text">Navegação</h2>
            </div>
            
            {!mobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCollapse}
                className="h-6 w-6 p-0"
                aria-label="Recolher sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-6 w-6 p-0"
            aria-label="Expandir sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navigation.map(item => renderNavItem(item))}
        </nav>
        
        {/* Status Summary */}
        {!collapsed && (
          <div className="mt-6 p-3 rounded-lg bg-bg-secondary">
            <h3 className="text-xs font-medium text-text-secondary mb-2">Sistema Unificado</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Produção</span>
                </div>
                <span className="font-medium text-green-600">99%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Sprint 24</span>
                </div>
                <span className="font-medium text-blue-600">NEW</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Labs</span>
                </div>
                <span className="font-medium text-purple-600">1%</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">Sprint 24 Completo</span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Hook para acessar estado da sidebar
export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return {
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    toggle: () => setCollapsed(!collapsed),
    open: () => setMobileOpen(true),
    close: () => setMobileOpen(false)
  }
}
