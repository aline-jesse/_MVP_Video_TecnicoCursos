/**
 * 🔔 Sistema de Notificação de Render
 * Gerencia notificações de conclusão de renderização
 */

import { Redis } from 'ioredis';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { RenderJob } from '@prisma/client';

interface NotificationOptions {
  userId: string;
  jobId: string;
  projectId: string;
  status: 'completed' | 'failed';
  error?: string;
  outputUrl?: string;
}

export class RenderNotifier {
  private static instance: RenderNotifier;
  private redis: Redis;
  private resend: Resend;

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public static getInstance(): RenderNotifier {
    if (!RenderNotifier.instance) {
      RenderNotifier.instance = new RenderNotifier();
    }
    return RenderNotifier.instance;
  }

  /**
   * Envia notificação de conclusão do render
   */
  public async notify(options: NotificationOptions): Promise<void> {
    try {
      // Busca informações do usuário e projeto
      const [user, project] = await Promise.all([
        prisma.user.findUnique({ where: { id: options.userId } }),
        prisma.project.findUnique({ where: { id: options.projectId } })
      ]);

      if (!user || !project) {
        console.error('❌ Usuário ou projeto não encontrado:', options);
        return;
      }

      // Atualiza status do job no banco
      await prisma.renderJob.update({
        where: { id: options.jobId },
        data: {
          status: options.status,
          error: options.error,
          outputUrl: options.outputUrl,
          finishedAt: new Date()
        }
      });

      // Envia notificação por email
      await this.sendEmail({
        to: user.email,
        jobId: options.jobId,
        projectName: project.name,
        status: options.status,
        error: options.error,
        outputUrl: options.outputUrl
      });

      // Publica evento no Redis para notificação em tempo real
      await this.redis.publish('render:notification', JSON.stringify({
        type: 'render_complete',
        userId: options.userId,
        jobId: options.jobId,
        projectId: options.projectId,
        status: options.status,
        error: options.error,
        outputUrl: options.outputUrl,
        timestamp: new Date().toISOString()
      }));

      // Salva notificação no banco para histórico
      await prisma.notification.create({
        data: {
          userId: options.userId,
          type: 'render_complete',
          title: `Renderização ${options.status === 'completed' ? 'concluída' : 'falhou'}`,
          message: options.status === 'completed'
            ? `A renderização do projeto "${project.name}" foi concluída com sucesso!`
            : `Ocorreu um erro durante a renderização do projeto "${project.name}": ${options.error}`,
          data: {
            jobId: options.jobId,
            projectId: options.projectId,
            status: options.status,
            error: options.error,
            outputUrl: options.outputUrl
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
    }
  }

  /**
   * Envia email de notificação
   */
  private async sendEmail(options: {
    to: string;
    jobId: string;
    projectName: string;
    status: 'completed' | 'failed';
    error?: string;
    outputUrl?: string;
  }): Promise<void> {
    try {
      const subject = options.status === 'completed'
        ? `✨ Renderização Concluída - ${options.projectName}`
        : `❌ Erro na Renderização - ${options.projectName}`;

      const html = options.status === 'completed'
        ? `
          <h2>Renderização Concluída com Sucesso!</h2>
          <p>A renderização do projeto "${options.projectName}" foi finalizada.</p>
          ${options.outputUrl ? `
            <p>Você pode acessar o vídeo através do link abaixo:</p>
            <p><a href="${options.outputUrl}" target="_blank">${options.outputUrl}</a></p>
          ` : ''}
          <p>ID do Job: ${options.jobId}</p>
        `
        : `
          <h2>Erro na Renderização</h2>
          <p>Ocorreu um erro durante a renderização do projeto "${options.projectName}".</p>
          <p>Erro: ${options.error}</p>
          <p>ID do Job: ${options.jobId}</p>
          <p>Nossa equipe técnica foi notificada e irá analisar o problema.</p>
        `;

      await this.resend.emails.send({
        from: 'Estúdio IA <noreply@estudioiavideo.com.br>',
        to: options.to,
        subject,
        html
      });

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
    }
  }

  /**
   * Inscreve para receber notificações em tempo real
   */
  public async subscribe(callback: (notification: any) => void): Promise<void> {
    const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    subscriber.subscribe('render:notification', (err) => {
      if (err) {
        console.error('❌ Erro ao se inscrever no canal de notificações:', err);
        return;
      }
    });

    subscriber.on('message', (_channel, message) => {
      try {
        const notification = JSON.parse(message);
        callback(notification);
      } catch (error) {
        console.error('❌ Erro ao processar notificação:', error);
      }
    });
  }

  /**
   * Limpa notificações antigas
   */
  public async cleanup(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          type: 'render_complete'
        }
      });

    } catch (error) {
      console.error('❌ Erro ao limpar notificações antigas:', error);
    }
  }
}