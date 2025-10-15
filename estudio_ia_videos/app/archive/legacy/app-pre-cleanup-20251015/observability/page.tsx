
/**
 * 👁️ Estúdio IA de Vídeos - Sprint 9
 * Página Observability & Monitoring
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Monitor,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Clock,
  Database,
  Network,
  Cpu
} from 'lucide-react';

export default function ObservabilityPage() {
  const [metrics] = useState({
    uptime: 99.95,
    responseTime: 245,
    errorRate: 0.02,
    throughput: 1540
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Monitor className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Observability Dashboard
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitoramento 360° de performance, logs e métricas em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.uptime}%
              </div>
              <Progress value={metrics.uptime} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.responseTime}ms
              </div>
              <div className="text-xs text-gray-600">Média última hora</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {(metrics.errorRate * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-600">Últimas 24h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                Throughput
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.throughput}
              </div>
              <div className="text-xs text-gray-600">Requests/min</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sistema de Monitoramento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Observability Dashboard</h3>
              <p className="text-gray-600">
                Monitoramento completo de performance, logs e métricas em tempo real
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
