# ============================================
# 🚀 EXECUTAR SETUP COMPLETO - AUTOMATIZADO
# ============================================
# Script simplificado para executar setup completo
# Data: 13/10/2025

$ErrorActionPreference = "Stop"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 SETUP AUTOMATIZADO - SUPABASE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Configurações
$PROJECT_ID = "ofhzrdiadxigrvmrhaiz"
$DASHBOARD_URL = "https://supabase.com/dashboard/project/$PROJECT_ID"
$SQL_EDITOR_URL = "$DASHBOARD_URL/sql/new"
$STORAGE_URL = "$DASHBOARD_URL/storage/buckets"

Write-Host "📋 Este script vai:" -ForegroundColor Yellow
Write-Host "   1. Abrir o SQL Editor do Supabase no navegador" -ForegroundColor White
Write-Host "   2. Abrir os arquivos SQL no seu editor" -ForegroundColor White
Write-Host "   3. Você cola cada SQL e clica RUN" -ForegroundColor White
Write-Host "   4. Script testa se tudo foi criado" -ForegroundColor White
Write-Host "   5. ✅ Pronto para usar!" -ForegroundColor White
Write-Host ""

Read-Host "Pressione ENTER para começar"

# Verificar se os arquivos SQL existem
$schemaFile = Join-Path $PSScriptRoot "database-schema.sql"
$rlsFile = Join-Path $PSScriptRoot "database-rls-policies.sql"
$seedFile = Join-Path $PSScriptRoot "seed-nr-courses.sql"

$filesExist = $true
Write-Host "`n🔍 Verificando arquivos SQL..." -ForegroundColor Cyan

if (-not (Test-Path $schemaFile)) {
    Write-Host "   ❌ Arquivo não encontrado: database-schema.sql" -ForegroundColor Red
    $filesExist = $false
} else {
    Write-Host "   ✅ database-schema.sql encontrado" -ForegroundColor Green
}

if (-not (Test-Path $rlsFile)) {
    Write-Host "   ❌ Arquivo não encontrado: database-rls-policies.sql" -ForegroundColor Red
    $filesExist = $false
} else {
    Write-Host "   ✅ database-rls-policies.sql encontrado" -ForegroundColor Green
}

if (-not (Test-Path $seedFile)) {
    Write-Host "   ❌ Arquivo não encontrado: seed-nr-courses.sql" -ForegroundColor Red
    $filesExist = $false
} else {
    Write-Host "   ✅ seed-nr-courses.sql encontrado" -ForegroundColor Green
}

