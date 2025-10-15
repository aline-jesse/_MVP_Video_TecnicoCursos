
'use client'

// Utility para debuggar loops infinitos em useEffect
class EffectDebugger {
  private static instance: EffectDebugger
  private effectCounts: Map<string, number> = new Map()
  private effectTimestamps: Map<string, number[]> = new Map()
  
  public static getInstance(): EffectDebugger {
    if (!EffectDebugger.instance) {
      EffectDebugger.instance = new EffectDebugger()
    }
    return EffectDebugger.instance
  }

  public trackEffect(componentName: string, effectName: string, dependencies?: readonly any[]): void {
    const key = `${componentName}:${effectName}`
    const count = (this.effectCounts.get(key) || 0) + 1
    const timestamps = this.effectTimestamps.get(key) || []
    const now = Date.now()
    
    // Manter apenas últimos 10 timestamps
    timestamps.push(now)
    if (timestamps.length > 10) {
      timestamps.shift()
    }
    
    this.effectCounts.set(key, count)
    this.effectTimestamps.set(key, timestamps)
    
    // Detectar execuções muito frequentes (mais de 5 em 1 segundo)
    const recentTimestamps = timestamps.filter(t => now - t < 1000)
    if (recentTimestamps.length > 5) {
      console.error(`🚨 POSSÍVEL LOOP INFINITO DETECTADO!`)
      console.error(`Component: ${componentName}`)
      console.error(`Effect: ${effectName}`)
      console.error(`Execuções em 1 segundo: ${recentTimestamps.length}`)
      console.error(`Total de execuções: ${count}`)
      console.error(`Dependencies:`, dependencies)
      console.trace(`Stack trace do loop:`)
    }
    
    // Log para monitoramento
    if (count > 100) {
      console.warn(`⚠️ Effect executou ${count} vezes: ${key}`)
    }
  }

  public getStats(): { [key: string]: number } {
    return Object.fromEntries(this.effectCounts)
  }

  public reset(): void {
    this.effectCounts.clear()
    this.effectTimestamps.clear()
  }
}

// Hook para debuggar useEffect
export function useEffectDebugger(
  componentName: string, 
  effectName: string, 
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const effectDebugger = EffectDebugger.getInstance()
  
  // Em development, track o effect
  if (process.env.NODE_ENV === 'development') {
    effectDebugger.trackEffect(componentName, effectName, deps)
  }
  
  return { effect, deps }
}

// Utility para verificar re-renders excessivos
export function useRenderCounter(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    // Inicializar contadores se não existirem
    if (!(window as any)._renderCounts) {
      (window as any)._renderCounts = {}
    }
    
    // Incrementar contador para o componente
    const currentCount = (window as any)._renderCounts[componentName] || 0
    const renderCount = currentCount + 1
    ;(window as any)._renderCounts[componentName] = renderCount
    
    if (renderCount > 50) {
      console.warn(`⚠️ Component renderizou ${renderCount} vezes: ${componentName}`)
    }
    
    if (renderCount > 100) {
      console.error(`🚨 POSSÍVEL RE-RENDER INFINITO: ${componentName}`)
      console.trace('Stack trace:')
    }
  }
}
