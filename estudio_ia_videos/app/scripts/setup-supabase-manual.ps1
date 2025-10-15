# 🔧 Setup Manual do Supabase
# Configura o .env com as credenciais fornecidas

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  🚀 CONFIGURAÇÃO MANUAL SUPABASE                          ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Informações do projeto
$projectId = "ofhzrdiadxigrvmrhaiz"
$password = "Tr1unf0@"
$passwordEncoded = [System.Web.HttpUtility]::UrlEncode($password)
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE3NjEsImV4cCI6MjA3NTI4Nzc2MX0.u-F5m9lvYc1lx9aA-MoTZqCAa83QHGVk8uTh-_KPfCQ"

Write-Host "📋 Informações do projeto:" -ForegroundColor Yellow
Write-Host "   Project ID: $projectId"
Write-Host "   Senha: $password"
Write-Host "   Senha codificada: $passwordEncoded`n"

# Testa todas as regiões possíveis
$regions = @("us-west-1", "us-east-1", "sa-east-1", "eu-west-1", "ap-southeast-1")

Write-Host "🔍 Testando regiões..." -ForegroundColor Cyan

$workingRegion = $null

foreach ($region in $regions) {
    Write-Host "   Testando $region..." -NoNewline
    
    $testUrl = "postgresql://postgres.${projectId}:${passwordEncoded}@aws-0-${region}.pooler.supabase.com:5432/postgres"
    
    # Testa conexão usando Prisma
    $env:DIRECT_DATABASE_URL = $testUrl
    $env:DATABASE_URL = $testUrl
    
    $testResult = npx prisma db execute --stdin --schema="$PSScriptRoot\..\prisma\schema.prisma" <<< "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        $workingRegion = $region
        break
    } else {
        Write-Host " ❌" -ForegroundColor Red
    }
}

if ($workingRegion) {
    Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  ✅ REGIÃO ENCONTRADA: $workingRegion                     ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

    # Gera URLs corretas
    $poolingUrl = "postgresql://postgres.${projectId}:${passwordEncoded}@aws-0-${workingRegion}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
    $directUrl = "postgresql://postgres.${projectId}:${passwordEncoded}@aws-0-${workingRegion}.pooler.supabase.com:5432/postgres"
    $supabaseUrl = "https://${projectId}.supabase.co"
    
    Write-Host "📡 Connection strings geradas:" -ForegroundColor Cyan
    Write-Host "`nDATABASE_URL:" -ForegroundColor Yellow
    Write-Host $poolingUrl
    Write-Host "`nDIRECT_DATABASE_URL:" -ForegroundColor Yellow
    Write-Host $directUrl
    
    # Atualiza .env
    $envPath = Join-Path $PSScriptRoot ".." ".env"
    
    if (Test-Path $envPath) {
        Write-Host "`n🔧 Atualizando arquivo .env..." -ForegroundColor Yellow
        
        $content = Get-Content $envPath -Raw
        $lines = $content -split "`n"
        $newLines = @()
        
        foreach ($line in $lines) {
            if ($line -notmatch "^DATABASE_URL=" -and $line -notmatch "^DIRECT_DATABASE_URL=") {
                $newLines += $line
            }
        }
        
        # Adiciona novas URLs
        $finalContent = @"
DATABASE_URL="$poolingUrl"
DIRECT_DATABASE_URL="$directUrl"
$($newLines -join "`n")
"@
        
        Set-Content -Path $envPath -Value $finalContent.Trim()
        
        Write-Host "✅ Arquivo .env atualizado!" -ForegroundColor Green
        
        # Executa migration
        Write-Host "`n🔧 Criando tabelas no banco..." -ForegroundColor Cyan
        
        npx prisma db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!                   ║
╚════════════════════════════════════════════════════════════╝

✅ Banco de dados configurado
✅ Tabelas criadas
✅ Sistema 100% operacional!

📊 Próximos passos:

   1. Verificar sistema:
      .\scripts\production-check.ps1

   2. Abrir Prisma Studio:
      npx prisma studio
      (http://localhost:5555)

   3. Iniciar aplicação:
      npm run dev
      (http://localhost:3000)

"@ -ForegroundColor Green
        }
    }
} else {
    Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  ❌ NENHUMA REGIÃO FUNCIONOU                              ║
╚════════════════════════════════════════════════════════════╝

Vou tentar método alternativo usando o dashboard...

1. Acesse: https://supabase.com/dashboard/project/$projectId/settings/database

2. Copie a "Connection string" (modo "Session pooling" ou "Transaction pooling")

3. Execute: .\scripts\quick-setup-supabase.ps1

"@ -ForegroundColor Yellow
}
