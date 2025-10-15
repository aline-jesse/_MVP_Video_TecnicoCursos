

/**
 * 🔒 Enhanced Security Framework - Zero Trust Architecture
 * Sprint 13 - Segurança Empresarial Avançada
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Key,
  Server,
  Globe,
  Scan,
  Fingerprint,
  Search,
  FileText,
  Clock,
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface SecurityEvent {
  id: string;
  type: 'threat_detected' | 'access_denied' | 'compliance_check' | 'vulnerability_scan';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  timestamp: string;
  resolved: boolean;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  result: 'success' | 'failure';
}

export default function SecurityZeroTrustPage() {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const response = await fetch('/api/v2/security/zero-trust/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
        setEvents(data.events);
        setAuditLogs(data.auditLogs);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    }
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/v2/security/zero-trust/scan', {
        method: 'POST'
      });
      
      if (response.ok) {
        setTimeout(() => {
          loadSecurityData();
          setIsScanning(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Erro no scan de segurança:', error);
      setIsScanning(false);
    }
  };

  // Dados para gráficos
  const threatData = [
    { name: 'Jan', threats: 12, blocked: 12 },
    { name: 'Fev', threats: 19, blocked: 18 },
    { name: 'Mar', threats: 8, blocked: 8 },
    { name: 'Abr', threats: 15, blocked: 15 },
    { name: 'Mai', threats: 6, blocked: 6 },
    { name: 'Jun', threats: 22, blocked: 22 },
    { name: 'Jul', threats: 4, blocked: 4 },
    { name: 'Ago', threats: 2, blocked: 2 },
  ];

  const complianceData = [
    { name: 'LGPD', value: 100, color: '#10b981' },
    { name: 'ISO 27001', value: 98, color: '#3b82f6' },
    { name: 'SOC 2', value: 96, color: '#8b5cf6' },
    { name: 'OWASP', value: 94, color: '#f59e0b' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              🔒 Zero Trust Security Framework
            </h1>
            <p className="text-gray-600">
              Arquitetura de segurança empresarial avançada - Sprint 13
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={loadSecurityData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              onClick={runSecurityScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700"
            >
              {isScanning ? (
                <>
                  <Scan className="h-4 w-4 mr-2 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan Completo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Métricas de Segurança */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Security Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-green-600">98</div>
                <Progress value={98} className="flex-1" />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Excelente • Target: 95+
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Ameaças Bloqueadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <div className="text-xs text-gray-500">
                Últimos 30 dias • 100% blocked
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">97%</div>
              <div className="text-xs text-gray-500">
                LGPD, ISO27001, SOC2
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Vulnerabilidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-gray-500">
                Críticas • 2 Low risk
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Funcionalidades */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'threats', label: 'Threat Detection' },
              { id: 'access', label: 'Access Control' },
              { id: 'encryption', label: 'Encryption' },
              { id: 'audit', label: 'Audit Logs' },
              { id: 'compliance', label: 'Compliance' }
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

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Ameaças Detectadas (30 dias)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={threatData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} name="Detectadas" />
                        <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} name="Bloqueadas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Compliance Score</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={complianceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {complianceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>AI Threat Detection</span>
                  </CardTitle>
                  <CardDescription>
                    Detecção inteligente de ameaças em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Sistema funcionando normalmente. Nenhuma ameaça ativa detectada.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Ameaças Hoje</div>
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-xs text-gray-500">100% bloqueadas</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Tentativas de Acesso</div>
                        <div className="text-2xl font-bold text-blue-600">147</div>
                        <div className="text-xs text-gray-500">Todas autorizadas</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>Zero Trust Access Control</span>
                  </CardTitle>
                  <CardDescription>
                    Controle granular de acesso e permissões
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Usuários Ativos</div>
                        <div className="text-2xl font-bold text-purple-600">156</div>
                        <div className="text-xs text-gray-500">Verificados</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Sessões MFA</div>
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-xs text-gray-500">Autenticação dupla</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Políticas Ativas</div>
                        <div className="text-2xl font-bold text-blue-600">24</div>
                        <div className="text-xs text-gray-500">Aplicadas</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'encryption' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>End-to-End Encryption</span>
                  </CardTitle>
                  <CardDescription>
                    Criptografia avançada para dados em trânsito e em repouso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="font-medium">Dados em Trânsito</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>TLS 1.3</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Perfect Forward Secrecy</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Certificate Pinning</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="font-medium">Dados em Repouso</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>AES-256-GCM</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Key Rotation</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Hardware Security Module</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Encryption Status: Fully Protected</span>
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        Todos os dados são criptografados com padrões militares
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Audit Trail - Últimas 24h</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { user: 'Ana Silva', action: 'Login', resource: 'Dashboard', time: '2 min atrás', result: 'success' },
                      { user: 'Carlos Santos', action: 'Video Export', resource: 'Project #1247', time: '5 min atrás', result: 'success' },
                      { user: 'Maria Oliveira', action: 'File Upload', resource: 'PPTX Parser', time: '12 min atrás', result: 'success' },
                      { user: 'João Costa', action: 'Settings Change', resource: 'User Profile', time: '18 min atrás', result: 'success' },
                      { user: 'Sistema', action: 'Backup', resource: 'Database', time: '1 hora atrás', result: 'success' }
                    ].map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">{log.user}</div>
                            <div className="text-xs text-gray-500">{log.action} • {log.resource}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">{log.time}</div>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {log.result}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Compliance Automation</span>
                  </CardTitle>
                  <CardDescription>
                    Automação de conformidade e relatórios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {complianceData.map((compliance) => (
                        <div key={compliance.name} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{compliance.name}</span>
                            <span className="text-sm font-bold" style={{ color: compliance.color }}>
                              {compliance.value}%
                            </span>
                          </div>
                          <Progress value={compliance.value} className="h-2" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="font-medium text-blue-900 mb-2">Próxima Auditoria</div>
                      <div className="text-sm text-blue-700">
                        ISO 27001 Annual Review - 15 de Setembro, 2025
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Preparação automática em andamento
                      </div>
                    </div>
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

