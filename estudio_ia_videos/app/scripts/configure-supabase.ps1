# ============================================
# 🚀 SCRIPT DE CONFIGURAÇÃO SUPABASE
# ============================================
# Facilita a configuração do .env.local com Supabase
# 
# Uso:
#   .\scripts\configure-supabase.ps1
# ============================================

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 CONFIGURAÇÃO SUPABASE - PPTX Advanced Features      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Este script vai guiá-lo na configuração do Supabase.`n" -ForegroundColor Yellow

# ============================================
# VERIFICAR SE JÁ TEM .env.local
# ============================================

$envPath = Join-Path $PSScriptRoot "..\..\.env.local"

if (Test-Path $envPath) {
    Write-Host "⚠️  Arquivo .env.local já existe!`n" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja sobrescrever? (S/N)"
    
    if ($overwrite -ne "S" -and $overwrite -ne "s") {
        Write-Host "`n❌ Operação cancelada. Edite manualmente o .env.local`n" -ForegroundColor Red
        exit
    }
    
    # Fazer backup
    $backupPath = "$envPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $envPath $backupPath
    Write-Host "✅ Backup criado: $(Split-Path $backupPath -Leaf)`n" -ForegroundColor Green
}

# ============================================
# COLETAR INFORMAÇÕES
# ============================================

Write-Host "📝 Preencha as informações do seu projeto Supabase:`n" -ForegroundColor Cyan

# PROJECT ID
Write-Host "1️⃣  PROJECT ID" -ForegroundColor Yellow
Write-Host "   Onde encontrar: Supabase → Settings → General → Reference ID`n" -ForegroundColor Gray
$projectId = Read-Host "   Digite o PROJECT ID"

if ([string]::IsNullOrWhiteSpace($projectId)) {
    Write-Host "`n❌ PROJECT ID é obrigatório!`n" -ForegroundColor Red
    exit
}

# DATABASE PASSWORD
Write-Host "`n2️⃣  DATABASE PASSWORD" -ForegroundColor Yellow
Write-Host "   Onde encontrar: A senha que você criou ao criar o projeto`n" -ForegroundColor Gray
Write-Host "   ⚠️  ATENÇÃO: Se tem caracteres especiais (@ # % &), será convertido automaticamente`n" -ForegroundColor Yellow
$password = Read-Host "   Digite a senha do banco" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
    Write-Host "`n❌ Senha é obrigatória!`n" -ForegroundColor Red
    exit
}

# URL Encode da senha
$passwordEncoded = [System.Web.HttpUtility]::UrlEncode($passwordPlain)

# ANON KEY (Opcional)
Write-Host "`n3️⃣  ANON KEY (Opcional - pressione Enter para pular)" -ForegroundColor Yellow
Write-Host "   Onde encontrar: Supabase → Settings → API → anon public`n" -ForegroundColor Gray
$anonKey = Read-Host "   Digite a ANON KEY (ou Enter para pular)"

# ============================================
# GERAR .env.local
# ============================================

Write-Host "`n🔧 Gerando arquivo .env.local...`n" -ForegroundColor Cyan

$envContent = @"
# ============================================
# 🗄️ SUPABASE DATABASE
# ============================================
# Gerado automaticamente em: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

# Connection Pooling (Para aplicação Next.js)
DATABASE_URL="postgresql://postgres:${passwordEncoded}@db.${projectId}.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct Connection (Para migrations com Prisma)
DIRECT_DATABASE_URL="postgresql://postgres:${passwordEncoded}@db.${projectId}.supabase.co:5432/postgres"

# ============================================
# 🔑 SUPABASE API
# ============================================

NEXT_PUBLIC_SUPABASE_URL="https://${projectId}.supabase.co"
"@

if (-not [string]::IsNullOrWhiteSpace($anonKey)) {
    $envContent += @"

NEXT_PUBLIC_SUPABASE_ANON_KEY="$anonKey"
"@
}

$envContent += @"


# ============================================
# 🎙️ TTS SERVICES (Adicione conforme necessário)
# ============================================

# AZURE_TTS_KEY="your-azure-key"
# AZURE_TTS_REGION="brazilsouth"
# ELEVENLABS_API_KEY="your-elevenlabs-key"

# ============================================
# 🔐 NEXTAUTH
# ============================================

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(New-Guid)"

"@

# Salvar arquivo
Set-Content -Path $envPath -Value $envContent -Encoding UTF8

Write-Host "✅ Arquivo .env.local criado com sucesso!`n" -ForegroundColor Green

# ============================================
# VALIDAR CONEXÃO
# ============================================

Write-Host "📡 Validando conexão com Supabase...`n" -ForegroundColor Cyan

try {
    $validateOutput = npx prisma db push --accept-data-loss 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão estabelecida com sucesso!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao conectar com o banco:`n" -ForegroundColor Red
        Write-Host $validateOutput -ForegroundColor Red
        Write-Host "`n💡 Verifique se:`n" -ForegroundColor Yellow
        Write-Host "   1. O PROJECT ID está correto" -ForegroundColor Gray
        Write-Host "   2. A senha está correta" -ForegroundColor Gray
        Write-Host "   3. O projeto está ativo no Supabase`n" -ForegroundColor Gray
        exit
    }
} catch {
    Write-Host "❌ Erro ao validar conexão: $_`n" -ForegroundColor Red
    exit
}

# ============================================
# EXECUTAR MIGRATION
# ============================================

Write-Host "📦 Executando migração do banco de dados...`n" -ForegroundColor Cyan

$migrate = Read-Host "Deseja executar a migração agora? (S/N)"

if ($migrate -eq "S" -or $migrate -eq "s") {
    try {
        npx prisma migrate dev --name add_pptx_batch_models
        Write-Host "`n✅ Migração executada com sucesso!`n" -ForegroundColor Green
    } catch {
        Write-Host "`n❌ Erro na migração: $_`n" -ForegroundColor Red
    }
}

# ============================================
# RESUMO
# ============================================

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ CONFIGURAÇÃO CONCLUÍDA!                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📝 PRÓXIMOS PASSOS:

1️⃣  Verificar no Prisma Studio:
   npx prisma studio

2️⃣  Executar testes:
   .\scripts\setup-and-test.ps1

3️⃣  Testar com arquivo real:
   npx tsx scripts\test-api-pptx.ts

🔗 LINKS ÚTEIS:

   Supabase Dashboard: https://supabase.com/dashboard/project/$projectId
   Prisma Studio:      http://localhost:5555
   App:                http://localhost:3000

📁 ARQUIVOS CRIADOS:

   ✅ .env.local (com suas credenciais)
"@ -ForegroundColor Cyan

if (Test-Path "$envPath.backup.*") {
    Write-Host "   ✅ Backup do .env.local anterior`n" -ForegroundColor Cyan
}

Write-Host "`n🎉 Tudo pronto para usar o PPTX Advanced Features v2.1!`n" -ForegroundColor Green
