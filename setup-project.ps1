#!/usr/bin/env pwsh

# ============================================
# 🚀 SCRIPT DE SETUP INICIAL DO PROJETO
# ============================================

Write-Host "🎯 Iniciando configuração do MVP TécnicoCursos v7..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js não encontrado! Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar npm
Write-Host "📦 Verificando npm..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# Instalar dependências raiz
Write-Host ""
Write-Host "📦 Instalando dependências do projeto raiz..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependências raiz instaladas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao instalar dependências raiz" -ForegroundColor Red
    exit 1
}

# Instalar dependências do estúdio
Write-Host ""
Write-Host "📦 Instalando dependências do Estúdio IA Videos..." -ForegroundColor Yellow
Set-Location "estudio_ia_videos/app"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependências do estúdio instaladas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao instalar dependências do estúdio" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Set-Location "../.."

# Criar arquivo .env.local
Write-Host ""
Write-Host "⚙️  Criando arquivo .env.local..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    @"
# ============================================
# 🔐 SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DIRECT_DATABASE_URL=your-direct-database-url

# ============================================
# 🎙️ TTS SERVICES
# ============================================
ELEVENLABS_API_KEY=your-elevenlabs-api-key
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=brazilsouth

# ============================================
# 💳 STRIPE
# ============================================
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# ============================================
# 🌐 APLICAÇÃO
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "   ✅ Arquivo .env.local criado" -ForegroundColor Green
    Write-Host "   ⚠️  IMPORTANTE: Configure as variáveis com suas credenciais reais!" -ForegroundColor Yellow
} else {
    Write-Host "   ℹ️  Arquivo .env.local já existe" -ForegroundColor Cyan
}

# Criar arquivo .env.local no estúdio
Write-Host ""
Write-Host "⚙️  Criando arquivo .env.local no estúdio..." -ForegroundColor Yellow
if (!(Test-Path "estudio_ia_videos/app/.env.local")) {
    @"
# ============================================
# 🔐 SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ============================================
# 🎙️ TTS SERVICES
# ============================================
ELEVENLABS_API_KEY=your-elevenlabs-api-key
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=brazilsouth

# ============================================
# 🌐 APLICAÇÃO
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath "estudio_ia_videos/app/.env.local" -Encoding utf8
    Write-Host "   ✅ Arquivo .env.local do estúdio criado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Arquivo .env.local do estúdio já existe" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ SETUP INICIAL CONCLUÍDO!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure as variáveis de ambiente em .env.local" -ForegroundColor White
Write-Host "   Você precisa adicionar suas credenciais reais:" -ForegroundColor Gray
Write-Host "   - Supabase (URL, ANON_KEY, SERVICE_ROLE_KEY)" -ForegroundColor Gray
Write-Host "   - TTS APIs (ElevenLabs, Azure Speech)" -ForegroundColor Gray
Write-Host "   - Stripe (SECRET_KEY, PUBLISHABLE_KEY)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure o Supabase:" -ForegroundColor White
Write-Host "   npm run setup:supabase" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Execute o ambiente de desenvolvimento:" -ForegroundColor White
Write-Host "   cd estudio_ia_videos/app" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Acesse a aplicação em:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentação completa em:" -ForegroundColor Yellow
Write-Host "   - README.md" -ForegroundColor Cyan
Write-Host "   - docs/" -ForegroundColor Cyan
Write-Host "   - ___BIBLIOTECAS/" -ForegroundColor Cyan
Write-Host ""
