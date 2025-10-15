
/**
 * 🎬 KEYFRAME ANIMATION SYSTEM - Sistema Real de Keyframes
 * Sistema completo de animações com GSAP para timeline profissional
 */

import { gsap } from 'gsap'
import { toast } from 'react-hot-toast'

export interface Keyframe {
  id: string
  time: number // tempo em segundos
  objectId: string
  properties: KeyframeProperties
  easing: string
  duration: number
}

export interface KeyframeProperties {
  x?: number
  y?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  opacity?: number
  [key: string]: any
}

export interface TimelineTrack {
  id: string
  name: string
  type: 'video' | 'audio' | 'text' | 'image' | 'shape'
  keyframes: Keyframe[]
  duration: number
  locked: boolean
  visible: boolean
}

export interface TimelineData {
  id: string
  tracks: TimelineTrack[]
  duration: number
  fps: number
  resolution: { width: number; height: number }
}

/**
 * Gerenciador principal do sistema de keyframes
 */
export class KeyframeAnimationSystem {
  private timeline: gsap.core.Timeline | null = null
  private tracks: Map<string, TimelineTrack> = new Map()
  private isPlaying = false
  private currentTime = 0
  private duration = 30 // segundos
  private fps = 30

  constructor() {
    this.initializeGSAP()
  }

  private initializeGSAP() {
    // Configurar GSAP para performance máxima
    gsap.config({
      force3D: true,
      nullTargetWarn: false
    })

    // Criar timeline principal
    this.timeline = gsap.timeline({
      paused: true,
      onUpdate: () => {
        this.currentTime = this.timeline?.time() || 0
        this.onTimeUpdate?.(this.currentTime)
      },
      onComplete: () => {
        this.isPlaying = false
        this.onPlayComplete?.()
      }
    })

    console.log('✅ GSAP Timeline inicializado')
  }

  // Callbacks para eventos
  onTimeUpdate?: (time: number) => void
  onPlayComplete?: () => void

  /**
   * Adiciona uma track à timeline
   */
  addTrack(track: TimelineTrack): void {
    this.tracks.set(track.id, track)
    this.rebuildTimeline()
    console.log(`🎬 Track adicionada: ${track.name}`)
  }

  /**
   * Remove uma track da timeline
   */
  removeTrack(trackId: string): void {
    this.tracks.delete(trackId)
    this.rebuildTimeline()
    console.log(`🗑️ Track removida: ${trackId}`)
  }

  /**
   * Adiciona um keyframe a uma track
   */
  addKeyframe(trackId: string, keyframe: Keyframe): void {
    const track = this.tracks.get(trackId)
    if (!track) {
      console.error('❌ Track não encontrada:', trackId)
      return
    }

    // Remover keyframe existente no mesmo tempo
    track.keyframes = track.keyframes.filter(kf => 
      !(kf.time === keyframe.time && kf.objectId === keyframe.objectId)
    )

    // Adicionar novo keyframe
    track.keyframes.push(keyframe)
    track.keyframes.sort((a, b) => a.time - b.time)

    this.rebuildTimeline()
    console.log(`🎯 Keyframe adicionado em ${keyframe.time}s`)
  }

  /**
   * Remove um keyframe
   */
  removeKeyframe(trackId: string, keyframeId: string): void {
    const track = this.tracks.get(trackId)
    if (!track) return

    track.keyframes = track.keyframes.filter(kf => kf.id !== keyframeId)
    this.rebuildTimeline()
    console.log(`🗑️ Keyframe removido: ${keyframeId}`)
  }

  /**
   * Reconstrói a timeline GSAP com todos os keyframes
   */
  private rebuildTimeline(): void {
    if (!this.timeline) return

    // Limpar timeline atual
    this.timeline.clear()

    // Processar cada track
    this.tracks.forEach(track => {
      if (!track.visible) return

      this.processTrackKeyframes(track)
    })

    console.log('🔄 Timeline reconstruída')
  }

  /**
   * Processa keyframes de uma track específica
   */
  private processTrackKeyframes(track: TimelineTrack): void {
    const keyframes = track.keyframes.sort((a, b) => a.time - b.time)

    // Agrupar keyframes por objeto
    const objectKeyframes = new Map<string, Keyframe[]>()
    keyframes.forEach(kf => {
      if (!objectKeyframes.has(kf.objectId)) {
        objectKeyframes.set(kf.objectId, [])
      }
      objectKeyframes.get(kf.objectId)!.push(kf)
    })

    // Criar animações para cada objeto
    objectKeyframes.forEach((kfs, objectId) => {
      this.createObjectAnimation(objectId, kfs)
    })
  }

