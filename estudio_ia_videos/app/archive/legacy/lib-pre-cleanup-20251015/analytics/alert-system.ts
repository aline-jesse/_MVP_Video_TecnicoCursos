import { prisma } from '@/lib/db';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertType = 
  | 'high_error_rate'
  | 'slow_response'
  | 'traffic_spike'
  | 'traffic_drop'
  | 'system_overload'
  | 'storage_full'
  | 'api_failure'
  | 'user_drop'
  | 'conversion_drop'
  | 'security_threat'
  | 'custom';

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  severity: AlertSeverity;
  condition: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number;
    timeWindow: number; // em minutos
    aggregation?: 'avg' | 'sum' | 'count' | 'max' | 'min';
  };
  isActive: boolean;
  organizationId?: string;
  userId: string;
  channels: AlertChannel[];
  cooldown: number; // em minutos
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertChannel {
  type: 'email' | 'webhook' | 'dashboard' | 'sms';
  config: {
    recipients?: string[];
    webhookUrl?: string;
    phoneNumbers?: string[];
  };
  isActive: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  value: number;
  threshold: number;
  status: 'active' | 'acknowledged' | 'resolved';
  organizationId?: string;
  userId?: string;
  metadata: any;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

export class AlertSystem {
  /**
   * Avalia todas as regras de alerta ativas
   */
  async evaluateAlerts(): Promise<{
    evaluated: number;
    triggered: number;
    alerts: Alert[];
  }> {
    console.log('[AlertSystem] Starting alert evaluation...');
    
    const activeRules = await this.getActiveAlertRules();
    const triggeredAlerts: Alert[] = [];
    let evaluated = 0;
    let triggered = 0;

    for (const rule of activeRules) {
      try {
        evaluated++;
        
        // Verificar cooldown
        if (this.isInCooldown(rule)) {
          continue;
        }

        // Avaliar condição
        const shouldTrigger = await this.evaluateRule(rule);
        
        if (shouldTrigger.triggered) {
          const alert = await this.createAlert(rule, shouldTrigger.value);
          triggeredAlerts.push(alert);
          triggered++;
          
          // Enviar notificações
          await this.sendAlertNotifications(alert, rule);
          
          // Atualizar última execução da regra
          await this.updateRuleLastTriggered(rule.id);
        }
        
      } catch (error: any) {
        console.error(`[AlertSystem] Error evaluating rule ${rule.id}:`, error);
      }
    }

    console.log(`[AlertSystem] Evaluation completed. Evaluated: ${evaluated}, Triggered: ${triggered}`);
    
    return { evaluated, triggered, alerts: triggeredAlerts };
  }

  /**
   * Busca regras de alerta ativas
   */
  private async getActiveAlertRules(): Promise<AlertRule[]> {
    const rules = await prisma.analyticsEvent.findMany({
      where: {
        category: 'alert_rule',
        status: 'active'
      },
      orderBy: { createdAt: 'asc' }
    });

    return rules.map(rule => ({
      id: rule.id,
      name: rule.label || 'Unnamed Rule',
      type: rule.action as AlertType,
      severity: (rule.metadata as any)?.severity || 'warning',
      condition: (rule.metadata as any)?.condition,
      isActive: rule.status === 'active',
      organizationId: rule.organizationId,
      userId: rule.userId,
      channels: (rule.metadata as any)?.channels || [],
      cooldown: (rule.metadata as any)?.cooldown || 15,
      lastTriggered: (rule.metadata as any)?.lastTriggered ? 
        new Date((rule.metadata as any).lastTriggered) : undefined,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    }));
  }

  /**
   * Verifica se a regra está em cooldown
   */
  private isInCooldown(rule: AlertRule): boolean {
    if (!rule.lastTriggered) return false;
    
    const cooldownEnd = new Date(rule.lastTriggered.getTime() + rule.cooldown * 60 * 1000);
    return new Date() < cooldownEnd;
  }

  /**
   * Avalia uma regra específica
   */
  private async evaluateRule(rule: AlertRule): Promise<{ triggered: boolean; value: number }> {
    const { condition } = rule;
    const now = new Date();
    const startTime = new Date(now.getTime() - condition.timeWindow * 60 * 1000);

    let value = 0;

    // Buscar dados baseado na métrica
    switch (condition.metric) {
      case 'error_rate':
        value = await this.calculateErrorRate(startTime, now, rule.organizationId);
        break;
        
      case 'response_time':
        value = await this.calculateAverageResponseTime(startTime, now, rule.organizationId);
        break;
        
      case 'events_per_minute':
        value = await this.calculateEventsPerMinute(startTime, now, rule.organizationId);
        break;
        
      case 'active_users':
        value = await this.calculateActiveUsers(startTime, now, rule.organizationId);
        break;
        
      case 'api_failures':
        value = await this.calculateApiFailures(startTime, now, rule.organizationId);
        break;
        
      case 'storage_usage':
        value = await this.calculateStorageUsage(rule.organizationId);
        break;
        
      default:
        console.warn(`[AlertSystem] Unknown metric: ${condition.metric}`);
        return { triggered: false, value: 0 };
    }

    // Avaliar condição
    const triggered = this.evaluateCondition(value, condition.operator, condition.threshold);
    
    return { triggered, value };
  }

  /**
   * Calcula taxa de erro
   */
  private async calculateErrorRate(start: Date, end: Date, organizationId?: string): Promise<number> {
    const whereClause = {
      createdAt: { gte: start, lte: end },
      ...(organizationId && { organizationId })
    };

    const [totalEvents, errorEvents] = await Promise.all([
      prisma.analyticsEvent.count({ where: whereClause }),
      prisma.analyticsEvent.count({ 
        where: { ...whereClause, status: 'error' }
      })
    ]);

    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
  }

  /**
   * Calcula tempo médio de resposta
   */
  private async calculateAverageResponseTime(start: Date, end: Date, organizationId?: string): Promise<number> {
    const result = await prisma.analyticsEvent.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        duration: { not: null },
        ...(organizationId && { organizationId })
      },
      _avg: { duration: true }
    });

    return result._avg.duration || 0;
  }

  /**
   * Calcula eventos por minuto
   */
  private async calculateEventsPerMinute(start: Date, end: Date, organizationId?: string): Promise<number> {
    const totalEvents = await prisma.analyticsEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
        ...(organizationId && { organizationId })
      }
    });

    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return minutes > 0 ? totalEvents / minutes : 0;
  }

  /**
   * Calcula usuários ativos
   */
  private async calculateActiveUsers(start: Date, end: Date, organizationId?: string): Promise<number> {
    const uniqueUsers = await prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: start, lte: end },
        userId: { not: null },
        ...(organizationId && { organizationId })
      }
    });

    return uniqueUsers.length;
  }

  /**
   * Calcula falhas de API
   */
  private async calculateApiFailures(start: Date, end: Date, organizationId?: string): Promise<number> {
    return await prisma.analyticsEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
        category: 'api',
        status: 'error',
        ...(organizationId && { organizationId })
      }
    });
  }

  /**
   * Calcula uso de armazenamento (simulado)
   */
  private async calculateStorageUsage(organizationId?: string): Promise<number> {
    // Em uma implementação real, isso consultaria métricas do sistema de arquivos
    // Por agora, retornamos um valor simulado baseado no número de projetos
    const projectCount = await prisma.project.count({
      where: organizationId ? { organizationId } : {}
    });

    // Simular uso de storage baseado no número de projetos
    return Math.min(projectCount * 2.5, 100); // Máximo 100%
  }

  /**
   * Avalia condição de alerta
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  /**
   * Cria um novo alerta
   */
  private async createAlert(rule: AlertRule, value: number): Promise<Alert> {
    const alert: Alert = {
      id: '', // Será definido pelo banco
      ruleId: rule.id,
      type: rule.type,
      severity: rule.severity,
      title: this.generateAlertTitle(rule, value),
      message: this.generateAlertMessage(rule, value),
      value,
      threshold: rule.condition.threshold,
      status: 'active',
      organizationId: rule.organizationId,
      userId: rule.userId,
      metadata: {
        rule: rule.name,
        metric: rule.condition.metric,
        operator: rule.condition.operator,
        timeWindow: rule.condition.timeWindow
      },
      triggeredAt: new Date()
    };

    // Salvar no banco
    const savedAlert = await prisma.analyticsEvent.create({
      data: {
        organizationId: alert.organizationId,
        userId: alert.userId,
        category: 'alert',
        action: alert.type,
        label: alert.title,
        status: 'active',
        value: alert.value,
        metadata: {
          ...alert.metadata,
          ruleId: rule.id,
          severity: alert.severity,
          threshold: alert.threshold,
          message: alert.message
        }
      }
    });

    alert.id = savedAlert.id;
    return alert;
  }

  /**
   * Gera título do alerta
   */
  private generateAlertTitle(rule: AlertRule, value: number): string {
    const metric = rule.condition.metric.replace(/_/g, ' ');
    return `${rule.severity.toUpperCase()}: ${metric} - ${value.toFixed(2)}`;
  }

  /**
   * Gera mensagem do alerta
   */
  private generateAlertMessage(rule: AlertRule, value: number): string {
    const { condition } = rule;
    const metric = condition.metric.replace(/_/g, ' ');
    
    return `A métrica "${metric}" atingiu ${value.toFixed(2)}, que é ${condition.operator} ${condition.threshold}. ` +
           `Regra: ${rule.name}. Janela de tempo: ${condition.timeWindow} minutos.`;
  }

  /**
   * Envia notificações do alerta
   */
  private async sendAlertNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    for (const channel of rule.channels) {
      if (!channel.isActive) continue;

      try {
        switch (channel.type) {
          case 'email':
            await this.sendEmailNotification(alert, channel);
            break;
            
          case 'webhook':
            await this.sendWebhookNotification(alert, channel);
            break;
            
          case 'dashboard':
            // Dashboard notifications são automáticas via banco de dados
            break;
            
          case 'sms':
            await this.sendSMSNotification(alert, channel);
            break;
        }
        
        // Registrar envio de notificação
        await prisma.analyticsEvent.create({
          data: {
            organizationId: alert.organizationId,
            userId: alert.userId,
            category: 'alert_notification',
            action: channel.type,
            label: `Alert notification sent via ${channel.type}`,
            status: 'success',
            metadata: {
              alertId: alert.id,
              channel: channel.type,
              recipients: channel.config.recipients || []
            }
          }
        });
        
      } catch (error: any) {
        console.error(`[AlertSystem] Failed to send ${channel.type} notification:`, error);
        
        // Registrar falha
        await prisma.analyticsEvent.create({
          data: {
            organizationId: alert.organizationId,
            userId: alert.userId,
            category: 'alert_notification',
            action: channel.type,
            label: `Failed to send alert notification via ${channel.type}`,
            status: 'error',
            errorMessage: error.message,
            metadata: {
              alertId: alert.id,
              channel: channel.type,
              error: error.message
            }
          }
        });
      }
    }
  }

  /**
   * Envia notificação por email (simulado)
   */
  private async sendEmailNotification(alert: Alert, channel: AlertChannel): Promise<void> {
    console.log(`[AlertSystem] Sending email notification for alert ${alert.id}`);
    // Aqui integraria com serviço de email real
  }

  /**
   * Envia notificação via webhook
   */
  private async sendWebhookNotification(alert: Alert, channel: AlertChannel): Promise<void> {
    if (!channel.config.webhookUrl) return;

    const payload = {
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        value: alert.value,
        threshold: alert.threshold,
        triggeredAt: alert.triggeredAt
      },
      timestamp: new Date().toISOString()
    };

    // Aqui faria a requisição HTTP para o webhook
    console.log(`[AlertSystem] Sending webhook notification to ${channel.config.webhookUrl}`);
  }

  /**
   * Envia notificação por SMS (simulado)
   */
  private async sendSMSNotification(alert: Alert, channel: AlertChannel): Promise<void> {
    console.log(`[AlertSystem] Sending SMS notification for alert ${alert.id}`);
    // Aqui integraria com serviço de SMS real
  }

  /**
   * Atualiza última execução da regra
   */
  private async updateRuleLastTriggered(ruleId: string): Promise<void> {
    await prisma.analyticsEvent.update({
      where: { id: ruleId },
      data: {
        metadata: {
          path: ['lastTriggered'],
          set: new Date().toISOString()
        }
      }
    });
  }

  /**
   * Reconhece um alerta
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await prisma.analyticsEvent.update({
      where: { id: alertId },
      data: {
        status: 'acknowledged',
        metadata: {
          path: ['acknowledgedAt'],
          set: new Date().toISOString()
        }
      }
    });

    await prisma.analyticsEvent.update({
      where: { id: alertId },
      data: {
        metadata: {
          path: ['acknowledgedBy'],
          set: userId
        }
      }
    });
  }

  /**
   * Resolve um alerta
   */
  async resolveAlert(alertId: string, userId: string): Promise<void> {
    await prisma.analyticsEvent.update({
      where: { id: alertId },
      data: {
        status: 'resolved',
        metadata: {
          path: ['resolvedAt'],
          set: new Date().toISOString()
        }
      }
    });

    await prisma.analyticsEvent.update({
      where: { id: alertId },
      data: {
        metadata: {
          path: ['resolvedBy'],
          set: userId
        }
      }
    });
  }

  /**
   * Lista alertas ativos
   */
  async getActiveAlerts(organizationId?: string): Promise<Alert[]> {
    const alerts = await prisma.analyticsEvent.findMany({
      where: {
        category: 'alert',
        status: 'active',
        ...(organizationId && { organizationId })
      },
      orderBy: { createdAt: 'desc' }
    });

    return alerts.map(alert => ({
      id: alert.id,
      ruleId: (alert.metadata as any)?.ruleId || '',
      type: alert.action as AlertType,
      severity: (alert.metadata as any)?.severity || 'warning',
      title: alert.label || 'Unknown Alert',
      message: (alert.metadata as any)?.message || '',
      value: alert.value || 0,
      threshold: (alert.metadata as any)?.threshold || 0,
      status: alert.status as 'active' | 'acknowledged' | 'resolved',
      organizationId: alert.organizationId,
      userId: alert.userId,
      metadata: alert.metadata,
      triggeredAt: alert.createdAt,
      acknowledgedAt: (alert.metadata as any)?.acknowledgedAt ? 
        new Date((alert.metadata as any).acknowledgedAt) : undefined,
      resolvedAt: (alert.metadata as any)?.resolvedAt ? 
        new Date((alert.metadata as any).resolvedAt) : undefined,
      acknowledgedBy: (alert.metadata as any)?.acknowledgedBy,
      resolvedBy: (alert.metadata as any)?.resolvedBy
    }));
  }
}