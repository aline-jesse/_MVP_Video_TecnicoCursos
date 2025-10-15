# ============================================
# 🧪 TEST SUPABASE CONNECTION
# ============================================
# Script para testar a conexão com Supabase
# Data: 09/10/2025

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 TESTE DE CONEXÃO SUPABASE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configurações
$SUPABASE_URL = "https://ofhzrdiadxigrvmrhaiz.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE3NjEsImV4cCI6MjA3NTI4Nzc2MX0.u-F5m9lvYc1lx9aA-MoTZqCAa83QHGVk8uTh-_KPfCQ"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxMTc2MSwiZXhwIjoyMDc1Mjg3NzYxfQ.0bVv7shwyo9aSGP5vbopBlZTS5MUDKkLtTCTYh36gug"

Write-Host "📋 Configurações:" -ForegroundColor Yellow
Write-Host "   URL: $SUPABASE_URL"
Write-Host "   Project Ref: ofhzrdiadxigrvmrhaiz"
Write-Host ""

# Teste 1: Verificar conectividade básica
Write-Host "🔍 Teste 1: Verificando conectividade básica..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/" -Method GET -Headers @{
        "apikey" = $SUPABASE_ANON_KEY
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
    } -ErrorAction Stop
    
    Write-Host "   ✅ Conectividade OK!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro na conectividade: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Listar tabelas disponíveis
Write-Host ""
Write-Host "🔍 Teste 2: Listando tabelas disponíveis..." -ForegroundColor Cyan
try {
    $headers = @{
        "apikey" = $SUPABASE_ANON_KEY
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
        "Content-Type" = "application/json"
    }
    
    # Tentar acessar algumas tabelas comuns
    $tables = @("projects", "slides", "render_jobs", "analytics_events", "users")
    
    foreach ($table in $tables) {
        try {
            $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$table?limit=1" -Method GET -Headers $headers -ErrorAction SilentlyContinue
            Write-Host "   ✅ Tabela '$table' acessível" -ForegroundColor Green
        } catch {
            if ($_.Exception.Response.StatusCode.value__ -eq 404) {
                Write-Host "   ⚠️  Tabela '$table' não existe (precisa ser criada)" -ForegroundColor Yellow
            } elseif ($_.Exception.Response.StatusCode.value__ -eq 401) {
                Write-Host "   ⚠️  Tabela '$table' existe mas sem permissão (normal)" -ForegroundColor Yellow
            } else {
                Write-Host "   ℹ️  Tabela '$table' - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Blue
            }
        }
    }
} catch {
    Write-Host "   ⚠️  Erro ao listar tabelas: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Teste 3: Verificar autenticação
Write-Host ""
Write-Host "🔍 Teste 3: Verificando sistema de autenticação..." -ForegroundColor Cyan
try {
    $authHeaders = @{
        "apikey" = $SUPABASE_ANON_KEY
        "Content-Type" = "application/json"
    }
    
    # Tentar acessar o endpoint de auth
    $response = Invoke-WebRequest -Uri "$SUPABASE_URL/auth/v1/settings" -Method GET -Headers $authHeaders -ErrorAction Stop
    
    Write-Host "   ✅ Sistema de autenticação ativo!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "   ⚠️  Auth endpoint não encontrado" -ForegroundColor Yellow
    } else {
        Write-Host "   ℹ️  Auth Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Blue
    }
}

# Teste 4: Verificar Storage
Write-Host ""
Write-Host "🔍 Teste 4: Verificando Supabase Storage..." -ForegroundColor Cyan
try {
    $storageHeaders = @{
        "apikey" = $SUPABASE_ANON_KEY
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
    }
    
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/storage/v1/bucket" -Method GET -Headers $storageHeaders -ErrorAction Stop
    
    if ($response.Count -gt 0) {
        Write-Host "   ✅ Storage ativo com $($response.Count) bucket(s)" -ForegroundColor Green
        foreach ($bucket in $response) {
            Write-Host "      • $($bucket.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  Storage ativo mas sem buckets configurados" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Erro ao verificar Storage: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Resumo Final
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESUMO DO TESTE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Supabase está configurado e acessível!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos recomendados:" -ForegroundColor Yellow
Write-Host "   1. Criar as tabelas necessárias no banco de dados" -ForegroundColor White
Write-Host "   2. Configurar buckets de Storage para arquivos" -ForegroundColor White
Write-Host "   3. Configurar políticas RLS (Row Level Security)" -ForegroundColor White
Write-Host "   4. Testar autenticação de usuários" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
