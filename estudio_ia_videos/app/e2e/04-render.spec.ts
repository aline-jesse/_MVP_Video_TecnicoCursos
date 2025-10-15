import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Video Rendering Flow
 * 
 * Testes de renderização de vídeo
 */

// Setup
test.beforeEach(async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test@12345');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Navegar para projeto com áudios gerados
  await page.goto('/dashboard/projects/test-project-id');
});

test.describe('Video Rendering Flow', () => {
  // ==========================================
  // RENDER INTERFACE
  // ==========================================

  test('should display render configuration panel', async ({ page }) => {
    // Abrir painel de renderização
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Verificar elementos
    await expect(page.locator('h2:has-text("Configuração de Vídeo")')).toBeVisible();
    await expect(page.locator('text=Resolução')).toBeVisible();
    await expect(page.locator('text=Qualidade')).toBeVisible();
    await expect(page.locator('text=Formato')).toBeVisible();
  });

  test('should display resolution options', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Verificar opções
    await expect(page.locator('text=720p (HD)')).toBeVisible();
    await expect(page.locator('text=1080p (Full HD)')).toBeVisible();
    await expect(page.locator('text=2160p (4K)')).toBeVisible();
  });

  test('should display quality presets', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Verificar presets
    await expect(page.locator('text=Baixa')).toBeVisible();
    await expect(page.locator('text=Média')).toBeVisible();
    await expect(page.locator('text=Alta')).toBeVisible();
  });

  test('should display format options', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Verificar formatos
    await expect(page.locator('text=MP4')).toBeVisible();
    await expect(page.locator('text=WebM')).toBeVisible();
  });

  // ==========================================
  // CONFIGURATION
  // ==========================================

  test('should select resolution', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Selecionar 1080p
    await page.click('label:has-text("1080p")');
    
    // Verificar seleção
    const radio = page.locator('input[value="1080p"]');
    await expect(radio).toBeChecked();
  });

  test('should select quality preset', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Selecionar Alta
    await page.click('label:has-text("Alta")');
    
    // Verificar seleção
    const radio = page.locator('input[value="high"]');
    await expect(radio).toBeChecked();
  });

  test('should toggle transitions', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Toggle
    const checkbox = page.locator('input[type="checkbox"][name="transitions"]');
    await checkbox.click();
    
    // Verificar estado
    await expect(checkbox).toBeChecked();
  });

  test('should configure watermark', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Habilitar watermark
    await page.click('input[type="checkbox"][name="watermark"]');
    
    // Configurar posição
    await page.click('select[name="watermark-position"]');
    await page.selectOption('select[name="watermark-position"]', 'bottom-right');
    
    // Verificar
    const select = page.locator('select[name="watermark-position"]');
    await expect(select).toHaveValue('bottom-right');
  });

  // ==========================================
  // ESTIMATES
  // ==========================================

  test('should display time estimate', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Verificar estimativa
    await expect(page.locator('text=Tempo estimado:')).toBeVisible();
    await expect(page.locator('[data-testid="time-estimate"]')).toContainText('min');
  });

  test('should display size estimate', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Verificar estimativa
    await expect(page.locator('text=Tamanho estimado:')).toBeVisible();
    await expect(page.locator('[data-testid="size-estimate"]')).toContainText('MB');
  });

  test('should update estimates when changing settings', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Pegar estimativa inicial
    const initialSize = await page.locator('[data-testid="size-estimate"]').textContent();
    
    // Mudar para 4K
    await page.click('label:has-text("2160p")');
    
    // Aguardar atualização
    await page.waitForTimeout(500);
    
    // Verificar que mudou
    const newSize = await page.locator('[data-testid="size-estimate"]').textContent();
    expect(newSize).not.toBe(initialSize);
  });

  // ==========================================
  // START RENDERING
  // ==========================================

  test('should validate all slides have audio', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Tentar iniciar sem todos os áudios
    await page.click('button:has-text("Iniciar Renderização")');
    
    // Verificar validação
    await expect(
      page.locator('text=Todos os slides precisam ter áudio')
    ).toBeVisible();
  });

  test('should start rendering successfully', async ({ page }) => {
    await page.click('button:has-text("Renderizar Vídeo")');
    
    // Configurar
    await page.click('label:has-text("1080p")');
    await page.click('label:has-text("Alta")');
    
    // Iniciar
    await page.click('button:has-text("Iniciar Renderização")');
    
    // Verificar início
    await expect(page.locator('text=Renderização iniciada')).toBeVisible();
    
    // Verificar redirecionamento para tela de progresso
    await expect(page.locator('h2:has-text("Renderizando Vídeo")')).toBeVisible({
      timeout: 5000,
    });
  });

  // ==========================================
  // RENDER PROGRESS
  // ==========================================

  test('should display render progress', async ({ page }) => {
    // Assumir que renderização está em progresso
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Verificar elementos de progresso
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    await expect(page.locator('text=0%')).toBeVisible();
  });

  test('should show current stage', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Verificar stages
    await expect(
      page.locator('text=Baixando assets|Processando slides|Codificando|Finalizando')
    ).toBeVisible();
  });

  test('should update progress in real-time', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Pegar progresso inicial
    const initialProgress = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow');
    
    // Aguardar atualização via WebSocket
    await page.waitForTimeout(5000);
    
    // Verificar que mudou
    const newProgress = await page.locator('[role="progressbar"]').getAttribute('aria-valuenow');
    expect(parseInt(newProgress || '0')).toBeGreaterThan(parseInt(initialProgress || '0'));
  });

  test('should display estimated time remaining', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Verificar tempo restante
    await expect(page.locator('text=Tempo restante:')).toBeVisible();
    await expect(page.locator('[data-testid="time-remaining"]')).toContainText('min');
  });

  // ==========================================
  // CANCEL RENDERING
  // ==========================================

  test('should allow cancelling render', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Clicar em cancelar
    await page.click('button:has-text("Cancelar Renderização")');
    
    // Confirmar
    await expect(page.locator('text=Deseja cancelar?')).toBeVisible();
    await page.click('button:has-text("Sim, Cancelar")');
    
    // Verificar cancelamento
    await expect(page.locator('text=Renderização cancelada')).toBeVisible({
      timeout: 5000,
    });
  });

  // ==========================================
  // RENDER COMPLETION
  // ==========================================

  test('should display completion message', async ({ page }) => {
    // Simular conclusão
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Aguardar conclusão (ou simular via WebSocket mock)
    await expect(page.locator('text=Renderização concluída!')).toBeVisible({
      timeout: 120000, // 2 min
    });
  });

  test('should show video preview', async ({ page }) => {
    // Assumir render completo
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Aguardar ou assumir conclusão
    await page.waitForSelector('text=Renderização concluída!', { timeout: 120000 });
    
    // Verificar player de vídeo
    await expect(page.locator('video')).toBeVisible();
  });

  test('should play rendered video', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    await page.waitForSelector('text=Renderização concluída!', { timeout: 120000 });
    
    // Clicar em play
    await page.click('button[aria-label="Reproduzir vídeo"]');
    
    // Verificar que está tocando
    const video = page.locator('video');
    const isPlaying = await video.evaluate((el: HTMLVideoElement) => !el.paused);
    expect(isPlaying).toBe(true);
  });

  // ==========================================
  // DOWNLOAD VIDEO
  // ==========================================

  test('should download rendered video', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    await page.waitForSelector('text=Renderização concluída!', { timeout: 120000 });
    
    // Configurar listener de download
    const downloadPromise = page.waitForEvent('download');
    
    // Clicar em download
    await page.click('button:has-text("Download Vídeo")');
    
    // Aguardar download
    const download = await downloadPromise;
    
    // Verificar arquivo
    expect(download.suggestedFilename()).toContain('.mp4');
  });

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  test('should display error on render failure', async ({ page }) => {
    // Simular erro
    await page.route('**/api/render/start', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Render error' }),
      });
    });
    
    await page.click('button:has-text("Renderizar Vídeo")');
    await page.click('label:has-text("1080p")');
    await page.click('button:has-text("Iniciar Renderização")');
    
    // Verificar erro
    await expect(page.locator('text=Erro na renderização')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should allow retrying failed render', async ({ page }) => {
    // Assumir falha
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Simular falha (ou assumir estado de erro)
    await page.waitForSelector('text=Renderização falhou', { timeout: 30000 });
    
    // Clicar em tentar novamente
    await page.click('button:has-text("Tentar Novamente")');
    
    // Verificar nova tentativa
    await expect(page.locator('text=Renderização iniciada')).toBeVisible();
  });

  // ==========================================
  // RENDER HISTORY
  // ==========================================

  test('should display render history', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id');
    
    // Abrir histórico
    await page.click('button:has-text("Histórico de Renders")');
    
    // Verificar lista
    await expect(page.locator('text=Renders Anteriores')).toBeVisible();
    await expect(page.locator('[data-testid="render-history-item"]')).toHaveCount(
      await page.locator('[data-testid="render-history-item"]').count()
    );
  });

  test('should show render details in history', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id');
    await page.click('button:has-text("Histórico de Renders")');
    
    // Clicar em item do histórico
    await page.click('[data-testid="render-history-item"]:first-child');
    
    // Verificar detalhes
    await expect(page.locator('text=Resolução:')).toBeVisible();
    await expect(page.locator('text=Qualidade:')).toBeVisible();
    await expect(page.locator('text=Duração:')).toBeVisible();
  });

  // ==========================================
  // QUEUE MANAGEMENT
  // ==========================================

  test('should show position in queue', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Verificar posição na fila
    await expect(page.locator('text=Posição na fila:')).toBeVisible();
    await expect(page.locator('[data-testid="queue-position"]')).toContainText('#');
  });

  test('should display queue status', async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id/render/job-123');
    
    // Verificar status
    await expect(
      page.locator('text=Aguardando|Processando|Concluído|Falhou')
    ).toBeVisible();
  });
});
