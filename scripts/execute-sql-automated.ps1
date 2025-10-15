# ============================================
# 🚀 EXECUÇÃO AUTOMATIZADA DOS SQLS SUPABASE
# ============================================
# Script para executar SQLs diretamente no Supabase
# Data: 13/10/2025

param(
    [switch]$Force,
    [switch]$SkipValidation
)

# Configurações
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Cores
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Blue = "Blue"

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $Cyan
Write-Host "🚀 EXECUÇÃO AUTOMATIZADA - SUPABASE SQL" -ForegroundColor $Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor $Cyan

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor $Red
    exit 1
}

# Carregar variáveis do .env
Write-Host "📋 Carregando configurações..." -ForegroundColor $Yellow
$envContent = Get-Content ".env" | Where-Object { $_ -match "^[^#].*=" }
foreach ($line in $envContent) {
    if ($line -match "^([^=]+)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY
$dbUrl = $env:DIRECT_DATABASE_URL

if (-not $supabaseUrl -or -not $serviceKey -or -not $dbUrl) {
    Write-Host "❌ Variáveis de ambiente não encontradas!" -ForegroundColor $Red
    Write-Host "Verifique: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DIRECT_DATABASE_URL" -ForegroundColor $Red
    exit 1
}

Write-Host "✅ Configurações carregadas" -ForegroundColor $Green

# Verificar arquivos SQL
$sqlFiles = @(
    @{ Name = "database-schema.sql"; Description = "Schema do banco de dados" },
    @{ Name = "database-rls-policies.sql"; Description = "Políticas de segurança RLS" },
    @{ Name = "seed-nr-courses.sql"; Description = "Dados iniciais dos cursos" }
)

Write-Host "`n🔍 Verificando arquivos SQL..." -ForegroundColor $Yellow
foreach ($file in $sqlFiles) {
    if (-not (Test-Path $file.Name)) {
        Write-Host "❌ Arquivo não encontrado: $($file.Name)" -ForegroundColor $Red
        exit 1
    }
    Write-Host "✅ $($file.Name) - $($file.Description)" -ForegroundColor $Green
}

# Função para executar SQL via REST API
function Invoke-SupabaseSQL {
    param(
        [string]$SqlContent,
        [string]$Description
    )
    
    Write-Host "`n🔄 Executando: $Description..." -ForegroundColor $Yellow
    
    try {
        $headers = @{
            "Authorization" = "Bearer $serviceKey"
            "Content-Type" = "application/json"
            "apikey" = $serviceKey
        }
        
        $body = @{
            query = $SqlContent
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host "✅ $Description executado com sucesso!" -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Host "❌ Erro ao executar $Description" -ForegroundColor $Red
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor $Red
        return $false
    }
}

# Função alternativa usando psql
function Invoke-PostgreSQL {
    param(
        [string]$SqlFile,
        [string]$Description
    )
    
    Write-Host "`n🔄 Executando via psql: $Description..." -ForegroundColor $Yellow
    
    try {
        # Verificar se psql está disponível
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if (-not $psqlPath) {
            Write-Host "⚠️ psql não encontrado. Tentando via REST API..." -ForegroundColor $Yellow
            $sqlContent = Get-Content $SqlFile -Raw
            return Invoke-SupabaseSQL -SqlContent $sqlContent -Description $Description
        }
        
        # Executar via psql
        $result = & psql $dbUrl -f $SqlFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description executado com sucesso!" -ForegroundColor $Green
            return $true
        } else {
            Write-Host "❌ Erro ao executar $Description" -ForegroundColor $Red
            Write-Host "Saída: $result" -ForegroundColor $Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Erro ao executar $Description" -ForegroundColor $Red
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor $Red
        return $false
    }
}

# Executar SQLs em ordem
Write-Host "`n🚀 Iniciando execução dos SQLs..." -ForegroundColor $Cyan

$success = $true

foreach ($file in $sqlFiles) {
    $result = Invoke-PostgreSQL -SqlFile $file.Name -Description $file.Description
    if (-not $result) {
        $success = $false
        if (-not $Force) {
            Write-Host "`n❌ Execução interrompida devido a erro." -ForegroundColor $Red
            Write-Host "Use -Force para continuar mesmo com erros." -ForegroundColor $Yellow
            break
        }
    }
    Start-Sleep -Seconds 2
}

# Validação final
if ($success -and -not $SkipValidation) {
    Write-Host "`n🔍 Executando validação..." -ForegroundColor $Yellow
    try {
        & "$PSScriptRoot\validate-supabase-setup.ps1" -ErrorAction Stop
    }
    catch {
        Write-Host "⚠️ Erro na validação, mas SQLs foram executados." -ForegroundColor $Yellow
    }
}

# Resultado final
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor $Cyan
if ($success) {
    Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor $Green
    Write-Host "✅ Banco de dados configurado" -ForegroundColor $Green
    Write-Host "✅ Políticas RLS aplicadas" -ForegroundColor $Green
    Write-Host "✅ Dados iniciais populados" -ForegroundColor $Green
    Write-Host "`n🚀 Próximo passo: Configurar Storage Buckets" -ForegroundColor $Cyan
} else {
    Write-Host "⚠️ CONFIGURAÇÃO CONCLUÍDA COM AVISOS" -ForegroundColor $Yellow
    Write-Host "Verifique os erros acima e execute novamente se necessário." -ForegroundColor $Yellow
}
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $Cyan