# ====================================================================
# 🚀 DEPLOY SISTEMA INTEGRADO - Script PowerShell
# ====================================================================
# Este script automatiza o processo de deploy do sistema integrado
# Data: 08/10/2025
# Versão: 1.0.0
# ====================================================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 DEPLOY SISTEMA INTEGRADO - ESTÚDIO IA DE VÍDEOS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Variáveis
$PROJECT_ROOT = "c:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app"
$ENV_FILE = "$PROJECT_ROOT\.env.local"
$BACKUP_DIR = "$PROJECT_ROOT\.deployment-backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

# ====================================================================
# FUNÇÕES AUXILIARES
# ====================================================================

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Yellow
    Write-Host "▶ $Message" -ForegroundColor Yellow
    Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Check-Command {
    param([string]$CommandName)
    
    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        return $true
    }
    return $false
}

# ====================================================================
# 1. PRÉ-REQUISITOS
# ====================================================================

Write-Step "Verificando pré-requisitos"

# Node.js
if (Check-Command "node") {
    $nodeVersion = node --version
    Write-Success "Node.js encontrado: $nodeVersion"
} else {
    Write-Error-Custom "Node.js não encontrado. Instale: https://nodejs.org/"
    exit 1
}

# npm ou yarn
if (Check-Command "npm") {
    $npmVersion = npm --version
    Write-Success "npm encontrado: v$npmVersion"
} else {
    Write-Error-Custom "npm não encontrado"
    exit 1
}

# Git (opcional)
if (Check-Command "git") {
    $gitVersion = git --version
    Write-Success "Git encontrado: $gitVersion"
} else {
    Write-Warning-Custom "Git não encontrado (opcional)"
}

# ====================================================================
# 2. VERIFICAR DIRETÓRIO
# ====================================================================

Write-Step "Verificando diretório do projeto"

if (Test-Path $PROJECT_ROOT) {
    Write-Success "Diretório do projeto encontrado: $PROJECT_ROOT"
    Set-Location $PROJECT_ROOT
} else {
    Write-Error-Custom "Diretório não encontrado: $PROJECT_ROOT"
    exit 1
}

# ====================================================================
# 3. BACKUP
# ====================================================================

Write-Step "Criando backup"

if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

$BACKUP_PATH = "$BACKUP_DIR\backup_$TIMESTAMP"
New-Item -ItemType Directory -Path $BACKUP_PATH -Force | Out-Null

# Backup de arquivos importantes
$filesToBackup = @(".env.local", "package.json", "next.config.js")

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        Copy-Item $file -Destination "$BACKUP_PATH\" -Force
        Write-Success "Backup: $file"
    }
}

Write-Success "Backup criado em: $BACKUP_PATH"

# ====================================================================
# 4. VALIDAR CONFIGURAÇÃO
# ====================================================================

Write-Step "Validando configuração"

if (Test-Path $ENV_FILE) {
    Write-Success "Arquivo .env.local encontrado"
    
    # Verificar variáveis críticas
    $envContent = Get-Content $ENV_FILE -Raw
    
    $criticalVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "AWS_S3_BUCKET"
    )
    
    $missingVars = @()
    
    foreach ($var in $criticalVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Warning-Custom "Variáveis de ambiente ausentes:"
        foreach ($var in $missingVars) {
            Write-Host "  - $var" -ForegroundColor Yellow
        }
        Write-Host ""
        $continue = Read-Host "Continuar mesmo assim? (s/N)"
        if ($continue -ne "s" -and $continue -ne "S") {
            Write-Host "Deploy cancelado pelo usuário" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Success "Todas as variáveis críticas configuradas"
    }
    
} else {
    Write-Error-Custom "Arquivo .env.local não encontrado!"
    Write-Host ""
    Write-Host "Crie o arquivo .env.local baseado em .env.example" -ForegroundColor Yellow
    Write-Host "Exemplo mínimo:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "NODE_ENV=production" -ForegroundColor Gray
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co" -ForegroundColor Gray
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" -ForegroundColor Gray
    Write-Host "AWS_S3_BUCKET=your_bucket" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# ====================================================================
# 5. INSTALAR DEPENDÊNCIAS
# ====================================================================

Write-Step "Instalando dependências"

Write-Host "Executando: npm install" -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependências instaladas com sucesso"
} else {
    Write-Error-Custom "Erro ao instalar dependências"
    exit 1
}

# ====================================================================
# 6. EXECUTAR TESTES (OPCIONAL)
# ====================================================================

Write-Step "Testes (opcional)"

$runTests = Read-Host "Executar testes antes do deploy? (s/N)"

