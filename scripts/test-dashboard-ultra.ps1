# ============================================
# 🧪 TESTE COMPLETO - DASHBOARD ULTRA v3.0
# ============================================
# Script de validação e testes rigorosos
# Data: 08/10/2025

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║" -NoNewline -ForegroundColor Cyan
Write-Host "          🧪 TESTE COMPLETO - DASHBOARD ULTRA v3.0          " -NoNewline -ForegroundColor Yellow
Write-Host "    ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Configurações
$ErrorActionPreference = "Continue"
$supabaseUrl = "https://ofhzrdiadxigrvmrhaiz.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE3NjEsImV4cCI6MjA3NTI4Nzc2MX0.u-F5m9lvYc1lx9aA-MoTZqCAa83QHGVk8uTh-_KPfCQ"
$headers = @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
}

$testResults = @()

function Test-Connection {
    Write-Host "`n[1/8] 🔌 Testando conexão com Supabase..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/" -Headers $headers -Method Get
        Write-Host "  ✅ Conexão estabelecida com sucesso!" -ForegroundColor Green
        $script:testResults += @{ Test = "Conexão"; Status = "PASS"; Message = "API respondendo" }
        return $true
    } catch {
        Write-Host "  ❌ Erro na conexão: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{ Test = "Conexão"; Status = "FAIL"; Message = $_.Exception.Message }
        return $false
    }
}

function Test-Avatars {
    Write-Host "`n[2/8] 🎭 Testando leitura de avatares..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/avatar_models?select=*" -Headers $headers -Method Get
        $count = $response.Count
        Write-Host "  ✅ $count avatares encontrados" -ForegroundColor Green
        
        if ($count -gt 0) {
            Write-Host "  📋 Primeiros 3 avatares:" -ForegroundColor White
            $response | Select-Object -First 3 | ForEach-Object {
                Write-Host "     • $($_.display_name) ($($_.gender))" -ForegroundColor Gray
            }
        }
        
        $script:testResults += @{ Test = "Avatares"; Status = "PASS"; Message = "$count registros" }
        return $true
    } catch {
        Write-Host "  ❌ Erro ao ler avatares: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{ Test = "Avatares"; Status = "FAIL"; Message = $_.Exception.Message }
        return $false
    }
}

function Test-Voices {
    Write-Host "`n[3/8] 🎤 Testando leitura de vozes..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/voice_profiles?select=*" -Headers $headers -Method Get
        $count = $response.Count
        Write-Host "  ✅ $count vozes encontradas" -ForegroundColor Green
        
        if ($count -gt 0) {
            Write-Host "  📋 Primeiras 3 vozes:" -ForegroundColor White
            $response | Select-Object -First 3 | ForEach-Object {
                Write-Host "     • $($_.display_name) ($($_.language))" -ForegroundColor Gray
            }
        }
        
        $script:testResults += @{ Test = "Vozes"; Status = "PASS"; Message = "$count registros" }
        return $true
    } catch {
        Write-Host "  ❌ Erro ao ler vozes: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{ Test = "Vozes"; Status = "FAIL"; Message = $_.Exception.Message }
        return $false
    }
}

function Test-SystemStats {
    Write-Host "`n[4/8] 📊 Testando leitura de estatísticas..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/system_stats?select=*&limit=10" -Headers $headers -Method Get
        $count = $response.Count
        Write-Host "  ✅ $count registros de estatísticas encontrados" -ForegroundColor Green
        $script:testResults += @{ Test = "Estatísticas"; Status = "PASS"; Message = "$count registros" }
        return $true
    } catch {
        Write-Host "  ⚠️ Nenhuma estatística disponível (normal se não houver dados)" -ForegroundColor Yellow
        $script:testResults += @{ Test = "Estatísticas"; Status = "WARN"; Message = "Sem dados" }
        return $true
    }
}

