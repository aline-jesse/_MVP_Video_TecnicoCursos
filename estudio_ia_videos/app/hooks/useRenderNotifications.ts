'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RenderNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  progress?: number;
  timestamp: number;
  duration?: number;
}

export function useRenderNotifications() {
  const [notifications, setNotifications] = useState<RenderNotification[]>([]);

  const addNotification = useCallback((notification: Omit<RenderNotification, 'id' | 'timestamp'>) => {
    const newNotification: RenderNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random()}`,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove após duração especificada (padrão: 5 segundos)
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, duration);
    }

    return newNotification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, progress } : n))
    );
  }, []);

  // Listener para eventos de renderização
  useEffect(() => {
    const handleRenderStart = (event: CustomEvent) => {
      addNotification({
        type: 'info',
        title: 'Renderização Iniciada',
        message: `Job ${event.detail.jobId} iniciado`,
        progress: 0,
        duration: 0 // Não remove automaticamente
      });
    };

    const handleRenderProgress = (event: CustomEvent) => {
      const { jobId, progress } = event.detail;
      // Atualiza progresso da notificação existente
      setNotifications(prev =>
        prev.map(n =>
          n.message.includes(jobId) ? { ...n, progress } : n
        )
      );
    };

    const handleRenderComplete = (event: CustomEvent) => {
      addNotification({
        type: 'success',
        title: 'Renderização Concluída',
        message: `Job ${event.detail.jobId} finalizado com sucesso!`,
        duration: 5000
      });
    };

    const handleRenderError = (event: CustomEvent) => {
      addNotification({
        type: 'error',
        title: 'Erro na Renderização',
        message: event.detail.error || 'Erro desconhecido',
        duration: 10000
      });
    };

    window.addEventListener('render:start', handleRenderStart as EventListener);
    window.addEventListener('render:progress', handleRenderProgress as EventListener);
    window.addEventListener('render:complete', handleRenderComplete as EventListener);
    window.addEventListener('render:error', handleRenderError as EventListener);

    return () => {
      window.removeEventListener('render:start', handleRenderStart as EventListener);
      window.removeEventListener('render:progress', handleRenderProgress as EventListener);
      window.removeEventListener('render:complete', handleRenderComplete as EventListener);
      window.removeEventListener('render:error', handleRenderError as EventListener);
    };
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    updateProgress
  };
}
