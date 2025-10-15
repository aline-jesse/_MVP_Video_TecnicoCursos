
import NRComplianceEngine from '@/components/advanced-compliance/nr-compliance-engine'

export const metadata = {
  title: 'Advanced NR Compliance Engine - Estúdio IA de Vídeos',
  description: 'Sistema avançado de conformidade com Normas Regulamentadoras brasileiras com certificação blockchain e auditoria automática'
}

export default function AdvancedNRCompliancePage() {
  return (
    <div className="container mx-auto py-6">
      <NRComplianceEngine />
    </div>
  )
}
