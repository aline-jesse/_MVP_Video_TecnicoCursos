'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf' | 'xml';
export type ExportDataType = 'events' | 'performance' | 'users' | 'projects' | 'alerts' | 'reports' | 'all';

interface ExportOptions {
  format: ExportFormat;
  dataType: ExportDataType;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    organizationId?: string;
    userId?: string;
    category?: string;
    status?: string;
    severity?: string;
  };
  includeMetadata?: boolean;
  compression?: boolean;
  maxRecords?: number;
}

interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  dataType: ExportDataType;
  recordCount: number;
  fileSize: number;
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    filters: any;
    processingTime: number;
  };
}

interface UseDataExportReturn {
  isExporting: boolean;
  exportData: (options: ExportOptions) => Promise<ExportResult | null>;
  quickExport: (format: ExportFormat, dataType: ExportDataType, period?: string) => Promise<ExportResult | null>;
  getExportHistory: () => Promise<any[]>;
  downloadFile: (url: string, filename: string) => Promise<void>;
}

export function useDataExport(): UseDataExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(async (options: ExportOptions): Promise<ExportResult | null> => {
    setIsExporting(true);
    
    try {
      // Definir valores padrão
      const defaultOptions = {
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        filters: {},
        includeMetadata: false,
        compression: false,
        maxRecords: 10000,
        ...options
      };

      // Primeiro, criar a exportação
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultOptions)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Falha na exportação');
      }

      const result = await response.json();
      
      // Fazer download do arquivo
      const downloadUrl = new URL('/api/analytics/export', window.location.origin);
      downloadUrl.searchParams.set('format', defaultOptions.format);
      downloadUrl.searchParams.set('type', defaultOptions.dataType);
      downloadUrl.searchParams.set('start', defaultOptions.dateRange.start);
      downloadUrl.searchParams.set('end', defaultOptions.dateRange.end);
      
      if (defaultOptions.includeMetadata) {
        downloadUrl.searchParams.set('includeMetadata', 'true');
      }
      
      if (defaultOptions.maxRecords !== 10000) {
        downloadUrl.searchParams.set('maxRecords', defaultOptions.maxRecords.toString());
      }

      // Adicionar filtros à URL
      Object.entries(defaultOptions.filters).forEach(([key, value]) => {
        if (value) {
          downloadUrl.searchParams.set(key, value);
        }
      });

      await downloadFile(downloadUrl.toString(), result.export.filename);

      toast.success(`Exportação concluída! ${result.export.recordCount} registros exportados.`);
      
      return result.export;

    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Erro na exportação: ${error.message}`);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const quickExport = useCallback(async (
    format: ExportFormat, 
    dataType: ExportDataType, 
    period: string = '7d'
  ): Promise<ExportResult | null> => {
    // Calcular período
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    return exportData({
      format,
      dataType,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });
  }, [exportData]);

  const getExportHistory = useCallback(async (): Promise<any[]> => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao carregar histórico');
      }

      const data = await response.json();
      return data.exports || [];
    } catch (error: any) {
      console.error('Error loading export history:', error);
      toast.error(`Erro ao carregar histórico: ${error.message}`);
      return [];
    }
  }, []);

  const downloadFile = useCallback(async (url: string, filename: string): Promise<void> => {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Falha no download do arquivo');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
    } catch (error: any) {
      console.error('Download error:', error);
      throw new Error(`Falha no download: ${error.message}`);
    }
  }, []);

  return {
    isExporting,
    exportData,
    quickExport,
    getExportHistory,
    downloadFile
  };
}

// Hook para exportação em lote
export function useBatchExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { exportData } = useDataExport();

  const exportBatch = useCallback(async (exports: ExportOptions[]): Promise<ExportResult[]> => {
    setIsExporting(true);
    setProgress(0);
    
    const results: ExportResult[] = [];
    
    try {
      for (let i = 0; i < exports.length; i++) {
        const result = await exportData(exports[i]);
        if (result) {
          results.push(result);
        }
        
        setProgress(((i + 1) / exports.length) * 100);
        
        // Pequeno delay entre exportações para não sobrecarregar o servidor
        if (i < exports.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success(`${results.length} exportações concluídas!`);
      
    } catch (error: any) {
      console.error('Batch export error:', error);
      toast.error(`Erro na exportação em lote: ${error.message}`);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
    
    return results;
  }, [exportData]);

  return {
    isExporting,
    progress,
    exportBatch
  };
}

// Utilitários para formatação
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFormatLabel = (format: ExportFormat): string => {
  const labels = {
    csv: 'CSV',
    json: 'JSON',
    xlsx: 'Excel',
    pdf: 'PDF',
    xml: 'XML'
  };
  return labels[format] || format.toUpperCase();
};

export const getDataTypeLabel = (dataType: ExportDataType): string => {
  const labels = {
    events: 'Eventos',
    performance: 'Performance',
    users: 'Usuários',
    projects: 'Projetos',
    alerts: 'Alertas',
    reports: 'Relatórios',
    all: 'Todos os Dados'
  };
  return labels[dataType] || dataType;
};