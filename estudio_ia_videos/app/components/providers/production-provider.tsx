
/**
 * 🚀 Provider de Configurações de Produção + Emergency Fixes
 */

'use client';

import React, { useEffect } from 'react';
import { initializeEmergencyFixes } from '../../lib/emergency-fixes';

export default function ProductionProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    // 🚨 EMERGENCY: Initialize all emergency fixes
    initializeEmergencyFixes();

    // Aplicar configurações de produção no cliente
    if (process.env.NODE_ENV === 'production') {
      // Remover avisos de React DevTools
      if (typeof window !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
          /* Esconder elementos de desenvolvimento */
          [data-reactroot] { outline: none !important; }
          .react-dev-overlay { display: none !important; }
        `;
        document.head.appendChild(style);
      }

      // 🚨 EMERGENCY: Enhanced WebSocket blocking
      if (typeof WebSocket !== 'undefined') {
        const originalWebSocket = WebSocket;
        window.WebSocket = class extends originalWebSocket {
          constructor(url: string | URL, protocols?: string | string[]) {
            const urlStr = url.toString();
            
            // Bloquear conexões HMR em qualquer ambiente
            if (urlStr.includes('webpack-hmr') || urlStr.includes('_next/webpack-hmr') || urlStr.includes('preview.abacusai.app')) {
              console.log('🚨 EMERGENCY: WebSocket HMR blocked');
              
              // Create dummy connection that fails silently
              const dummyWs = {
                addEventListener: () => {},
                removeEventListener: () => {},
                send: () => {},
                close: () => {},
                readyState: WebSocket.CLOSED,
                CONNECTING: WebSocket.CONNECTING,
                OPEN: WebSocket.OPEN,
                CLOSING: WebSocket.CLOSING,
                CLOSED: WebSocket.CLOSED
              };
              
              return dummyWs as any;
            }
            
            super(url, protocols);
          }
        };
      }
    }

    // 🚨 EMERGENCY: Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      console.warn('🚨 EMERGENCY: Global error caught', event.error);
      // Prevent error from breaking the app
      event.preventDefault();
      return true;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('🚨 EMERGENCY: Unhandled promise rejection', event.reason);
      // Prevent unhandled rejection from crashing
      event.preventDefault();
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
