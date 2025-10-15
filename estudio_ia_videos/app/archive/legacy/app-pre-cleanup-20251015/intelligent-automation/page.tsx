
/**
 * ⚡ Estúdio IA de Vídeos - Sprint 10
 * Página de Automação Inteligente
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Zap,
  Bot,
  Calendar,
  Bell,
  Settings,
  Play,
  Pause,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Users,
  Mail,
  MessageSquare,
  Workflow,
  Cpu,
  Brain,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AutomationWorkflow, AutomationTemplate, ScheduledTask, NotificationItem } from '@/types/sprint10';

export default function IntelligentAutomationPage() {
  const [activeAutomations, setActiveAutomations] = useState<AutomationWorkflow[]>([]);
  const [automationTemplates, setAutomationTemplates] = useState<AutomationTemplate[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    loadAutomations();
    loadTemplates();
    loadScheduledTasks();
    loadNotifications();
  }, []);

  const loadAutomations = () => {
    setActiveAutomations([
      {
        id: 'auto-1',
        name: 'Onboarding Automático',
        description: 'Matricula novos funcionários em cursos obrigatórios',
        type: 'enrollment',
        status: 'active',
        trigger: 'user.created',
        actions: ['Enviar boas-vindas', 'Matricular NR-35', 'Agendar avaliação'],
        executionCount: 347,
        successRate: 98.5,
        lastExecution: new Date(Date.now() - 1800000)
      }
    ]);
  };

  const loadTemplates = () => {
    setAutomationTemplates([
      {
        id: 'template-1',
        name: 'Workflow de Compliance',
        description: 'Automatiza processo de conformidade regulatória',
        category: 'compliance',
        steps: 5,
        estimatedTime: '15 min setup',
        icon: CheckCircle,
        color: 'bg-green-500'
      }
    ]);
  };

  const loadScheduledTasks = () => {
    setScheduledTasks([
      {
        id: 'task-1',
        name: 'Backup Semanal',
        type: 'maintenance',
        schedule: 'Toda segunda às 02:00',
        nextRun: new Date(Date.now() + 86400000 * 2),
        status: 'active',
        lastRun: new Date(Date.now() - 86400000 * 5)
      }
    ]);
  };

  const loadNotifications = () => {
    setNotifications([
      {
        id: 'notif-1',
        type: 'success',
        title: 'Automação Concluída',
        message: 'Onboarding automático executado com sucesso (15 novos usuários)',
        timestamp: new Date(Date.now() - 1800000),
        read: false
      }
    ]);
  };

  const toggleAutomation = (automationId: string) => {
    setActiveAutomations(prev => 
      prev.map(automation => 
        automation.id === automationId 
          ? { ...automation, status: automation.status === 'active' ? 'paused' : 'active' }
          : automation
      )
    );
    toast.success('Status da automação atualizado!');
  };

  const createAutomation = (templateId: string) => {
    const template = automationTemplates.find(t => t.id === templateId);
    toast.success(`Criando automação: ${template?.name}`);
  };

  const runAutomation = (automationId: string) => {
    toast.success('Executando automação...');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.paused;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50',
      info: 'border-blue-200 bg-blue-50'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Zap className="h-8 w-8 text-violet-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Automação Inteligente
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Workflows automatizados, agendamento inteligente e notificações preditivas para máxima eficiência
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Bot className="h-8 w-8 text-violet-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-violet-600">
                {activeAutomations.filter(a => a.status === 'active').length}
              </div>
              <p className="text-sm text-gray-600">Automações Ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {activeAutomations.reduce((sum, a) => sum + a.executionCount, 0)}
              </div>
              <p className="text-sm text-gray-600">Execuções Totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {activeAutomations.length > 0 ? Math.round(activeAutomations.reduce((sum, a) => sum + a.successRate, 0) / activeAutomations.length) : 0}%
              </div>
              <p className="text-sm text-gray-600">Taxa Sucesso Média</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {scheduledTasks.filter(t => t.status === 'active').length}
              </div>
              <p className="text-sm text-gray-600">Tarefas Agendadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Automations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              Automações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAutomations.map((automation) => (
                <div key={automation.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <Bot className="h-5 w-5 text-violet-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">{automation.name}</h4>
                        <p className="text-sm text-gray-600">{automation.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(automation.status)}>
                        {automation.status}
                      </Badge>
                      <Switch 
                        checked={automation.status === 'active'}
                        onCheckedChange={() => toggleAutomation(automation.id)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Execuções:</span>
                      <span className="font-semibold">{automation.executionCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Sucesso:</span>
                      <span className="font-semibold text-green-600">{automation.successRate}%</span>
                    </div>
                    <Progress value={automation.successRate} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Última execução: {automation.lastExecution.toLocaleString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => runAutomation(automation.id)}
                        size="sm" 
                        variant="outline"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Executar
                      </Button>
                      <Button 
                        onClick={() => toast.success('Abrindo configurações...')}
                        size="sm" 
                        variant="outline"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Templates de Automação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {automationTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${template.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                          <p className="text-xs text-gray-600">{template.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {template.steps} passos • {template.estimatedTime}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => createAutomation(template.id)}
                        size="sm"
                      >
                        Usar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
