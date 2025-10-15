

/**
 * Sprint 7 - Página de Otimização e Cache
 * Dashboard completo para monitoramento de performance
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { CacheMonitor } from '../../components/optimization/cache-monitor'
import { 
  Database, 
  Zap, 
  BarChart3, 
  Settings, 
  TrendingUp,
  Shield,
  Clock,
  HardDrive,
  Activity
} from 'lucide-react'

export default function OptimizationPage() {
  const [activeTab, setActiveTab] = useState('cache')

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Centro de Otimização</h1>
        </div>
        <p className="text-gray-600">
          Monitor de performance, cache inteligente e otimizações do sistema
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-green-600">87.3%</p>
              </div>
              <Database className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tempo Médio</p>
                <p className="text-2xl font-bold text-blue-600">1.2s</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Memória Usada</p>
                <p className="text-2xl font-bold text-purple-600">1.1GB</p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Otimização</p>
                <p className="text-2xl font-bold text-orange-600">94%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cache">
            <Database className="w-4 h-4 mr-2" />
            Cache Monitor
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Zap className="w-4 h-4 mr-2" />
            Otimizações
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Cache Monitor Tab */}
        <TabsContent value="cache">
          <CacheMonitor />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance em Tempo Real</CardTitle>
                <CardDescription>
                  Monitoramento contínuo de todas as operações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* PPTX Processing Performance */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Processamento PPTX
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tempo médio</span>
                        <Badge variant="secondary">1.245s</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Melhor tempo</span>
                        <Badge variant="outline" className="text-green-600">890ms</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Operações/hora</span>
                        <Badge variant="default">243</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Template Application Performance */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      Aplicação de Templates
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tempo médio</span>
                        <Badge variant="secondary">567ms</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Cache hit rate</span>
                        <Badge variant="outline" className="text-green-600">94%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Templates/min</span>
                        <Badge variant="default">156</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Narration Performance */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-600" />
                      Geração de Narração
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tempo médio</span>
                        <Badge variant="secondary">2.89s</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Qualidade TTS</span>
                        <Badge variant="outline" className="text-green-600">96%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Áudios/hora</span>
                        <Badge variant="default">43</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Performance (Últimas 24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold text-green-600">Melhorando</div>
                      <div className="text-sm text-gray-500">Processamento PPTX</div>
                    </div>
                    <div className="text-center">
                      <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold text-blue-600">Estável</div>
                      <div className="text-sm text-gray-500">Templates</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold text-green-600">Melhorando</div>
                      <div className="text-sm text-gray-500">Narração</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Otimizações Automáticas</CardTitle>
                <CardDescription>
                  Configure e execute otimizações inteligentes do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Auto Optimizations */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Otimizações Automáticas</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">Cache Inteligente</div>
                          <div className="text-xs text-gray-500">LRU + prioridade dinâmica</div>
                        </div>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">Processamento em Lote</div>
                          <div className="text-xs text-gray-500">Agrupamento de tarefas similares</div>
                        </div>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">Preview Preditivo</div>
                          <div className="text-xs text-gray-500">Pré-carregamento inteligente</div>
                        </div>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Manual Optimizations */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Otimizações Manuais</h4>
                    
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        Otimizar Todos os Caches
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <Zap className="w-4 h-4 mr-2" />
                        Reorganizar Prioridades
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Análise de Performance
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Verificação de Integridade
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Otimização</CardTitle>
              <CardDescription>
                Configure os parâmetros de cache e performance do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cache Settings */}
                <div>
                  <h4 className="font-medium mb-4">Configurações de Cache</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Tamanho máximo do cache PPTX</label>
                        <p className="text-xs text-gray-500 mb-2">Recomendado: 200MB</p>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="50" 
                            max="500" 
                            defaultValue="200"
                            className="flex-1"
                          />
                          <span className="text-sm">200MB</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">TTL padrão</label>
                        <p className="text-xs text-gray-500 mb-2">Tempo de vida dos itens no cache</p>
                        <select className="w-full p-2 border rounded">
                          <option value="1">1 hora</option>
                          <option value="4" selected>4 horas</option>
                          <option value="12">12 horas</option>
                          <option value="24">24 horas</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Estratégia de evicção</label>
                        <p className="text-xs text-gray-500 mb-2">Como remover itens quando cache lotado</p>
                        <select className="w-full p-2 border rounded">
                          <option value="lru">LRU (Menos usado recentemente)</option>
                          <option value="intelligent" selected>Inteligente (LRU + prioridade)</option>
                          <option value="fifo">FIFO (Primeiro a entrar, primeiro a sair)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Auto-limpeza</label>
                        <p className="text-xs text-gray-500 mb-2">Limpeza automática de itens expirados</p>
                        <select className="w-full p-2 border rounded">
                          <option value="5">A cada 5 minutos</option>
                          <option value="10" selected>A cada 10 minutos</option>
                          <option value="30">A cada 30 minutos</option>
                          <option value="60">A cada 1 hora</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Settings */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Configurações de Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Tamanho do lote de processamento</label>
                        <p className="text-xs text-gray-500 mb-2">Quantos slides processar simultaneamente</p>
                        <select className="w-full p-2 border rounded">
                          <option value="3">3 slides</option>
                          <option value="5" selected>5 slides</option>
                          <option value="10">10 slides</option>
                          <option value="20">20 slides</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Prioridade de processamento</label>
                        <p className="text-xs text-gray-500 mb-2">Como priorizar trabalhos na fila</p>
                        <select className="w-full p-2 border rounded">
                          <option value="fifo">Por ordem de chegada</option>
                          <option value="user_tier" selected>Por nível do usuário</option>
                          <option value="complexity">Por complexidade</option>
                          <option value="smart">Inteligente (múltiplos fatores)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Qualidade do preview</label>
                        <p className="text-xs text-gray-500 mb-2">Qualidade padrão para previews</p>
                        <select className="w-full p-2 border rounded">
                          <option value="low">Baixa (mais rápido)</option>
                          <option value="medium" selected>Média (balanceado)</option>
                          <option value="high">Alta (melhor qualidade)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Pré-carregamento</label>
                        <p className="text-xs text-gray-500 mb-2">Quantos previews gerar antecipadamente</p>
                        <select className="w-full p-2 border rounded">
                          <option value="1">1 slide</option>
                          <option value="3" selected>3 slides</option>
                          <option value="5">5 slides</option>
                          <option value="all">Todos os slides</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Save Settings */}
                <div className="flex justify-end pt-6 border-t">
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Actions Tab */}
        <TabsContent value="optimization">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações de Otimização</CardTitle>
                <CardDescription>
                  Execute otimizações manuais para melhorar performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                    <Database className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Otimizar Caches</div>
                      <div className="text-xs text-gray-500">Reorganizar e otimizar todos os caches</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    <div className="text-left">
                      <div className="font-medium">Análise Completa</div>
                      <div className="text-xs text-gray-500">Análise profunda de performance</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Pré-carregar Comuns</div>
                      <div className="text-xs text-gray-500">Carregar templates populares</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                    <Activity className="w-6 h-6 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Balancear Recursos</div>
                      <div className="text-xs text-gray-500">Redistribuir memória entre caches</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                    <Shield className="w-6 h-6 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">Verificar Integridade</div>
                      <div className="text-xs text-gray-500">Validar consistência dos dados</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium">Relatório Detalhado</div>
                      <div className="text-xs text-gray-500">Gerar relatório de otimização</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
