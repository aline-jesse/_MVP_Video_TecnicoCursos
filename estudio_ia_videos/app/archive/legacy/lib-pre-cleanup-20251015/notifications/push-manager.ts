
/**
 * 🔔 SPRINT 39 - Push Notifications Manager
 * Sistema de push notifications com Web Push API e FCM
 */

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  silent?: boolean;
  requireInteraction?: boolean;
  timestamp?: number;
}

interface PushSubscriptionInfo {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey: string = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications não suportadas neste navegador');
      return false;
    }

    // Validar chave VAPID
    if (!this.vapidPublicKey || this.vapidPublicKey.length < 80) {
      console.warn('⚠️ VAPID key não configurada. Push notifications desabilitadas.');
      console.warn('Configure NEXT_PUBLIC_VAPID_PUBLIC_KEY no arquivo .env');
      return false;
    }

    try {
      // Registrar service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registrado para push notifications');

      // Verificar permissão
      const permission = await this.checkPermission();
      
      if (permission === 'granted') {
        await this.getSubscription();
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar push notifications:', error);
      return false;
    }
  }

  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications não suportadas');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Permissão para notificações concedida');
        await this.subscribe();
        return true;
      } else {
        console.log('❌ Permissão para notificações negada');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      return false;
    }
  }

  async subscribe(): Promise<PushSubscriptionInfo | null> {
    if (!this.registration) {
      console.error('Service Worker não registrado');
      return null;
    }

    try {
      // Verificar se já existe subscription
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Criar nova subscription
        const uint8Array = this.urlBase64ToUint8Array(this.vapidPublicKey);
        
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: uint8Array as any, // Type assertion para compatibilidade
        });
      }

      this.subscription = subscription;

      // Extrair informações da subscription
      const subscriptionInfo = this.extractSubscriptionInfo(subscription);
      
      // Enviar para o servidor
      await this.sendSubscriptionToServer(subscriptionInfo);

      console.log('✅ Inscrito em push notifications');
      return subscriptionInfo;
    } catch (error) {
      console.error('❌ Erro ao se inscrever em push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      
      // Remover do servidor
      await this.removeSubscriptionFromServer();
      
      console.log('✅ Desinscrito de push notifications');
      return true;
    } catch (error) {
      console.error('❌ Erro ao desinscrever de push notifications:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscriptionInfo | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        this.subscription = subscription;
        return this.extractSubscriptionInfo(subscription);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter subscription:', error);
      return null;
    }
  }

  async showNotification(notification: PushNotification): Promise<void> {
    if (!this.registration) {
      console.error('Service Worker não registrado');
      return;
    }

    try {
      await this.registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icon-192.png',
        badge: notification.badge || '/icon-72.png',
        tag: notification.tag || notification.id,
        data: notification.data,
        silent: notification.silent,
        requireInteraction: notification.requireInteraction,
      });

      console.log('✅ Notificação exibida:', notification.title);
    } catch (error) {
      console.error('❌ Erro ao exibir notificação:', error);
    }
  }

  // Notificações específicas do app

  async notifyRenderComplete(projectName: string, projectId: string): Promise<void> {
    await this.showNotification({
      id: `render-${projectId}`,
      title: '🎬 Vídeo renderizado!',
      body: `O projeto "${projectName}" foi renderizado com sucesso.`,
      tag: 'render-complete',
      data: { projectId, type: 'render-complete' },
      actions: [
        { action: 'view', title: 'Ver vídeo' },
        { action: 'download', title: 'Baixar' },
      ],
      requireInteraction: true,
    });
  }

  async notifyCommentMention(userName: string, projectName: string, projectId: string): Promise<void> {
    await this.showNotification({
      id: `mention-${Date.now()}`,
      title: '💬 Nova menção',
      body: `${userName} mencionou você em "${projectName}"`,
      tag: 'mention',
      data: { projectId, type: 'mention' },
      actions: [
        { action: 'view', title: 'Ver comentário' },
      ],
    });
  }

  async notifyReviewApproved(projectName: string, projectId: string): Promise<void> {
    await this.showNotification({
      id: `approval-${projectId}`,
      title: '✅ Projeto aprovado',
      body: `"${projectName}" foi aprovado e está pronto para publicação!`,
      tag: 'approval',
      data: { projectId, type: 'approval' },
      actions: [
        { action: 'publish', title: 'Publicar' },
        { action: 'view', title: 'Visualizar' },
      ],
      requireInteraction: true,
    });
  }

  async notifyTrialEnding(daysLeft: number): Promise<void> {
    await this.showNotification({
      id: 'trial-ending',
      title: '⏰ Trial terminando',
      body: `Seu período de teste termina em ${daysLeft} dias. Atualize agora!`,
      tag: 'trial-ending',
      data: { type: 'trial-ending', daysLeft },
      actions: [
        { action: 'upgrade', title: 'Atualizar plano' },
        { action: 'dismiss', title: 'Lembrar depois' },
      ],
      requireInteraction: true,
    });
  }

  async notifyNewFeature(featureName: string, description: string): Promise<void> {
    await this.showNotification({
      id: `feature-${Date.now()}`,
      title: `🆕 ${featureName}`,
      body: description,
      tag: 'new-feature',
      data: { type: 'new-feature', featureName },
      actions: [
        { action: 'learn-more', title: 'Saiba mais' },
      ],
    });
  }

  // Helpers

  private extractSubscriptionInfo(subscription: PushSubscription): PushSubscriptionInfo {
    const key = subscription.getKey('p256dh');
    const token = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: key ? this.arrayBufferToBase64(key) : '',
        auth: token ? this.arrayBufferToBase64(token) : '',
      },
    };
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private async sendSubscriptionToServer(subscription: PushSubscriptionInfo): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      console.log('✅ Subscription enviada ao servidor');
    } catch (error) {
      console.error('❌ Erro ao enviar subscription ao servidor:', error);
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
      });
      console.log('✅ Subscription removida do servidor');
    } catch (error) {
      console.error('❌ Erro ao remover subscription do servidor:', error);
    }
  }
}

export const pushManager = new PushNotificationManager();
