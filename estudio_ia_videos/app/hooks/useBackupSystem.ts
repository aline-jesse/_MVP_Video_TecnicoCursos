'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRealTimeCollaboration } from './useRealTimeCollaboration';

// Interfaces para Backup System
export interface BackupVersion {
  id: string;
  projectId: string;
  version: string;
  timestamp: Date;
  size: number;
  type: 'auto' | 'manual' | 'milestone';
  description?: string;
  changes: BackupChange[];
  metadata: {
    author: string;
    device: string;
    platform: string;
    appVersion: string;
  };
  checksum: string;
  compressed: boolean;
  tags: string[];
}

export interface BackupChange {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move';
  path: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  author: string;
}

export interface RestorePoint {
  id: string;
  projectId: string;
  name: string;
  description: string;
  timestamp: Date;
  versionId: string;
  automatic: boolean;
  stable: boolean;
  tags: string[];
}

export interface BackupConfig {
  autoBackup: boolean;
  interval: number; // em minutos
  maxVersions: number;
  compression: boolean;
  cloudSync: boolean;
  incrementalBackup: boolean;
  restorePointInterval: number; // em horas
  retentionPolicy: {
    daily: number; // dias
    weekly: number; // semanas
    monthly: number; // meses
  };
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
  syncInProgress: boolean;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  type: 'upload' | 'download' | 'conflict';
  message: string;
  timestamp: Date;
  resolved: boolean;
  versionId?: string;
}

export interface BackupStats {
  totalVersions: number;
  totalSize: number;
  oldestBackup: Date | null;
  newestBackup: Date | null;
  autoBackups: number;
  manualBackups: number;
  restorePoints: number;
  cloudBackups: number;
  localBackups: number;
}

export interface ConflictResolution {
  id: string;
  localVersion: BackupVersion;
  remoteVersion: BackupVersion;
  resolution: 'local' | 'remote' | 'merge' | 'manual';
  mergedData?: any;
}

export interface UseBackupSystemReturn {
  // Estado
  versions: BackupVersion[];
  restorePoints: RestorePoint[];
  config: BackupConfig;
  syncStatus: SyncStatus;
  stats: BackupStats;
  isBackingUp: boolean;
  isRestoring: boolean;
  
  // Backup
  createBackup: (type: 'auto' | 'manual' | 'milestone', description?: string) => Promise<BackupVersion>;
  createRestorePoint: (name: string, description?: string) => Promise<RestorePoint>;
  scheduleAutoBackup: () => void;
  stopAutoBackup: () => void;
  
  // Restore
  restoreVersion: (versionId: string) => Promise<boolean>;
  restoreToPoint: (restorePointId: string) => Promise<boolean>;
  previewRestore: (versionId: string) => Promise<any>;
  
  // Versioning
  getVersionHistory: (projectId: string) => Promise<BackupVersion[]>;
  compareVersions: (versionA: string, versionB: string) => Promise<BackupChange[]>;
  getVersionDiff: (versionId: string) => Promise<BackupChange[]>;
  
  // Cloud Sync
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>;
  
  // Management
  deleteVersion: (versionId: string) => Promise<boolean>;
  deleteOldVersions: (olderThan: Date) => Promise<number>;
  compressVersion: (versionId: string) => Promise<boolean>;
  exportBackup: (versionId: string, format: 'zip' | 'json') => Promise<Blob>;
  importBackup: (file: File) => Promise<BackupVersion>;
  
  // Configuration
  updateConfig: (newConfig: Partial<BackupConfig>) => void;
  resetConfig: () => void;
  
  // Utilities
  calculateStorageUsage: () => Promise<number>;
  cleanupStorage: () => Promise<void>;
  validateBackup: (versionId: string) => Promise<boolean>;
  repairBackup: (versionId: string) => Promise<boolean>;
  
  // Monitoring
  getBackupStats: () => Promise<BackupStats>;
  getHealthStatus: () => Promise<'healthy' | 'warning' | 'error'>;
  
  // Real-time
  onBackupCreated: (callback: (version: BackupVersion) => void) => () => void;
  onRestoreCompleted: (callback: (success: boolean) => void) => () => void;
  onSyncStatusChanged: (callback: (status: SyncStatus) => void) => () => void;
}

