#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Inicia o servidor Next.js com todas as configurações corretas
.DESCRIPTION
    Script para iniciar o servidor Next.js do Estudio IA Videos
    com as chaves VAPID configuradas e Service Worker corrigido
#>

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "║            🚀 INICIANDO SERVIDOR NEXT.JS                         ║" -ForegroundColor Cyan
Write-Host "║                                                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$appDir = "C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app"

# Verificar se o diretório existe
if (-not (Test-Path $appDir)) {
    Write-Host "❌ Erro: Diretório não encontrado: $appDir" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Diretório: $appDir" -ForegroundColor Gray
Write-Host "🔍 Verificando configurações...`n" -ForegroundColor Gray

# Verificar arquivo package.json
$packageJson = Join-Path $appDir "package.json"
if (-not (Test-Path $packageJson)) {
    Write-Host "❌ Erro: package.json não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ package.json encontrado" -ForegroundColor Green

# Verificar se .env existe
$envFile = "C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\.env"
if (Test-Path $envFile) {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    
    # Verificar se as chaves VAPID estão configuradas
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "NEXT_PUBLIC_VAPID_PUBLIC_KEY") {
        Write-Host "✅ Chaves VAPID configuradas" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Aviso: Chaves VAPID não encontradas no .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Aviso: Arquivo .env não encontrado" -ForegroundColor Yellow
}

# Verificar Service Worker
$swFile = Join-Path $appDir "public\sw.js"
if (Test-Path $swFile) {
    Write-Host "✅ Service Worker (sw.js) encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aviso: sw.js não encontrado" -ForegroundColor Yellow
}

Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n🚀 Iniciando servidor Next.js...`n" -ForegroundColor Yellow

# Mudar para o diretório do app
Set-Location $appDir

# Iniciar o servidor
Write-Host "📍 Servidor será iniciado em: http://localhost:3000" -ForegroundColor Magenta
Write-Host "⏱️  Aguarde alguns segundos para o servidor inicializar..." -ForegroundColor Gray
Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Executar npm run dev
npm run dev
