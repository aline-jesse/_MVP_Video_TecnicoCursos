

'use client'

/**
 * 🚀 Canvas Engine - Optimized Core
 * Performance-first canvas implementation with GPU acceleration
 * Sprint 22 - Performance Optimization Engine
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { FabricManager, useFabric } from '@/lib/fabric-singleton'
import { useCanvasCache } from './cache-manager'
import { usePerformanceMonitor } from './performance-monitor'
import { toast } from 'react-hot-toast'

// Fabric.js dynamic import
let fabric: any = null

interface CanvasEngineProps {
  width?: number
  height?: number
  backgroundColor?: string
  onCanvasReady?: (canvas: any) => void
  onObjectModified?: (object: any) => void
  enableGPUAcceleration?: boolean
}

export default function CanvasEngine({
  width = 1920,
  height = 1080,
  backgroundColor = '#ffffff',
  onCanvasReady,
  onObjectModified,
  enableGPUAcceleration = true
}: CanvasEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gpuEnabled, setGpuEnabled] = useState(false)
  
  // Performance hooks
  const { cacheObject, renderFromCache, clearCache } = useCanvasCache()
  const { startMonitoring, getMetrics } = usePerformanceMonitor()
  
  // Initialize Canvas Engine
  const initializeCanvas = useCallback(async () => {
    if (!canvasRef.current || canvas) return

    try {
      setIsLoading(true)
      
      // Load Fabric.js via singleton
      fabric = await FabricManager.getInstance()
      
      // Create optimized canvas
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor,
        selection: true,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        skipOffscreen: true, // Performance optimization
        enableRetinaScaling: true,
        fireRightClick: true,
        stopContextMenu: true,
        // GPU acceleration settings
        ...(enableGPUAcceleration && {
          imageSmoothingEnabled: true,
          allowTouchScrolling: false,
          isDrawingMode: false
        })
      })

      // Enable GPU acceleration if available
      if (enableGPUAcceleration) {
        try {
          const ctx = fabricCanvas.getContext('2d')
          if (ctx && 'filter' in ctx) {
            setGpuEnabled(true)
            fabricCanvas.contextContainer.imageSmoothingQuality = 'high'
            fabricCanvas.contextTop.imageSmoothingQuality = 'high'
          }
        } catch (error) {
          console.warn('GPU acceleration not available:', error)
        }
      }

      // Performance event listeners
      fabricCanvas.on('object:modified', (e: any) => {
        const obj = e.target
        if (obj) {
          // Cache modified object for performance
          cacheObject(obj.id, fabricCanvas)
          onObjectModified?.(obj)
        }
      })

      fabricCanvas.on('object:added', (e: any) => {
        const obj = e.target
        if (obj && !obj.id) {
          obj.id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      })

      // Optimization: Debounced render
      let renderTimeout: NodeJS.Timeout
      const originalRenderAll = fabricCanvas.renderAll.bind(fabricCanvas)
      fabricCanvas.renderAll = function() {
        clearTimeout(renderTimeout)
        renderTimeout = setTimeout(() => {
          originalRenderAll()
        }, 16) // 60 FPS cap
      }

      setCanvas(fabricCanvas)
      onCanvasReady?.(fabricCanvas)
      
      // Start performance monitoring
      startMonitoring(fabricCanvas)
      
      setIsLoading(false)
      toast.success(`Canvas Engine ${gpuEnabled ? 'GPU' : 'CPU'} Ready`)
      
    } catch (error) {
      console.error('Canvas initialization error:', error)
      setIsLoading(false)
      toast.error('Canvas initialization failed')
    }
  }, [width, height, backgroundColor, onCanvasReady, onObjectModified, enableGPUAcceleration])

  // Cleanup
  useEffect(() => {
    initializeCanvas()
    
    return () => {
      if (canvas) {
        canvas.dispose()
        clearCache()
      }
    }
  }, [initializeCanvas])

  // Performance metrics display
  const metrics = getMetrics()
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing Canvas Engine...</p>
          </div>
        </div>
      )}
      
      {/* Performance Badge */}
      {!isLoading && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-mono">
            {gpuEnabled ? '⚡ GPU' : '🔧 CPU'}
          </div>
          <div className="bg-green-600/80 text-white px-2 py-1 rounded text-xs font-mono">
            {metrics.fps.toFixed(0)} FPS
          </div>
          <div className="bg-blue-600/80 text-white px-2 py-1 rounded text-xs font-mono">
            {metrics.objectCount} obj
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="block border border-gray-200 rounded-lg shadow-lg"
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100vh',
          imageRendering: gpuEnabled ? 'crisp-edges' : 'auto'
        }}
      />
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white p-2 rounded text-xs font-mono max-w-xs">
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
          <div>Cache Hit Rate: {metrics.cacheHitRate.toFixed(1)}%</div>
        </div>
      )}
    </div>
  )
}

// Export performance utilities
export const CanvasUtils = {
  optimizeForMobile: (canvas: any) => {
    if (canvas) {
      canvas.selection = false
      canvas.skipOffscreen = true
      canvas.renderOnAddRemove = false
    }
  },
  
  optimizeForDesktop: (canvas: any) => {
    if (canvas) {
      canvas.selection = true
      canvas.skipOffscreen = false
      canvas.renderOnAddRemove = true
    }
  },
  
  enablePerformanceMode: (canvas: any) => {
    if (canvas) {
      canvas.renderAll = canvas.renderAll.bind(canvas)
      canvas.skipOffscreen = true
      canvas.imageSmoothingEnabled = false
    }
  }
}

