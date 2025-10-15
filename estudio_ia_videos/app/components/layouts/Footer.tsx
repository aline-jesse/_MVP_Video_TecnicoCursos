
'use client'

/**
 * 🦶 FOOTER - Rodapé com Status e Links
 * Status do sistema, links úteis e informações
 */

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Heart,
  Zap,
  Globe,
  Shield,
  Activity,
  Database,
  Server,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  HelpCircle,
  FileText,
  Mail,
  Github,
  Twitter
} from 'lucide-react'

export default function Footer() {
  // Simular status do sistema (substituir por dados reais)
  const [systemStatus, setSystemStatus] = React.useState({
    api: 'operational',
    database: 'operational', 
    storage: 'operational',
    render: 'degraded',
    uptime: 99.9,
    activeUsers: 1247,
    totalProjects: 15832,
    lastUpdate: '2024-09-24T20:30:00Z'
  })

  const [isOnline, setIsOnline] = React.useState(true)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Função de formatação consistente para evitar erros de hidratação
  const formatNumber = (num: number) => {
    if (!isMounted) {
      // Durante SSR, usar formatação simples sem locale
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    // Após hidratação, usar locale brasileiro específico
    return num.toLocaleString('pt-BR')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-3 w-3 text-success" />
      case 'degraded': return <AlertCircle className="h-3 w-3 text-warning" />
      case 'down': return <AlertCircle className="h-3 w-3 text-danger" />
      default: return <Clock className="h-3 w-3 text-text-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-success'
      case 'degraded': return 'text-warning'
      case 'down': return 'text-danger'
      default: return 'text-text-muted'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operacional'
      case 'degraded': return 'Degradado'
      case 'down': return 'Fora do Ar'
      default: return 'Desconhecido'
    }
  }

  return (
    <footer className="mt-auto border-t border-border bg-surface/50 backdrop-blur-sm">
      {/* Status Bar */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          
          {/* System Status */}
          <div className="flex items-center gap-4 text-xs">
            <TooltipProvider>
              
              {/* Connection Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    {isOnline ? (
                      <Wifi className="h-3 w-3 text-success" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-danger" />
                    )}
                    <span className={isOnline ? 'text-success' : 'text-danger'}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Status da conexão com a internet
                </TooltipContent>
              </Tooltip>

              {/* API Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(systemStatus.api)}
                    <span className={getStatusColor(systemStatus.api)}>
                      API
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Status da API: {getStatusText(systemStatus.api)}
                </TooltipContent>
              </Tooltip>

              {/* Database Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(systemStatus.database)}
                    <Database className="h-3 w-3" />
                    <span className={getStatusColor(systemStatus.database)}>
                      DB
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Status do banco de dados: {getStatusText(systemStatus.database)}
                </TooltipContent>
              </Tooltip>

              {/* Storage Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(systemStatus.storage)}
                    <Server className="h-3 w-3" />
                    <span className={getStatusColor(systemStatus.storage)}>
                      Storage
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Status do armazenamento: {getStatusText(systemStatus.storage)}
                </TooltipContent>
              </Tooltip>

              {/* Render Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(systemStatus.render)}
                    <Zap className="h-3 w-3" />
                    <span className={getStatusColor(systemStatus.render)}>
                      Render
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Status do sistema de render: {getStatusText(systemStatus.render)}
                </TooltipContent>
              </Tooltip>

            </TooltipProvider>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            
            <TooltipProvider>
              
              {/* Uptime */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3" />
                    <span>{systemStatus.uptime}% uptime</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Tempo de atividade do sistema
                </TooltipContent>
              </Tooltip>

              {/* Active Users */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    <span>{formatNumber(systemStatus.activeUsers)} usuários</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Usuários ativos no sistema
                </TooltipContent>
              </Tooltip>

              {/* Total Projects */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    <span>{formatNumber(systemStatus.totalProjects)} projetos</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Total de projetos criados
                </TooltipContent>
              </Tooltip>

            </TooltipProvider>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              asChild
            >
              <Link href="/system-status">
                Status Completo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          
          {/* Left: Brand & Version */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">Estúdio IA de Vídeos</h3>
                <p className="text-xs text-text-muted">v2.1.0 - Build 2024.09.24</p>
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              <Heart className="h-3 w-3 mr-1 text-danger" />
              Feito com amor no Brasil
            </Badge>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6 text-xs">
            <Link 
              href="/help" 
              className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors"
            >
              <HelpCircle className="h-3 w-3" />
              Ajuda
            </Link>
            
            <Link 
              href="/docs" 
              className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors"
            >
              <FileText className="h-3 w-3" />
              Documentação
            </Link>
            
            <Link 
              href="/privacy" 
              className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors"
            >
              <Shield className="h-3 w-3" />
              Privacidade
            </Link>
            
            <Link 
              href="/terms" 
              className="text-text-muted hover:text-text transition-colors"
            >
              Termos de Uso
            </Link>
          </div>

          {/* Right: Social & Contact */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              asChild
            >
              <Link href="mailto:suporte@estudioiasqueletos.com">
                <Mail className="h-3 w-3" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              asChild
            >
              <Link href="https://github.com/estudio-ia" target="_blank">
                <Github className="h-3 w-3" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              asChild
            >
              <Link href="https://twitter.com/estudioiavideos" target="_blank">
                <Twitter className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="px-4 py-2 border-t border-border bg-bg-secondary/50">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div>
            © 2024 Estúdio IA de Vídeos. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            <span>pt-BR</span>
            <span>•</span>
            <span>Região: Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Hook para status do sistema
export function useSystemStatus() {
  const [status, setStatus] = React.useState<{
    api: string
    database: string
    storage: string
    render: string
    uptime: number
    lastCheck: Date | null
  }>({
    api: 'operational',
    database: 'operational',
    storage: 'operational',
    render: 'operational',
    uptime: 99.9,
    lastCheck: null // ✅ CORRIGIDO: Inicializa com null para evitar hydration error
  })
  
  const [mounted, setMounted] = React.useState(false)

  // ✅ CORRIGIDO: Atualiza apenas após mount no cliente
  React.useEffect(() => {
    setMounted(true)
    setStatus(prev => ({
      ...prev,
      lastCheck: new Date()
    }))
  }, [])

  // Simular verificação periódica
  React.useEffect(() => {
    if (!mounted) return
    
    const interval = setInterval(() => {
      // Aqui você faria uma chamada real para verificar o status
      setStatus(prev => ({
        ...prev,
        lastCheck: new Date()
      }))
    }, 30000) // Check a cada 30 segundos

    return () => clearInterval(interval)
  }, [mounted])

  return status
}

// Componente de status minimalista para usar em outros lugares
export function SystemStatusIndicator() {
  const { api, database, storage } = useSystemStatus()
  
  const hasIssues = [api, database, storage].some(s => s !== 'operational')
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "w-2 h-2 rounded-full",
        hasIssues ? "bg-warning animate-pulse" : "bg-success"
      )} />
      <span className="text-xs text-text-muted">
        {hasIssues ? 'Problemas detectados' : 'Todos os sistemas operacionais'}
      </span>
    </div>
  )
}
