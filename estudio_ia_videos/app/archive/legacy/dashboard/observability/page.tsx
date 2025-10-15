/**
 * Página do Dashboard de Observabilidade
 */

import ObservabilityDashboard from '@/components/observability/observability-dashboard';

export const metadata = {
  title: 'Observabilidade | Estúdio IA',
  description: 'Monitoramento de métricas e saúde do sistema',
};

export default function ObservabilityPage() {
  return <ObservabilityDashboard />;
}
