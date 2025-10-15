

'use client'

/**
 * 🏠 DASHBOARD HOME - Página Centralizada do Dashboard
 * Página real para o dashboard principal com navegação unificada
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AppShell from '@/components/layouts/AppShell'
import UnifiedDashboard from '@/components/dashboard/unified-dashboard'

export default function DashboardHomePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  useEffect(() => {
    // Se não está autenticado, redirecionar para página principal
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null // Redirecionando...
  }

  return (
    <AppShell
      title="Dashboard Principal"
      description="Centro de controle para criação de vídeos com IA"
      showBreadcrumbs={false}
    >
      <UnifiedDashboard />
    </AppShell>
  )
}
