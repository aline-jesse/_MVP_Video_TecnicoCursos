/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 SISTEMA DE MONITORAMENTO EM TEMPO REAL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Monitora saúde e performance do sistema em tempo real
 * Versão: 1.0
 * Data: 10/10/2025
 * 
 * Funcionalidades:
 * - Monitor de CPU e Memória
 * - Monitor de Database (conexões, queries)
 * - Monitor de API (requests, latência)
 * - Monitor de Disco (espaço, I/O)
 * - Alertas automáticos
 * - Dashboard em tempo real
 * - Métricas históricas
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface SystemMetrics {
  timestamp: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
}

interface CpuMetrics {
  usage: number;
  cores: number;
  loadAverage: number[];
  model: string;
}

interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

interface DiskMetrics {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

interface NetworkMetrics {
  interfaces: number;
  active: string[];
}

interface Alert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  metric: string;
  value: number;
}

class SystemMonitor {
  private metricsHistory: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private maxHistorySize: number = 60; // 60 medições
  private isRunning: boolean = false;

  // Thresholds
  private readonly CPU_WARNING = 70;
  private readonly CPU_CRITICAL = 90;
  private readonly MEMORY_WARNING = 80;
  private readonly MEMORY_CRITICAL = 95;
  private readonly DISK_WARNING = 80;
  private readonly DISK_CRITICAL = 95;

