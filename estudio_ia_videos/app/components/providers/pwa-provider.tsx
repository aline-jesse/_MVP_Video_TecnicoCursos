
'use client';

/**
 * 🔧 SPRINT 39 - PWA Provider
 * Provider para inicializar PWA, offline sync e push notifications
 */

import { useEffect, useState } from 'react';
import { pwaManager } from '@/lib/pwa/pwa-manager';
import { useSession } from 'next-auth/react';
import { PublicOnboarding } from '@/components/onboarding/public-onboarding';
import { ProductTour, editorTourSteps } from '@/components/tour/product-tour';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() || {};
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initPWA = async () => {
      try {
        await pwaManager.initialize();
        setInitialized(true);

        // Se usuário logado, solicitar permissão de notificações
        if (session?.user) {
          const hasPermission = await Notification.permission;
          
          if (hasPermission === 'default') {
            // Aguardar 3 segundos antes de solicitar
            setTimeout(async () => {
              await pwaManager.requestNotificationPermission();
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar PWA:', error);
      }
    };

    initPWA();
  }, [session]);

  return (
    <>
      {children}
      
      {/* Onboarding para novos usuários */}
      {session?.user && <PublicOnboarding />}
      
      {/* Tour do editor */}
      {session?.user && <ProductTour steps={editorTourSteps} />}
      
      {/* Indicador offline */}
      <OfflineIndicator />
    </>
  );
}
