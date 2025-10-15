# ============================================
# 🚀 SETUP COMPLETO SUPABASE - ONE COMMAND
# ============================================
# Script all-in-one para configurar tudo
# Data: 09/10/2025

param(
    [switch]$SkipSchema,
    [switch]$SkipRLS,
    [switch]$SkipSeed,
    [switch]$OpenDashboard
)

$ErrorActionPreference = "Stop"

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 SETUP COMPLETO SUPABASE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Configurações
$PROJECT_ID = "ofhzrdiadxigrvmrhaiz"
$DASHBOARD_URL = "https://supabase.com/dashboard/project/$PROJECT_ID"
$SQL_EDITOR_URL = "$DASHBOARD_URL/editor"

# Verificar se os arquivos SQL existem
$schemaFile = Join-Path $PSScriptRoot "database-schema.sql"
$rlsFile = Join-Path $PSScriptRoot "database-rls-policies.sql"
$seedFile = Join-Path $PSScriptRoot "seed-nr-courses.sql"

$filesExist = $true
if (-not (Test-Path $schemaFile)) {
    Write-Host "❌ Arquivo não encontrado: database-schema.sql" -ForegroundColor Red
    $filesExist = $false
}
if (-not (Test-Path $rlsFile)) {
    Write-Host "❌ Arquivo não encontrado: database-rls-policies.sql" -ForegroundColor Red
    $filesExist = $false
}
if (-not (Test-Path $seedFile)) {
    Write-Host "❌ Arquivo não encontrado: seed-nr-courses.sql" -ForegroundColor Red
    $filesExist = $false
}

