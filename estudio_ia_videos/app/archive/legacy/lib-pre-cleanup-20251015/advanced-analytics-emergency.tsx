
'use client'

/**
 * 🚨 EMERGENCY ANALYTICS - ANTI-LOOP VERSION 🚨
 */

import React from 'react'

interface AnalyticsEvent {
  id: string
  type: string
  userId?: string
  sessionId: string
  timestamp: number
  data: Record<string, any>
}

// 🚨 EMERGENCY THROTTLE SYSTEM
const THROTTLE_REGISTRY = new Map<string, number>()
const THROTTLE_DELAY = 2000 // 2 segundos mínimo entre eventos do mesmo tipo

class EmergencyAnalytics {
  private static instance: EmergencyAnalytics
  private sessionId: string
  private events: AnalyticsEvent[] = []
  private isBlocked = false

  private constructor() {
    this.sessionId = 'session_' + Date.now()
    
    // 🚨 Auto-reset se muitos eventos
    setInterval(() => {
      if (this.events.length > 100) {
        console.warn('🚨 [ANALYTICS] Limpando eventos (>100)')
        this.events = this.events.slice(-50)
      }
    }, 30000)
  }

  static getInstance(): EmergencyAnalytics {
    if (!EmergencyAnalytics.instance) {
      EmergencyAnalytics.instance = new EmergencyAnalytics()
    }
    return EmergencyAnalytics.instance
  }

  private shouldThrottle(type: string): boolean {
    const now = Date.now()
    const lastTime = THROTTLE_REGISTRY.get(type) || 0
    
    if (now - lastTime < THROTTLE_DELAY) {
      console.warn(`⏱️ [ANALYTICS] Throttled: ${type}`)
      return true
    }
    
    THROTTLE_REGISTRY.set(type, now)
    return false
  }

  track(type: string, data: Record<string, any> = {}): void {
    // 🛡️ Proteção anti-loop
    if (this.isBlocked) {
      console.warn('⛔ [ANALYTICS] Bloqueado')
      return
    }
    
    // 🚨 Throttling obrigatório
    if (this.shouldThrottle(type)) {
      return
    }
    
    const event: AnalyticsEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      data
    }

    this.events.push(event)
    
    // 🚨 Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [ANALYTICS]', type, data)
    }
    
    // 🚨 Auto-block se muitos eventos muito rápidos
    if (this.events.filter(e => Date.now() - e.timestamp < 10000).length > 20) {
      console.error('🚨 [ANALYTICS] BLOQUEANDO - muitos eventos!')
      this.isBlocked = true
      setTimeout(() => {
        this.isBlocked = false
        console.log('✅ [ANALYTICS] Desbloqueado')
      }, 10000)
    }
  }

  trackPageView(page: string, title?: string): void {
    this.track('page_view', { page, title })
  }

  trackUserAction(action: string, category: string, data: Record<string, any> = {}): void {
    this.track('user_action', { action, category, ...data })
  }

  trackVideoCreation(data: Record<string, any>): void {
    this.track('video_creation', data)
  }

  trackExport(data: Record<string, any>): void {
    this.track('export', data)
  }

  trackFunnelStep(step: string, data: Record<string, any> = {}): void {
    this.track('funnel_step', { step, ...data })
  }

  trackDropoff(point: string, reason?: string): void {
    this.track('dropoff', { point, reason })
  }

  trackError(error: any): void {
    this.track('error', { error: error.toString() })
  }

  getVariant(testName: string, variants: string[]): string {
    const index = Math.abs(this.sessionId.length) % variants.length
    return variants[index]
  }
  
  // 🚨 Emergency controls
  emergency = {
    block: () => { this.isBlocked = true; console.log('🚨 Analytics BLOCKED') },
    unblock: () => { this.isBlocked = false; console.log('✅ Analytics UNBLOCKED') },
    clear: () => { this.events = []; console.log('🗑️ Analytics CLEARED') },
    status: () => ({ 
      isBlocked: this.isBlocked, 
      eventCount: this.events.length,
      recentEvents: this.events.slice(-5)
    })
  }
}

// Export emergency instance
export const emergencyAnalytics = EmergencyAnalytics.getInstance()

// 🚨 SAFE React hooks - with loop protection
export const useEmergencyAnalytics = () => {
  return {
    track: emergencyAnalytics.track.bind(emergencyAnalytics),
    trackPageView: emergencyAnalytics.trackPageView.bind(emergencyAnalytics),
    trackUserAction: emergencyAnalytics.trackUserAction.bind(emergencyAnalytics),
    trackVideoCreation: emergencyAnalytics.trackVideoCreation.bind(emergencyAnalytics),
    trackExport: emergencyAnalytics.trackExport.bind(emergencyAnalytics),
    trackFunnelStep: emergencyAnalytics.trackFunnelStep.bind(emergencyAnalytics),
    trackDropoff: emergencyAnalytics.trackDropoff.bind(emergencyAnalytics),
    getVariant: emergencyAnalytics.getVariant.bind(emergencyAnalytics),
    emergency: emergencyAnalytics.emergency
  }
}

export const useEmergencyPerformanceMonitoring = () => {
  const measureOperation = (operationName: string) => {
    const startTime = Date.now()
    return () => {
      const duration = Date.now() - startTime
      if (duration < 10000) { // Só trackea se não passou de 10s (evita operações travadas)
        emergencyAnalytics.track('performance', { operation: operationName, duration })
      }
    }
  }

  return { measureOperation }
}

// 🚨 EMERGENCY Error Boundary - mais simples e seguro
interface EmergencyErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorCount: number
}

export class EmergencyErrorBoundary extends React.Component<EmergencyErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: EmergencyErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorCount: 0 }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true, errorCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Emergency Error Boundary:', error, errorInfo)
    
    // 🚨 Prevent error tracking loops
    try {
      if (this.state.errorCount < 3) {
        emergencyAnalytics.trackError(error)
        this.setState(prev => ({ ...prev, errorCount: prev.errorCount + 1 }))
      }
    } catch (e) {
      console.warn('Failed to track error:', e)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-red-200">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Sistema de Emergência Ativo</h2>
            <p className="text-red-600 mb-6">A aplicação foi automaticamente protegida contra loops infinitos.</p>
            <div className="space-y-2">
              <button 
                onClick={() => this.setState({ hasError: false, errorCount: 0 })}
                className="block mx-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                🔄 Tentar Novamente
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="block mx-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🔄 Recarregar Página
              </button>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Errors: {this.state.errorCount}/3
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
