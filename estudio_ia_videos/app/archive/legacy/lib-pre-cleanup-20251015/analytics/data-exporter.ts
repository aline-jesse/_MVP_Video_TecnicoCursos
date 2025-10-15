import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf' | 'xml';
export type ExportDataType = 'events' | 'performance' | 'users' | 'projects' | 'alerts' | 'reports' | 'all';

export interface ExportOptions {
  format: ExportFormat;
  dataType: ExportDataType;
  dateRange: {
    start: Date;
    end: Date;
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

export interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  dataType: ExportDataType;
  recordCount: number;
  fileSize: number;
  downloadUrl?: string;
  content?: string;
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    filters: any;
    processingTime: number;
  };
}

export class DataExporter {
  /**
   * Exporta dados baseado nas opções fornecidas
   */
  async exportData(options: ExportOptions, userId: string): Promise<ExportResult> {
    const startTime = Date.now();
    
    console.log(`[DataExporter] Starting export: ${options.dataType} as ${options.format}`);
    
    try {
      // Buscar dados baseado no tipo
      const data = await this.fetchData(options);
      
      // Gerar conteúdo no formato solicitado
      const content = await this.generateContent(data, options);
      
      // Gerar nome do arquivo
      const filename = this.generateFilename(options);
      
      // Calcular tamanho do arquivo (aproximado)
      const fileSize = new Blob([content]).size;
      
      const processingTime = Date.now() - startTime;
      
      // Registrar exportação no banco
      await this.logExport(options, userId, filename, data.length, fileSize, processingTime);
      
      console.log(`[DataExporter] Export completed in ${processingTime}ms: ${data.length} records, ${fileSize} bytes`);
      
      return {
        success: true,
        filename,
        format: options.format,
        dataType: options.dataType,
        recordCount: data.length,
        fileSize,
        content,
        metadata: {
          exportedAt: new Date(),
          exportedBy: userId,
          filters: options.filters || {},
          processingTime
        }
      };
      
    } catch (error: any) {
      console.error('[DataExporter] Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Busca dados baseado no tipo e filtros
   */
  private async fetchData(options: ExportOptions): Promise<any[]> {
    const { dataType, dateRange, filters, maxRecords = 10000 } = options;
    
    const baseWhere = {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      },
      ...(filters?.organizationId && { organizationId: filters.organizationId }),
      ...(filters?.userId && { userId: filters.userId })
    };

    switch (dataType) {
      case 'events':
        return await prisma.analyticsEvent.findMany({
          where: {
            ...baseWhere,
            ...(filters?.category && { category: filters.category }),
            ...(filters?.status && { status: filters.status })
          },
          orderBy: { createdAt: 'desc' },
          take: maxRecords,
          include: options.includeMetadata ? {} : undefined
        });

      case 'performance':
        return await prisma.analyticsEvent.findMany({
          where: {
            ...baseWhere,
            category: 'api',
            duration: { not: null }
          },
          orderBy: { createdAt: 'desc' },
          take: maxRecords
        });

      case 'users':
        const userEvents = await prisma.analyticsEvent.groupBy({
          by: ['userId'],
          where: {
            ...baseWhere,
            userId: { not: null }
          },
          _count: { id: true },
          _min: { createdAt: true },
          _max: { createdAt: true }
        });
        
        return userEvents.map(user => ({
          userId: user.userId,
          eventCount: user._count.id,
          firstSeen: user._min.createdAt,
          lastSeen: user._max.createdAt
        }));

      case 'projects':
        return await prisma.project.findMany({
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            },
            ...(filters?.organizationId && { organizationId: filters.organizationId })
          },
          orderBy: { createdAt: 'desc' },
          take: maxRecords
        });

      case 'alerts':
        return await prisma.analyticsEvent.findMany({
          where: {
            ...baseWhere,
            category: 'alert',
            ...(filters?.severity && { 
              metadata: { path: ['severity'], equals: filters.severity }
            })
          },
          orderBy: { createdAt: 'desc' },
          take: maxRecords
        });

      case 'reports':
        return await prisma.analyticsEvent.findMany({
          where: {
            ...baseWhere,
            category: 'report_generated'
          },
          orderBy: { createdAt: 'desc' },
          take: maxRecords
        });

      case 'all':
        // Para 'all', buscar uma amostra de cada tipo
        const [events, projects, alerts] = await Promise.all([
          this.fetchData({ ...options, dataType: 'events', maxRecords: 1000 }),
          this.fetchData({ ...options, dataType: 'projects', maxRecords: 1000 }),
          this.fetchData({ ...options, dataType: 'alerts', maxRecords: 1000 })
        ]);
        
        return [
          { type: 'events', data: events },
          { type: 'projects', data: projects },
          { type: 'alerts', data: alerts }
        ];

      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
  }

  /**
   * Gera conteúdo no formato solicitado
   */
  private async generateContent(data: any[], options: ExportOptions): Promise<string> {
    switch (options.format) {
      case 'csv':
        return this.generateCSV(data, options);
        
      case 'json':
        return this.generateJSON(data, options);
        
      case 'xlsx':
        return this.generateXLSX(data, options);
        
      case 'pdf':
        return this.generatePDF(data, options);
        
      case 'xml':
        return this.generateXML(data, options);
        
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Gera CSV
   */
  private generateCSV(data: any[], options: ExportOptions): string {
    if (data.length === 0) return '';

    // Se é exportação 'all', tratar diferente
    if (options.dataType === 'all') {
      let csv = '';
      for (const section of data) {
        csv += `\n# ${section.type.toUpperCase()}\n`;
        if (section.data.length > 0) {
          csv += this.arrayToCSV(section.data);
        }
        csv += '\n';
      }
      return csv;
    }

    return this.arrayToCSV(data);
  }

  /**
   * Converte array para CSV
   */
  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return '';

    // Obter todas as chaves únicas
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'metadata' || key === 'metadata') {
          allKeys.add(key);
        }
      });
    });

    const headers = Array.from(allKeys);
    
    // Gerar cabeçalho
    let csv = headers.map(h => `"${h}"`).join(',') + '\n';
    
    // Gerar linhas
    data.forEach(item => {
      const row = headers.map(header => {
        let value = item[header];
        
        if (value === null || value === undefined) {
          return '""';
        }
        
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        if (value instanceof Date) {
          value = format(value, 'yyyy-MM-dd HH:mm:ss');
        }
        
        // Escapar aspas duplas
        value = String(value).replace(/"/g, '""');
        
        return `"${value}"`;
      });
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }

  /**
   * Gera JSON
   */
  private generateJSON(data: any[], options: ExportOptions): string {
    const exportData = {
      metadata: {
        exportedAt: new Date(),
        dataType: options.dataType,
        format: options.format,
        recordCount: data.length,
        dateRange: options.dateRange,
        filters: options.filters || {}
      },
      data
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Gera XLSX (simulado como CSV para simplicidade)
   */
  private generateXLSX(data: any[], options: ExportOptions): string {
    // Em uma implementação real, usaria uma biblioteca como 'xlsx' ou 'exceljs'
    // Por agora, retorna CSV com indicação de que é XLSX
    const csvContent = this.generateCSV(data, options);
    return `# XLSX Export (CSV format)\n# Use Excel to open this file\n\n${csvContent}`;
  }

  /**
   * Gera PDF (HTML que pode ser convertido)
   */
  private generatePDF(data: any[], options: ExportOptions): string {
    const title = `Exportação de ${options.dataType} - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
        .metadata { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-left: 4px solid #007bff; padding-left: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
    </div>
    
    <div class="metadata">
        <h3>Informações da Exportação</h3>
        <p><strong>Tipo de Dados:</strong> ${options.dataType}</p>
        <p><strong>Período:</strong> ${format(options.dateRange.start, 'dd/MM/yyyy')} a ${format(options.dateRange.end, 'dd/MM/yyyy')}</p>
        <p><strong>Total de Registros:</strong> ${data.length}</p>
        ${options.filters ? `<p><strong>Filtros:</strong> ${JSON.stringify(options.filters)}</p>` : ''}
    </div>
`;

    if (options.dataType === 'all') {
      // Tratar exportação 'all'
      for (const section of data) {
        html += `
        <div class="section">
            <h2>${section.type.toUpperCase()} (${section.data.length} registros)</h2>
            ${this.generateHTMLTable(section.data)}
        </div>`;
      }
    } else {
      html += `
        <div class="section">
            <h2>Dados (${data.length} registros)</h2>
            ${this.generateHTMLTable(data)}
        </div>`;
    }

    html += `
    <div class="footer">
        <p>Exportação gerada pelo Sistema de Analytics - Estúdio IA Vídeos</p>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Gera tabela HTML
   */
  private generateHTMLTable(data: any[]): string {
    if (data.length === 0) return '<p>Nenhum dado encontrado.</p>';

    // Obter cabeçalhos
    const headers = Object.keys(data[0]).filter(key => key !== 'metadata');
    
    let table = '<table><thead><tr>';
    headers.forEach(header => {
      table += `<th>${header}</th>`;
    });
    table += '</tr></thead><tbody>';
    
    // Gerar linhas (máximo 100 para PDF)
    const maxRows = Math.min(data.length, 100);
    for (let i = 0; i < maxRows; i++) {
      const item = data[i];
      table += '<tr>';
      headers.forEach(header => {
        let value = item[header];
        
        if (value === null || value === undefined) {
          value = '-';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else if (value instanceof Date) {
          value = format(value, 'dd/MM/yyyy HH:mm');
        }
        
        // Limitar tamanho do texto
        if (String(value).length > 50) {
          value = String(value).substring(0, 47) + '...';
        }
        
        table += `<td>${value}</td>`;
      });
      table += '</tr>';
    }
    
    if (data.length > 100) {
      table += `<tr><td colspan="${headers.length}"><em>... e mais ${data.length - 100} registros</em></td></tr>`;
    }
    
    table += '</tbody></table>';
    return table;
  }

  /**
   * Gera XML
   */
  private generateXML(data: any[], options: ExportOptions): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<export>\n`;
    xml += `  <metadata>\n`;
    xml += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`;
    xml += `    <dataType>${options.dataType}</dataType>\n`;
    xml += `    <format>${options.format}</format>\n`;
    xml += `    <recordCount>${data.length}</recordCount>\n`;
    xml += `  </metadata>\n`;
    xml += `  <data>\n`;
    
    if (options.dataType === 'all') {
      for (const section of data) {
        xml += `    <section type="${section.type}">\n`;
        section.data.forEach((item: any, index: number) => {
          xml += `      <record index="${index}">\n`;
          xml += this.objectToXML(item, '        ');
          xml += `      </record>\n`;
        });
        xml += `    </section>\n`;
      }
    } else {
      data.forEach((item, index) => {
        xml += `    <record index="${index}">\n`;
        xml += this.objectToXML(item, '      ');
        xml += `    </record>\n`;
      });
    }
    
    xml += `  </data>\n`;
    xml += `</export>`;
    
    return xml;
  }

  /**
   * Converte objeto para XML
   */
  private objectToXML(obj: any, indent: string = ''): string {
    let xml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        xml += `${indent}<${key} />\n`;
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        xml += `${indent}<${key}>\n`;
        xml += this.objectToXML(value, indent + '  ');
        xml += `${indent}</${key}>\n`;
      } else {
        let stringValue = String(value);
        if (value instanceof Date) {
          stringValue = value.toISOString();
        }
        // Escapar caracteres XML
        stringValue = stringValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        
        xml += `${indent}<${key}>${stringValue}</${key}>\n`;
      }
    }
    
    return xml;
  }

  /**
   * Gera nome do arquivo
   */
  private generateFilename(options: ExportOptions): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const dateRange = `${format(options.dateRange.start, 'yyyy-MM-dd')}_to_${format(options.dateRange.end, 'yyyy-MM-dd')}`;
    
    return `analytics_${options.dataType}_${dateRange}_${timestamp}.${options.format}`;
  }

  /**
   * Registra exportação no banco
   */
  private async logExport(
    options: ExportOptions,
    userId: string,
    filename: string,
    recordCount: number,
    fileSize: number,
    processingTime: number
  ): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        organizationId: options.filters?.organizationId,
        userId,
        category: 'data_export',
        action: options.format,
        label: `Export ${options.dataType} as ${options.format}`,
        status: 'success',
        duration: processingTime,
        fileSize,
        value: recordCount,
        metadata: {
          filename,
          dataType: options.dataType,
          format: options.format,
          dateRange: options.dateRange,
          filters: options.filters,
          recordCount,
          fileSize,
          processingTime
        }
      }
    });
  }

  /**
   * Lista exportações anteriores
   */
  async getExportHistory(userId: string, organizationId?: string): Promise<any[]> {
    const exports = await prisma.analyticsEvent.findMany({
      where: {
        category: 'data_export',
        userId,
        ...(organizationId && { organizationId })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return exports.map(exp => ({
      id: exp.id,
      filename: (exp.metadata as any)?.filename,
      dataType: (exp.metadata as any)?.dataType,
      format: exp.action,
      recordCount: exp.value,
      fileSize: exp.fileSize,
      processingTime: exp.duration,
      createdAt: exp.createdAt,
      status: exp.status
    }));
  }
}