/**
 * 🔥 SYSTEM INTEGRATION CORE
 * 
 * Módulo central de integração e consolidação do sistema.
 * Unifica todos os subsistemas independentes em um único aplicativo estável.
 * 
 * @version 1.0.0
 * @date 08/10/2025
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ModuleConfig {
  name: string;
  version: string;
  enabled: boolean;
  dependencies: string[];
  priority: number;
  healthCheck: () => Promise<boolean>;
}

export interface IntegrationStatus {
  totalModules: number;
  activeModules: number;
  failedModules: number;
  healthyModules: number;
  overallStatus: 'healthy' | 'degraded' | 'critical';
}

export interface ModuleRegistry {
  [key: string]: ModuleConfig;
}

// ============================================================================
// SYSTEM INTEGRATION MANAGER
// ============================================================================

export class SystemIntegrationManager extends EventEmitter {
  private modules: ModuleRegistry = {};
  private initialized: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();
  }

  /**
   * Registra um novo módulo no sistema integrado
   */
  registerModule(moduleId: string, config: ModuleConfig): void {
    if (this.modules[moduleId]) {
      console.warn(`[Integration] Módulo ${moduleId} já registrado. Sobrescrevendo...`);
    }

    this.modules[moduleId] = config;
    this.emit('moduleRegistered', { moduleId, config });
    
    console.log(`[Integration] ✅ Módulo registrado: ${config.name} v${config.version}`);
  }

  /**
   * Inicializa todos os módulos na ordem correta de dependências
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[Integration] Sistema já inicializado');
      return;
    }

    console.log('[Integration] 🚀 Iniciando integração do sistema...');

    // Ordenar módulos por prioridade e dependências
    const orderedModules = this.getModuleInitializationOrder();

    // Inicializar cada módulo
    for (const moduleId of orderedModules) {
      const module = this.modules[moduleId];
      
      if (!module.enabled) {
        console.log(`[Integration] ⏭️  Módulo ${module.name} desabilitado, pulando...`);
        continue;
      }

      try {
        console.log(`[Integration] 🔄 Inicializando ${module.name}...`);
        
        // Verificar dependências
        await this.checkDependencies(moduleId);
        
        // Health check
        const healthy = await module.healthCheck();
        
        if (!healthy) {
          throw new Error(`Health check falhou para ${module.name}`);
        }

        console.log(`[Integration] ✅ ${module.name} inicializado com sucesso`);
        this.emit('moduleInitialized', { moduleId, module });
        
      } catch (error) {
        console.error(`[Integration] ❌ Erro ao inicializar ${module.name}:`, error);
        this.emit('moduleError', { moduleId, module, error });
      }
    }

    this.initialized = true;
    this.startHealthMonitoring();
    
    console.log('[Integration] ✅ Sistema integrado inicializado com sucesso');
    this.emit('systemInitialized');
  }

  /**
   * Verifica dependências de um módulo
   */
  private async checkDependencies(moduleId: string): Promise<void> {
    const module = this.modules[moduleId];
    
    for (const depId of module.dependencies) {
      if (!this.modules[depId]) {
        throw new Error(`Dependência não encontrada: ${depId} (requerida por ${module.name})`);
      }

      if (!this.modules[depId].enabled) {
        throw new Error(`Dependência desabilitada: ${depId} (requerida por ${module.name})`);
      }
    }
  }

  /**
   * Calcula ordem de inicialização baseada em dependências e prioridade
   */
  private getModuleInitializationOrder(): string[] {
    const moduleIds = Object.keys(this.modules);
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (moduleId: string) => {
      if (visited.has(moduleId)) return;

      const module = this.modules[moduleId];
      
      // Visitar dependências primeiro
      for (const depId of module.dependencies) {
        if (this.modules[depId]) {
          visit(depId);
        }
      }

      visited.add(moduleId);
      order.push(moduleId);
    };

    // Ordenar por prioridade antes de processar
    const sortedByPriority = moduleIds.sort((a, b) => {
      return this.modules[b].priority - this.modules[a].priority;
    });

    for (const moduleId of sortedByPriority) {
      visit(moduleId);
    }

    return order;
  }

  /**
   * Inicia monitoramento contínuo de saúde
   */
  private startHealthMonitoring(): void {
    // Health check a cada 60 segundos
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000);

    console.log('[Integration] 🏥 Monitoramento de saúde iniciado');
  }

  /**
   * Executa verificação de saúde em todos os módulos
   */
  private async performHealthCheck(): Promise<void> {
    const results: { [key: string]: boolean } = {};

    for (const [moduleId, module] of Object.entries(this.modules)) {
      if (!module.enabled) continue;

      try {
        results[moduleId] = await module.healthCheck();
      } catch (error) {
        results[moduleId] = false;
        console.error(`[Integration] Health check falhou para ${module.name}:`, error);
      }
    }

    this.emit('healthCheckCompleted', results);
  }

  /**
   * Retorna status geral do sistema integrado
   */
  getIntegrationStatus(): IntegrationStatus {
    const moduleIds = Object.keys(this.modules);
    const totalModules = moduleIds.length;
    const activeModules = moduleIds.filter(id => this.modules[id].enabled).length;
    
    // Simplificado - em produção, rastrear módulos com falha
    const failedModules = 0;
    const healthyModules = activeModules;

    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (failedModules > 0) {
      overallStatus = failedModules > activeModules / 2 ? 'critical' : 'degraded';
    }

    return {
      totalModules,
      activeModules,
      failedModules,
      healthyModules,
      overallStatus
    };
  }

  /**
   * Desliga o sistema de forma graceful
   */
  async shutdown(): Promise<void> {
    console.log('[Integration] 🛑 Iniciando shutdown graceful...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Desligar módulos em ordem reversa
    const orderedModules = this.getModuleInitializationOrder().reverse();

    for (const moduleId of orderedModules) {
      const module = this.modules[moduleId];
      console.log(`[Integration] 🔽 Desligando ${module.name}...`);
      this.emit('moduleShutdown', { moduleId, module });
    }

    this.initialized = false;
    console.log('[Integration] ✅ Shutdown completo');
    this.emit('systemShutdown');
  }

  /**
   * Retorna informações de um módulo específico
   */
  getModuleInfo(moduleId: string): ModuleConfig | null {
    return this.modules[moduleId] || null;
  }

  /**
   * Lista todos os módulos registrados
   */
  listModules(): ModuleRegistry {
    return { ...this.modules };
  }

  /**
   * Verifica se o sistema está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

let integrationManager: SystemIntegrationManager | null = null;

export function getSystemIntegrationManager(): SystemIntegrationManager {
  if (!integrationManager) {
    integrationManager = new SystemIntegrationManager();
  }
  return integrationManager;
}

export default getSystemIntegrationManager;