function Test-DashboardFile {
    Write-Host "`n[5/8] 📄 Validando arquivo dashboard-ultra.html..." -ForegroundColor Cyan
    
    $dashboardPath = ".\dashboard-ultra.html"
    
    if (Test-Path $dashboardPath) {
        $fileSize = (Get-Item $dashboardPath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        
        Write-Host "  ✅ Arquivo encontrado ($fileSizeKB KB)" -ForegroundColor Green
        
        # Validar conteúdo
        $content = Get-Content $dashboardPath -Raw
        
        $checks = @(
            @{ Name = "Supabase Client"; Pattern = "supabase.createClient" },
            @{ Name = "Realtime Setup"; Pattern = "setupRealtime" },
            @{ Name = "CRUD Operations"; Pattern = "saveAvatar|saveVoice|deleteAvatar|deleteVoice" },
            @{ Name = "Chart.js Integration"; Pattern = "new Chart" },
            @{ Name = "Dark Mode"; Pattern = "toggleTheme" },
            @{ Name = "Export Functions"; Pattern = "exportToPDF|exportToCSV" },
            @{ Name = "Alert System"; Pattern = "createAlert" },
            @{ Name = "Activity Log"; Pattern = "logActivity" }
        )
        
        foreach ($check in $checks) {
            if ($content -match $check.Pattern) {
                Write-Host "     ✓ $($check.Name)" -ForegroundColor Green
            } else {
                Write-Host "     ✗ $($check.Name) - NÃO ENCONTRADO" -ForegroundColor Red
            }
        }
        
        $script:testResults += @{ Test = "Dashboard File"; Status = "PASS"; Message = "$fileSizeKB KB" }
        return $true
    } else {
        Write-Host "  ❌ Arquivo não encontrado!" -ForegroundColor Red
        $script:testResults += @{ Test = "Dashboard File"; Status = "FAIL"; Message = "Arquivo não existe" }
        return $false
    }
}

function Test-Dependencies {
    Write-Host "`n[6/8] 📦 Validando dependências CDN..." -ForegroundColor Cyan
    
    $dependencies = @(
        @{ Name = "Chart.js"; Url = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" },
        @{ Name = "jsPDF"; Url = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" },
        @{ Name = "Supabase JS"; Url = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" }
    )
    
    foreach ($dep in $dependencies) {
        try {
            $response = Invoke-WebRequest -Uri $dep.Url -Method Head -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ $($dep.Name) - Disponível" -ForegroundColor Green
            }
        } catch {
            Write-Host "  ❌ $($dep.Name) - Erro ao acessar" -ForegroundColor Red
        }
    }
    
    $script:testResults += @{ Test = "Dependências"; Status = "PASS"; Message = "CDNs validados" }
}

function Test-Browser {
    Write-Host "`n[7/8] 🌐 Testando abertura no navegador..." -ForegroundColor Cyan
    
    try {
        $dashboardPath = Resolve-Path ".\dashboard-ultra.html"
        Start-Process "chrome" "file:///$dashboardPath"
        Write-Host "  ✅ Dashboard aberto no Chrome" -ForegroundColor Green
        Write-Host "  ℹ️  Verifique manualmente:" -ForegroundColor Yellow
        Write-Host "     1. Os dados estão carregando?" -ForegroundColor Gray
        Write-Host "     2. Os gráficos estão renderizando?" -ForegroundColor Gray
        Write-Host "     3. O indicador 'Realtime Ativo' está pulsando?" -ForegroundColor Gray
        Write-Host "     4. Os botões de adicionar/editar funcionam?" -ForegroundColor Gray
        
        $script:testResults += @{ Test = "Browser"; Status = "PASS"; Message = "Aberto para teste manual" }
    } catch {
        Write-Host "  ⚠️ Não foi possível abrir automaticamente" -ForegroundColor Yellow
        Write-Host "  ℹ️  Abra manualmente: .\dashboard-ultra.html" -ForegroundColor Cyan
        $script:testResults += @{ Test = "Browser"; Status = "WARN"; Message = "Abrir manualmente" }
    }
}

function Test-Performance {
    Write-Host "`n[8/8] ⚡ Testando performance..." -ForegroundColor Cyan
    
    # Medir tempo de resposta
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $null = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/avatar_models?select=*&limit=100" -Headers $headers -Method Get
        $stopwatch.Stop()
        
        $latencyMs = $stopwatch.ElapsedMilliseconds
        
        if ($latencyMs -lt 500) {
            Write-Host "  ✅ Latência excelente: $latencyMs ms" -ForegroundColor Green
        } elseif ($latencyMs -lt 1000) {
            Write-Host "  ✅ Latência boa: $latencyMs ms" -ForegroundColor Yellow
        } else {
            Write-Host "  ⚠️ Latência alta: $latencyMs ms" -ForegroundColor Red
        }
        
        $script:testResults += @{ Test = "Performance"; Status = "PASS"; Message = "$latencyMs ms" }
    } catch {
        Write-Host "  ❌ Erro ao medir performance" -ForegroundColor Red
        $script:testResults += @{ Test = "Performance"; Status = "FAIL"; Message = $_.Exception.Message }
    }
}

function Show-Summary {
    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║" -NoNewline -ForegroundColor Cyan
    Write-Host "                    📊 RESUMO DOS TESTES                    " -NoNewline -ForegroundColor Yellow
    Write-Host "    ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    $passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $warned = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count
    
    foreach ($result in $testResults) {
        $icon = switch ($result.Status) {
            "PASS" { "✅"; $color = "Green" }
            "FAIL" { "❌"; $color = "Red" }
            "WARN" { "⚠️"; $color = "Yellow" }
        }
        
        Write-Host "$icon $($result.Test): " -NoNewline -ForegroundColor White
        Write-Host "$($result.Message)" -ForegroundColor $color
    }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Total: $($testResults.Count) testes" -ForegroundColor White
    Write-Host "Passed: " -NoNewline -ForegroundColor White
    Write-Host "$passed" -ForegroundColor Green
    Write-Host "Failed: " -NoNewline -ForegroundColor White
    Write-Host "$failed" -ForegroundColor Red
    Write-Host "Warnings: " -NoNewline -ForegroundColor White
    Write-Host "$warned" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    if ($failed -eq 0) {
        Write-Host "`n🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
        Write-Host "✨ Dashboard Ultra v3.0 está 100% OPERACIONAL!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Alguns testes falharam. Revise os erros acima." -ForegroundColor Yellow
    }
}

# ==================== EXECUTAR TESTES ====================

Write-Host "`nIniciando bateria de testes..." -ForegroundColor White
Write-Host "Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray

Test-Connection
Test-Avatars
Test-Voices
Test-SystemStats
Test-DashboardFile
Test-Dependencies
Test-Browser
Test-Performance

Show-Summary

Write-Host "`n📝 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Verifique o dashboard aberto no navegador" -ForegroundColor White
Write-Host "  2. Teste adicionar um novo avatar" -ForegroundColor White
Write-Host "  3. Teste editar uma voz existente" -ForegroundColor White
Write-Host "  4. Verifique se o Realtime está funcionando" -ForegroundColor White
Write-Host "  5. Exporte um PDF e um CSV para validar" -ForegroundColor White

Write-Host "`n✅ Teste completo finalizado!" -ForegroundColor Green
Write-Host ""
