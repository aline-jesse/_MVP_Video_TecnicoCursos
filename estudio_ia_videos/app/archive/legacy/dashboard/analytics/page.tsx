
'use client'

/**
 * 📊 Analytics Dashboard
 * Sprint 29 - Production Analytics
 */

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  Database,
  TrendingUp,
  Clock,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import LayoutWithNavigation from '@/components/layout/layout-with-navigation'

interface CacheStats {
  redis: {
    enabled: boolean
    connected: boolean
    keys: number
    memory: string
    hitRate: number
    hits: number
    misses: number
    totalRequests: number
    uptime: number
    lastError: string | null
    health: {
      healthy: boolean
      latency: number
      error?: string
    }
  }
  tts: {
    size: number
    totalCost: number
    hitRate: number
    hitCount: number
    missCount: number
    totalRequests: number
  }
  combined: {
    totalHits: number
    totalMisses: number
    totalRequests: number
    overallHitRate: number
  }
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)

  /**
   * Load cache statistics
   */
  const loadStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cache/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data)
        setLastUpdate(new Date())
      } else {
        toast.error('Erro ao carregar estatísticas')
      }
    } catch (error) {
      console.error('Load stats error:', error)
      toast.error('Erro ao conectar ao servidor')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Auto-refresh
   */
  useEffect(() => {
    loadStats()

    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(loadStats, 10000) // Refresh every 10s
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  /**
   * Reset statistics
   */
  const handleReset = async () => {
    try {
      const response = await fetch('/api/cache/stats/reset', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Estatísticas resetadas!')
        loadStats()
      } else {
        toast.error('Erro ao resetar estatísticas')
      }
    } catch (error) {
      console.error('Reset error:', error)
      toast.error('Erro ao conectar ao servidor')
    }
  }

  /**
   * Format uptime
   */
  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  /**
   * Get health status badge
   */
  const getHealthBadge = (healthy: boolean) => {
    if (healthy) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Saudável
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Erro
      </Badge>
    )
  }

  return (
    <LayoutWithNavigation>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Monitoramento de cache e performance em tempo real
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh
            </Button>

            <Button variant="outline" onClick={loadStats} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <Button variant="destructive" onClick={handleReset}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Resetar Stats
            </Button>
          </div>
        </div>

        {/* Last Update */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Última atualização:</span>
              <span className="font-mono font-medium">
                {lastUpdate.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {isLoading && !stats ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Carregando estatísticas...</p>
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Requests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total de Requisições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {stats.combined.totalRequests.toLocaleString()}
                    </span>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Overall Hit Rate */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Taxa de Acerto Global
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-600">
                      {stats.combined.overallHitRate.toFixed(2)}%
                    </span>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Redis Keys */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Redis Keys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {stats.redis.keys.toLocaleString()}
                    </span>
                    <Database className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Memória: {stats.redis.memory}
                  </p>
                </CardContent>
              </Card>

              {/* TTS Cache Size */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    TTS Cache
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {stats.tts.size.toLocaleString()}
                    </span>
                    <Zap className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Áudios em cache
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Redis Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Redis Cache
                    </CardTitle>
                    <CardDescription>
                      Cache distribuído para TTS e renderização
                    </CardDescription>
                  </div>
                  {getHealthBadge(stats.redis.health.healthy)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold">
                      {stats.redis.connected ? '✅ Conectado' : '❌ Desconectado'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Latência</p>
                    <p className="text-lg font-semibold">
                      {stats.redis.health.latency}ms
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="text-lg font-semibold">
                      {formatUptime(stats.redis.uptime)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Taxa de Acerto</p>
                    <p className="text-lg font-semibold text-green-600">
                      {stats.redis.hitRate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Hits</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.redis.hits.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Misses</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.redis.misses.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">
                      {stats.redis.totalRequests.toLocaleString()}
                    </p>
                  </div>
                </div>

                {stats.redis.lastError && (
                  <>
                    <Separator />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Último erro:</strong> {stats.redis.lastError}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* TTS Cache Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  TTS Cache (In-Memory)
                </CardTitle>
                <CardDescription>
                  Cache em memória para Text-to-Speech
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tamanho</p>
                    <p className="text-lg font-semibold">
                      {stats.tts.size} áudios
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Custo Total</p>
                    <p className="text-lg font-semibold">
                      ${stats.tts.totalCost.toFixed(4)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Taxa de Acerto</p>
                    <p className="text-lg font-semibold text-green-600">
                      {stats.tts.hitRate.toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Requisições</p>
                    <p className="text-lg font-semibold">
                      {stats.tts.totalRequests.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Hits</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.tts.hitCount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Misses</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.tts.missCount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">
                      {stats.tts.totalRequests.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Combined Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas Combinadas
                </CardTitle>
                <CardDescription>
                  Visão geral de todos os sistemas de cache
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Hit Rate Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Taxa de Acerto Global</span>
                      <span className="text-sm font-bold text-green-600">
                        {stats.combined.overallHitRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.combined.overallHitRate}%` }}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Hits</p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.combined.totalHits.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Misses</p>
                      <p className="text-3xl font-bold text-red-600">
                        {stats.combined.totalMisses.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.combined.totalRequests.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600">Erro ao carregar estatísticas</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutWithNavigation>
  )
}
