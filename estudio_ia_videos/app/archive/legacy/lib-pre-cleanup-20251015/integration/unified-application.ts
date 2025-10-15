/**
 * 🚀 UNIFIED APPLICATION BOOTSTRAP
 * 
 * Arquivo principal de inicialização do aplicativo unificado.
 * Registra e inicializa todos os módulos do sistema integrado.
 * 
 * @version 1.0.0
 * @date 08/10/2025
 */

import { getSystemIntegrationManager, ModuleConfig } from './system-integration-core';
import { adapters } from './module-adapters';

// ============================================================================
// CONFIGURAÇÃO DOS MÓDULOS
// ============================================================================

const MODULE_CONFIGS: { [key: string]: ModuleConfig } = {
  // Core Infrastructure (prioridade máxima)
  storage: {
    name: 'Storage Service (S3)',
    version: '1.0.0',
    enabled: true,
    dependencies: [],
    priority: 100,
    healthCheck: async () => adapters.storage.healthCheck()
  },

  analytics: {
    name: 'Analytics & Metrics',
    version: '1.0.0',
    enabled: true,
    dependencies: [],
    priority: 90,
    healthCheck: async () => adapters.analytics.healthCheck()
  },

  // Processing Engines
  pptx: {
    name: 'PPTX Processing Engine',
    version: '2.1.0',
    enabled: true,
    dependencies: ['storage', 'analytics'],
    priority: 80,
    healthCheck: async () => adapters.pptx.healthCheck()
  },

  tts: {
    name: 'Text-to-Speech Service',
    version: '1.0.0',
    enabled: true,
    dependencies: ['storage', 'analytics'],
    priority: 80,
    healthCheck: async () => adapters.tts.healthCheck()
  },

  avatar: {
    name: 'Avatar Rendering System',
    version: '1.0.0',
    enabled: true,
    dependencies: ['storage', 'tts', 'analytics'],
    priority: 70,
    healthCheck: async () => adapters.avatar.healthCheck()
  },

  render: {
    name: 'Video Render Engine',
    version: '1.0.0',
    enabled: true,
    dependencies: ['storage', 'avatar', 'tts', 'analytics'],
    priority: 60,
    healthCheck: async () => adapters.render.healthCheck()
  },

  // High-level Features
  canvas: {
    name: 'Canvas Editor Pro',
    version: '1.0.0',
    enabled: true,
    dependencies: ['pptx', 'avatar', 'tts', 'render'],
    priority: 50,
    healthCheck: async () => Promise.resolve(true) // TODO: Implementar
  },

  timeline: {
    name: 'Timeline Editor Professional',
    version: '1.0.0',
    enabled: true,
    dependencies: ['pptx', 'avatar', 'tts', 'render'],
    priority: 50,
    healthCheck: async () => Promise.resolve(true) // TODO: Implementar
  },

  collaboration: {
    name: 'Real-time Collaboration',
    version: '1.0.0',
    enabled: false, // Desabilitado por padrão
    dependencies: ['analytics'],
    priority: 40,
    healthCheck: async () => Promise.resolve(true) // TODO: Implementar
  },

  // Enterprise Features
  sso: {
    name: 'Enterprise SSO',
    version: '1.0.0',
    enabled: false, // Desabilitado por padrão
    dependencies: ['analytics'],
    priority: 30,
    healthCheck: async () => Promise.resolve(true) // TODO: Implementar
  },

  whiteLabel: {
    name: 'White Label & Multi-tenancy',
    version: '1.0.0',
    enabled: false, // Desabilitado por padrão
    dependencies: ['analytics'],
    priority: 30,
    healthCheck: async () => Promise.resolve(true) // TODO: Implementar
  }
};

// ============================================================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================================================

class UnifiedApplication {
  private integrationManager = getSystemIntegrationManager();
  private isRunning: boolean = false;