if (-not $filesExist) {
    Write-Host "`n❌ Execute primeiro: .\create-database-schema.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Todos os arquivos SQL encontrados`n" -ForegroundColor Green

# Teste de conexão
Write-Host "🔍 PASSO 1: Testando conexão..." -ForegroundColor Yellow
try {
    & "$PSScriptRoot\test-supabase-connection.ps1" -ErrorAction Stop
    Write-Host "`n✅ Conexão OK!`n" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Erro na conexão. Verifique suas credenciais." -ForegroundColor Red
    exit 1
}

# Instruções para SQL Editor
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 INSTRUÇÕES PARA CONFIGURAÇÃO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Você tem 2 opções:`n" -ForegroundColor Yellow

Write-Host "OPÇÃO 1: Via Dashboard (Recomendado e Fácil)" -ForegroundColor Green
Write-Host "─────────────────────────────────────────────`n" -ForegroundColor Gray

Write-Host "1️⃣  Abrir SQL Editor:" -ForegroundColor Cyan
Write-Host "   $SQL_EDITOR_URL`n" -ForegroundColor White

if (-not $SkipSchema) {
    Write-Host "2️⃣  SCHEMA DO BANCO:" -ForegroundColor Cyan
    Write-Host "   • Cole o conteúdo de: database-schema.sql" -ForegroundColor White
    Write-Host "   • Clique em RUN" -ForegroundColor White
    Write-Host "   • Aguarde confirmação de sucesso`n" -ForegroundColor White
}

if (-not $SkipRLS) {
    Write-Host "3️⃣  POLÍTICAS DE SEGURANÇA:" -ForegroundColor Cyan
    Write-Host "   • Cole o conteúdo de: database-rls-policies.sql" -ForegroundColor White
    Write-Host "   • Clique em RUN" -ForegroundColor White
    Write-Host "   • Aguarde confirmação de sucesso`n" -ForegroundColor White
}

if (-not $SkipSeed) {
    Write-Host "4️⃣  DADOS INICIAIS:" -ForegroundColor Cyan
    Write-Host "   • Cole o conteúdo de: seed-nr-courses.sql" -ForegroundColor White
    Write-Host "   • Clique em RUN" -ForegroundColor White
    Write-Host "   • Aguarde confirmação de sucesso`n" -ForegroundColor White
}

Write-Host "─────────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

Write-Host "OPÇÃO 2: Via psql (Para Usuários Avançados)" -ForegroundColor Green
Write-Host "────────────────────────────────────────────`n" -ForegroundColor Gray

$dbUrl = "postgresql://postgres:Tr1unf0%40@db.$PROJECT_ID.supabase.co:5432/postgres"

if (-not $SkipSchema) {
    Write-Host "psql `"$dbUrl`" -f database-schema.sql" -ForegroundColor White
}
if (-not $SkipRLS) {
    Write-Host "psql `"$dbUrl`" -f database-rls-policies.sql" -ForegroundColor White
}
if (-not $SkipSeed) {
    Write-Host "psql `"$dbUrl`" -f seed-nr-courses.sql" -ForegroundColor White
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📂 ABRIR ARQUIVOS SQL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Perguntar se quer abrir os arquivos
$openFiles = Read-Host "Deseja abrir os arquivos SQL no editor? (S/N)"
if ($openFiles -eq 'S' -or $openFiles -eq 's') {
    Write-Host "`n📂 Abrindo arquivos...`n" -ForegroundColor Green
    
    if (-not $SkipSchema) {
        Write-Host "   Abrindo: database-schema.sql" -ForegroundColor White
        Start-Process $schemaFile
        Start-Sleep -Seconds 1
    }
    
    if (-not $SkipRLS) {
        Write-Host "   Abrindo: database-rls-policies.sql" -ForegroundColor White
        Start-Process $rlsFile
        Start-Sleep -Seconds 1
    }
    
    if (-not $SkipSeed) {
        Write-Host "   Abrindo: seed-nr-courses.sql" -ForegroundColor White
        Start-Process $seedFile
        Start-Sleep -Seconds 1
    }
}

# Perguntar se quer abrir o Dashboard
Write-Host ""
$openDash = Read-Host "Deseja abrir o Dashboard do Supabase? (S/N)"
if ($openDash -eq 'S' -or $openDash -eq 's' -or $OpenDashboard) {
    Write-Host "`n🌐 Abrindo Dashboard...`n" -ForegroundColor Green
    Start-Process $SQL_EDITOR_URL
}

# Aguardar confirmação
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⏳ AGUARDANDO EXECUÇÃO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Execute os SQLs no Dashboard e depois pressione qualquer tecla..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Verificar se as tabelas foram criadas
Write-Host "`n🔍 Verificando se as tabelas foram criadas..." -ForegroundColor Yellow

$SUPABASE_URL = "https://$PROJECT_ID.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE3NjEsImV4cCI6MjA3NTI4Nzc2MX0.u-F5m9lvYc1lx9aA-MoTZqCAa83QHGVk8uTh-_KPfCQ"

$headers = @{
    "apikey" = $SUPABASE_ANON_KEY
    "Authorization" = "Bearer $SUPABASE_ANON_KEY"
}

$tables = @("users", "projects", "slides", "render_jobs", "analytics_events", "nr_courses", "nr_modules")
$createdTables = 0

foreach ($table in $tables) {
    try {
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$table?limit=1" -Method GET -Headers $headers -ErrorAction SilentlyContinue
        Write-Host "   ✅ Tabela '$table' encontrada" -ForegroundColor Green
        $createdTables++
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Write-Host "   ⚠️  Tabela '$table' existe (sem permissão pública - OK)" -ForegroundColor Yellow
            $createdTables++
        } else {
            Write-Host "   ❌ Tabela '$table' não encontrada" -ForegroundColor Red
        }
    }
}

# Verificar cursos criados
Write-Host "`n🔍 Verificando cursos NR criados..." -ForegroundColor Yellow
try {
    $courses = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/nr_courses?select=course_code,title" -Method GET -Headers $headers -ErrorAction Stop
    
    if ($courses.Count -gt 0) {
        Write-Host "   ✅ Encontrados $($courses.Count) cursos:" -ForegroundColor Green
        foreach ($course in $courses) {
            Write-Host "      • $($course.course_code) - $($course.title)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  Nenhum curso encontrado (execute seed-nr-courses.sql)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar cursos" -ForegroundColor Yellow
}

# Resumo final
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESUMO FINAL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$percentage = [math]::Round(($createdTables / $tables.Count) * 100)

if ($percentage -eq 100) {
    Write-Host "✅ CONFIGURAÇÃO 100% COMPLETA!" -ForegroundColor Green
    Write-Host "`n🎉 Seu Supabase está pronto para uso!" -ForegroundColor Green
    Write-Host "`n📚 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Configure Storage Buckets" -ForegroundColor White
    Write-Host "   2. Configure autenticação de usuários" -ForegroundColor White
    Write-Host "   3. Teste criação de projetos" -ForegroundColor White
    Write-Host "   4. Leia SUPABASE_CONFIGURACAO_COMPLETA.md" -ForegroundColor White
} elseif ($percentage -gt 0) {
    Write-Host "⚠️  CONFIGURAÇÃO PARCIAL ($percentage%)" -ForegroundColor Yellow
    Write-Host "`n📋 Algumas tabelas não foram criadas." -ForegroundColor Yellow
    Write-Host "   Execute os SQLs faltantes no Dashboard." -ForegroundColor White
} else {
    Write-Host "❌ CONFIGURAÇÃO NÃO INICIADA" -ForegroundColor Red
    Write-Host "`n📋 Execute os SQLs no Dashboard:" -ForegroundColor Yellow
    Write-Host "   $SQL_EDITOR_URL" -ForegroundColor White
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Criar arquivo de status
$status = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    tables_created = $createdTables
    total_tables = $tables.Count
    percentage = $percentage
    completed = ($percentage -eq 100)
} | ConvertTo-Json

$status | Out-File -FilePath (Join-Path $PSScriptRoot "setup-status.json") -Encoding UTF8

Write-Host "`n💾 Status salvo em: setup-status.json`n" -ForegroundColor Gray
