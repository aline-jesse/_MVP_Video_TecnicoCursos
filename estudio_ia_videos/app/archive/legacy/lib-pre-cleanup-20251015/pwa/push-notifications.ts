
/**
 * SPRINT 34 - PWA PUSH NOTIFICATIONS
 * Web Push API integration for real-time notifications
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Push Notification Manager
 */
export class PushNotificationManager {
  private vapidPublicKey?: string;
  private serviceWorkerRegistration?: ServiceWorkerRegistration;

  constructor() {
    if (typeof window !== 'undefined') {
      this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    }
  }

  /**
   * Initialize push notifications
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    // Register service worker
    this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
  }

  /**
   * Request permission for push notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.serviceWorkerRegistration) {
      await this.init();
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    // Subscribe to push service
    const subscription = await this.serviceWorkerRegistration!.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey!),
    });

    // Convert subscription to our format
    const subscriptionJSON = subscription.toJSON();
    return {
      endpoint: subscriptionJSON.endpoint!,
      keys: {
        p256dh: subscriptionJSON.keys!.p256dh!,
        auth: subscriptionJSON.keys!.auth!,
      },
    };
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }

    return false;
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      await this.init();
    }

    return await this.serviceWorkerRegistration!.pushManager.getSubscription();
  }

  /**
   * Show local notification (for testing)
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      await this.init();
    }

    await this.serviceWorkerRegistration!.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-72.png',
      image: payload.image,
      data: payload.data,
      actions: payload.actions,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
    });
  }

  /**
   * Helper: Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

/**
 * Server-side push notification sender
 */
export class PushNotificationSender {
  /**
   * Send push notification to user
   */
  static async send(
    subscription: PushSubscriptionData,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      // In production, use web-push library
      // For now, we'll use the Web Push API directly
      const webpush = await import('web-push');

      webpush.setVapidDetails(
        'mailto:' + (process.env.VAPID_SUBJECT || 'admin@treinx.abacusai.app'),
        process.env.VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      );

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
        JSON.stringify(payload)
      );

      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  static async sendBulk(
    subscriptions: PushSubscriptionData[],
    payload: NotificationPayload
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      const sent = await this.send(subscription, payload);
      if (sent) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}

// Notification templates
export const notificationTemplates = {
  projectComplete: (projectName: string): NotificationPayload => ({
    title: 'Projeto Concluído! 🎉',
    body: `Seu projeto "${projectName}" foi processado com sucesso e está pronto para uso.`,
    icon: '/icon-192.png',
    tag: 'project-complete',
    data: { type: 'project-complete' },
    actions: [
      { action: 'view', title: 'Visualizar' },
      { action: 'download', title: 'Baixar' },
    ],
  }),

  renderComplete: (projectName: string, videoUrl: string): NotificationPayload => ({
    title: 'Vídeo Renderizado! 🎬',
    body: `O vídeo do projeto "${projectName}" está pronto para download.`,
    icon: '/icon-192.png',
    tag: 'render-complete',
    data: { type: 'render-complete', videoUrl },
    actions: [
      { action: 'view', title: 'Ver Vídeo' },
      { action: 'download', title: 'Baixar' },
    ],
  }),

  commentAdded: (userName: string, projectName: string): NotificationPayload => ({
    title: 'Novo Comentário 💬',
    body: `${userName} comentou no projeto "${projectName}"`,
    icon: '/icon-192.png',
    tag: 'comment-added',
    data: { type: 'comment-added' },
    actions: [{ action: 'view', title: 'Ver Comentário' }],
  }),

  projectShared: (userName: string, projectName: string): NotificationPayload => ({
    title: 'Projeto Compartilhado 📤',
    body: `${userName} compartilhou o projeto "${projectName}" com você`,
    icon: '/icon-192.png',
    tag: 'project-shared',
    data: { type: 'project-shared' },
    actions: [{ action: 'open', title: 'Abrir Projeto' }],
  }),

  renderError: (projectName: string, error: string): NotificationPayload => ({
    title: 'Erro na Renderização ⚠️',
    body: `Falha ao processar o projeto "${projectName}": ${error}`,
    icon: '/icon-192.png',
    tag: 'render-error',
    data: { type: 'render-error' },
    requireInteraction: true,
    actions: [{ action: 'retry', title: 'Tentar Novamente' }],
  }),
};
