/**
 * Teste do Sistema de Renderização FASE 2 - REAL
 * Testa todos os componentes do sistema de renderização
 */

const { addRenderJob, getVideoJobStatus } = require('./lib/queue/render-queue');

async function testRenderSystem() {
  console.log('🧪 Iniciando teste do sistema de renderização REAL...\n');

  try {
    // 1. Teste de adição de job na fila
    console.log('1️⃣ Testando adição de job na fila...');
    
    const testJobData = {
      projectId: 'test-project-' + Date.now(),
      userId: 'test-user',
      config: {
        resolution: '1080p',
        fps: 30,
        quality: 'high',
        format: 'mp4'
      }
    };

    const job = await addRenderJob(testJobData);
    
    if (job) {
      console.log('✅ Job adicionado com sucesso:', job.id);
      
      // 2. Teste de verificação de status
      console.log('\n2️⃣ Testando verificação de status...');
      
      // Aguardar um pouco para o job começar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const status = await getVideoJobStatus(job.id);
      
      if (status) {
        console.log('✅ Status obtido com sucesso:', {
          status: status.status,
          progress: status.progress
        });
      } else {
        console.log('❌ Falha ao obter status do job');
      }
      
      // 3. Aguardar conclusão (máximo 30 segundos)
      console.log('\n3️⃣ Aguardando conclusão do job...');
      
      let attempts = 0;
      const maxAttempts = 15; // 30 segundos
      
      while (attempts < maxAttempts) {
        const currentStatus = await getVideoJobStatus(job.id);
        
        if (currentStatus) {
          console.log(`📊 Status: ${currentStatus.status} - Progresso: ${currentStatus.progress}%`);
          
          if (currentStatus.status === 'completed') {
            console.log('✅ Job concluído com sucesso!');
            console.log('📹 Resultado:', currentStatus.result);
            break;
          } else if (currentStatus.status === 'failed') {
            console.log('❌ Job falhou:', currentStatus.error);
            break;
          }
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (attempts >= maxAttempts) {
        console.log('⏰ Timeout: Job não concluído em 30 segundos');
      }
      
    } else {
      console.log('❌ Falha ao adicionar job na fila');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }

  console.log('\n🏁 Teste concluído!');
}

// Executar teste
testRenderSystem().catch(console.error);