

/**
 * PPTX Metrics System for Sprint 6
 * Track and analyze PPTX conversion performance
 */

export interface PPTXConversionMetrics {
  conversionId: string
  fileName: string
  fileSize: number
  slideCount: number
  processingTime: number
  qualityScore: number
  narrationTime: number
  templatesUsed: string[]
  voiceConfig: {
    voiceId: string
    language: string
    speed: number
  }
  success: boolean
  errors: string[]
  createdAt: string
}

export interface PPTXPerformanceStats {
  totalConversions: number
  successRate: number
  averageProcessingTime: number
  averageSlideCount: number
  mostUsedTemplates: Array<{
    templateId: string
    usage: number
  }>
  mostUsedVoices: Array<{
    voiceId: string
    usage: number
  }>
  errorBreakdown: Array<{
    error: string
    count: number
  }>
  trendData: Array<{
    date: string
    conversions: number
    successRate: number
    avgProcessingTime: number
  }>
}

export interface PPTXQualityMetrics {
  contentAnalysis: {
    averageTextLength: number
    slidesWithImages: number
    slidesWithNotes: number
    slidesWithLongContent: number
  }
  narrationAnalysis: {
    totalAudioDuration: number
    averageSegmentDuration: number
    segmentCount: number
    estimatedCost: number
  }
  templateAnalysis: {
    autoSelectedTemplates: number
    manuallyChangedTemplates: number
    templateDistribution: Record<string, number>
  }
}

/**
 * PPTX Metrics Collector
 */
export class PPTXMetricsCollector {
  
  private static metrics: PPTXConversionMetrics[] = []
  
  /**
   * Record a PPTX conversion
   */
  static recordConversion(metrics: PPTXConversionMetrics): void {
    this.metrics.push(metrics)
    
    // In production, this would save to database
    console.log('PPTX Conversion recorded:', metrics.conversionId)
    
    // Send to analytics
    this.sendToAnalytics(metrics)
  }
  
