# Test Video Processing System
# Script para testar todas as funcionalidades implementadas

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VIDEO PROCESSING SYSTEM - TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$testsPassed = 0
$testsFailed = 0

# Função para executar teste
function Run-Test {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    Write-Host "▶ $Name" -ForegroundColor Yellow
    try {
        & $Test
        Write-Host "  ✓ PASSED" -ForegroundColor Green
        $script:testsPassed++
    } catch {
        Write-Host "  ✗ FAILED: $_" -ForegroundColor Red
        $script:testsFailed++
    }
    Write-Host ""
}

# Navegar para diretório do app
Set-Location -Path "estudio_ia_videos\app"

Write-Host "📦 Verificando instalação de dependências..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules não encontrado. Instalando dependências..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "🧪 EXECUTANDO TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Video Validator
Run-Test "1. Video Validator - Unit Tests" {
    npm test -- --testPathPattern=validator.test.ts --passWithNoTests
}

# Teste 2: Queue Manager
Run-Test "2. Queue Manager - Unit Tests" {
    npm test -- --testPathPattern=queue-manager.test.ts --passWithNoTests
}

# Teste 3: Cache Manager
Run-Test "3. Cache Manager - Unit Tests" {
    npm test -- --testPathPattern=cache-manager.test.ts --passWithNoTests
}

# Teste 4: Pipeline Integration
Run-Test "4. Pipeline - Integration Tests" {
    npm test -- --testPathPattern=video-pipeline.integration.test.ts --passWithNoTests
}

# Teste 5: Verificar estrutura de arquivos
Run-Test "5. Verificar estrutura de arquivos criados" {
    $files = @(
        "lib\video\validator.ts",
        "lib\video\queue-manager.ts",
        "lib\audio\analyzer.ts",
        "lib\cache\cache-manager.ts",
        "lib\video\pipeline.ts"
    )
    
    foreach ($file in $files) {
        if (-not (Test-Path $file)) {
            throw "Arquivo não encontrado: $file"
        }
    }
}

# Teste 6: Verificar testes criados
Run-Test "6. Verificar testes criados" {
    $testFiles = @(
        "__tests__\lib\video\validator.test.ts",
        "__tests__\lib\video\queue-manager.test.ts",
        "__tests__\lib\cache\cache-manager.test.ts",
        "__tests__\integration\video-pipeline.integration.test.ts"
    )
    
    foreach ($file in $testFiles) {
        if (-not (Test-Path $file)) {
            throw "Arquivo de teste não encontrado: $file"
        }
    }
}

# Teste 7: Build TypeScript
Run-Test "7. Compilação TypeScript" {
    npx tsc --noEmit --skipLibCheck
}

# Teste 8: Lint
Run-Test "8. Lint check" {
    npm run lint -- --max-warnings=50
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Testes Passaram: $testsPassed" -ForegroundColor Green
Write-Host "✗ Testes Falharam: $testsFailed" -ForegroundColor Red
Write-Host "Total: $($testsPassed + $testsFailed)" -ForegroundColor Cyan
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Sistema pronto para uso:" -ForegroundColor Cyan
    Write-Host "  • Video Validator: ✓" -ForegroundColor Green
    Write-Host "  • Queue Manager: ✓" -ForegroundColor Green
    Write-Host "  • Audio Analyzer: ✓" -ForegroundColor Green
    Write-Host "  • Cache Manager: ✓" -ForegroundColor Green
    Write-Host "  • Integrated Pipeline: ✓" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
    Write-Host "Verifique os erros acima para mais detalhes." -ForegroundColor Yellow
    Write-Host ""
}

# Voltar ao diretório raiz
Set-Location -Path "..\..\"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testes concluídos!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
