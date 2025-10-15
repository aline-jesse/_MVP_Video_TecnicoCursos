# 🔍 Script de Diagnóstico - Supabase Connection
# Testa diferentes formatos de connection string

Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  🔍 DIAGNÓSTICO DE CONEXÃO SUPABASE                       ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Informações fornecidas
$projectId = "ofhzrdiadxigrvmrhaiz"
$password = "Th@mires122"
$passwordEncoded = "Th%40mires122"

Write-Host "📋 Informações:" -ForegroundColor Yellow
Write-Host "   Project ID: $projectId"
Write-Host "   Senha original: $password"
Write-Host "   Senha codificada: $passwordEncoded`n"

# Regiões para testar
$regions = @(
    @{ name = "São Paulo"; code = "sa-east-1" },
    @{ name = "N. Virginia"; code = "us-east-1" },
    @{ name = "N. California"; code = "us-west-1" },
    @{ name = "Oregon"; code = "us-west-2" },
    @{ name = "Ireland"; code = "eu-west-1" },
    @{ name = "Frankfurt"; code = "eu-central-1" },
    @{ name = "Singapore"; code = "ap-southeast-1" },
    @{ name = "Tokyo"; code = "ap-northeast-1" },
    @{ name = "Sydney"; code = "ap-southeast-2" }
)

# Formatos de usuário para testar
$userFormats = @(
    "postgres.$projectId",
    "postgres",
    $projectId
)

Write-Host "🔍 Testando combinações...`n" -ForegroundColor Cyan

$testCount = 0
$successCount = 0

foreach ($region in $regions) {
    foreach ($userFormat in $userFormats) {
        $testCount++
        
        # Teste com porta 5432 (direct)
        $directUrl = "postgresql://${userFormat}:${passwordEncoded}@aws-0-$($region.code).pooler.supabase.com:5432/postgres"
        
        Write-Host "[$testCount] Testando: $($region.name) ($($region.code)) - User: $userFormat" -NoNewline
        
        # Testa usando psql (se disponível) ou PostgreSQL .NET driver
        try {
            $env:PGPASSWORD = $password
            $testResult = psql "$directUrl" -c "SELECT 1;" 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " ✅ SUCESSO!" -ForegroundColor Green
                Write-Host "`n🎉 CONNECTION STRING CORRETA ENCONTRADA:" -ForegroundColor Green
                Write-Host "`nDIRECT_DATABASE_URL=$directUrl" -ForegroundColor Yellow
                Write-Host "DATABASE_URL=postgresql://${userFormat}:${passwordEncoded}@aws-0-$($region.code).pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1" -ForegroundColor Yellow
                $successCount++
                break
            } else {
                Write-Host " ❌" -ForegroundColor Red
            }
        } catch {
            Write-Host " ❌ (Erro: $($_.Exception.Message))" -ForegroundColor Red
        }
    }
    
    if ($successCount -gt 0) { break }
}

if ($successCount -eq 0) {
    Write-Host @"

╔════════════════════════════════════════════════════════════╗
║  ⚠️  NENHUMA CONEXÃO FUNCIONOU                            ║
╚════════════════════════════════════════════════════════════╝

Possíveis problemas:

1. ❌ Senha incorreta
   → Verifique a senha no painel do Supabase
   → Settings → Database → Reset Database Password

2. ❌ Projeto inativo ou pausado
   → Verifique se o projeto está ativo no dashboard

3. ❌ Restrições de IP
   → Settings → Database → Network Restrictions
   → Certifique-se de que "Allow all IP addresses" está marcado

4. ❌ Projeto não configurado corretamente
   → Verifique se o PostgreSQL foi habilitado

📋 SOLUÇÃO RECOMENDADA:

1. Acesse: https://supabase.com/dashboard/project/$projectId/settings/database

2. Copie a "Connection string" EXATAMENTE como aparece:
   
   Connection pooling:
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@...
   
3. Cole a string completa abaixo e pressione Enter:

"@ -ForegroundColor Yellow

    $userInput = Read-Host "`nCole a Connection String (pooling)"
    
    if ($userInput) {
        Write-Host "`n✅ String fornecida:" -ForegroundColor Green
        Write-Host $userInput
        
        # Extrai direct URL (substitui porta 6543 por 5432)
        $directInput = $userInput -replace ":6543/", ":5432/"
        $directInput = $directInput -replace "\?.*", ""
        
        Write-Host "`n📝 Adicione ao arquivo .env:" -ForegroundColor Cyan
        Write-Host "`nDATABASE_URL=`"$userInput`"" -ForegroundColor Yellow
        Write-Host "DIRECT_DATABASE_URL=`"$directInput`"" -ForegroundColor Yellow
        
        # Salva no arquivo
        $envPath = Join-Path $PSScriptRoot ".." ".env"
        
        if (Test-Path $envPath) {
            $content = Get-Content $envPath -Raw
            
            # Remove linhas antigas
            $content = $content -replace 'DATABASE_URL=".*"', ''
            $content = $content -replace 'DIRECT_DATABASE_URL=".*"', ''
            
            # Adiciona novas linhas
            $newLines = @"
DATABASE_URL="$userInput"
DIRECT_DATABASE_URL="$directInput"
"@
            
            $content = $newLines + "`n" + $content
            
            Set-Content -Path $envPath -Value $content
            
            Write-Host "`n✅ Arquivo .env atualizado!" -ForegroundColor Green
            Write-Host "`n🔄 Testando conexão..." -ForegroundColor Cyan
            
            npx prisma db push
        }
    }
}

Write-Host "`n✅ Diagnóstico concluído!`n" -ForegroundColor Green
