/**
 * Página do Dashboard de Cache
 */

import CacheDashboard from '@/components/cache/cache-dashboard';

export default function CachePage() {
  return (
    <div className="min-h-screen bg-background">
      <CacheDashboard refreshInterval={3000} />
    </div>
  );
}

export const metadata = {
  title: 'Dashboard de Cache - Estúdio IA Vídeos',
  description: 'Monitore e gerencie o sistema de cache inteligente'
};