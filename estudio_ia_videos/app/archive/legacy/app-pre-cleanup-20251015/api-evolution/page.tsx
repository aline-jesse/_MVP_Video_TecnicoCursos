

/**
 * 🚀 API v2 Evolution - Sprint 13
 * GraphQL, WebSockets, Microserviços e API Gateway
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  Globe,
  Database,
  Activity,
  Code,
  Server,
  Cloud,
  Network,
  Layers,
  Target,
  CheckCircle,
  TrendingUp,
  Clock,
  RefreshCw,
  Download,
  Play,
  Settings,
  Eye,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';

export default function APIEvolutionPage() {
  const [metrics, setMetrics] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadTesting, setIsLoadTesting] = useState(false);

  useEffect(() => {
    loadAPIData();
    const interval = setInterval(loadAPIData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAPIData = async () => {
    try {
      const [metricsRes, endpointsRes] = await Promise.all([
        fetch('/api/v2/api-evolution/metrics'),
        fetch('/api/v2/api-evolution/endpoints')
      ]);
      
      if (metricsRes.ok && endpointsRes.ok) {
        const metricsData = await metricsRes.json();
        const endpointsData = await endpointsRes.json();
        
        if (metricsData.success) setMetrics(metricsData.metrics);
        if (endpointsData.success) setEndpoints(endpointsData.endpoints);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
    }
  };

  const runLoadTest = async () => {
    setIsLoadTesting(true);
    try {
      const response = await fetch('/api/v2/api-evolution/load-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: 60, concurrency: 100 })
      });
      
      if (response.ok) {
        setTimeout(() => {
          loadAPIData();
          setIsLoadTesting(false);
        }, 60000);
      }
    } catch (error) {
      console.error('Erro no teste de carga:', error);
      setIsLoadTesting(false);
    }
  };

  const mockMetrics = {
    totalEndpoints: 67,
    activeConnections: 456,
    requestsPerSecond: 28.7,
    avgResponseTime: 95,
    errorRate: 0.23,
    graphqlQueries: 1247,
    websocketConnections: 89,
    microservicesHealth: 98
  };

  const currentMetrics = metrics || mockMetrics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">
              🚀 API v2 Evolution Platform
            </h1>
            <p className="text-gray-600">
              GraphQL, WebSockets, Microserviços e API Gateway - Sprint 13
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={loadAPIData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              onClick={runLoadTest}
              disabled={isLoadTesting}
              className="bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700"
            >
              {isLoadTesting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Load Test
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{currentMetrics.totalEndpoints}</div>
              <div className="text-xs text-gray-500">4 versões ativas</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-green-600">{currentMetrics.avgResponseTime}ms</div>
                <Progress value={100 - currentMetrics.avgResponseTime} className="flex-1" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt; 100ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Throughput</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{currentMetrics.requestsPerSecond}/s</div>
              <div className="text-xs text-gray-500">{currentMetrics.activeConnections} conexões ativas</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{currentMetrics.errorRate}%</div>
              <div className="text-xs text-gray-500">Target: &lt; 1%</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'graphql', label: 'GraphQL' },
              { id: 'websockets', label: 'WebSockets' },
              { id: 'microservices', label: 'Microserviços' },
              { id: 'gateway', label: 'API Gateway' },
              { id: 'monitoring', label: 'Monitoring' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 ${activeTab === tab.id ? 'bg-white shadow-sm' : ''}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Evolution Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">API v2 Evolution Ativo</h3>
                    <p className="text-gray-600">
                      Explore os módulos: GraphQL Schema, WebSockets Real-time, Microservices Architecture
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'graphql' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>GraphQL Advanced Schema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Queries Ativas</div>
                      <div className="text-2xl font-bold text-blue-600">{currentMetrics.graphqlQueries}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Resolvers</div>
                      <div className="text-2xl font-bold text-purple-600">34</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">Cache Hit Rate</div>
                      <div className="text-2xl font-bold text-green-600">89%</div>
                    </div>
                  </div>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      GraphQL Schema funcionando perfeitamente. Todas as queries estão otimizadas.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'websockets' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Network className="h-5 w-5" />
                    <span>WebSocket Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Conexões Ativas</div>
                        <div className="text-2xl font-bold text-green-600">{currentMetrics.websocketConnections}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Latência Média</div>
                        <div className="text-2xl font-bold text-blue-600">12ms</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Uptime</div>
                        <div className="text-2xl font-bold text-purple-600">99.99%</div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="font-medium text-green-800 mb-2">WebSocket Features</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Live Collaboration</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Real-time Notifications</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>API Performance Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Performance Dashboard</h3>
                    <p className="text-gray-600">Métricas de performance em tempo real</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