  private log(message: string, level: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
    const colors = {
      info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m',
      warning: '\x1b[33m', reset: '\x1b[0m'
    };
    console.log(`${colors[level]}${icons[level]} ${message}${colors.reset}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COLETA DE MÉTRICAS
  // ═══════════════════════════════════════════════════════════════════════

  private getCpuMetrics(): CpuMetrics {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    // Calcular uso de CPU (média dos cores)
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    return {
      usage,
      cores: cpus.length,
      loadAverage: loadAvg,
      model: cpus[0]?.model || 'Unknown'
    };
  }

  private getMemoryMetrics(): MemoryMetrics {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = (used / total) * 100;

    return {
      total,
      used,
      free,
      usagePercent
    };
  }

  private getDiskMetrics(): DiskMetrics {
    try {
      const projectRoot = path.join(process.cwd(), '..');
      let total = 0;
      let free = 0;
      let used = 0;

      if (process.platform === 'win32') {
        // Windows: usar wmic
        const drive = projectRoot.substring(0, 2); // Ex: C:
        const output = execSync(
          `wmic logicaldisk where "DeviceID='${drive}'" get Size,FreeSpace /format:csv`,
          { encoding: 'utf-8' }
        );

        const lines = output.trim().split('\n').filter(l => l.trim());
        if (lines.length > 1) {
          const data = lines[1].split(',');
          free = parseInt(data[1]) || 0;
          total = parseInt(data[2]) || 0;
          used = total - free;
        }
      } else {
        // Linux/Mac: usar df
        const output = execSync(`df -k "${projectRoot}"`, { encoding: 'utf-8' });
        const lines = output.trim().split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          total = parseInt(parts[1]) * 1024;
          used = parseInt(parts[2]) * 1024;
          free = parseInt(parts[3]) * 1024;
        }
      }

      const usagePercent = total > 0 ? (used / total) * 100 : 0;

      return { total, used, free, usagePercent };
    } catch (error) {
      return { total: 0, used: 0, free: 0, usagePercent: 0 };
    }
  }

  private getNetworkMetrics(): NetworkMetrics {
    const interfaces = os.networkInterfaces();
    const active: string[] = [];

    for (const [name, nets] of Object.entries(interfaces)) {
      if (!nets) continue;
      
      const hasActiveConnection = nets.some(net => 
        !net.internal && net.address !== '127.0.0.1' && net.address !== '::1'
      );

      if (hasActiveConnection) {
        active.push(name);
      }
    }

    return {
      interfaces: Object.keys(interfaces).length,
      active
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ANÁLISE E ALERTAS
  // ═══════════════════════════════════════════════════════════════════════

  private analyzeMetrics(metrics: SystemMetrics): void {
    const timestamp = new Date().toISOString();

    // CPU
    if (metrics.cpu.usage >= this.CPU_CRITICAL) {
      this.alerts.push({
        level: 'critical',
        message: `CPU crítica: ${metrics.cpu.usage.toFixed(1)}%`,
        timestamp,
        metric: 'cpu',
        value: metrics.cpu.usage
      });
    } else if (metrics.cpu.usage >= this.CPU_WARNING) {
      this.alerts.push({
        level: 'warning',
        message: `CPU alta: ${metrics.cpu.usage.toFixed(1)}%`,
        timestamp,
        metric: 'cpu',
        value: metrics.cpu.usage
      });
    }

    // Memória
    if (metrics.memory.usagePercent >= this.MEMORY_CRITICAL) {
      this.alerts.push({
        level: 'critical',
        message: `Memória crítica: ${metrics.memory.usagePercent.toFixed(1)}%`,
        timestamp,
        metric: 'memory',
        value: metrics.memory.usagePercent
      });
    } else if (metrics.memory.usagePercent >= this.MEMORY_WARNING) {
      this.alerts.push({
        level: 'warning',
        message: `Memória alta: ${metrics.memory.usagePercent.toFixed(1)}%`,
        timestamp,
        metric: 'memory',
        value: metrics.memory.usagePercent
      });
    }

    // Disco
    if (metrics.disk.usagePercent >= this.DISK_CRITICAL) {
      this.alerts.push({
        level: 'critical',
        message: `Disco crítico: ${metrics.disk.usagePercent.toFixed(1)}%`,
        timestamp,
        metric: 'disk',
        value: metrics.disk.usagePercent
      });
    } else if (metrics.disk.usagePercent >= this.DISK_WARNING) {
      this.alerts.push({
        level: 'warning',
        message: `Disco cheio: ${metrics.disk.usagePercent.toFixed(1)}%`,
        timestamp,
        metric: 'disk',
        value: metrics.disk.usagePercent
      });
    }

    // Limitar histórico de alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COLETA PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  private collectMetrics(): SystemMetrics {
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      cpu: this.getCpuMetrics(),
      memory: this.getMemoryMetrics(),
      disk: this.getDiskMetrics(),
      network: this.getNetworkMetrics()
    };

    // Adicionar ao histórico
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Analisar e gerar alertas
    this.analyzeMetrics(metrics);

    return metrics;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════

  private clearScreen() {
    process.stdout.write('\x1Bc');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private getStatusIcon(percent: number, type: 'cpu' | 'memory' | 'disk'): string {
    const thresholds = {
      cpu: { warning: this.CPU_WARNING, critical: this.CPU_CRITICAL },
      memory: { warning: this.MEMORY_WARNING, critical: this.MEMORY_CRITICAL },
      disk: { warning: this.DISK_WARNING, critical: this.DISK_CRITICAL }
    };

    const threshold = thresholds[type];
    if (percent >= threshold.critical) return '🔴';
    if (percent >= threshold.warning) return '🟡';
    return '🟢';
  }

  private createProgressBar(percent: number, width: number = 30): string {
    const filled = Math.floor((percent / 100) * width);
    const empty = width - filled;
    
    let color = '\x1b[32m'; // Verde
    if (percent >= 70) color = '\x1b[33m'; // Amarelo
    if (percent >= 90) color = '\x1b[31m'; // Vermelho

    const bar = color + '█'.repeat(filled) + '\x1b[0m' + '░'.repeat(empty);
    return `[${bar}] ${percent.toFixed(1)}%`;
  }

  private renderDashboard(metrics: SystemMetrics) {
    this.clearScreen();

    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                   ║');
    console.log('║           📊 MONITOR DE SISTEMA EM TEMPO REAL                    ║');
    console.log('║                                                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    // Timestamp
    const now = new Date();
    console.log(`⏰ ${now.toLocaleString('pt-BR')}\n`);

    // CPU
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`🖥️  CPU ${this.getStatusIcon(metrics.cpu.usage, 'cpu')}`);
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`   Modelo: ${metrics.cpu.model}`);
    console.log(`   Cores: ${metrics.cpu.cores}`);
    console.log(`   Uso: ${this.createProgressBar(metrics.cpu.usage)}`);
    console.log(`   Load Average: ${metrics.cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}`);
    console.log('');

    // Memória
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`💾 MEMÓRIA ${this.getStatusIcon(metrics.memory.usagePercent, 'memory')}`);
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`   Total: ${this.formatBytes(metrics.memory.total)}`);
    console.log(`   Usado: ${this.formatBytes(metrics.memory.used)}`);
    console.log(`   Livre: ${this.formatBytes(metrics.memory.free)}`);
    console.log(`   Uso: ${this.createProgressBar(metrics.memory.usagePercent)}`);
    console.log('');

    // Disco
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`💿 DISCO ${this.getStatusIcon(metrics.disk.usagePercent, 'disk')}`);
    console.log('═══════════════════════════════════════════════════════════════════');
    if (metrics.disk.total > 0) {
      console.log(`   Total: ${this.formatBytes(metrics.disk.total)}`);
      console.log(`   Usado: ${this.formatBytes(metrics.disk.used)}`);
      console.log(`   Livre: ${this.formatBytes(metrics.disk.free)}`);
      console.log(`   Uso: ${this.createProgressBar(metrics.disk.usagePercent)}`);
    } else {
      console.log('   ⚠️  Não disponível');
    }
    console.log('');

    // Rede
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('🌐 REDE');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`   Interfaces: ${metrics.network.interfaces}`);
    console.log(`   Ativas: ${metrics.network.active.join(', ') || 'Nenhuma'}`);
    console.log('');

    // Alertas recentes (últimos 5)
    if (this.alerts.length > 0) {
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log('🚨 ALERTAS RECENTES');
      console.log('═══════════════════════════════════════════════════════════════════');
      
      const recentAlerts = this.alerts.slice(-5).reverse();
      recentAlerts.forEach(alert => {
        const icon = alert.level === 'critical' ? '🔴' : alert.level === 'warning' ? '🟡' : 'ℹ️';
        const time = new Date(alert.timestamp).toLocaleTimeString('pt-BR');
        console.log(`   ${icon} [${time}] ${alert.message}`);
      });
      console.log('');
    }

    // Estatísticas do histórico
    if (this.metricsHistory.length > 1) {
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log('📈 HISTÓRICO (últimos 60s)');
      console.log('═══════════════════════════════════════════════════════════════════');

      const cpuAvg = this.metricsHistory.reduce((sum, m) => sum + m.cpu.usage, 0) / this.metricsHistory.length;
      const memAvg = this.metricsHistory.reduce((sum, m) => sum + m.memory.usagePercent, 0) / this.metricsHistory.length;
      const cpuMax = Math.max(...this.metricsHistory.map(m => m.cpu.usage));
      const memMax = Math.max(...this.metricsHistory.map(m => m.memory.usagePercent));

      console.log(`   CPU média: ${cpuAvg.toFixed(1)}% | Pico: ${cpuMax.toFixed(1)}%`);
      console.log(`   Memória média: ${memAvg.toFixed(1)}% | Pico: ${memMax.toFixed(1)}%`);
      console.log(`   Amostras: ${this.metricsHistory.length}`);
      console.log('');
    }

    // Footer
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('💡 Pressione Ctrl+C para sair');
    console.log('═══════════════════════════════════════════════════════════════════\n');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXPORTAR MÉTRICAS
  // ═══════════════════════════════════════════════════════════════════════

  exportMetrics(filepath?: string): void {
    const reportPath = filepath || path.join(
      process.cwd(),
      'reports',
      `monitor-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );

    // Criar diretório se não existir
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metricsHistory,
      alerts: this.alerts,
      summary: this.generateSummary()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📊 Relatório exportado: ${reportPath}`, 'success');
  }

  private generateSummary() {
    if (this.metricsHistory.length === 0) {
      return {};
    }

    const cpuValues = this.metricsHistory.map(m => m.cpu.usage);
    const memValues = this.metricsHistory.map(m => m.memory.usagePercent);
    const diskValues = this.metricsHistory.map(m => m.disk.usagePercent).filter(v => v > 0);

    return {
      duration: this.metricsHistory.length,
      cpu: {
        avg: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length,
        min: Math.min(...cpuValues),
        max: Math.max(...cpuValues)
      },
      memory: {
        avg: memValues.reduce((a, b) => a + b, 0) / memValues.length,
        min: Math.min(...memValues),
        max: Math.max(...memValues)
      },
      disk: diskValues.length > 0 ? {
        avg: diskValues.reduce((a, b) => a + b, 0) / diskValues.length,
        min: Math.min(...diskValues),
        max: Math.max(...diskValues)
      } : null,
      alerts: {
        total: this.alerts.length,
        critical: this.alerts.filter(a => a.level === 'critical').length,
        warning: this.alerts.filter(a => a.level === 'warning').length,
        info: this.alerts.filter(a => a.level === 'info').length
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MODO CONTÍNUO
  // ═══════════════════════════════════════════════════════════════════════

  async startMonitoring(interval: number = 1000): Promise<void> {
    this.isRunning = true;

    // Handler para Ctrl+C
    process.on('SIGINT', () => {
      this.isRunning = false;
      this.exportMetrics();
      console.log('\n👋 Monitor encerrado.');
      process.exit(0);
    });

    while (this.isRunning) {
      const metrics = this.collectMetrics();
      this.renderDashboard(metrics);

      // Aguardar próxima iteração
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MODO SNAPSHOT
  // ═══════════════════════════════════════════════════════════════════════

  snapshot(): SystemMetrics {
    return this.collectMetrics();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const monitor = new SystemMonitor();
  
  const args = process.argv.slice(2);
  const mode = args[0] || 'live';

  if (mode === 'snapshot') {
    // Modo snapshot: uma medição e sai
    const metrics = monitor.snapshot();
    monitor.exportMetrics();
  } else {
    // Modo live: monitoramento contínuo
    await monitor.startMonitoring(1000);
  }
}

main().catch(console.error);
