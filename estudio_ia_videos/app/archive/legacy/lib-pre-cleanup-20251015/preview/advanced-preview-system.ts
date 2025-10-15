

/**
 * Sprint 7 - Sistema de Preview Avançado
 * Preview otimizado com cache e pré-renderização
 */

import { intelligentCache, renderCache } from '../cache/intelligent-cache'
import { performanceOptimizer } from '../optimization/performance-optimizer'

interface PreviewConfig {
  quality: 'low' | 'medium' | 'high'
  resolution: '480p' | '720p' | '1080p'
  framerate: 24 | 30 | 60
  format: 'webm' | 'mp4'
  preload: boolean
}

interface PreviewResult {
  previewUrl: string
  thumbnailUrl: string
  duration: number
  fileSize: number
  quality: string
  cached: boolean
  generationTime: number
}

export class AdvancedPreviewSystem {
  private static instance: AdvancedPreviewSystem
  private previewQueue: Map<string, Promise<PreviewResult>> = new Map()
  private thumbnailCache = new Map<string, string>()

  static getInstance(): AdvancedPreviewSystem {
    if (!AdvancedPreviewSystem.instance) {
      AdvancedPreviewSystem.instance = new AdvancedPreviewSystem()
    }
    return AdvancedPreviewSystem.instance
  }

  /**
   * Generate optimized preview with caching
   */
  async generatePreview(
    sceneData: any, 
    templateId: string, 
    config: Partial<PreviewConfig> = {}
  ): Promise<PreviewResult> {
    const fullConfig: PreviewConfig = {
      quality: 'medium',
      resolution: '720p',
      framerate: 30,
      format: 'webm',
      preload: true,
      ...config
    }
    
    const cacheKey = this.generatePreviewCacheKey(sceneData, templateId, fullConfig)
    
    // Check if preview is already being generated
    if (this.previewQueue.has(cacheKey)) {
      return await this.previewQueue.get(cacheKey)!
    }
    
    // Check cache first
    const cached = renderCache.get<PreviewResult>(cacheKey)
    if (cached) {
      return {
        ...cached,
        cached: true,
        generationTime: 0
      }
    }
    
    // Generate new preview
    const previewPromise = this.performPreviewGeneration(sceneData, templateId, fullConfig)
    this.previewQueue.set(cacheKey, previewPromise)
    
    try {
      const result = await previewPromise
      
      // Cache the result
      renderCache.set(cacheKey, result, {
        priority: fullConfig.quality === 'high' ? 'high' : 'medium',
        tags: ['preview', templateId, fullConfig.resolution, sceneData.type || 'general']
      })
      
      return result
      
    } finally {
      this.previewQueue.delete(cacheKey)
    }
  }

  /**
   * Generate batch previews with optimization
   */
  async generateBatchPreviews(
    scenes: Array<{ sceneData: any, templateId: string }>,
    config: Partial<PreviewConfig> = {}
  ): Promise<PreviewResult[]> {
    const startTime = performance.now()
    
    // Group scenes by template for efficient processing
    const templateGroups = new Map<string, any[]>()
    scenes.forEach(({ sceneData, templateId }) => {
      if (!templateGroups.has(templateId)) {
        templateGroups.set(templateId, [])
      }
      templateGroups.get(templateId)!.push(sceneData)
    })
    
    const results: PreviewResult[] = []
    
    // Process each template group
    for (const [templateId, sceneDataList] of templateGroups.entries()) {
      const groupResults = await Promise.all(
        sceneDataList.map(sceneData => 
          this.generatePreview(sceneData, templateId, config)
        )
      )
      results.push(...groupResults)
    }
    
    const processingTime = performance.now() - startTime
    console.log(`Batch preview generation completed in ${processingTime.toFixed(2)}ms`)
    
    return results
  }

  /**
   * Generate instant thumbnail for quick preview
   */
  async generateInstantThumbnail(sceneData: any, templateId: string): Promise<string> {
    const thumbnailKey = `thumb_${templateId}_${JSON.stringify(sceneData).substring(0, 100)}`
    
    // Check thumbnail cache
    if (this.thumbnailCache.has(thumbnailKey)) {
      return this.thumbnailCache.get(thumbnailKey)!
    }
    
    // Generate thumbnail
    const thumbnailUrl = await this.performThumbnailGeneration(sceneData, templateId)
    
    // Cache thumbnail
    this.thumbnailCache.set(thumbnailKey, thumbnailUrl)
    
    return thumbnailUrl
  }

  /**
   * Preload previews for better UX
   */
  async preloadPreviews(scenes: Array<{ sceneData: any, templateId: string }>): Promise<void> {
    // Preload first 3 previews for immediate display
    const priorityScenes = scenes.slice(0, 3)
    
    const preloadPromises = priorityScenes.map(({ sceneData, templateId }) =>
      this.generatePreview(sceneData, templateId, { 
        quality: 'low', 
        resolution: '480p',
        preload: true 
      })
    )
    
    // Start preloading without waiting
    Promise.all(preloadPromises).catch(console.error)
    
    // Generate thumbnails for all scenes
    const thumbnailPromises = scenes.map(({ sceneData, templateId }) =>
      this.generateInstantThumbnail(sceneData, templateId)
    )
    
    await Promise.all(thumbnailPromises)
  }

  /**
   * Generate cache key for preview
   */
  private generatePreviewCacheKey(sceneData: any, templateId: string, config: PreviewConfig): string {
    const dataHash = JSON.stringify({ 
      title: sceneData.title,
      content: sceneData.content,
      type: sceneData.type 
    })
    
    return `preview_${templateId}_${config.quality}_${config.resolution}_${dataHash.substring(0, 32)}`
  }

  /**
   * Perform actual preview generation (mock implementation)
   */
  private async performPreviewGeneration(
    sceneData: any, 
    templateId: string, 
    config: PreviewConfig
  ): Promise<PreviewResult> {
    const startTime = performance.now()
    
    // Simulate rendering time based on quality
    const renderTime = config.quality === 'high' ? 3000 : 
                      config.quality === 'medium' ? 1500 : 500
    
    await new Promise(resolve => setTimeout(resolve, renderTime))
    
    const generationTime = performance.now() - startTime
    
    return {
      previewUrl: `/api/previews/${Date.now()}_${templateId}.${config.format}`,
      thumbnailUrl: `/api/thumbnails/${Date.now()}_${templateId}.jpg`,
      duration: sceneData.estimatedDuration || 15,
      fileSize: config.quality === 'high' ? 5000000 : 
                config.quality === 'medium' ? 2000000 : 800000,
      quality: config.quality,
      cached: false,
      generationTime
    }
  }

  /**
   * Perform thumbnail generation
   */
  private async performThumbnailGeneration(sceneData: any, templateId: string): Promise<string> {
    // Simulate thumbnail generation
    await new Promise(resolve => setTimeout(resolve, 200))
    return `/api/thumbnails/thumb_${templateId}_${Date.now()}.jpg`
  }

  /**
   * Get preview system statistics
   */
  getPreviewStats(): any {
    return {
      cacheStats: renderCache.getStats(),
      queueSize: this.previewQueue.size,
      thumbnailCacheSize: this.thumbnailCache.size,
      performanceInsights: performanceOptimizer.getPerformanceInsights()
    }
  }

  /**
   * Clear preview cache
   */
  clearPreviewCache(): void {
    renderCache.clear()
    this.thumbnailCache.clear()
    this.previewQueue.clear()
  }
}

export const advancedPreviewSystem = AdvancedPreviewSystem.getInstance()
