

'use client'

/**
 * 🛡️ TEMPLATES NR ESPECÍFICOS - Sprint 17
 * Página principal dos templates NR com compliance automático
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AppShell from '@/components/layouts/AppShell'
import NRTemplatesEnhanced from '@/components/nr-templates/nr-templates-enhanced'
import { EmergencyErrorBoundary } from '@/lib/advanced-analytics-emergency'
import { Loader2 } from 'lucide-react'

function SafeTemplatesNRContent() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AppShell 
      title="Templates NR Compliance Pro"
      description="Templates profissionais com compliance automático para Normas Regulamentadoras"
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Templates NR', href: '/templates-nr-especificos' }
      ]}
    >
      <NRTemplatesEnhanced />
    </AppShell>
  )
}

export default function TemplatesNREspecificosPage() {
  return (
    <EmergencyErrorBoundary>
      <SafeTemplatesNRContent />
    </EmergencyErrorBoundary>
  )
}

