

/**
 * ⚡ Performance Dashboard - Página Principal
 * Métricas em tempo real do sistema
 */

'use client';

import React from 'react';
import PerformanceDashboard from '@/components/performance/performance-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Crown, Zap } from 'lucide-react';

export default function PerformanceDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Activity className="h-12 w-12" />
                  <div>
                    <h1 className="text-3xl font-bold">Performance Dashboard</h1>
                    <p className="text-green-100 mt-2">
                      Monitoramento em tempo real do sistema e métricas avançadas
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Zap className="h-4 w-4 mr-1" />
                    Real-time
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Crown className="h-4 w-4 mr-1" />
                    Advanced Analytics
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">99.8%</div>
                  <div className="text-sm text-green-200">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">245ms</div>
                  <div className="text-sm text-green-200">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm text-green-200">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">89/h</div>
                  <div className="text-sm text-green-200">Video Renders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Component */}
        <PerformanceDashboard />
      </div>
    </div>
  );
}