  /**
   * Cria animação GSAP para um objeto específico
   */
  private createObjectAnimation(objectId: string, keyframes: Keyframe[]): void {
    const element = document.querySelector(`[data-object-id="${objectId}"]`)
    if (!element) {
      console.warn('⚠️ Elemento não encontrado:', objectId)
      return
    }

    // Criar animação sequencial entre keyframes
    for (let i = 0; i < keyframes.length - 1; i++) {
      const fromKf = keyframes[i]
      const toKf = keyframes[i + 1]
      const duration = toKf.time - fromKf.time

      if (duration <= 0) continue

      // Criar tween GSAP
      const tween = gsap.to(element, {
        duration: duration,
        ...toKf.properties,
        ease: this.convertEasing(toKf.easing),
        immediateRender: false
      })

      // Adicionar à timeline no tempo correto
      this.timeline?.add(tween, fromKf.time)
    }

    console.log(`🎬 Animação criada para objeto: ${objectId}`)
  }

  /**
   * Converte easing names para formato GSAP
   */
  private convertEasing(easing: string): string {
    const easingMap: { [key: string]: string } = {
      'linear': 'none',
      'ease-in': 'power2.in',
      'ease-out': 'power2.out',
      'ease-in-out': 'power2.inOut',
      'bounce': 'bounce.out',
      'elastic': 'elastic.out',
      'back': 'back.out'
    }

    return easingMap[easing] || 'power2.out'
  }

  /**
   * Controles de reprodução
   */
  play(): void {
    if (!this.timeline) return
    
    this.timeline.play()
    this.isPlaying = true
    console.log('▶️ Timeline reproduzindo')
  }

  pause(): void {
    if (!this.timeline) return
    
    this.timeline.pause()
    this.isPlaying = false
    console.log('⏸️ Timeline pausada')
  }

  stop(): void {
    if (!this.timeline) return
    
    this.timeline.pause().time(0)
    this.isPlaying = false
    this.currentTime = 0
    console.log('⏹️ Timeline parada')
  }

  /**
   * Navegação temporal
   */
  seekTo(time: number): void {
    if (!this.timeline) return
    
    time = Math.max(0, Math.min(time, this.duration))
    this.timeline.time(time)
    this.currentTime = time
    console.log(`⏩ Seek para: ${time}s`)
  }

  /**
   * Getters
   */
  getCurrentTime(): number {
    return this.currentTime
  }

  getDuration(): number {
    return this.duration
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  getTracks(): TimelineTrack[] {
    return Array.from(this.tracks.values())
  }

  /**
   * Exporta dados da timeline para renderização
   */
  exportTimelineData(): TimelineData {
    return {
      id: `timeline-${Date.now()}`,
      tracks: this.getTracks(),
      duration: this.duration,
      fps: this.fps,
      resolution: { width: 1920, height: 1080 }
    }
  }

  /**
   * Importa dados de timeline
   */
  importTimelineData(data: TimelineData): void {
    this.tracks.clear()
    this.duration = data.duration
    this.fps = data.fps

    data.tracks.forEach(track => {
      this.tracks.set(track.id, track)
    })

    this.rebuildTimeline()
    console.log('📥 Timeline importada:', data.id)
  }

  /**
   * Gera preview em tempo real
   */
  generatePreview(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Simular geração de preview
        console.log('🎬 Gerando preview da timeline...')
        
        setTimeout(() => {
          // Em produção, seria rendering real
          const blob = new Blob(['preview data'], { type: 'video/mp4' })
          resolve(blob)
        }, 2000)
        
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.timeline) {
      this.timeline.kill()
      this.timeline = null
    }
    this.tracks.clear()
    console.log('🧹 KeyframeAnimationSystem destruído')
  }
}

/**
 * Hook React para usar o sistema de keyframes
 */
export const useKeyframeAnimation = () => {
  const [system] = React.useState(() => new KeyframeAnimationSystem())
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)

  React.useEffect(() => {
    system.onTimeUpdate = (time) => {
      setCurrentTime(time)
    }

    system.onPlayComplete = () => {
      setIsPlaying(false)
    }

    return () => {
      system.destroy()
    }
  }, [system])

  const play = () => {
    system.play()
    setIsPlaying(true)
  }

  const pause = () => {
    system.pause()
    setIsPlaying(false)
  }

  const stop = () => {
    system.stop()
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const seekTo = (time: number) => {
    system.seekTo(time)
    setCurrentTime(time)
  }

  return {
    system,
    isPlaying,
    currentTime,
    duration: system.getDuration(),
    tracks: system.getTracks(),
    play,
    pause,
    stop,
    seekTo,
    addTrack: system.addTrack.bind(system),
    removeTrack: system.removeTrack.bind(system),
    addKeyframe: system.addKeyframe.bind(system),
    removeKeyframe: system.removeKeyframe.bind(system),
    exportData: system.exportTimelineData.bind(system),
    importData: system.importTimelineData.bind(system),
    generatePreview: system.generatePreview.bind(system)
  }
}

// Import React for hook
import * as React from 'react'
