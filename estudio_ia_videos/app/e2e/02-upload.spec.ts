import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E Tests - File Upload Flow
 * 
 * Testes de upload de arquivos PPTX
 */

// Setup: fazer login antes de cada teste
test.beforeEach(async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test@12345');
  await page.click('button[type="submit"]');
  
  // Aguardar dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
});

test.describe('File Upload Flow', () => {
  // ==========================================
  // UPLOAD PAGE
  // ==========================================

  test('should display upload page', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Verificar elementos
    await expect(page.locator('h1')).toContainText('Upload');
    await expect(page.locator('text=Arraste e solte')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  // ==========================================
  // FILE VALIDATION
  // ==========================================

  test('should reject non-PPTX files', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Criar arquivo de teste (não PPTX)
    const textFile = path.join(__dirname, 'fixtures', 'test.txt');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(textFile);
    
    // Verificar mensagem de erro
    await expect(
      page.locator('text=Apenas arquivos PPTX são permitidos')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should reject files larger than limit', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Simular arquivo grande (50MB+)
    // Nota: Seria melhor ter um arquivo de teste real
    const largeFile = path.join(__dirname, 'fixtures', 'large-file.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(largeFile);
    
    // Verificar mensagem de erro
    await expect(
      page.locator('text=Arquivo muito grande')
    ).toBeVisible({ timeout: 5000 });
  });

  // ==========================================
  // SUCCESSFUL UPLOAD
  // ==========================================

  test('should upload PPTX file successfully', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Arquivo de teste válido
    const pptxFile = path.join(__dirname, 'fixtures', 'sample.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Aguardar upload
    await expect(page.locator('text=Upload em progresso')).toBeVisible();
    
    // Aguardar conclusão
    await expect(page.locator('text=Upload concluído')).toBeVisible({
      timeout: 30000,
    });
    
    // Verificar redirecionamento para página do projeto
    await page.waitForURL('**/dashboard/projects/*', { timeout: 10000 });
  });

  test('should display upload progress', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    const pptxFile = path.join(__dirname, 'fixtures', 'sample.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Verificar barra de progresso
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Verificar porcentagem
    await expect(page.locator('text=0%')).toBeVisible();
    
    // Aguardar 100%
    await expect(page.locator('text=100%')).toBeVisible({ timeout: 30000 });
  });

  // ==========================================
  // DRAG AND DROP
  // ==========================================

  test('should support drag and drop', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Simular drag and drop
    const dropZone = page.locator('[data-testid="drop-zone"]');
    
    // Verificar estado inicial
    await expect(dropZone).toBeVisible();
    
    // Simular drag over
    await dropZone.dispatchEvent('dragover', {
      dataTransfer: {
        files: [],
      },
    });
    
    // Verificar estado de hover
    await expect(dropZone).toHaveClass(/border-blue/);
  });

  // ==========================================
  // MULTIPLE FILES
  // ==========================================

  test('should handle multiple file selection', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Múltiplos arquivos
    const files = [
      path.join(__dirname, 'fixtures', 'sample1.pptx'),
      path.join(__dirname, 'fixtures', 'sample2.pptx'),
    ];
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(files);
    
    // Verificar lista de arquivos
    await expect(page.locator('text=2 arquivos selecionados')).toBeVisible();
  });

  // ==========================================
  // CANCEL UPLOAD
  // ==========================================

  test('should allow cancelling upload', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    const pptxFile = path.join(__dirname, 'fixtures', 'large-sample.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Aguardar início do upload
    await expect(page.locator('text=Upload em progresso')).toBeVisible();
    
    // Cancelar
    await page.click('button:has-text("Cancelar")');
    
    // Verificar cancelamento
    await expect(page.locator('text=Upload cancelado')).toBeVisible();
  });

  // ==========================================
  // RETRY FAILED UPLOAD
  // ==========================================

  test('should allow retrying failed upload', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Simular falha de rede (interceptar request)
    await page.route('**/api/upload', (route) => {
      route.abort('failed');
    });
    
    const pptxFile = path.join(__dirname, 'fixtures', 'sample.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Verificar erro
    await expect(page.locator('text=Erro no upload')).toBeVisible({
      timeout: 10000,
    });
    
    // Remover interceptação
    await page.unroute('**/api/upload');
    
    // Tentar novamente
    await page.click('button:has-text("Tentar Novamente")');
    
    // Verificar sucesso
    await expect(page.locator('text=Upload concluído')).toBeVisible({
      timeout: 30000,
    });
  });

  // ==========================================
  // THUMBNAIL GENERATION
  // ==========================================

  test('should generate thumbnail after upload', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    const pptxFile = path.join(__dirname, 'fixtures', 'sample.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Aguardar conclusão
    await page.waitForURL('**/dashboard/projects/*', { timeout: 30000 });
    
    // Verificar thumbnail
    await expect(page.locator('img[alt="Project thumbnail"]')).toBeVisible({
      timeout: 10000,
    });
  });

  // ==========================================
  // PROJECT METADATA
  // ==========================================

  test('should allow editing project name after upload', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    const pptxFile = path.join(__dirname, 'fixtures', 'sample.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard/projects/*', { timeout: 30000 });
    
    // Editar nome
    await page.click('button[aria-label="Editar nome do projeto"]');
    await page.fill('input[name="project-name"]', 'Meu Projeto Teste');
    await page.click('button:has-text("Salvar")');
    
    // Verificar atualização
    await expect(page.locator('h1:has-text("Meu Projeto Teste")')).toBeVisible();
  });

  // ==========================================
  // NAVIGATION
  // ==========================================

  test('should navigate back to projects list', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    const pptxFile = path.join(__dirname, 'fixtures', 'sample.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pptxFile);
    
    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard/projects/*', { timeout: 30000 });
    
    // Voltar para lista
    await page.click('a:has-text("Todos os Projetos")');
    
    // Verificar navegação
    await page.waitForURL('**/dashboard/projects');
    await expect(page.locator('h1:has-text("Meus Projetos")')).toBeVisible();
  });

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  test('should display error for corrupted file', async ({ page }) => {
    await page.goto('/dashboard/upload');
    
    // Arquivo corrompido
    const corruptedFile = path.join(__dirname, 'fixtures', 'corrupted.pptx');
    
    // Upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(corruptedFile);
    
    // Verificar erro
    await expect(
      page.locator('text=Arquivo corrompido ou inválido')
    ).toBeVisible({ timeout: 10000 });
  });
});
