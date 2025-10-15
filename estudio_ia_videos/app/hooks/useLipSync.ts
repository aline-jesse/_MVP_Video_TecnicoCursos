
/**
 * 🎤 useLipSync Hook
 * Hook para sincronização de movimentos labiais com áudio TTS
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { LipSyncFrame, avatarEngine } from '@/lib/avatar-engine';

export interface LipSyncState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentFrame: LipSyncFrame | null;
  progress: number;
}

export interface UseLipSyncOptions {
  text: string;
  audioUrl: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useLipSync({ text, audioUrl, onComplete, onError }: UseLipSyncOptions) {
  const [state, setState] = useState<LipSyncState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentFrame: null,
    progress: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const framesRef = useRef<LipSyncFrame[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  /**
   * Inicializa áudio e gera frames de lip sync
   */
  useEffect(() => {
    if (!audioUrl || !text) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Quando o áudio carregar, gera os frames
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration * 1000; // Converter para ms
      setState(prev => ({ ...prev, duration }));

      // Gera frames de sincronização labial
      const frames = avatarEngine.generateLipSyncFrames(text, audioUrl, audio.duration);
      framesRef.current = frames;
    });

    audio.addEventListener('ended', () => {
      setState(prev => ({ ...prev, isPlaying: false, progress: 100 }));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onComplete?.();
    });

    audio.addEventListener('error', (e) => {
      const error = new Error(`Erro ao carregar áudio: ${e.type}`);
      onError?.(error);
    });

    return () => {
      audio.pause();
      audio.remove();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl, text, onComplete, onError]);

  /**
   * Loop de atualização de frame
   */
  const updateFrame = useCallback(() => {
    if (!audioRef.current || !state.isPlaying) return;

    const currentTime = (performance.now() - startTimeRef.current);
    const audio = audioRef.current;

    // Sincroniza com o tempo real do áudio
    const audioTime = audio.currentTime * 1000;

    // Busca o frame correspondente ao tempo atual
    const frame = avatarEngine.getLipSyncFrameAtTime(framesRef.current, audioTime);

    if (frame) {
      setState(prev => ({
        ...prev,
        currentTime: audioTime,
        currentFrame: frame,
        progress: (audioTime / prev.duration) * 100
      }));
    }

    // Continua o loop
    animationFrameRef.current = requestAnimationFrame(updateFrame);
  }, [state.isPlaying]);

  /**
   * Inicia reprodução
   */
  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
      startTimeRef.current = performance.now() - (audioRef.current.currentTime * 1000);
      setState(prev => ({ ...prev, isPlaying: true }));
      
      // Inicia loop de atualização
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [updateFrame, onError]);

  /**
   * Pausa reprodução
   */
  const pause = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  /**
   * Para e reseta
   */
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentFrame: null,
      progress: 0
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  /**
   * Busca tempo específico
   */
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = time / 1000; // Converter ms para segundos
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  return {
    state,
    play,
    pause,
    stop,
    seek,
    frames: framesRef.current
  };
}