  /**
   * Inicializa o aplicativo unificado
   */
  async initialize(): Promise<void> {
    if (this.isRunning) {
      console.warn('[App] Sistema já está em execução');
      return;
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 ESTÚDIO IA DE VÍDEOS - SISTEMA INTEGRADO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    try {
      // Registrar todos os módulos
      this.registerModules();

      // Configurar event listeners
      this.setupEventListeners();

      // Inicializar sistema integrado
      await this.integrationManager.initialize();

      this.isRunning = true;

      // Exibir status
      this.displayStatus();

      console.log('');
      console.log('✅ Sistema pronto para uso!');
      console.log('');

    } catch (error) {
      console.error('');
      console.error('❌ Erro fatal na inicialização do sistema:', error);
      console.error('');
      throw error;
    }
  }

  /**
   * Registra todos os módulos configurados
   */
  private registerModules(): void {
    console.log('📦 Registrando módulos...');
    console.log('');

    for (const [moduleId, config] of Object.entries(MODULE_CONFIGS)) {
      this.integrationManager.registerModule(moduleId, config);
    }

    console.log('');
  }

  /**
   * Configura listeners para eventos do sistema
   */
  private setupEventListeners(): void {
    this.integrationManager.on('moduleInitialized', ({ moduleId, module }) => {
      console.log(`  ✅ ${module.name} → Pronto`);
    });

    this.integrationManager.on('moduleError', ({ moduleId, module, error }) => {
      console.error(`  ❌ ${module.name} → Erro:`, error);
    });

    this.integrationManager.on('healthCheckCompleted', (results) => {
      const failedModules = Object.entries(results)
        .filter(([_, healthy]) => !healthy)
        .map(([id, _]) => id);

      if (failedModules.length > 0) {
        console.warn(`[Health Check] Módulos com problemas: ${failedModules.join(', ')}`);
      }
    });
  }

  /**
   * Exibe status do sistema
   */
  private displayStatus(): void {
    const status = this.integrationManager.getIntegrationStatus();
    const modules = this.integrationManager.listModules();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 STATUS DO SISTEMA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Total de Módulos:      ${status.totalModules}`);
    console.log(`Módulos Ativos:        ${status.activeModules}`);
    console.log(`Módulos Saudáveis:     ${status.healthyModules}`);
    console.log(`Módulos com Falha:     ${status.failedModules}`);
    console.log(`Status Geral:          ${this.getStatusIcon(status.overallStatus)} ${status.overallStatus.toUpperCase()}`);
    console.log('');
    console.log('───────────────────────────────────────────────────────────');
    console.log('📋 MÓDULOS CARREGADOS');
    console.log('───────────────────────────────────────────────────────────');
    console.log('');

    const sortedModules = Object.entries(modules).sort((a, b) => b[1].priority - a[1].priority);

    for (const [moduleId, config] of sortedModules) {
      const statusIcon = config.enabled ? '🟢' : '⚪';
      const priorityBar = '█'.repeat(Math.floor(config.priority / 10));
      
      console.log(`${statusIcon} ${config.name.padEnd(35)} [${priorityBar.padEnd(10)}] v${config.version}`);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
  }

  /**
   * Retorna ícone para status
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  }

  /**
   * Desliga o sistema de forma graceful
   */
  async shutdown(): Promise<void> {
    if (!this.isRunning) {
      console.warn('[App] Sistema não está em execução');
      return;
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🛑 DESLIGANDO SISTEMA...');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    await this.integrationManager.shutdown();

    this.isRunning = false;

    console.log('');
    console.log('✅ Sistema desligado com sucesso');
    console.log('');
  }

  /**
   * Retorna status atual do sistema
   */
  getStatus() {
    return {
      running: this.isRunning,
      integration: this.integrationManager.getIntegrationStatus(),
      modules: this.integrationManager.listModules()
    };
  }

  /**
   * Acessa um adaptador específico
   */
  getAdapter(name: keyof typeof adapters) {
    return adapters[name];
  }
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================

let appInstance: UnifiedApplication | null = null;

export function getUnifiedApplication(): UnifiedApplication {
  if (!appInstance) {
    appInstance = new UnifiedApplication();
  }
  return appInstance;
}

export async function initializeUnifiedSystem(): Promise<UnifiedApplication> {
  const app = getUnifiedApplication();
  await app.initialize();
  return app;
}

export { UnifiedApplication, adapters };
export default getUnifiedApplication;