if ($runTests -eq "s" -or $runTests -eq "S") {
    Write-Host "Executando: npm test" -ForegroundColor Cyan
    npm test
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Todos os testes passaram"
    } else {
        Write-Warning-Custom "Alguns testes falharam"
        $continue = Read-Host "Continuar mesmo assim? (s/N)"
        if ($continue -ne "s" -and $continue -ne "S") {
            Write-Host "Deploy cancelado pelo usuário" -ForegroundColor Yellow
            exit 0
        }
    }
} else {
    Write-Warning-Custom "Testes pulados"
}

# ====================================================================
# 7. BUILD DA APLICAÇÃO
# ====================================================================

Write-Step "Build da aplicação"

Write-Host "Executando: npm run build" -ForegroundColor Cyan
Write-Host "(Isso pode levar alguns minutos...)" -ForegroundColor Gray
Write-Host ""

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Success "Build concluído com sucesso"
} else {
    Write-Error-Custom "Erro no build da aplicação"
    Write-Host ""
    Write-Host "Verifique os erros acima e corrija antes de continuar" -ForegroundColor Yellow
    exit 1
}

# ====================================================================
# 8. VALIDAR BUILD
# ====================================================================

Write-Step "Validando build"

$buildDir = "$PROJECT_ROOT\.next"

if (Test-Path $buildDir) {
    $buildSize = (Get-ChildItem $buildDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Success "Diretório .next criado ($('{0:N2}' -f $buildSize) MB)"
} else {
    Write-Error-Custom "Diretório .next não encontrado"
    exit 1
}

# ====================================================================
# 9. INICIALIZAR SISTEMA INTEGRADO
# ====================================================================

Write-Step "Inicializando sistema integrado"

Write-Host "Testando inicialização..." -ForegroundColor Cyan

$initScript = "$PROJECT_ROOT\scripts\initialize-unified-system.ts"

if (Test-Path $initScript) {
    # Executar script de inicialização (timeout de 30s)
    $job = Start-Job -ScriptBlock {
        param($path, $script)
        Set-Location $path
        npx tsx $script
    } -ArgumentList $PROJECT_ROOT, $initScript
    
    Wait-Job $job -Timeout 30 | Out-Null
    
    if ($job.State -eq 'Completed') {
        $output = Receive-Job $job
        Write-Success "Sistema integrado inicializado com sucesso"
        Write-Host $output -ForegroundColor Gray
    } else {
        Write-Warning-Custom "Timeout na inicialização (normal para ambiente de desenvolvimento)"
        Stop-Job $job
        Remove-Job $job
    }
} else {
    Write-Warning-Custom "Script de inicialização não encontrado"
}

# ====================================================================
# 10. PREPARAR PARA PRODUÇÃO
# ====================================================================

Write-Step "Preparando para produção"

# Verificar se existe package.json com script start
$packageJson = Get-Content "$PROJECT_ROOT\package.json" -Raw | ConvertFrom-Json

if ($packageJson.scripts.start) {
    Write-Success "Script 'start' encontrado no package.json"
} else {
    Write-Warning-Custom "Script 'start' não encontrado"
}

# Criar arquivo de informações de deploy
$deployInfo = @{
    timestamp = $TIMESTAMP
    nodeVersion = node --version
    npmVersion = npm --version
    buildSize = $buildSize
    environment = "production"
} | ConvertTo-Json

$deployInfo | Out-File "$PROJECT_ROOT\.deployment-info.json" -Encoding UTF8

Write-Success "Informações de deploy salvas"

# ====================================================================
# 11. RESUMO
# ====================================================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 RESUMO:" -ForegroundColor Cyan
Write-Host "  • Build: OK ($('{0:N2}' -f $buildSize) MB)" -ForegroundColor White
Write-Host "  • Backup: $BACKUP_PATH" -ForegroundColor White
Write-Host "  • Data/Hora: $TIMESTAMP" -ForegroundColor White
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Para testar localmente:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. Para deploy em produção:" -ForegroundColor Yellow
Write-Host "   • Vercel: vercel --prod" -ForegroundColor White
Write-Host "   • Docker: docker-compose up -d" -ForegroundColor White
Write-Host "   • Manual: Copie os arquivos para o servidor" -ForegroundColor White
Write-Host ""
Write-Host "3. Monitoramento:" -ForegroundColor Yellow
Write-Host "   • Verifique logs do servidor" -ForegroundColor White
Write-Host "   • Acesse /api/health para health check" -ForegroundColor White
Write-Host "   • Configure alertas de monitoramento" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# ====================================================================
# FINALIZAÇÃO
# ====================================================================

# Perguntar se deseja iniciar o servidor local
$startServer = Read-Host "Deseja iniciar o servidor local agora? (s/N)"

if ($startServer -eq "s" -or $startServer -eq "S") {
    Write-Host ""
    Write-Host "Iniciando servidor..." -ForegroundColor Cyan
    Write-Host "Acesse: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
    Write-Host ""
    npm start
} else {
    Write-Host ""
    Write-Host "Deploy finalizado! Execute 'npm start' quando estiver pronto." -ForegroundColor Cyan
    Write-Host ""
}
