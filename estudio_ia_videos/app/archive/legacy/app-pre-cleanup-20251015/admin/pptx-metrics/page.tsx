

'use client'

import { PPTXMetricsDashboard } from '../../../components/pptx/pptx-metrics-dashboard'
import { Button } from '../../../components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'

export default function PPTXMetricsPage() {
  const router = useRouter()

  const handleExportMetrics = async () => {
    try {
      const response = await fetch('/api/pptx/metrics?type=export')
      const data = await response.json()
      
      if (data.success) {
        // Create download
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pptx-metrics-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting metrics:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/metrics')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para Admin
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button
                onClick={handleExportMetrics}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Métricas PPTX Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Dashboard detalhado do sistema de conversão PPTX para vídeo (Sprint 6)
            </p>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <PPTXMetricsDashboard />
        
      </div>
    </div>
  )
}
