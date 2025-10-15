# 🔧 Configuração Rápida Supabase
# Script simplificado que solicita a connection string do dashboard

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  🚀 CONFIGURAÇÃO RÁPIDA SUPABASE                          ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "📋 PASSO 1: Obter Connection String" -ForegroundColor Yellow
Write-Host @"

1. Acesse: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/settings/database

2. Role até encontrar "Connection string"

3. Na seção "Connection pooling", copie a string completa:
   postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

4. ⚠️  IMPORTANTE: Substitua [YOUR-PASSWORD] pela sua senha REAL
   Se a senha tem @ use %40 no lugar (exemplo: Th@mires122 vira Th%40mires122)

"@

$poolingUrl = Read-Host "Cole a CONNECTION STRING (pooling) aqui"

if (-not $poolingUrl) {
    Write-Host "`n❌ Nenhuma URL fornecida. Cancelando..." -ForegroundColor Red
    exit 1
}

# Remove aspas se existirem
$poolingUrl = $poolingUrl.Trim('"')

# Valida formato básico
if ($poolingUrl -notmatch "^postgresql://") {
    Write-Host "`n❌ URL inválida! Deve começar com postgresql://" -ForegroundColor Red
    exit 1
}

# Gera direct URL (substitui 6543 por 5432 e remove parâmetros pgbouncer)
$directUrl = $poolingUrl -replace ":6543/", ":5432/"
$directUrl = $directUrl -replace "\?pgbouncer=.*", ""

Write-Host "`n✅ URLs processadas:" -ForegroundColor Green
Write-Host "`n📡 Pooling (DATABASE_URL):" -ForegroundColor Cyan
Write-Host $poolingUrl -ForegroundColor White
Write-Host "`n📡 Direct (DIRECT_DATABASE_URL):" -ForegroundColor Cyan  
Write-Host $directUrl -ForegroundColor White

# Atualiza arquivo .env
$envPath = Join-Path $PSScriptRoot ".." ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "`n❌ Arquivo .env não encontrado em: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Atualizando arquivo .env..." -ForegroundColor Yellow

$content = Get-Content $envPath -Raw

# Remove linhas antigas DATABASE_URL e DIRECT_DATABASE_URL
$lines = $content -split "`n"
$newLines = @()

foreach ($line in $lines) {
    if ($line -notmatch "^DATABASE_URL=" -and $line -notmatch "^DIRECT_DATABASE_URL=") {
        $newLines += $line
    }
}

# Adiciona novas URLs no início
$finalContent = @"
DATABASE_URL="$poolingUrl"
DIRECT_DATABASE_URL="$directUrl"
$($newLines -join "`n")
"@

Set-Content -Path $envPath -Value $finalContent.Trim()

Write-Host "✅ Arquivo .env atualizado!" -ForegroundColor Green

# Testa conexão
Write-Host "`n🔍 Testando conexão com Supabase..." -ForegroundColor Cyan

try {
    $testOutput = npx prisma db push 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  ✅ CONEXÃO ESTABELECIDA COM SUCESSO!                     ║
╚════════════════════════════════════════════════════════════╝

🎉 Tabelas criadas no banco Supabase!

📊 Modelos disponíveis:
   • PPTXBatchJob
   • PPTXProcessingJob

🔍 Próximos passos:

   1. Verificar sistema completo:
      .\scripts\production-check.ps1

   2. Abrir Prisma Studio:
      npx prisma studio
      (Abre em http://localhost:5555)

   3. Iniciar aplicação:
      npm run dev
      (Abre em http://localhost:3000)

✅ Sistema 100% operacional!

"@ -ForegroundColor Green
        
    } else {
        Write-Host "`n❌ Erro ao conectar:" -ForegroundColor Red
        Write-Host $testOutput
        Write-Host @"

💡 Possíveis soluções:

1. Verifique se a senha está correta
2. Verifique se substituiu [YOUR-PASSWORD] pela senha real
3. Se a senha tem @ use %40 (exemplo: pass@123 → pass%40123)
4. Tente copiar a string novamente do dashboard

Execute novamente: .\scripts\quick-setup-supabase.ps1

"@ -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Erro ao executar Prisma: $($_.Exception.Message)" -ForegroundColor Red
}