export const useBackupSystem = (projectId: string): UseBackupSystemReturn => {
  const [versions, setVersions] = useState<BackupVersion[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackup: true,
    interval: 15, // 15 minutos
    maxVersions: 50,
    compression: true,
    cloudSync: true,
    incrementalBackup: true,
    restorePointInterval: 2, // 2 horas
    retentionPolicy: {
      daily: 7,
      weekly: 4,
      monthly: 6,
    },
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingUploads: 0,
    pendingDownloads: 0,
    syncInProgress: false,
    errors: [],
  });
  const [stats, setStats] = useState<BackupStats>({
    totalVersions: 0,
    totalSize: 0,
    oldestBackup: null,
    newestBackup: null,
    autoBackups: 0,
    manualBackups: 0,
    restorePoints: 0,
    cloudBackups: 0,
    localBackups: 0,
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const { broadcastUpdate } = useRealTimeCollaboration();
  const autoBackupInterval = useRef<NodeJS.Timeout | null>(null);
  const restorePointInterval = useRef<NodeJS.Timeout | null>(null);
  const eventCallbacks = useRef<{
    onBackupCreated: ((version: BackupVersion) => void)[];
    onRestoreCompleted: ((success: boolean) => void)[];
    onSyncStatusChanged: ((status: SyncStatus) => void)[];
  }>({
    onBackupCreated: [],
    onRestoreCompleted: [],
    onSyncStatusChanged: [],
  });

  // Inicialização
  useEffect(() => {
    loadVersionHistory();
    loadRestorePoints();
    loadConfig();
    setupNetworkMonitoring();
    
    if (config.autoBackup) {
      scheduleAutoBackup();
    }
    
    return () => {
      if (autoBackupInterval.current) {
        clearInterval(autoBackupInterval.current);
      }
      if (restorePointInterval.current) {
        clearInterval(restorePointInterval.current);
      }
    };
  }, [projectId]);

  const loadVersionHistory = useCallback(async () => {
    try {
      // Carregar do localStorage e cloud
      const localVersions = JSON.parse(
        localStorage.getItem(`backup_versions_${projectId}`) || '[]'
      );
      
      setVersions(localVersions.map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp),
      })));
      
      updateStats();
    } catch (error) {
      console.error('Erro ao carregar histórico de versões:', error);
    }
  }, [projectId]);

  const loadRestorePoints = useCallback(async () => {
    try {
      const localPoints = JSON.parse(
        localStorage.getItem(`restore_points_${projectId}`) || '[]'
      );
      
      setRestorePoints(localPoints.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
      })));
    } catch (error) {
      console.error('Erro ao carregar restore points:', error);
    }
  }, [projectId]);

  const loadConfig = useCallback(() => {
    try {
      const savedConfig = localStorage.getItem('backup_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  }, []);

  const setupNetworkMonitoring = useCallback(() => {
    const updateOnlineStatus = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const createBackup = useCallback(async (
    type: 'auto' | 'manual' | 'milestone',
    description?: string
  ): Promise<BackupVersion> => {
    setIsBackingUp(true);
    
    try {
      // Obter dados do projeto atual
      const projectData = await getCurrentProjectData();
      
      // Calcular mudanças desde último backup
      const changes = await calculateChanges(projectData);
      
      // Criar nova versão
      const newVersion: BackupVersion = {
        id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        version: generateVersionNumber(),
        timestamp: new Date(),
        size: calculateDataSize(projectData),
        type,
        description,
        changes,
        metadata: {
          author: 'current-user', // Obter do contexto de auth
          device: navigator.userAgent,
          platform: navigator.platform,
          appVersion: '1.0.0',
        },
        checksum: await calculateChecksum(projectData),
        compressed: config.compression,
        tags: [],
      };

      // Comprimir se necessário
      if (config.compression) {
        projectData.compressed = await compressData(projectData);
      }

      // Salvar localmente
      await saveVersionLocally(newVersion, projectData);
      
      // Atualizar lista de versões
      setVersions(prev => {
        const updated = [newVersion, ...prev];
        
        // Aplicar política de retenção
        const retained = applyRetentionPolicy(updated);
        
        // Salvar no localStorage
        localStorage.setItem(
          `backup_versions_${projectId}`,
          JSON.stringify(retained)
        );
        
        return retained;
      });

      // Sync para cloud se habilitado
      if (config.cloudSync && syncStatus.isOnline) {
        syncToCloud();
      }

      // Notificar callbacks
      eventCallbacks.current.onBackupCreated.forEach(callback => {
        callback(newVersion);
      });

      // Broadcast para colaboradores
      broadcastUpdate('backup-created', newVersion);

      updateStats();
      
      return newVersion;
    } finally {
      setIsBackingUp(false);
    }
  }, [projectId, config, syncStatus.isOnline, broadcastUpdate]);

  const createRestorePoint = useCallback(async (
    name: string,
    description?: string
  ): Promise<RestorePoint> => {
    // Criar backup primeiro
    const backup = await createBackup('milestone', `Restore Point: ${name}`);
    
    const restorePoint: RestorePoint = {
      id: `restore_${Date.now()}`,
      projectId,
      name,
      description: description || '',
      timestamp: new Date(),
      versionId: backup.id,
      automatic: false,
      stable: true,
      tags: ['manual'],
    };

    setRestorePoints(prev => {
      const updated = [restorePoint, ...prev];
      localStorage.setItem(
        `restore_points_${projectId}`,
        JSON.stringify(updated)
      );
      return updated;
    });

    return restorePoint;
  }, [projectId, createBackup]);

  const scheduleAutoBackup = useCallback(() => {
    if (autoBackupInterval.current) {
      clearInterval(autoBackupInterval.current);
    }

    autoBackupInterval.current = setInterval(async () => {
      if (config.autoBackup) {
        try {
          await createBackup('auto', 'Backup automático');
        } catch (error) {
          console.error('Erro no backup automático:', error);
        }
      }
    }, config.interval * 60 * 1000); // Converter minutos para ms

    // Agendar restore points automáticos
    if (restorePointInterval.current) {
      clearInterval(restorePointInterval.current);
    }

    restorePointInterval.current = setInterval(async () => {
      try {
        await createRestorePoint(
          `Auto Restore Point ${new Date().toLocaleString()}`,
          'Restore point automático'
        );
      } catch (error) {
        console.error('Erro ao criar restore point automático:', error);
      }
    }, config.restorePointInterval * 60 * 60 * 1000); // Converter horas para ms
  }, [config.autoBackup, config.interval, config.restorePointInterval, createBackup, createRestorePoint]);

  const stopAutoBackup = useCallback(() => {
    if (autoBackupInterval.current) {
      clearInterval(autoBackupInterval.current);
      autoBackupInterval.current = null;
    }
    
    if (restorePointInterval.current) {
      clearInterval(restorePointInterval.current);
      restorePointInterval.current = null;
    }
  }, []);

  const restoreVersion = useCallback(async (versionId: string): Promise<boolean> => {
    setIsRestoring(true);
    
    try {
      const version = versions.find(v => v.id === versionId);
      if (!version) {
        throw new Error('Versão não encontrada');
      }

      // Carregar dados da versão
      const versionData = await loadVersionData(versionId);
      
      // Criar backup do estado atual antes de restaurar
      await createBackup('manual', `Backup antes de restaurar para ${version.version}`);
      
      // Aplicar dados da versão
      await applyVersionData(versionData);
      
      // Notificar callbacks
      eventCallbacks.current.onRestoreCompleted.forEach(callback => {
        callback(true);
      });

      // Broadcast para colaboradores
      broadcastUpdate('version-restored', { versionId, timestamp: new Date() });
      
      return true;
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
      
      eventCallbacks.current.onRestoreCompleted.forEach(callback => {
        callback(false);
      });
      
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [versions, createBackup, broadcastUpdate]);

  const restoreToPoint = useCallback(async (restorePointId: string): Promise<boolean> => {
    const restorePoint = restorePoints.find(p => p.id === restorePointId);
    if (!restorePoint) {
      throw new Error('Restore point não encontrado');
    }

    return restoreVersion(restorePoint.versionId);
  }, [restorePoints, restoreVersion]);

  const syncToCloud = useCallback(async () => {
    if (!syncStatus.isOnline) {
      throw new Error('Sem conexão com a internet');
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      // Implementar sync real com Supabase
      const pendingVersions = versions.filter(v => !v.metadata.device.includes('cloud'));
      
      for (const version of pendingVersions) {
        // Upload para cloud storage
        await uploadVersionToCloud(version);
      }

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingUploads: 0,
        syncInProgress: false,
      }));

      eventCallbacks.current.onSyncStatusChanged.forEach(callback => {
        callback(syncStatus);
      });
    } catch (error) {
      console.error('Erro no sync para cloud:', error);
      
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        errors: [...prev.errors, {
          id: `error_${Date.now()}`,
          type: 'upload',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date(),
          resolved: false,
        }],
      }));
    }
  }, [syncStatus.isOnline, versions]);

  const updateStats = useCallback(() => {
    const newStats: BackupStats = {
      totalVersions: versions.length,
      totalSize: versions.reduce((sum, v) => sum + v.size, 0),
      oldestBackup: versions.length > 0 ? new Date(Math.min(...versions.map(v => v.timestamp.getTime()))) : null,
      newestBackup: versions.length > 0 ? new Date(Math.max(...versions.map(v => v.timestamp.getTime()))) : null,
      autoBackups: versions.filter(v => v.type === 'auto').length,
      manualBackups: versions.filter(v => v.type === 'manual').length,
      restorePoints: restorePoints.length,
      cloudBackups: versions.filter(v => v.metadata.device.includes('cloud')).length,
      localBackups: versions.filter(v => !v.metadata.device.includes('cloud')).length,
    };

    setStats(newStats);
  }, [versions, restorePoints]);

  // Funções auxiliares
  const getCurrentProjectData = async () => {
    // Implementar obtenção dos dados atuais do projeto
    return {
      id: projectId,
      timestamp: new Date(),
      data: {}, // Dados reais do projeto
    };
  };

  const calculateChanges = async (projectData: any): Promise<BackupChange[]> => {
    // Implementar cálculo de mudanças
    return [];
  };

  const generateVersionNumber = (): string => {
    const now = new Date();
    return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${versions.length + 1}`;
  };

  const calculateDataSize = (data: any): number => {
    return JSON.stringify(data).length;
  };

  const calculateChecksum = async (data: any): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const compressData = async (data: any): Promise<any> => {
    // Implementar compressão real
    return data;
  };

  const saveVersionLocally = async (version: BackupVersion, data: any) => {
    localStorage.setItem(`backup_data_${version.id}`, JSON.stringify(data));
  };

  const loadVersionData = async (versionId: string) => {
    const data = localStorage.getItem(`backup_data_${versionId}`);
    return data ? JSON.parse(data) : null;
  };

  const applyVersionData = async (data: any) => {
    // Implementar aplicação dos dados restaurados
    console.log('Aplicando dados da versão:', data);
  };

  const applyRetentionPolicy = (versions: BackupVersion[]): BackupVersion[] => {
    // Implementar política de retenção
    return versions.slice(0, config.maxVersions);
  };

  const uploadVersionToCloud = async (version: BackupVersion) => {
    // Implementar upload real para Supabase
    console.log('Uploading version to cloud:', version.id);
  };

  return {
    // Estado
    versions,
    restorePoints,
    config,
    syncStatus,
    stats,
    isBackingUp,
    isRestoring,
    
    // Backup
    createBackup,
    createRestorePoint,
    scheduleAutoBackup,
    stopAutoBackup,
    
    // Restore
    restoreVersion,
    restoreToPoint,
    previewRestore: async () => ({}), // Implementar
    
    // Versioning
    getVersionHistory: async () => versions,
    compareVersions: async () => [], // Implementar
    getVersionDiff: async () => [], // Implementar
    
    // Cloud Sync
    syncToCloud,
    syncFromCloud: async () => {}, // Implementar
    resolveConflict: async () => {}, // Implementar
    
    // Management
    deleteVersion: async (versionId) => {
      setVersions(prev => prev.filter(v => v.id !== versionId));
      localStorage.removeItem(`backup_data_${versionId}`);
      return true;
    },
    deleteOldVersions: async (olderThan) => {
      const toDelete = versions.filter(v => v.timestamp < olderThan);
      toDelete.forEach(v => localStorage.removeItem(`backup_data_${v.id}`));
      setVersions(prev => prev.filter(v => v.timestamp >= olderThan));
      return toDelete.length;
    },
    compressVersion: async () => true, // Implementar
    exportBackup: async () => new Blob(), // Implementar
    importBackup: async () => ({} as BackupVersion), // Implementar
    
    // Configuration
    updateConfig: (newConfig) => {
      const updated = { ...config, ...newConfig };
      setConfig(updated);
      localStorage.setItem('backup_config', JSON.stringify(updated));
      
      if (updated.autoBackup !== config.autoBackup) {
        if (updated.autoBackup) {
          scheduleAutoBackup();
        } else {
          stopAutoBackup();
        }
      }
    },
    resetConfig: () => {
      const defaultConfig: BackupConfig = {
        autoBackup: true,
        interval: 15,
        maxVersions: 50,
        compression: true,
        cloudSync: true,
        incrementalBackup: true,
        restorePointInterval: 2,
        retentionPolicy: { daily: 7, weekly: 4, monthly: 6 },
      };
      setConfig(defaultConfig);
      localStorage.setItem('backup_config', JSON.stringify(defaultConfig));
    },
    
    // Utilities
    calculateStorageUsage: async () => stats.totalSize,
    cleanupStorage: async () => {}, // Implementar
    validateBackup: async () => true, // Implementar
    repairBackup: async () => true, // Implementar
    
    // Monitoring
    getBackupStats: async () => stats,
    getHealthStatus: async () => 'healthy' as const, // Implementar
    
    // Real-time
    onBackupCreated: (callback) => {
      eventCallbacks.current.onBackupCreated.push(callback);
      return () => {
        eventCallbacks.current.onBackupCreated = 
          eventCallbacks.current.onBackupCreated.filter(cb => cb !== callback);
      };
    },
    onRestoreCompleted: (callback) => {
      eventCallbacks.current.onRestoreCompleted.push(callback);
      return () => {
        eventCallbacks.current.onRestoreCompleted = 
          eventCallbacks.current.onRestoreCompleted.filter(cb => cb !== callback);
      };
    },
    onSyncStatusChanged: (callback) => {
      eventCallbacks.current.onSyncStatusChanged.push(callback);
      return () => {
        eventCallbacks.current.onSyncStatusChanged = 
          eventCallbacks.current.onSyncStatusChanged.filter(cb => cb !== callback);
      };
    },
  };
};