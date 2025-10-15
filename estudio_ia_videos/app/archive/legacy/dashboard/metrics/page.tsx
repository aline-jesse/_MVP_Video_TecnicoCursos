import { Metadata } from 'next';
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard de Métricas | Estúdio IA Vídeos',
  description: 'Dashboard completo de métricas e estatísticas de uso',
};

export default async function MetricsPage() {
  const supabase = createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return <AnalyticsDashboard />;
}
