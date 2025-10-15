

'use client'

/**
 * ⚖️ PÁGINA NR COMPLIANCE ENGINE - Sprint 17
 * Sistema avançado de compliance para Normas Regulamentadoras
 */

import React from 'react'
import AppShell from '../../components/layouts/AppShell'
import NRComplianceEngine from '../../components/templates/nr-compliance-engine'
import { Shield, Scale, CheckCircle } from 'lucide-react'

export default function NRCompliancePage() {
  return (
    <AppShell
      breadcrumbs={[
        { href: '/', label: 'Início' },
        { href: '/nr-compliance', label: 'NR Compliance' }
      ]}
      title="Sistema NR Compliance"
      description="Validação jurídica e conformidade automática com Normas Regulamentadoras brasileiras"
    >
      <div className="container mx-auto py-6">
        <NRComplianceEngine />
      </div>
    </AppShell>
  )
}