  /**
   * Get performance statistics
   */
  static getPerformanceStats(daysBack: number = 30): PPTXPerformanceStats {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)
    
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.createdAt) >= cutoffDate
    )
    
    if (recentMetrics.length === 0) {
      return this.getEmptyStats()
    }
    
    const successfulConversions = recentMetrics.filter(m => m.success)
    const successRate = (successfulConversions.length / recentMetrics.length) * 100
    
    // Calculate averages
    const avgProcessingTime = successfulConversions.reduce((sum, m) => sum + m.processingTime, 0) / successfulConversions.length
    const avgSlideCount = successfulConversions.reduce((sum, m) => sum + m.slideCount, 0) / successfulConversions.length
    
    // Template usage
    const templateUsage = new Map<string, number>()
    successfulConversions.forEach(m => {
      m.templatesUsed.forEach(templateId => {
        templateUsage.set(templateId, (templateUsage.get(templateId) || 0) + 1)
      })
    })
    
    // Voice usage
    const voiceUsage = new Map<string, number>()
    successfulConversions.forEach(m => {
      const voiceId = m.voiceConfig.voiceId
      voiceUsage.set(voiceId, (voiceUsage.get(voiceId) || 0) + 1)
    })
    
    // Error breakdown
    const errorCount = new Map<string, number>()
    recentMetrics.filter(m => !m.success).forEach(m => {
      m.errors.forEach(error => {
        errorCount.set(error, (errorCount.get(error) || 0) + 1)
      })
    })
    
    // Trend data (daily breakdown)
    const trendData = this.calculateTrendData(recentMetrics, daysBack)
    
    return {
      totalConversions: recentMetrics.length,
      successRate: Math.round(successRate * 10) / 10,
      averageProcessingTime: Math.round(avgProcessingTime),
      averageSlideCount: Math.round(avgSlideCount * 10) / 10,
      mostUsedTemplates: Array.from(templateUsage.entries())
        .map(([templateId, usage]) => ({ templateId, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5),
      mostUsedVoices: Array.from(voiceUsage.entries())
        .map(([voiceId, usage]) => ({ voiceId, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5),
      errorBreakdown: Array.from(errorCount.entries())
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count),
      trendData
    }
  }
  
  /**
   * Get quality metrics
   */
  static getQualityMetrics(daysBack: number = 30): PPTXQualityMetrics {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)
    
    const recentMetrics = this.metrics.filter(m => 
      new Date(m.createdAt) >= cutoffDate && m.success
    )
    
    if (recentMetrics.length === 0) {
      return this.getEmptyQualityMetrics()
    }
    
    // Mock quality analysis (in production, this would use real data)
    return {
      contentAnalysis: {
        averageTextLength: 150,
        slidesWithImages: Math.round(recentMetrics.length * 0.7),
        slidesWithNotes: Math.round(recentMetrics.length * 0.4),
        slidesWithLongContent: Math.round(recentMetrics.length * 0.2)
      },
      narrationAnalysis: {
        totalAudioDuration: recentMetrics.reduce((sum, m) => sum + m.narrationTime, 0),
        averageSegmentDuration: 8.5,
        segmentCount: recentMetrics.reduce((sum, m) => sum + m.slideCount * 2, 0),
        estimatedCost: recentMetrics.length * 0.15
      },
      templateAnalysis: {
        autoSelectedTemplates: Math.round(recentMetrics.length * 0.8),
        manuallyChangedTemplates: Math.round(recentMetrics.length * 0.2),
        templateDistribution: {
          'title-bullets-1': 40,
          'two-columns-1': 25,
          'title-image-1': 20,
          'highlight-1': 10,
          'image-full-1': 5
        }
      }
    }
  }
  
  /**
   * Calculate trend data
   */
  private static calculateTrendData(metrics: PPTXConversionMetrics[], daysBack: number) {
    const trendData = []
    const today = new Date()
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayMetrics = metrics.filter(m => 
        m.createdAt.startsWith(dateStr)
      )
      
      const successfulDayMetrics = dayMetrics.filter(m => m.success)
      const successRate = dayMetrics.length > 0 ? 
        (successfulDayMetrics.length / dayMetrics.length) * 100 : 0
      
      const avgProcessingTime = successfulDayMetrics.length > 0 ?
        successfulDayMetrics.reduce((sum, m) => sum + m.processingTime, 0) / successfulDayMetrics.length : 0
      
      trendData.push({
        date: dateStr,
        conversions: dayMetrics.length,
        successRate: Math.round(successRate * 10) / 10,
        avgProcessingTime: Math.round(avgProcessingTime)
      })
    }
    
    return trendData
  }
  
  /**
   * Send metrics to analytics
   */
  private static sendToAnalytics(metrics: PPTXConversionMetrics): void {
    // In production, this would send to a real analytics service
    if (typeof window !== 'undefined') {
      console.log('Analytics: PPTX conversion', {
        success: metrics.success,
        slideCount: metrics.slideCount,
        processingTime: metrics.processingTime,
        qualityScore: metrics.qualityScore
      })
    }
  }
  
  /**
   * Get empty stats structure
   */
  private static getEmptyStats(): PPTXPerformanceStats {
    return {
      totalConversions: 0,
      successRate: 0,
      averageProcessingTime: 0,
      averageSlideCount: 0,
      mostUsedTemplates: [],
      mostUsedVoices: [],
      errorBreakdown: [],
      trendData: []
    }
  }
  
  /**
   * Get empty quality metrics
   */
  private static getEmptyQualityMetrics(): PPTXQualityMetrics {
    return {
      contentAnalysis: {
        averageTextLength: 0,
        slidesWithImages: 0,
        slidesWithNotes: 0,
        slidesWithLongContent: 0
      },
      narrationAnalysis: {
        totalAudioDuration: 0,
        averageSegmentDuration: 0,
        segmentCount: 0,
        estimatedCost: 0
      },
      templateAnalysis: {
        autoSelectedTemplates: 0,
        manuallyChangedTemplates: 0,
        templateDistribution: {}
      }
    }
  }
  
  /**
   * Export metrics for reporting
   */
  static exportMetrics(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return {
        performance: this.getPerformanceStats(),
        quality: this.getQualityMetrics(),
        rawData: this.metrics,
        exportedAt: new Date().toISOString()
      }
    }
    
    // CSV export would be implemented here
    return null
  }
}

/**
 * PPTX Cost Calculator
 */
export class PPTXCostCalculator {
  
  private static readonly COSTS = {
    ttsPerCharacter: 0.000016, // Mock pricing
    processingPerSlide: 0.02,
    storagePerMB: 0.001,
    renderingPerSecond: 0.05
  }
  
  /**
   * Calculate total cost for PPTX conversion
   */
  static calculateConversionCost(
    slideCount: number,
    totalTextLength: number,
    totalDuration: number,
    fileSize: number
  ): {
    tts: number
    processing: number
    storage: number
    rendering: number
    total: number
  } {
    
    const tts = totalTextLength * this.COSTS.ttsPerCharacter
    const processing = slideCount * this.COSTS.processingPerSlide
    const storage = (fileSize / 1024 / 1024) * this.COSTS.storagePerMB
    const rendering = totalDuration * this.COSTS.renderingPerSecond
    const total = tts + processing + storage + rendering
    
    return {
      tts: Math.round(tts * 100) / 100,
      processing: Math.round(processing * 100) / 100,
      storage: Math.round(storage * 100) / 100,
      rendering: Math.round(rendering * 100) / 100,
      total: Math.round(total * 100) / 100
    }
  }
  
  /**
   * Estimate cost before conversion
   */
  static estimateCost(slideCount: number, avgTextPerSlide: number): number {
    const totalText = slideCount * avgTextPerSlide
    const estimatedDuration = slideCount * 15 // 15 seconds per slide
    const estimatedFileSize = 10 * 1024 * 1024 // 10MB estimate
    
    const cost = this.calculateConversionCost(slideCount, totalText, estimatedDuration, estimatedFileSize)
    return cost.total
  }
}
