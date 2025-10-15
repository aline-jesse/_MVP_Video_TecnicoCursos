
import EnterpriseIntegrationSuite from '@/components/enterprise-integration/enterprise-integration-suite'

export const metadata = {
  title: 'Enterprise Integration Suite - Estúdio IA de Vídeos',  
  description: 'Integração completa com sistemas corporativos, ERPs e APIs de RH com dashboard executivo e tracking de ROI'
}

export default function EnterpriseIntegrationPage() {
  return (
    <div className="container mx-auto py-6">
      <EnterpriseIntegrationSuite />
    </div>
  )
}
