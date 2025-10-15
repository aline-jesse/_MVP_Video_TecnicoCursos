# ============================================
# Script de Validação - Setup Supabase
# ============================================
# 
# Este script valida se os arquivos necessários
# para o setup do Supabase existem e estão corretos
#
# Autor: Sistema
# Data: 10/10/2025
# ============================================

Write-Host "`n🔍 VALIDAÇÃO DE SETUP SUPABASE" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$basePath = $PSScriptRoot
$errors = @()
$warnings = @()
$success = @()

# ============================================
# 1. VERIFICAR ARQUIVOS SQL
# ============================================

Write-Host "`n📄 Verificando arquivos SQL..." -ForegroundColor Yellow

$sqlFiles = @(
    @{
        Name = "database-schema.sql"
        Path = Join-Path $basePath "database-schema.sql"
        MinSize = 3000
        RequiredStrings = @("CREATE TABLE", "users", "projects", "slides", "render_jobs", "analytics_events", "nr_courses", "nr_modules")
    },
    @{
        Name = "database-rls-policies.sql"
        Path = Join-Path $basePath "database-rls-policies.sql"
        MinSize = 2000
        RequiredStrings = @("ALTER TABLE", "ENABLE ROW LEVEL SECURITY", "CREATE POLICY")
    },
    @{
        Name = "seed-nr-courses.sql"
        Path = Join-Path $basePath "seed-nr-courses.sql"
        MinSize = 1000
        RequiredStrings = @("INSERT INTO", "nr_courses", "nr_modules", "NR12", "NR33", "NR35")
    }
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file.Path) {
        $content = Get-Content $file.Path -Raw
        $size = (Get-Item $file.Path).Length
        
        if ($size -lt $file.MinSize) {
            $warnings += "⚠️  $($file.Name): Arquivo muito pequeno ($size bytes, esperado >$($file.MinSize))"
        }
        
        $allStringsFound = $true
        foreach ($str in $file.RequiredStrings) {
            if ($content -notmatch [regex]::Escape($str)) {
                $allStringsFound = $false
                $errors += "❌ $($file.Name): String obrigatória não encontrada: '$str'"
            }
        }
        
        if ($allStringsFound -and $size -ge $file.MinSize) {
            $success += "✅ $($file.Name): OK ($size bytes)"
        }
    } else {
        $errors += "❌ $($file.Name): Arquivo não encontrado em $($file.Path)"
    }
}

# ============================================
# 2. VERIFICAR VARIÁVEIS DE AMBIENTE
# ============================================

Write-Host "`n🔐 Verificando variáveis de ambiente..." -ForegroundColor Yellow

$envFiles = @(
    @{
        Name = ".env"
        Path = Join-Path $basePath ".env"
    },
    @{
        Name = "estudio_ia_videos/.env.local"
        Path = Join-Path $basePath "estudio_ia_videos\.env.local"
    }
)

$requiredEnvVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile.Path) {
        $envContent = Get-Content $envFile.Path -Raw
        
        $foundVars = 0
        foreach ($varName in $requiredEnvVars) {
            if ($envContent -match "$varName=") {
                $foundVars++
            }
        }
        
        if ($foundVars -eq $requiredEnvVars.Count) {
            $success += "✅ $($envFile.Name): Todas as variáveis presentes"
        } else {
            $warnings += "⚠️  $($envFile.Name): Faltam $($requiredEnvVars.Count - $foundVars) variáveis"
        }
    } else {
        $warnings += "⚠️  $($envFile.Name): Arquivo não encontrado"
    }
}

# ============================================
# 3. VERIFICAR ESTRUTURA DE PASTAS
# ============================================

Write-Host "`n📁 Verificando estrutura de pastas..." -ForegroundColor Yellow

$requiredDirs = @(
    "estudio_ia_videos",
    "estudio_ia_videos\app"
)

foreach ($dir in $requiredDirs) {
    $dirPath = Join-Path $basePath $dir
    if (Test-Path $dirPath) {
        $success += "✅ Pasta existe: $dir"
    } else {
        $errors += "❌ Pasta não encontrada: $dir"
    }
}

# ============================================
# 4. VERIFICAR CONEXÃO COM SUPABASE
# ============================================

Write-Host "`n🌐 Verificando conectividade com Supabase..." -ForegroundColor Yellow

# Carregar variáveis do .env
$envPath = Join-Path $basePath ".env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$supabaseUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", "Process")
$supabaseAnonKey = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Process")

if ($supabaseUrl -and $supabaseAnonKey) {
    try {
        # Testar conexão básica
        $headers = @{
            "apikey" = $supabaseAnonKey
            "Authorization" = "Bearer $supabaseAnonKey"
        }
        
        $testUrl = "$supabaseUrl/rest/v1/"
        $response = Invoke-WebRequest -Uri $testUrl -Headers $headers -Method Get -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            $success += "✅ Conexão com Supabase: OK"
        }
    } catch {
        $warnings += "⚠️  Conexão com Supabase: Não foi possível verificar ($($_.Exception.Message))"
    }
} else {
    $warnings += "⚠️  Variáveis de ambiente do Supabase não configuradas"
}

# ============================================
# 5. RELATÓRIO FINAL
# ============================================

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 RELATÓRIO DE VALIDAÇÃO" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if ($success.Count -gt 0) {
    Write-Host "`n✅ SUCESSOS ($($success.Count)):" -ForegroundColor Green
    foreach ($item in $success) {
        Write-Host "  $item" -ForegroundColor Green
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  AVISOS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "  $item" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ ERROS ($($errors.Count)):" -ForegroundColor Red
    foreach ($item in $errors) {
        Write-Host "  $item" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan

# ============================================
# 6. AVALIAÇÃO FINAL
# ============================================

$totalChecks = $success.Count + $warnings.Count + $errors.Count
$score = [math]::Round(($success.Count / $totalChecks) * 100, 1)

Write-Host "`n🎯 SCORE: $score% ($($success.Count)/$totalChecks)" -ForegroundColor $(
    if ($score -ge 90) { "Green" }
    elseif ($score -ge 70) { "Yellow" }
    else { "Red" }
)

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`n✅ SISTEMA PRONTO PARA SETUP!" -ForegroundColor Green
    Write-Host "Próximo passo: Abra o arquivo SUPABASE_SETUP_PASSO_A_PASSO.md" -ForegroundColor Cyan
} elseif ($errors.Count -eq 0) {
    Write-Host "`n⚠️  SISTEMA QUASE PRONTO" -ForegroundColor Yellow
    Write-Host "Corrija os avisos antes de prosseguir com o setup" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ SISTEMA NÃO ESTÁ PRONTO" -ForegroundColor Red
    Write-Host "Corrija os erros antes de prosseguir" -ForegroundColor Red
}

Write-Host "`n"

# Retornar código de saída
if ($errors.Count -gt 0) {
    exit 1
} else {
    exit 0
}
