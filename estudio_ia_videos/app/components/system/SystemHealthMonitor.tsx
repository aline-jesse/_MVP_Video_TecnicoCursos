'use client';

/**
 * 🏥 System Health Monitor - Real-time system monitoring and validation
 * Monitors critical system components and provides real-time health status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Database,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Clock,
  RefreshCw,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  lastChecked: Date;
  trend: 'up' | 'down' | 'stable';
}

interface SystemComponent {
  id: string;
  name: string;
  type: 'api' | 'database' | 'storage' | 'service' | 'external';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastChecked: Date;
  endpoint?: string;
  dependencies: string[];
}

const SYSTEM_COMPONENTS: SystemComponent[] = [
  {
    id: 'main-api',
    name: 'Main API Server',
    type: 'api',
    status: 'online', 
    responseTime: 45,
    uptime: 99.9,
    lastChecked: new Date(),
    endpoint: '/api/health',
    dependencies: []
  },
  {
    id: 'database',
    name: 'Supabase Database',
    type: 'database',
    status: 'online',
    responseTime: 12,
    uptime: 99.8,
    lastChecked: new Date(),
    dependencies: ['main-api']
  },
  {
    id: 'file-storage',
    name: 'AWS S3 Storage',
    type: 'storage',
    status: 'online',
    responseTime: 89,
    uptime: 99.9,
    lastChecked: new Date(),
    dependencies: []
  },
  {
    id: 'render-engine',
    name: 'Video Render Engine',
    type: 'service',
    status: 'online',
    responseTime: 156,
    uptime: 98.5,
    lastChecked: new Date(),
    dependencies: ['main-api', 'file-storage']
  },
  {
    id: 'pptx-processor',
    name: 'PPTX Processing Service',
    type: 'service',
    status: 'online',
    responseTime: 234,
    uptime: 99.2,
    lastChecked: new Date(),
    dependencies: ['main-api', 'file-storage']
  },
  {
    id: 'avatar-service',
    name: 'Avatar Generation Service',
    type: 'external',
    status: 'online',
    responseTime: 298,
    uptime: 97.8,
    lastChecked: new Date(),
    dependencies: ['main-api']
  }
];

const SYSTEM_METRICS: SystemMetrics[] = [
  {
    id: 'cpu-usage',
    name: 'CPU Usage',
    status: 'healthy',
    value: 23,
    unit: '%',
    threshold: { warning: 70, critical: 85 },
    lastChecked: new Date(),
    trend: 'stable'
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    status: 'healthy',
    value: 41,
    unit: '%',
    threshold: { warning: 80, critical: 90 },
    lastChecked: new Date(),
    trend: 'up'
  },
  {
    id: 'disk-usage',
    name: 'Disk Usage',
    status: 'warning',
    value: 76,
    unit: '%',
    threshold: { warning: 75, critical: 90 },
    lastChecked: new Date(),
    trend: 'up'
  },
  {
    id: 'active-jobs',
    name: 'Active Render Jobs',
    status: 'healthy',
    value: 3,
    unit: 'jobs',
    threshold: { warning: 10, critical: 15 },
    lastChecked: new Date(),
    trend: 'stable'
  },
  {
    id: 'queue-size',
    name: 'Processing Queue',
    status: 'healthy',
    value: 7,
    unit: 'items',
    threshold: { warning: 50, critical: 100 },
    lastChecked: new Date(),
    trend: 'down'
  }
];

export default function SystemHealthMonitor() {
  const { toast } = useToast();
  const [components, setComponents] = useState<SystemComponent[]>(SYSTEM_COMPONENTS);
  const [metrics, setMetrics] = useState<SystemMetrics[]>(SYSTEM_METRICS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  // Calculate overall system health
  const calculateOverallHealth = useCallback(() => {
    const offlineComponents = components.filter(c => c.status === 'offline' || c.status === 'degraded').length;
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
    const warningMetrics = metrics.filter(m => m.status === 'warning').length;

    if (offlineComponents > 0 || criticalMetrics > 0) {
      setOverallHealth('critical');
    } else if (warningMetrics > 0) {
      setOverallHealth('warning');
    } else {
      setOverallHealth('healthy');
    }
  }, [components, metrics]);

  // Simulate real-time data updates
  const updateMetrics = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API calls for real metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics(prev => prev.map(metric => {
        const variance = (Math.random() - 0.5) * 10; // ±5% variance
        const newValue = Math.max(0, Math.min(100, metric.value + variance));
        
        let status: 'healthy' | 'warning' | 'critical' | 'unknown' = 'healthy';
        if (newValue >= metric.threshold.critical) {
          status = 'critical';
        } else if (newValue >= metric.threshold.warning) {
          status = 'warning';
        }
        
        return {
          ...metric,
          value: Math.round(newValue),
          status,
          lastChecked: new Date(),
          trend: newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable'
        };
      }));
      
      setComponents(prev => prev.map(comp => ({
        ...comp,
        responseTime: Math.max(10, comp.responseTime + (Math.random() - 0.5) * 20),
        lastChecked: new Date()
      })));
      
      setLastUpdate(new Date());
      
    } catch (error) {
      toast({
        title: "Erro ao atualizar métricas",
        description: "Não foi possível obter dados do sistema",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  // Calculate overall health when data changes
  useEffect(() => {
    calculateOverallHealth();
  }, [calculateOverallHealth]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      online: 'bg-green-100 text-green-800',
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      offline: 'bg-red-100 text-red-800',
      maintenance: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <CardTitle>System Health Monitor</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(overallHealth)}
              {getStatusBadge(overallHealth)}
            </div>
          </div>
          <CardDescription>
            Monitoramento em tempo real do status do sistema
            <span className="block text-xs text-gray-500 mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {components.filter(c => c.status === 'online').length} de {components.length} serviços online
            </div>
            <Button 
              onClick={updateMetrics} 
              disabled={isRefreshing}
              size="sm"
              variant="outline"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Componentes do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {components.map((component) => (
              <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {component.type === 'api' && <Server className="h-4 w-4 text-blue-500" />}
                    {component.type === 'database' && <Database className="h-4 w-4 text-purple-500" />}
                    {component.type === 'storage' && <Cloud className="h-4 w-4 text-green-500" />}
                    {component.type === 'service' && <Zap className="h-4 w-4 text-orange-500" />}
                    {component.type === 'external' && <Network className="h-4 w-4 text-red-500" />}
                    <span className="font-medium">{component.name}</span>
                  </div>
                  {getStatusBadge(component.status)}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{Math.round(component.responseTime)}ms</span>
                  </div>
                  <div>
                    <span>{component.uptime}% uptime</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Métricas do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {metric.id === 'cpu-usage' && <Cpu className="h-4 w-4 text-blue-500" />}
                    {metric.id === 'memory-usage' && <Database className="h-4 w-4 text-purple-500" />}
                    {metric.id === 'disk-usage' && <HardDrive className="h-4 w-4 text-green-500" />}
                    {(metric.id === 'active-jobs' || metric.id === 'queue-size') && <Activity className="h-4 w-4 text-orange-500" />}
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{metric.value}{metric.unit}</span>
                    <span className="text-gray-500">
                      {metric.threshold.critical}{metric.unit} max
                    </span>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className={`h-2 ${
                      metric.status === 'critical' ? 'bg-red-100' :
                      metric.status === 'warning' ? 'bg-yellow-100' : 
                      'bg-green-100'
                    }`}
                  />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {(overallHealth === 'warning' || overallHealth === 'critical') && (
        <Alert className={overallHealth === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
          {overallHealth === 'critical' ? 
            <XCircle className="h-4 w-4" /> : 
            <AlertTriangle className="h-4 w-4" />
          }
          <AlertDescription>
            <strong>
              {overallHealth === 'critical' ? 'Sistema em Estado Crítico!' : 'Aviso do Sistema'}
            </strong>
            <br />
            {overallHealth === 'critical' 
              ? 'Problemas críticos detectados. Verifique os componentes offline e métricas críticas.'
              : 'Alguns componentes precisam de atenção. Monitore as métricas em estado de aviso.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}