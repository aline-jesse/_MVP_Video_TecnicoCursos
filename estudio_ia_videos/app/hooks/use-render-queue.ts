
/**
 * Hook para gerenciar render queue
 * Sprint 48 - FASE 3
 */

import { useState, useCallback, useEffect } from 'react';
import { useAnalyticsTrack } from './use-analytics-track';

export interface RenderConfig {
  resolution?: '720p' | '1080p' | '4k';
  fps?: number;
  format?: 'mp4' | 'webm' | 'mov';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  withAudio?: boolean;
  withSubtitles?: boolean;
  avatarEngine?: 'azure' | 'elevenlabs' | 'vidnoz';
  priority?: number;
}

export interface RenderStatus {
  status: string;
  jobId: string;
  progress?: number;
  result?: {
    success: boolean;
    videoUrl?: string;
    duration?: number;
    error?: string;
  };
  error?: string;
}

export function useRenderQueue(projectId: string) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<RenderStatus | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { trackRenderStart, trackRenderComplete, trackRenderError } = useAnalyticsTrack();

  /**
   * Inicia um novo render
   */
  const startRender = useCallback(async (config?: RenderConfig) => {
    try {
      setIsRendering(true);
      setError(null);

      // Track início
      await trackRenderStart(projectId);

      const response = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          config: config || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao iniciar render');
      }

      const data = await response.json();
      setJobId(data.jobId);
      
      return data.jobId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      await trackRenderError(projectId, errorMessage);
      throw err;
    }
  }, [projectId, trackRenderStart, trackRenderError]);

  /**
   * Verifica status do render
   */
  const checkStatus = useCallback(async (jId?: string) => {
    const targetJobId = jId || jobId;
    if (!targetJobId) return null;

    try {
      const response = await fetch(`/api/render/status?jobId=${targetJobId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status');
      }

      const data = await response.json();
      setStatus(data);

      // Se completo, track analytics
      if (data.status === 'completed' && data.result?.success) {
        setIsRendering(false);
        await trackRenderComplete(projectId, data.result.duration || 0);
      }

      // Se erro, track analytics
      if (data.status === 'failed') {
        setIsRendering(false);
        await trackRenderError(projectId, data.error || 'Render falhou');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    }
  }, [jobId, projectId, trackRenderComplete, trackRenderError]);

  /**
   * Polling automático de status
   */
  useEffect(() => {
    if (!jobId || !isRendering) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 2000); // Check a cada 2 segundos

    return () => clearInterval(interval);
  }, [jobId, isRendering, checkStatus]);

  /**
   * Reset
   */
  const reset = useCallback(() => {
    setJobId(null);
    setStatus(null);
    setIsRendering(false);
    setError(null);
  }, []);

  return {
    startRender,
    checkStatus,
    reset,
    jobId,
    status,
    isRendering,
    error,
    progress: status?.progress || 0,
    isComplete: status?.status === 'completed',
    isFailed: status?.status === 'failed',
    videoUrl: status?.result?.videoUrl
  };
}
