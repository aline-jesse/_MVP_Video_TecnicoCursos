
/**
 * 🚀 Configurações de Produção
 * Suprime warnings dev e otimiza console
 */

export const isProd = process.env.NODE_ENV === 'production';

// Suprimir warnings de desenvolvimento em produção
if (isProd && typeof window !== 'undefined') {
  // Suprimir React DevTools warning
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Filtrar warnings específicos de desenvolvimento
    if (
      message.includes('React DevTools') ||
      message.includes('Download the React DevTools') ||
      message.includes('webpack-hmr') ||
      message.includes('HMR') ||
      message.includes('Fast Refresh')
    ) {
      return; // Não exibir em produção
    }
    
    originalConsoleWarn.apply(console, args);
  };

  // Limpar outros logs de desenvolvimento
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    
    if (
      message.includes('webpack') ||
      message.includes('HMR') ||
      message.includes('Fast Refresh') ||
      message.includes('[Next.js]')
    ) {
      return; // Não exibir em produção
    }
    
    originalConsoleLog.apply(console, args);
  };
}

export const productionConfig = {
  disableHMR: isProd,
  suppressDevWarnings: isProd,
  enableErrorBoundary: isProd,
  enablePerformanceMetrics: isProd
};
