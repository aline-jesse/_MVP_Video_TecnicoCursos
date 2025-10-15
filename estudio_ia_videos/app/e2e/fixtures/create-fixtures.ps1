# Script para Criar Fixtures de Teste
# Cria arquivos de teste para E2E tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Criando Fixtures de Teste E2E" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar arquivo de texto simples
Write-Host "[1/5] Criando test.txt..." -ForegroundColor Yellow
@"
Este é um arquivo de teste simples.
Usado para validar que apenas arquivos .pptx são aceitos no upload.
"@ | Out-File -FilePath "test.txt" -Encoding utf8
Write-Host "✓ test.txt criado" -ForegroundColor Green

# Criar corrupted.pptx (apenas renomear um txt)
Write-Host "[2/5] Criando corrupted.pptx..." -ForegroundColor Yellow
@"
Este arquivo parece ser um .pptx mas não é válido.
Usado para testar tratamento de erros.
"@ | Out-File -FilePath "corrupted.pptx" -Encoding utf8
Write-Host "✓ corrupted.pptx criado" -ForegroundColor Green

# Criar imagem de teste
Write-Host "[3/5] Criando test-image.jpg..." -ForegroundColor Yellow
Write-Host "  Gerando imagem 800x600..." -ForegroundColor Gray

# Criar uma imagem simples usando .NET
Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap(800, 600)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Preencher com gradiente
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(800, 600)),
    [System.Drawing.Color]::Blue,
    [System.Drawing.Color]::Purple
)
$graphics.FillRectangle($brush, 0, 0, 800, 600)

# Adicionar texto
$font = New-Object System.Drawing.Font("Arial", 48, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$text = "TEST IMAGE"
$graphics.DrawString($text, $font, $textBrush, 200, 250)

# Salvar
$bitmap.Save("test-image.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "✓ test-image.jpg criado" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  ATENÇÃO: Arquivos .pptx Obrigatórios" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Os seguintes arquivos PowerPoint precisam ser criados MANUALMENTE:" -ForegroundColor White
Write-Host ""
Write-Host "  [4/5] sample.pptx" -ForegroundColor Red
Write-Host "        - 5-10 slides com texto e imagens" -ForegroundColor Gray
Write-Host "        - Tamanho: ~2-5 MB" -ForegroundColor Gray
Write-Host "        - Arquivo principal para testes" -ForegroundColor Gray
Write-Host ""
Write-Host "  [5/5] large-file.pptx" -ForegroundColor Red
Write-Host "        - Muitos slides (20+) com imagens HD" -ForegroundColor Gray
Write-Host "        - Tamanho: >50 MB" -ForegroundColor Gray
Write-Host "        - Para testes de limite" -ForegroundColor Gray
Write-Host ""
Write-Host "  [6/6] small-sample.pptx" -ForegroundColor Red
Write-Host "        - 2-3 slides simples" -ForegroundColor Gray
Write-Host "        - Tamanho: ~1 MB" -ForegroundColor Gray
Write-Host "        - Para testes rápidos" -ForegroundColor Gray
Write-Host ""
Write-Host "Como criar:" -ForegroundColor Cyan
Write-Host "  1. Abra o Microsoft PowerPoint" -ForegroundColor White
Write-Host "  2. Crie uma apresentação com os requisitos acima" -ForegroundColor White
Write-Host "  3. Salve na pasta e2e/fixtures/" -ForegroundColor White
Write-Host ""
Write-Host "Ou baixe templates gratuitos:" -ForegroundColor Cyan
Write-Host "  https://templates.office.com/" -ForegroundColor Blue
Write-Host ""

# Verificar arquivos existentes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Status dos Fixtures" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
    @{ Name = "test.txt"; Required = $true },
    @{ Name = "corrupted.pptx"; Required = $true },
    @{ Name = "test-image.jpg"; Required = $false },
    @{ Name = "sample.pptx"; Required = $true },
    @{ Name = "large-file.pptx"; Required = $true },
    @{ Name = "small-sample.pptx"; Required = $true }
)

$missingCount = 0

foreach ($file in $requiredFiles) {
    $exists = Test-Path $file.Name
    
    if ($exists) {
        $size = (Get-Item $file.Name).Length
        $sizeKB = [math]::Round($size / 1KB, 2)
        $sizeMB = [math]::Round($size / 1MB, 2)
        
        if ($sizeMB -gt 1) {
            Write-Host "  ✓ $($file.Name) - $sizeMB MB" -ForegroundColor Green
        } else {
            Write-Host "  ✓ $($file.Name) - $sizeKB KB" -ForegroundColor Green
        }
    } else {
        if ($file.Required) {
            Write-Host "  ✗ $($file.Name) - FALTANDO (Obrigatório)" -ForegroundColor Red
            $missingCount++
        } else {
            Write-Host "  - $($file.Name) - FALTANDO (Opcional)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

if ($missingCount -gt 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  AÇÃO NECESSÁRIA" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "  $missingCount arquivo(s) obrigatório(s) faltando!" -ForegroundColor Red
    Write-Host "  Os testes E2E não funcionarão sem eles." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Crie os arquivos .pptx manualmente conforme instruções acima." -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ TODOS OS FIXTURES PRONTOS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Os testes E2E podem ser executados." -ForegroundColor White
    Write-Host ""
    Write-Host "  Execute:" -ForegroundColor Cyan
    Write-Host "    npm run test:e2e" -ForegroundColor White
    Write-Host ""
}
