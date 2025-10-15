
/**
 * 🎨 Assets Manager Premium - Página Principal
 * Gerenciador completo de assets com Unsplash, Freesound e uploads
 */

'use client'

import AppShell from '../../components/layouts/AppShell'
import AssetsManagerPremium from '../../components/assets/assets-manager-premium'
import { AssetItem } from '../../lib/assets-manager'

export default function AssetsManagerPremiumPage() {
  
  const handleAssetSelect = (asset: AssetItem) => {
    console.log('Asset selecionado:', asset)
    // Implementar ação ao selecionar asset
  }

  return (
    <AppShell 
      title="Assets Manager Premium"
      description="50M+ imagens, música, uploads customizados e muito mais"
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Studio', href: '/studio' },
        { label: 'Assets Manager', href: '/assets-manager-premium' }
      ]}
    >
      <AssetsManagerPremium
        onAssetSelect={handleAssetSelect}
        multiSelect={true}
      />
    </AppShell>
  )
}
