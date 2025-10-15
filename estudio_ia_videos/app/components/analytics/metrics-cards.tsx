'use client';

/**
 * Metrics Cards - Cards de Métricas Gerais
 * 
 * Exibe métricas principais com indicadores de tendência
 */

import { type AnalyticsMetrics } from '@/lib/analytics/queries';

// ==========================================
// TIPOS
// ==========================================

interface MetricsCardsProps {
  metrics: AnalyticsMetrics;
  trends: {
    uploads: { current: number; previous: number; trend: number };
    renders: { current: number; previous: number; trend: number };
    tts: { current: number; previous: number; trend: number };
  };
  loading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';
  suffix?: string;
}

// ==========================================
// COMPONENTE DE CARD INDIVIDUAL
// ==========================================

function MetricCard({ title, value, trend, icon, color, suffix = '' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    if (trend < 0) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              {suffix && <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">{suffix}</span>}
            </p>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span className="font-medium">
                {Math.abs(trend)}% {trend >= 0 ? 'acima' : 'abaixo'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">vs. período anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function MetricsCards({ metrics, trends, loading }: MetricsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total de Projetos */}
      <MetricCard
        title="Total de Projetos"
        value={metrics.totalProjects}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        }
        color="blue"
      />

      {/* Total de Uploads */}
      <MetricCard
        title="Uploads de Arquivos"
        value={metrics.totalUploads}
        trend={trends.uploads.trend}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        }
        color="green"
      />

      {/* Total de Renders */}
      <MetricCard
        title="Vídeos Renderizados"
        value={metrics.totalRenders}
        trend={trends.renders.trend}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        }
        color="purple"
      />

      {/* Total de Gerações TTS */}
      <MetricCard
        title="Gerações de TTS"
        value={metrics.totalTTSGenerations}
        trend={trends.tts.trend}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        }
        color="orange"
      />

      {/* Usuários Ativos */}
      <MetricCard
        title="Usuários Ativos"
        value={metrics.activeUsers}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
        color="pink"
      />

      {/* Storage Usado */}
      <MetricCard
        title="Armazenamento Usado"
        value={metrics.storageUsed.toFixed(2)}
        suffix="MB"
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
        }
        color="indigo"
      />
    </div>
  );
}
