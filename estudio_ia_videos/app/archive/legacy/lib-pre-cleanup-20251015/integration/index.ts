/**
 * 🔥 INTEGRATION MODULE - INDEX
 * 
 * Exporta todos os componentes do sistema de integração unificado.
 * 
 * @version 1.0.0
 * @date 08/10/2025
 */

// Core
export * from './system-integration-core';
export * from './module-adapters';
export * from './unified-application';

// Re-exports principais
export { 
  getSystemIntegrationManager,
  SystemIntegrationManager 
} from './system-integration-core';

export {
  adapters,
  PPTXProcessorAdapter,
  AvatarSystemAdapter,
  TTSServiceAdapter,
  RenderEngineAdapter,
  AnalyticsAdapter,
  StorageAdapter
} from './module-adapters';

export {
  getUnifiedApplication,
  initializeUnifiedSystem,
  UnifiedApplication
} from './unified-application';
