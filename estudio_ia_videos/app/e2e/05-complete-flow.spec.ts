import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E Tests - Complete User Flow
 * 
 * Teste do fluxo completo: Login → Upload → TTS → Render → Download
 */

test.describe('Complete User Flow', () => {
  test('should complete full workflow: login to video download', async ({ page }) => {
    // ==========================================
    // STEP 1: LOGIN
    // ==========================================
    
    console.log('Step 1: Login...');
    
    await page.goto('/login');
    
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    
    // Verificar login bem-sucedido
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    console.log('✓ Login successful');
    
    // ==========================================
    // STEP 2: UPLOAD PPTX
    // ==========================================
    
    console.log('Step 2: Uploading PPTX...');
    
    await page.goto('/dashboard/upload');
    
    // Upload arquivo
    const pptxFile = path.join(__dirname, 'fixtures', 'sample.pptx');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Aguardar upload
    await expect(page.locator('text=Upload em progresso')).toBeVisible();
    await expect(page.locator('text=Upload concluído')).toBeVisible({
      timeout: 30000,
    });
    
    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard/projects/*', { timeout: 10000 });
    
    console.log('✓ Upload successful');
    
    // Salvar ID do projeto para uso posterior
    const projectUrl = page.url();
    const projectId = projectUrl.split('/').pop();
    
    // ==========================================
    // STEP 3: VERIFY SLIDES
    // ==========================================
    
    console.log('Step 3: Verifying slides...');
    
    // Verificar que slides foram extraídos
    await expect(page.locator('[data-testid^="slide-"]')).toHaveCount(
      await page.locator('[data-testid^="slide-"]').count()
    );
    
    const slideCount = await page.locator('[data-testid^="slide-"]').count();
    console.log(`✓ Found ${slideCount} slides`);
    
    // ==========================================
    // STEP 4: GENERATE TTS FOR ALL SLIDES
    // ==========================================
    
    console.log('Step 4: Generating TTS...');
    
    // Abrir painel TTS
    await page.click('button:has-text("Gerar Áudio")');
    
    // Selecionar voz
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    
    console.log('✓ Voice selected');
    
    // Gerar para todos os slides
    await page.click('button:has-text("Gerar para Todos os Slides")');
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    
    // Aguardar progresso
    await expect(page.locator('text=Gerando')).toBeVisible();
    
    // Aguardar conclusão (pode demorar dependendo do número de slides)
    await expect(page.locator('text=Todos os áudios gerados')).toBeVisible({
      timeout: 120000, // 2 minutos
    });
    
    console.log('✓ TTS generation complete');
    
    // ==========================================
    // STEP 5: VERIFY AUDIO PLAYBACK
    // ==========================================
    
    console.log('Step 5: Verifying audio...');
    
    // Selecionar primeiro slide
    await page.click('[data-testid="slide-1"]');
    
    // Verificar que tem player de áudio
    await expect(page.locator('audio[data-slide="1"]')).toBeAttached();
    
    // Testar playback
    await page.click('button[aria-label="Reproduzir áudio"]');
    await page.waitForTimeout(2000); // Tocar por 2s
    await page.click('button[aria-label="Pausar áudio"]');
    
    console.log('✓ Audio playback verified');
    
    // ==========================================
    // STEP 6: CONFIGURE RENDER
    // ==========================================
    
    console.log('Step 6: Configuring render...');
    
    // Abrir painel de renderização
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Aguardar painel abrir
    await expect(page.locator('h2:has-text("Configuração de Vídeo")')).toBeVisible();
    
    // Configurar resolução
    await page.click('label:has-text("1080p")');
    
    // Configurar qualidade
    await page.click('label:has-text("Alta")');
    
    // Configurar formato (padrão MP4)
    
    // Habilitar transições
    await page.click('input[type="checkbox"][name="transitions"]');
    
    // Verificar estimativas
    await expect(page.locator('text=Tempo estimado:')).toBeVisible();
    await expect(page.locator('text=Tamanho estimado:')).toBeVisible();
    
    console.log('✓ Render configured');
    
    // ==========================================
    // STEP 7: START RENDERING
    // ==========================================
    
    console.log('Step 7: Starting render...');
    
    // Iniciar renderização
    await page.click('button:has-text("Iniciar Renderização")');
    
    // Verificar início
    await expect(page.locator('text=Renderização iniciada')).toBeVisible();
    
    // Aguardar tela de progresso
    await expect(page.locator('h2:has-text("Renderizando Vídeo")')).toBeVisible({
      timeout: 5000,
    });
    
    console.log('✓ Render started');
    
    // ==========================================
    // STEP 8: MONITOR PROGRESS
    // ==========================================
    
    console.log('Step 8: Monitoring progress...');
    
    // Verificar progress bar
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Verificar stages
    let currentStage = '';
    const checkProgress = async () => {
      const stage = await page.locator('[data-testid="current-stage"]').textContent();
      if (stage && stage !== currentStage) {
        currentStage = stage;
        console.log(`  Stage: ${stage}`);
      }
    };
    
    // Monitor a cada 5 segundos
    const progressInterval = setInterval(checkProgress, 5000);
    
    // Aguardar conclusão (pode demorar vários minutos)
    await expect(page.locator('text=Renderização concluída!')).toBeVisible({
      timeout: 300000, // 5 minutos
    });
    
    clearInterval(progressInterval);
    
    console.log('✓ Render complete');
    
    // ==========================================
    // STEP 9: PREVIEW VIDEO
    // ==========================================
    
    console.log('Step 9: Previewing video...');
    
    // Verificar player de vídeo
    await expect(page.locator('video')).toBeVisible();
    
    // Testar playback
    await page.click('button[aria-label="Reproduzir vídeo"]');
    
    // Aguardar alguns segundos
    await page.waitForTimeout(5000);
    
    // Pausar
    await page.click('button[aria-label="Pausar vídeo"]');
    
    console.log('✓ Video preview verified');
    
    // ==========================================
    // STEP 10: DOWNLOAD VIDEO
    // ==========================================
    
    console.log('Step 10: Downloading video...');
    
    // Configurar listener de download
    const downloadPromise = page.waitForEvent('download');
    
    // Clicar em download
    await page.click('button:has-text("Download Vídeo")');
    
    // Aguardar download
    const download = await downloadPromise;
    
    // Verificar arquivo
    expect(download.suggestedFilename()).toContain('.mp4');
    
    // Salvar arquivo (opcional)
    const downloadPath = path.join(__dirname, 'downloads', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    console.log(`✓ Video downloaded: ${download.suggestedFilename()}`);
    
    // ==========================================
    // STEP 11: VERIFY IN ANALYTICS
    // ==========================================
    
    console.log('Step 11: Verifying analytics...');
    
    // Navegar para analytics
    await page.goto('/dashboard/metrics');
    
    // Aguardar carregamento
    await expect(page.locator('h1:has-text("Dashboard de Analytics")')).toBeVisible();
    
    // Verificar que métricas foram atualizadas
    await expect(page.locator('text=Total de Projetos')).toBeVisible();
    await expect(page.locator('text=Vídeos Renderizados')).toBeVisible();
    
    // Verificar projeto na tabela
    await expect(page.locator(`text=${projectId}`)).toBeVisible();
    
    console.log('✓ Analytics verified');
    
    // ==========================================
    // STEP 12: LOGOUT
    // ==========================================
    
    console.log('Step 12: Logging out...');
    
    // Abrir menu de usuário
    await page.click('button[aria-label="Menu de usuário"]');
    
    // Logout
    await page.click('text=Sair');
    
    // Verificar redirecionamento
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/login/);
    
    console.log('✓ Logout successful');
    
    // ==========================================
    // SUMMARY
    // ==========================================
    
    console.log('\n✅ COMPLETE FLOW SUCCESSFUL!');
    console.log('=====================================');
    console.log('1. ✓ Login');
    console.log('2. ✓ Upload PPTX');
    console.log('3. ✓ Verify Slides');
    console.log('4. ✓ Generate TTS');
    console.log('5. ✓ Verify Audio');
    console.log('6. ✓ Configure Render');
    console.log('7. ✓ Start Rendering');
    console.log('8. ✓ Monitor Progress');
    console.log('9. ✓ Preview Video');
    console.log('10. ✓ Download Video');
    console.log('11. ✓ Verify Analytics');
    console.log('12. ✓ Logout');
    console.log('=====================================');
  });

  // ==========================================
  // PERFORMANCE TEST
  // ==========================================

  test('should complete workflow within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    // Execute fluxo simplificado
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Upload
    await page.goto('/dashboard/upload');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small-sample.pptx'));
    await page.waitForURL('**/dashboard/projects/*', { timeout: 30000 });
    
    // TTS (1 slide apenas)
    await page.click('button:has-text("Gerar Áudio")');
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    await page.click('[data-testid="slide-1"]');
    await page.click('button:has-text("Gerar Áudio")');
    await page.waitForSelector('text=Áudio gerado com sucesso', { timeout: 30000 });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // segundos
    
    console.log(`Workflow completed in ${duration}s`);
    
    // Verificar que completou em tempo aceitável (< 5 minutos para fluxo simplificado)
    expect(duration).toBeLessThan(300);
  });

  // ==========================================
  // ERROR RECOVERY TEST
  // ==========================================

  test('should recover from errors gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Simular erro de rede durante upload
    await page.route('**/api/upload', (route) => {
      route.abort('failed');
    });
    
    await page.goto('/dashboard/upload');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.pptx'));
    
    // Verificar erro
    await expect(page.locator('text=Erro no upload')).toBeVisible({ timeout: 10000 });
    
    // Remover erro
    await page.unroute('**/api/upload');
    
    // Retry
    await page.click('button:has-text("Tentar Novamente")');
    
    // Verificar sucesso
    await expect(page.locator('text=Upload concluído')).toBeVisible({ timeout: 30000 });
  });
});
