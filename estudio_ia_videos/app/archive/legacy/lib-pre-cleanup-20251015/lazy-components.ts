/**
 * Exemplo de Lazy Loading de Componentes
 * 
 * USO:
 * 
 * // Ao invés de:
 * import HeavyComponent from './HeavyComponent';
 * 
 * // Use:
 * const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
 *   loading: () => <div>Carregando...</div>,
 *   ssr: false // Se não precisar de SSR
 * });
 */

import dynamic from 'next/dynamic';

// Exemplo: Dashboard com componentes pesados
export const DashboardCharts = dynamic(
  () => import('./components/DashboardCharts'),
  {
    loading: () => React.createElement('div', { className: "animate-pulse" }, 'Carregando gráficos...'),
    ssr: false
  }
);

export const VideoEditor = dynamic(
  () => import('./components/VideoEditor'),
  {
    loading: () => React.createElement('div', { className: "animate-pulse" }, 'Carregando editor...'),
    ssr: false
  }
);

export const TemplateLibrary = dynamic(
  () => import('./components/TemplateLibrary'),
  {
    loading: () => React.createElement('div', { className: "animate-pulse" }, 'Carregando templates...'),
    ssr: false
  }
);

// Lazy load de bibliotecas pesadas
export const lazyLoadChart = () =>
  import('recharts').then(mod => ({
    LineChart: mod.LineChart,
    BarChart: mod.BarChart,
    PieChart: mod.PieChart,
  }));

export const lazyLoadEditor = () =>
  import('@tiptap/react').then(mod => ({
    useEditor: mod.useEditor,
    EditorContent: mod.EditorContent,
  }));
