/**
 * Teste do sistema de renderização real
 * FASE 2 - FFmpeg Real
 */

const testRenderSystem = async () => {
  console.log('🎬 Testando sistema de renderização real...');
  
  const baseUrl = 'http://localhost:3000';
  
  // Dados de teste para renderização
  const testData = {
    projectId: 'test-project-' + Date.now(),
    slides: [
      {
        id: 'slide-1',
        duration: 3,
        content: {
          type: 'text',
          text: 'Slide 1 - Teste de Renderização',
          background: '#1e40af'
        }
      },
      {
        id: 'slide-2', 
        duration: 3,
        content: {
          type: 'text',
          text: 'Slide 2 - Sistema FFmpeg Real',
          background: '#dc2626'
        }
      }
    ],
    config: {
      width: 1920,
      height: 1080,
      fps: 30,
      quality: 'medium',
      format: 'mp4'
    }
  };

  try {
    // 1. Iniciar renderização
    console.log('📤 Iniciando renderização...');
    const startResponse = await fetch(`${baseUrl}/api/render/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!startResponse.ok) {
      throw new Error(`Erro ao iniciar: ${startResponse.status}`);
    }

    const startResult = await startResponse.json();
    console.log('✅ Renderização iniciada:', startResult);

    const jobId = startResult.jobId;

    // 2. Monitorar status
    console.log('📊 Monitorando progresso...');
    let completed = false;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutos máximo

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Aguardar 10s
      
      const statusResponse = await fetch(`${baseUrl}/api/render/status?jobId=${jobId}`);
      
      if (!statusResponse.ok) {
        console.warn(`⚠️ Erro ao verificar status: ${statusResponse.status}`);
        attempts++;
        continue;
      }

      const status = await statusResponse.json();
      console.log(`📈 Status: ${status.status} - Progresso: ${status.progress}%`);

      if (status.status === 'completed') {
        console.log('🎉 Renderização concluída!');
        console.log('📹 Resultado:', status.result);
        completed = true;
      } else if (status.status === 'failed') {
        console.error('❌ Renderização falhou:', status.error);
        break;
      }

      attempts++;
    }

    if (!completed && attempts >= maxAttempts) {
      console.warn('⏰ Timeout - renderização ainda em progresso');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar teste
testRenderSystem();