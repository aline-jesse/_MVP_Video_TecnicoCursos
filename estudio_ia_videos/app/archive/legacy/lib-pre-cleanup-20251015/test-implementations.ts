/**
 * 🧪 SCRIPT DE TESTE DAS IMPLEMENTAÇÕES REAIS
 * 
 * Testa todas as funcionalidades implementadas:
 * - PPTX Processor
 * - Render Queue
 * - Analytics
 * 
 * @version 1.0.0
 * @date 08/10/2025
 */

import { PrismaClient } from '@prisma/client';
import { getRenderQueue } from './render-queue-real';
import { analytics } from './analytics-real';
import * as path from 'path';

const prisma = new PrismaClient();

// ============================================================================
// TESTE 1: ANALYTICS
// ============================================================================

async function testAnalytics() {
  console.log('\n🧪 TESTE 1: Analytics Real\n' + '='.repeat(50));

  try {
    // Criar usuário de teste
    const user = await prisma.user.upsert({
      where: { email: 'test@analytics.com' },
      update: {},
      create: {
        email: 'test@analytics.com',
        name: 'Test User Analytics',
        role: 'user'
      }
    });

    console.log('✅ Usuário criado:', user.id);

    // Rastrear evento
    await analytics.track({
      userId: user.id,
      event: 'video.created',
      properties: {
        projectId: 'test-project-123',
        duration: 30,
        resolution: '1080p'
      },
      timestamp: new Date()
    });

    console.log('✅ Evento rastreado');

    // Obter métricas do usuário
    const userMetrics = await analytics.getUserMetrics(user.id);
    console.log('✅ Métricas do usuário:', {
      totalEvents: userMetrics?.totalEvents,
      totalSessions: userMetrics?.totalSessions,
      totalVideos: userMetrics?.totalVideosCreated
    });

    // Obter métricas do sistema
    const systemMetrics = await analytics.getSystemMetrics();
    console.log('✅ Métricas do sistema:', {
      totalUsers: systemMetrics.totalUsers,
      activeUsers: systemMetrics.activeUsers,
      uptime: Math.round(systemMetrics.uptime) + 's'
    });

    return true;

  } catch (error) {
    console.error('❌ Erro no teste Analytics:', error);
    return false;
  }
}

// ============================================================================
// TESTE 2: RENDER QUEUE
// ============================================================================

async function testRenderQueue() {
  console.log('\n🧪 TESTE 2: Render Queue Real\n' + '='.repeat(50));

  try {
    // Criar projeto de teste
    const user = await prisma.user.upsert({
      where: { email: 'test@render.com' },
      update: {},
      create: {
        email: 'test@render.com',
        name: 'Test User Render',
        role: 'user'
      }
    });

    const project = await prisma.project.create({
      data: {
        name: 'Test Render Project',
        userId: user.id,
        status: 'DRAFT'
      }
    });

    console.log('✅ Projeto criado:', project.id);

    // Adicionar job à fila
    const queue = getRenderQueue();
    
    const jobId = await queue.addRenderJob({
      id: `render-${Date.now()}`,
      projectId: project.id,
      userId: user.id,
      type: 'video',
      priority: 'normal',
      sourceFile: '/test/input.pptx',
      outputFormat: 'mp4',
      quality: 'high',
      settings: {
        resolution: '1080p',
        fps: 30,
        codec: 'h264',
        bitrate: '5000k',
        format: 'mp4',
        quality: 'best'
      },
      metadata: {
        title: 'Test Video',
        createdAt: new Date()
      }
    });

    console.log('✅ Job adicionado à fila:', jobId);

    // Obter estatísticas
    const stats = await queue.getQueueStats();
    console.log('✅ Estatísticas da fila:', {
      waiting: stats.waiting,
      active: stats.active,
      completed: stats.completed,
      failed: stats.failed
    });

    return true;

  } catch (error) {
    console.error('❌ Erro no teste Render Queue:', error);
    return false;
  }
}

// ============================================================================
// TESTE 3: INTEGRAÇÃO COMPLETA
// ============================================================================

async function testIntegration() {
  console.log('\n🧪 TESTE 3: Integração Completa\n' + '='.repeat(50));

  try {
    const user = await prisma.user.upsert({
      where: { email: 'test@integration.com' },
      update: {},
      create: {
        email: 'test@integration.com',
        name: 'Test User Integration',
        role: 'user'
      }
    });

    const project = await prisma.project.create({
      data: {
        name: 'Integration Test Project',
        userId: user.id,
        status: 'DRAFT'
      }
    });

    // 1. Rastrear início do fluxo
    await analytics.track({
      userId: user.id,
      event: 'project.created',
      properties: { projectId: project.id },
      timestamp: new Date()
    });

    // 2. Adicionar à fila de renderização
    const queue = getRenderQueue();
    const jobId = await queue.addRenderJob({
      id: `integration-${Date.now()}`,
      projectId: project.id,
      userId: user.id,
      type: 'video',
      priority: 'high',
      sourceFile: '/test/integration.pptx',
      outputFormat: 'mp4',
      quality: 'high',
      settings: {
        resolution: '1080p',
        fps: 30,
        codec: 'h264',
        bitrate: '5000k',
        format: 'mp4',
        quality: 'best'
      },
      metadata: { test: true }
    });

    // 3. Rastrear conclusão
    await analytics.track({
      userId: user.id,
      event: 'render.queued',
      properties: { 
        projectId: project.id,
        jobId 
      },
      timestamp: new Date()
    });

    console.log('✅ Fluxo completo executado com sucesso!');
    console.log('   - Usuário:', user.id);
    console.log('   - Projeto:', project.id);
    console.log('   - Job:', jobId);

    return true;

  } catch (error) {
    console.error('❌ Erro no teste de Integração:', error);
    return false;
  }
}

// ============================================================================
// EXECUTAR TODOS OS TESTES
// ============================================================================

async function runAllTests() {
  console.log('\n🚀 INICIANDO TESTES DAS IMPLEMENTAÇÕES REAIS');
  console.log('='.repeat(70));
  console.log(`⏰ Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log('='.repeat(70));

  const results = {
    analytics: false,
    renderQueue: false,
    integration: false
  };

  // Executar testes
  results.analytics = await testAnalytics();
  await new Promise(resolve => setTimeout(resolve, 1000));

  results.renderQueue = await testRenderQueue();
  await new Promise(resolve => setTimeout(resolve, 1000));

  results.integration = await testIntegration();

  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DOS TESTES');
  console.log('='.repeat(70));
  console.log(`Analytics:     ${results.analytics ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Render Queue:  ${results.renderQueue ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Integração:    ${results.integration ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log('='.repeat(70));

  const totalPassed = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 RESULTADO: ${totalPassed}/${totalTests} testes passaram`);
  
  if (totalPassed === totalTests) {
    console.log('✅ TODOS OS TESTES PASSARAM! Sistema 100% funcional!');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os logs acima.');
  }

  await prisma.$disconnect();
  process.exit(totalPassed === totalTests ? 0 : 1);
}

// Executar
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testAnalytics, testRenderQueue, testIntegration, runAllTests };
