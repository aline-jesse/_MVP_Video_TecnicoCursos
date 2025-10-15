
'use client';

/**
 * 📴 SPRINT 39 - Offline Indicator
 * Indicador de status offline/online com sync status
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { syncManager } from '@/lib/offline/sync-manager';
import { offlineDB } from '@/lib/offline/indexeddb-manager';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const online = navigator.onLine;
        setIsOnline(online);

        // Tentar obter stats do DB (se inicializado)
        try {
          const stats = await offlineDB.getStorageStats();
          setPendingSync(stats.pendingSync);
          
          // Mostrar indicador se offline ou tem itens pendentes
          setShowIndicator(!online || stats.pendingSync > 0);
        } catch (dbError) {
          // DB não inicializado ainda, mostrar só se offline
          setShowIndicator(!online);
        }
      } catch (error) {
        console.debug('Erro ao atualizar status offline:', error);
      }
    };

    updateStatus();

    // Listeners
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Atualizar a cada 10 segundos
    const interval = setInterval(updateStatus, 10000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await syncManager.syncAll();
    setSyncing(false);
  };

  if (!showIndicator) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[280px]">
          {/* Icon */}
          <div className={`flex-shrink-0 ${isOnline ? 'text-green-500' : 'text-orange-500'}`}>
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="font-medium text-sm">
              {isOnline ? 'Online' : 'Modo Offline'}
            </div>
            <div className="text-xs text-gray-500">
              {pendingSync > 0 ? (
                `${pendingSync} ${pendingSync === 1 ? 'item' : 'itens'} para sincronizar`
              ) : (
                'Tudo sincronizado'
              )}
            </div>
          </div>

          {/* Action */}
          {isOnline && pendingSync > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          )}

          {isOnline && pendingSync === 0 && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
