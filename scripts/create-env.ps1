# ====================================================================
# 🔐 SCRIPT PARA CRIAR .env.local - ESTÚDIO IA DE VÍDEOS
# ====================================================================
# Execute este script para criar o arquivo .env.local
# ====================================================================

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔐 CRIAÇÃO DE ARQUIVO .env.local" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$envPath = "C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app\.env.local"

# Verificar se já existe
if (Test-Path $envPath) {
    Write-Host "⚠️  Arquivo .env.local já existe!" -ForegroundColor Yellow
    Write-Host "Localização: $envPath" -ForegroundColor Gray
    Write-Host ""
    $overwrite = Read-Host "Deseja sobrescrever? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "📝 Configurando variáveis de ambiente..." -ForegroundColor Green
Write-Host ""

# Coletar informações básicas
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "SUPABASE (OBRIGATÓRIO)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "Obtenha suas credenciais em: https://app.supabase.com/project/_/settings/api" -ForegroundColor Gray
Write-Host ""

$supabaseUrl = Read-Host "URL do Supabase (https://xxx.supabase.co)"
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    $supabaseUrl = "https://your-project.supabase.co"
}

$supabaseAnonKey = Read-Host "Chave Anônima do Supabase (anon key)"
if ([string]::IsNullOrWhiteSpace($supabaseAnonKey)) {
    $supabaseAnonKey = "your-anon-key-here"
}

$supabaseServiceKey = Read-Host "Chave de Serviço do Supabase (service_role key) [OPCIONAL]"
if ([string]::IsNullOrWhiteSpace($supabaseServiceKey)) {
    $supabaseServiceKey = "your-service-role-key-here"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "OUTROS SERVIÇOS (OPCIONAL)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "Pressione ENTER para pular qualquer serviço opcional" -ForegroundColor Gray
Write-Host ""

$includeOptional = Read-Host "Deseja configurar serviços opcionais agora? (s/N)"

$awsKey = "your_aws_access_key"
$awsSecret = "your_aws_secret_key"
$awsBucket = "your-bucket-name"
$azureKey = "your_azure_speech_key"
$elevenLabsKey = "your_elevenlabs_api_key"
$openaiKey = "your_openai_api_key"

if ($includeOptional -eq "s" -or $includeOptional -eq "S") {
    Write-Host ""
    Write-Host "AWS S3 (para upload de arquivos):" -ForegroundColor Cyan
    $tempAwsKey = Read-Host "  AWS Access Key ID [ENTER para pular]"
    if (-not [string]::IsNullOrWhiteSpace($tempAwsKey)) {
        $awsKey = $tempAwsKey
        $awsSecret = Read-Host "  AWS Secret Access Key"
        $awsBucket = Read-Host "  AWS S3 Bucket"
    }
    
    Write-Host ""
    Write-Host "Azure Speech (para TTS em PT-BR):" -ForegroundColor Cyan
    $tempAzureKey = Read-Host "  Azure Speech Key [ENTER para pular]"
    if (-not [string]::IsNullOrWhiteSpace($tempAzureKey)) {
        $azureKey = $tempAzureKey
    }
    
    Write-Host ""
    Write-Host "ElevenLabs (para voice cloning):" -ForegroundColor Cyan
    $tempElevenLabs = Read-Host "  ElevenLabs API Key [ENTER para pular]"
    if (-not [string]::IsNullOrWhiteSpace($tempElevenLabs)) {
        $elevenLabsKey = $tempElevenLabs
    }
    
    Write-Host ""
    Write-Host "OpenAI (para features de IA):" -ForegroundColor Cyan
    $tempOpenAI = Read-Host "  OpenAI API Key [ENTER para pular]"
    if (-not [string]::IsNullOrWhiteSpace($tempOpenAI)) {
        $openaiKey = $tempOpenAI
    }
}

# Criar conteúdo do arquivo
$envContent = @"
# ====================================================================
# 🔐 CONFIGURAÇÃO DE AMBIENTE - ESTÚDIO IA DE VÍDEOS
# ====================================================================
# Criado em: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
# IMPORTANTE: Nunca commite este arquivo!
# ====================================================================

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ====================================================================
# SUPABASE - DATABASE & AUTH (OBRIGATÓRIO)
# ====================================================================
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey
SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey

# ====================================================================
# AWS S3 - STORAGE
# ====================================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=$awsKey
AWS_SECRET_ACCESS_KEY=$awsSecret
AWS_S3_BUCKET=$awsBucket

# ====================================================================
# TEXT-TO-SPEECH PROVIDERS
# ====================================================================

# Azure Speech (Recomendado para PT-BR)
AZURE_SPEECH_KEY=$azureKey
AZURE_SPEECH_REGION=brazilsouth

# ElevenLabs (Voice Cloning)
ELEVENLABS_API_KEY=$elevenLabsKey

# Google Cloud TTS
GOOGLE_CLOUD_PROJECT_ID=your_google_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# ====================================================================
# OPENAI - AI FEATURES
# ====================================================================
OPENAI_API_KEY=$openaiKey
OPENAI_ORG_ID=your_openai_org_id

# ====================================================================
# AVATAR & VIDEO RENDERING
# ====================================================================
VIDNOZ_API_KEY=your_vidnoz_api_key
HEYGEN_API_KEY=your_heygen_api_key

# ====================================================================
# MONITORING & ANALYTICS
# ====================================================================
SENTRY_DSN=your_sentry_dsn
MIXPANEL_TOKEN=your_mixpanel_token

# ====================================================================
# REDIS - CACHE & QUEUE
# ====================================================================
REDIS_URL=redis://localhost:6379

# ====================================================================
# STRIPE - PAYMENTS (OPCIONAL)
# ====================================================================
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# ====================================================================
# EMAIL - NOTIFICATIONS
# ====================================================================
RESEND_API_KEY=your_resend_api_key
SMTP_FROM_EMAIL=noreply@yourdomain.com

# ====================================================================
# SECURITY
# ====================================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(New-Guid)

"@

# Criar arquivo
try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ ARQUIVO .env.local CRIADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Localização: $envPath" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Reinicie o servidor Next.js (Ctrl+C e npm run dev)" -ForegroundColor Yellow
    Write-Host "2. Verifique se não há mais erros do Supabase" -ForegroundColor Yellow
    Write-Host "3. Configure os serviços opcionais conforme necessário" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 DICA: Para editar o arquivo depois:" -ForegroundColor Cyan
    Write-Host "   notepad `"$envPath`"" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERRO ao criar arquivo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Perguntar se deseja abrir o arquivo
$openFile = Read-Host "Deseja abrir o arquivo agora para revisar? (s/N)"
if ($openFile -eq "s" -or $openFile -eq "S") {
    notepad $envPath
}

Write-Host ""
Write-Host "Concluído! 🎉" -ForegroundColor Green
Write-Host ""

