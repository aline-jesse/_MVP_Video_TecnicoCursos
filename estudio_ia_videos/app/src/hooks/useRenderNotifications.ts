/**
 * 🔔 Hook para Notificações de Render em Tempo Real
 * Gerencia conexão SSE e estado das notificações
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface RenderJob {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  script_text: string;
  output_video_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface RenderNotification {
  type: 'render_status_update' | 'connection_established' | 'heartbeat';
  timestamp: string;
  jobId?: string;
  status?: string;
  progress?: number;
  data?: {
    job?: RenderJob;
    errorMessage?: string;
    outputVideoUrl?: string;
  };
}

interface UseRenderNotificationsReturn {
  notifications: RenderNotification[];
  activeJobs: RenderJob[];
  isConnected: boolean;
  connectionError: string | null;
  clearNotifications: () => void;
  retryConnection: () => void;
}

export function useRenderNotifications(userId: string | null): UseRenderNotificationsReturn {
  const [notifications, setNotifications] = useState<RenderNotification[]>([]);
  const [activeJobs, setActiveJobs] = useState<RenderJob[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectToEventSource = useCallback(() => {
    if (!userId || eventSourceRef.current) return;

    try {
      const eventSource = new EventSource(`/api/render/events?userId=${userId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔗 Conectado ao stream de notificações');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const notification: RenderNotification = JSON.parse(event.data);
          
          setNotifications(prev => [...prev, notification]);

          // Processar diferentes tipos de notificação
          switch (notification.type) {
            case 'render_status_update':
              handleRenderStatusUpdate(notification);
              break;
            case 'connection_established':
              console.log('✅ Conexão estabelecida:', notification);
              break;
            case 'heartbeat':
              // Heartbeat silencioso
              break;
          }
        } catch (error) {
          console.error('Erro ao processar notificação:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Erro na conexão SSE:', error);
        setIsConnected(false);
        setConnectionError('Erro na conexão');
        
        eventSource.close();
        eventSourceRef.current = null;

        // Tentar reconectar
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Backoff exponencial
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectToEventSource();
          }, delay);
        }
      };

    } catch (error) {
      console.error('Erro ao criar EventSource:', error);
      setConnectionError('Erro ao conectar');
    }
  }, [userId]);

  const handleRenderStatusUpdate = (notification: RenderNotification) => {
    const { data } = notification;
    if (!data?.job) return;

    const job = data.job;

    // Atualizar lista de jobs ativos
    setActiveJobs(prev => {
      const filtered = prev.filter(j => j.id !== job.id);
      
      // Se o job ainda está ativo, adicionar à lista
      if (job.status === 'pending' || job.status === 'processing') {
        return [...filtered, job];
      }
      
      return filtered;
    });

    // Mostrar toast baseado no status
    switch (job.status) {
      case 'processing':
        toast.info(`🎬 Renderização iniciada`, {
          description: `Processando: ${job.script_text.substring(0, 50)}...`,
          duration: 3000
        });
        break;

      case 'completed':
        toast.success(`✅ Renderização concluída!`, {
          description: `Vídeo pronto para visualização`,
          duration: 5000,
          action: job.output_video_url ? {
            label: 'Ver Vídeo',
            onClick: () => window.open(job.output_video_url, '_blank')
          } : undefined
        });
        break;

      case 'failed':
        toast.error(`❌ Erro na renderização`, {
          description: data.errorMessage || 'Erro desconhecido',
          duration: 7000
        });
        break;
    }
  };

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const retryConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connectToEventSource();
  }, [connectToEventSource]);

  // Buscar jobs ativos iniciais
  useEffect(() => {
    if (!userId) return;

    const fetchActiveJobs = async () => {
      try {
        const response = await fetch(`/api/render/notifications?userId=${userId}`);
        const result = await response.json();
        
        if (result.success) {
          setActiveJobs(result.data.activeJobs);
        }
      } catch (error) {
        console.error('Erro ao buscar jobs ativos:', error);
      }
    };

    fetchActiveJobs();
  }, [userId]);

  // Conectar ao EventSource
  useEffect(() => {
    if (userId) {
      connectToEventSource();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [userId, connectToEventSource]);

  return {
    notifications,
    activeJobs,
    isConnected,
    connectionError,
    clearNotifications,
    retryConnection
  };
}