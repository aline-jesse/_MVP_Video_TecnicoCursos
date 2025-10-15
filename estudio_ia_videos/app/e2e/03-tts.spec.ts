import { test, expect } from '@playwright/test';

/**
 * E2E Tests - TTS Generation Flow
 * 
 * Testes de geração de áudio com TTS
 */

// Setup: fazer login e criar projeto
test.beforeEach(async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test@12345');
  await page.click('button[type="submit"]');
  
  // Aguardar dashboard e navegar para projeto de teste
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Assumir que existe um projeto com ID conhecido ou criar um
  await page.goto('/dashboard/projects/test-project-id');
});

test.describe('TTS Generation Flow', () => {
  // ==========================================
  // TTS INTERFACE
  // ==========================================

  test('should display TTS generation interface', async ({ page }) => {
    // Verificar elementos
    await expect(page.locator('h2:has-text("Geração de Áudio")')).toBeVisible();
    await expect(page.locator('text=Selecione uma voz')).toBeVisible();
    await expect(page.locator('button:has-text("Gerar Áudio")')).toBeVisible();
  });

  test('should display available voices', async ({ page }) => {
    // Abrir seletor de vozes
    await page.click('button:has-text("Selecione uma voz")');
    
    // Verificar lista de vozes
    await expect(page.locator('[role="listbox"]')).toBeVisible();
    
    // Verificar vozes de providers
    await expect(page.locator('text=ElevenLabs')).toBeVisible();
    await expect(page.locator('text=Azure TTS')).toBeVisible();
  });

  // ==========================================
  // VOICE SELECTION
  // ==========================================

  test('should select voice successfully', async ({ page }) => {
    // Abrir seletor
    await page.click('button:has-text("Selecione uma voz")');
    
    // Selecionar primeira voz
    await page.click('[role="option"]:first-child');
    
    // Verificar seleção
    await expect(page.locator('button:has-text("Selecione uma voz")')).not.toBeVisible();
    await expect(page.locator('text=Voz selecionada:')).toBeVisible();
  });

  test('should preview voice sample', async ({ page }) => {
    // Abrir seletor
    await page.click('button:has-text("Selecione uma voz")');
    
    // Hover em voz para ver preview
    await page.hover('[role="option"]:first-child');
    
    // Clicar em play preview
    await page.click('button[aria-label="Preview de voz"]');
    
    // Verificar player de áudio
    await expect(page.locator('audio')).toBeAttached();
  });

  // ==========================================
  // TTS GENERATION
  // ==========================================

  test('should generate TTS for single slide', async ({ page }) => {
    // Selecionar voz
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    
    // Selecionar slide
    await page.click('[data-testid="slide-1"]');
    
    // Gerar áudio
    await page.click('button:has-text("Gerar Áudio")');
    
    // Aguardar geração
    await expect(page.locator('text=Gerando áudio...')).toBeVisible();
    
    // Aguardar conclusão
    await expect(page.locator('text=Áudio gerado com sucesso')).toBeVisible({
      timeout: 30000,
    });
    
    // Verificar player de áudio
    await expect(page.locator('audio[data-slide="1"]')).toBeAttached();
  });

  test('should generate TTS for all slides', async ({ page }) => {
    // Selecionar voz
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    
    // Clicar em "Gerar para Todos"
    await page.click('button:has-text("Gerar para Todos os Slides")');
    
    // Aguardar modal de confirmação
    await expect(page.locator('text=Gerar áudio para todos?')).toBeVisible();
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    
    // Aguardar progresso
    await expect(page.locator('text=Gerando 1 de')).toBeVisible();
    
    // Aguardar conclusão de todos
    await expect(page.locator('text=Todos os áudios gerados')).toBeVisible({
      timeout: 60000,
    });
  });

  test('should display generation progress', async ({ page }) => {
    // Selecionar voz
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    
    // Gerar para todos
    await page.click('button:has-text("Gerar para Todos os Slides")');
    await page.click('button:has-text("Confirmar")');
    
    // Verificar progress bar
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Verificar contador
    await expect(page.locator('text=1/5')).toBeVisible();
  });

  // ==========================================
  // CREDITS MANAGEMENT
  // ==========================================

  test('should display credits balance', async ({ page }) => {
    // Verificar display de créditos
    await expect(page.locator('text=Créditos disponíveis:')).toBeVisible();
    await expect(page.locator('[data-testid="credits-balance"]')).toBeVisible();
  });

  test('should warn when low credits', async ({ page }) => {
    // Simular créditos baixos (interceptar API)
    await page.route('**/api/tts/credits', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ credits: 50 }), // Baixo
      });
    });
    
    // Recarregar
    await page.reload();
    
    // Verificar aviso
    await expect(page.locator('text=Créditos baixos')).toBeVisible();
  });

  test('should prevent generation without credits', async ({ page }) => {
    // Simular sem créditos
    await page.route('**/api/tts/credits', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ credits: 0 }),
      });
    });
    
    await page.reload();
    
    // Tentar gerar
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    await page.click('button:has-text("Gerar Áudio")');
    
    // Verificar erro
    await expect(page.locator('text=Créditos insuficientes')).toBeVisible();
  });

  // ==========================================
  // AUDIO PLAYBACK
  // ==========================================

  test('should play generated audio', async ({ page }) => {
    // Assumir que slide já tem áudio gerado
    await page.click('[data-testid="slide-1"]');
    
    // Clicar em play
    await page.click('button[aria-label="Reproduzir áudio"]');
    
    // Verificar que está tocando
    const audio = page.locator('audio[data-slide="1"]');
    const isPlaying = await audio.evaluate((el: HTMLAudioElement) => !el.paused);
    expect(isPlaying).toBe(true);
  });

  test('should pause audio playback', async ({ page }) => {
    await page.click('[data-testid="slide-1"]');
    
    // Play
    await page.click('button[aria-label="Reproduzir áudio"]');
    
    // Aguardar um pouco
    await page.waitForTimeout(1000);
    
    // Pause
    await page.click('button[aria-label="Pausar áudio"]');
    
    // Verificar que pausou
    const audio = page.locator('audio[data-slide="1"]');
    const isPaused = await audio.evaluate((el: HTMLAudioElement) => el.paused);
    expect(isPaused).toBe(true);
  });

  test('should display audio waveform', async ({ page }) => {
    await page.click('[data-testid="slide-1"]');
    
    // Verificar visualização de waveform
    await expect(page.locator('[data-testid="waveform"]')).toBeVisible();
  });

  // ==========================================
  // REGENERATION
  // ==========================================

  test('should regenerate audio for slide', async ({ page }) => {
    await page.click('[data-testid="slide-1"]');
    
    // Clicar em regenerar
    await page.click('button:has-text("Regenerar Áudio")');
    
    // Confirmar
    await expect(page.locator('text=Deseja regenerar?')).toBeVisible();
    await page.click('button:has-text("Confirmar")');
    
    // Aguardar nova geração
    await expect(page.locator('text=Áudio gerado com sucesso')).toBeVisible({
      timeout: 30000,
    });
  });

  // ==========================================
  // TEXT EDITING
  // ==========================================

  test('should edit slide text before generation', async ({ page }) => {
    await page.click('[data-testid="slide-1"]');
    
    // Clicar em editar texto
    await page.click('button[aria-label="Editar texto"]');
    
    // Editar
    const textarea = page.locator('textarea[name="slide-text"]');
    await textarea.clear();
    await textarea.fill('Novo texto para narração');
    
    // Salvar
    await page.click('button:has-text("Salvar Texto")');
    
    // Verificar atualização
    await expect(page.locator('text=Texto atualizado')).toBeVisible();
  });

  // ==========================================
  // CACHE
  // ==========================================

  test('should use cached audio when available', async ({ page }) => {
    // Gerar áudio
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    await page.click('[data-testid="slide-1"]');
    await page.click('button:has-text("Gerar Áudio")');
    
    await page.waitForSelector('text=Áudio gerado com sucesso', {
      timeout: 30000,
    });
    
    // Navegar para outro projeto e voltar
    await page.goto('/dashboard/projects');
    await page.goto('/dashboard/projects/test-project-id');
    
    // Gerar novamente com mesmo texto e voz
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('[role="option"]:first-child');
    await page.click('[data-testid="slide-1"]');
    await page.click('button:has-text("Gerar Áudio")');
    
    // Verificar que foi instantâneo (cache hit)
    await expect(page.locator('text=Áudio carregado do cache')).toBeVisible({
      timeout: 2000,
    });
  });

  // ==========================================
  // PROVIDER FALLBACK
  // ==========================================

  test('should fallback to alternative provider on error', async ({ page }) => {
    // Simular erro no provider principal
    await page.route('**/api/tts/generate', (route) => {
      if (route.request().postDataJSON()?.provider === 'elevenlabs') {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Provider error' }),
        });
      } else {
        route.continue();
      }
    });
    
    // Selecionar ElevenLabs
    await page.click('button:has-text("Selecione uma voz")');
    await page.click('text=ElevenLabs >> [role="option"]:first-child');
    
    // Gerar
    await page.click('[data-testid="slide-1"]');
    await page.click('button:has-text("Gerar Áudio")');
    
    // Verificar fallback
    await expect(
      page.locator('text=Usando provider alternativo')
    ).toBeVisible({ timeout: 5000 });
    
    // Verificar sucesso final
    await expect(page.locator('text=Áudio gerado com sucesso')).toBeVisible({
      timeout: 30000,
    });
  });

  // ==========================================
  // DOWNLOAD AUDIO
  // ==========================================

  test('should download generated audio', async ({ page }) => {
    await page.click('[data-testid="slide-1"]');
    
    // Configurar listener de download
    const downloadPromise = page.waitForEvent('download');
    
    // Clicar em download
    await page.click('button[aria-label="Download áudio"]');
    
    // Aguardar download
    const download = await downloadPromise;
    
    // Verificar arquivo
    expect(download.suggestedFilename()).toContain('.mp3');
  });
});