if (-not $filesExist) {
    Write-Host "`n❌ Alguns arquivos SQL não foram encontrados!" -ForegroundColor Red
    Write-Host "   Execute primeiro: .\create-database-schema.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📝 PASSO 1: CRIAR TABELAS (database-schema.sql)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "1️⃣  Abrindo SQL Editor no navegador..." -ForegroundColor Yellow
Start-Process $SQL_EDITOR_URL

Write-Host "2️⃣  Abrindo arquivo SQL no editor..." -ForegroundColor Yellow
Start-Process $schemaFile

Write-Host "`n📋 INSTRUÇÕES:" -ForegroundColor Green
Write-Host "   1. No arquivo SQL que abriu, selecione TODO o conteúdo (Ctrl+A)" -ForegroundColor White
Write-Host "   2. Copie (Ctrl+C)" -ForegroundColor White
Write-Host "   3. No navegador Supabase, cole no SQL Editor (Ctrl+V)" -ForegroundColor White
Write-Host "   4. Clique no botão RUN ou pressione Ctrl+Enter" -ForegroundColor White
Write-Host "   5. Aguarde a mensagem: 'Success. No rows returned'" -ForegroundColor White
Write-Host ""

Read-Host "Pressione ENTER quando terminar de executar o SQL"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔒 PASSO 2: APLICAR SEGURANÇA (database-rls-policies.sql)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "1️⃣  Abrindo novo SQL Editor..." -ForegroundColor Yellow
Start-Process $SQL_EDITOR_URL

Write-Host "2️⃣  Abrindo arquivo SQL no editor..." -ForegroundColor Yellow
Start-Process $rlsFile

Write-Host "`n📋 INSTRUÇÕES:" -ForegroundColor Green
Write-Host "   1. Selecione TODO o conteúdo do arquivo RLS (Ctrl+A)" -ForegroundColor White
Write-Host "   2. Copie (Ctrl+C)" -ForegroundColor White
Write-Host "   3. No navegador, NOVA query, cole (Ctrl+V)" -ForegroundColor White
Write-Host "   4. Clique RUN" -ForegroundColor White
Write-Host "   5. Aguarde 'Success'" -ForegroundColor White
Write-Host ""

Read-Host "Pressione ENTER quando terminar de executar o SQL"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📦 PASSO 3: POPULAR CURSOS NR (seed-nr-courses.sql)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "1️⃣  Abrindo novo SQL Editor..." -ForegroundColor Yellow
Start-Process $SQL_EDITOR_URL

Write-Host "2️⃣  Abrindo arquivo SQL no editor..." -ForegroundColor Yellow
Start-Process $seedFile

Write-Host "`n📋 INSTRUÇÕES:" -ForegroundColor Green
Write-Host "   1. Selecione TODO o conteúdo do arquivo SEED (Ctrl+A)" -ForegroundColor White
Write-Host "   2. Copie (Ctrl+C)" -ForegroundColor White
Write-Host "   3. No navegador, NOVA query, cole (Ctrl+V)" -ForegroundColor White
Write-Host "   4. Clique RUN" -ForegroundColor White
Write-Host "   5. Aguarde 'Success'" -ForegroundColor White
Write-Host ""

Read-Host "Pressione ENTER quando terminar de executar o SQL"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🪣 PASSO 4: CRIAR STORAGE BUCKETS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "1️⃣  Abrindo Storage no navegador..." -ForegroundColor Yellow
Start-Process $STORAGE_URL

Write-Host "`n📋 INSTRUÇÕES:" -ForegroundColor Green
Write-Host "   Crie 4 buckets clicando em 'New bucket':" -ForegroundColor White
Write-Host ""
Write-Host "   1. Nome: videos" -ForegroundColor Cyan
Write-Host "      • Public: NÃO" -ForegroundColor White
Write-Host "      • File size limit: 500 MB" -ForegroundColor White
Write-Host ""
Write-Host "   2. Nome: avatars" -ForegroundColor Cyan
Write-Host "      • Public: NÃO" -ForegroundColor White
Write-Host "      • File size limit: 50 MB" -ForegroundColor White
Write-Host ""
Write-Host "   3. Nome: thumbnails" -ForegroundColor Cyan
Write-Host "      • Public: SIM" -ForegroundColor White
Write-Host "      • File size limit: 10 MB" -ForegroundColor White
Write-Host ""
Write-Host "   4. Nome: assets" -ForegroundColor Cyan
Write-Host "      • Public: SIM" -ForegroundColor White
Write-Host "      • File size limit: 20 MB" -ForegroundColor White
Write-Host ""

Read-Host "Pressione ENTER quando terminar de criar os 4 buckets"

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 PASSO 5: TESTAR CONEXÃO" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Executando teste de conexão..." -ForegroundColor Yellow

# Verificar se Node.js está instalado
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "⚠️  Node.js não encontrado. Teste manual:" -ForegroundColor Yellow
    Write-Host "   Abra: http://localhost:3000" -ForegroundColor White
    Write-Host "   Crie uma conta e teste o upload de PPTX" -ForegroundColor White
} else {
    # Instalar dependência @supabase/supabase-js se não existir
    if (-not (Test-Path "node_modules\@supabase\supabase-js")) {
        Write-Host "Instalando dependência @supabase/supabase-js..." -ForegroundColor Yellow
        npm install @supabase/supabase-js --no-save 2>&1 | Out-Null
    }

    # Executar teste
    node test-supabase-simple.js
}

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETO!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "🎉 Parabéns! Seu sistema está configurado!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host "  2. Crie uma conta ou faça login" -ForegroundColor White
Write-Host "  3. Teste o upload de um arquivo PPTX" -ForegroundColor White
Write-Host "  4. Verifique se o projeto aparece no dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Para vídeos profissionais completos:" -ForegroundColor Yellow
Write-Host "  • Configure TTS (Azure/ElevenLabs) - 2h" -ForegroundColor White
Write-Host "  • Integre Avatar D-ID - 5 dias" -ForegroundColor White
Write-Host "  • Leia: AVATAR_3D_COMO_TORNAR_REAL.md" -ForegroundColor White
Write-Host ""

Read-Host "Pressione ENTER para finalizar"
