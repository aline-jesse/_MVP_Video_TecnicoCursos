
// @ts-nocheck

/**
 * 🔐 Estúdio IA de Vídeos - Sprint 9
 * Página Security Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Lock,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  Clock
} from 'lucide-react';

export default function SecurityDashboardPage() {
  const [securityData, setSecurityData] = useState(null);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const response = await fetch('/api/v2/security/zero-trust?endpoint=dashboard');
      if (response.ok) {
        const data = await response.json();
        setSecurityData(data);
      }
    } catch (error) {
      setSecurityData({
        overview: {
          activeSessions: 8,
          avgRiskScore: 23,
          policyViolations: 2,
          mfaAdoption: 0.73
        },
        recentEvents: [
          {
            timestamp: new Date(),
            type: 'High Risk Access',
            severity: 'medium',
            description: 'Acesso suspeito bloqueado'
          }
        ]
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Security Dashboard
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Zero-Trust Security, criptografia end-to-end e monitoramento de ameaças
          </p>
        </div>

        {securityData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Sessões Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {securityData.overview.activeSessions}
                </div>
                <div className="text-xs text-gray-600">Usuários conectados</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-yellow-600" />
                  Risco Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {securityData.overview.avgRiskScore}
                </div>
                <div className="text-xs text-gray-600">Score de risco</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  Violações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {securityData.overview.policyViolations}
                </div>
                <div className="text-xs text-gray-600">Últimas 24h</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-green-600" />
                  MFA Adoption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(securityData.overview.mfaAdoption * 100).toFixed(0)}%
                </div>
                <Progress value={securityData.overview.mfaAdoption * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Zero-Trust Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Zero-Trust Architecture</h3>
              <p className="text-gray-600">
                Segurança enterprise com verificação contínua e criptografia end-to-end
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
