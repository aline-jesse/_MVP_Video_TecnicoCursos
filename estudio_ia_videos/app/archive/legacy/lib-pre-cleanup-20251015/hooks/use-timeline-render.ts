
/**
 * Hook para integração Timeline → Render
 */
'use client';

import { useState, useCallback } from 'react';

interface RenderSettings {
  resolution: '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
  format: 'mp4' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  audio: boolean;
}

interface TimelineRenderOptions {
  projectId: string;
  timelineId: string;
  projectName: string;
  duration: number;
  clips: any[];
  settings: RenderSettings;
}

export function useTimelineRender() {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTimelineRender = useCallback(async (options: TimelineRenderOptions) => {
    try {
      setIsRendering(true);
      setError(null);
      setRenderProgress(0);

      // Preparar composição FFmpeg
      const composition = await prepareComposition(options);

      // Iniciar render (API simulada por enquanto)
      const response = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: options.projectId,
          composition,
          settings: options.settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar render');
      }

      const result = await response.json();
      setRenderJobId(result.jobId);

      // Simular progresso (TODO: implementar polling real)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setRenderProgress(progress);

        if (progress >= 100) {
          setIsRendering(false);
          clearInterval(interval);
        }
      }, 1000);

      return result;
    } catch (err) {
      setIsRendering(false);
      setError(err instanceof Error ? err.message : 'Erro ao renderizar');
      throw err;
    }
  }, []);

  const cancelRender = useCallback(async () => {
    if (renderJobId) {
      try {
        await fetch(`/api/render/cancel/${renderJobId}`, { method: 'POST' });
        setIsRendering(false);
        setRenderJobId(null);
      } catch (err) {
        console.error('Erro ao cancelar render:', err);
      }
    }
  }, [renderJobId]);

  const reset = useCallback(() => {
    setIsRendering(false);
    setRenderProgress(0);
    setRenderJobId(null);
    setError(null);
  }, []);

  return {
    isRendering,
    renderProgress,
    renderJobId,
    error,
    startTimelineRender,
    cancelRender,
    reset,
  };
}

/**
 * Preparar composição FFmpeg a partir da timeline
 */
async function prepareComposition(options: TimelineRenderOptions) {
  const response = await fetch('/api/timeline/prepare-composition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timelineId: options.timelineId,
      clips: options.clips,
      duration: options.duration,
      settings: options.settings,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao preparar composição');
  }

  return response.json();
}
