
/**
 * 🎨 FABRIC.JS LOCAL MANAGER (OPTIMIZED)
 * ✅ CORRIGIDO Sprint 43: Usa versão local instalada via yarn
 * ✅ Client-only (SSR safe)
 * ✅ Sem dependência de CDN externo
 */

'use client'

import React from 'react'

declare global {
  interface Window {
    fabric?: any
    fabricLoaded?: boolean
  }
}

let fabricInstance: any = null
let fabricPromise: Promise<any> | null = null

export class FabricManager {
  static async getInstance(): Promise<any> {
    // Se estamos no servidor, retorna null
    if (typeof window === 'undefined') {
      return null
    }

    // Se já existe instância, retorna
    if (fabricInstance) {
      return fabricInstance
    }

    // Se já carregou via window, usa ela
    if (window.fabric && window.fabricLoaded) {
      fabricInstance = window.fabric
      return fabricInstance
    }

    // Se já está carregando, retorna a promise
    if (fabricPromise) {
      return fabricPromise
    }

    // ✅ Usa window.fabric se já está disponível (via CDN carregado previamente)
    fabricPromise = new Promise(async (resolve, reject) => {
      // Se window.fabric já existe, usa ele
      if (window.fabric) {
        fabricInstance = window.fabric
        window.fabricLoaded = true
        this.applyFixes(fabricInstance)
        console.log('✅ Fabric.js carregado (via global window)')
        resolve(fabricInstance)
        return
      }

      // Aguarda um pouco para ver se o fabric carrega via script externo
      let attempts = 0
      const checkInterval = setInterval(() => {
        attempts++
        if (window.fabric) {
          clearInterval(checkInterval)
          fabricInstance = window.fabric
          window.fabricLoaded = true
          this.applyFixes(fabricInstance)
          console.log('✅ Fabric.js carregado (via global window - aguardado)')
          resolve(fabricInstance)
        } else if (attempts > 50) {
          // Timeout após 5 segundos
          clearInterval(checkInterval)
          console.error('❌ Fabric.js não disponível no window após timeout')
          reject(new Error('Fabric.js não disponível'))
          fabricPromise = null
        }
      }, 100)
    })
    
    return fabricPromise
  }

  // Aplica correções conhecidas no Fabric.js
  static applyFixes(fabric: any) {
    if (!fabric) return

    // Corrigir problemas de CanvasTextBaseline
    if (fabric.util && fabric.util.object) {
      const originalExtend = fabric.util.object.extend
      fabric.util.object.extend = function(destination: any, source: any) {
        if (source && typeof source === 'object') {
          const cleanSource = { ...source }
          if (cleanSource.textBaseline === 'alphabetical') {
            cleanSource.textBaseline = 'alphabetic'
          }
          return originalExtend.call(this, destination, cleanSource)
        }
        return originalExtend.call(this, destination, source)
      }
    }

    console.log('✅ Fabric.js LOCAL carregado com sucesso (via yarn) - Sprint 43')
  }

  static isLoaded(): boolean {
    return fabricInstance !== null
  }

  static getInstance_sync(): any {
    return fabricInstance || (typeof window !== 'undefined' && window.fabric ? window.fabric : null)
  }
}

// Hook personalizado para React
export function useFabric() {
  const [fabric, setFabric] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let mounted = true

    const loadFabric = async () => {
      try {
        setLoading(true)
        const fabricInstance = await FabricManager.getInstance()
        
        if (mounted) {
          setFabric(fabricInstance)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error)
          setFabric(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadFabric()

    return () => {
      mounted = false
    }
  }, [])

  return { fabric, loading, error }
}

export default FabricManager
