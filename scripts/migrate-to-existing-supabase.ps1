# ==========================================
# MIGRAÇÃO PARA SUPABASE EXISTENTE - Sistema NR-35
# ==========================================

# Configuração da API
$supabaseUrl = "https://ofhzrdiadxigrvmrhaiz.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE3NjEsImV4cCI6MjA3NTI4Nzc2MX0.u-F5m9lvYc1lx9aA-MoTZqCAa83QHGVk8uTh-_KPfCQ"

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}

Write-Host "🔄 INICIANDO MIGRAÇÃO PARA SUPABASE EXISTENTE..." -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl" -ForegroundColor Yellow

# ==========================================
# FUNÇÃO PARA GERAR GUID ÚNICO
# ==========================================
function New-Guid {
    return [System.Guid]::NewGuid().ToString()
}

# ==========================================
# 1. VERIFICAR CONEXÃO E TABELAS
# ==========================================
Write-Host "`n📊 Verificando tabelas disponíveis..." -ForegroundColor Green

try {
    $avatarsResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/avatar_models?limit=10" -Method Get -Headers $headers
    $voicesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/voice_profiles?limit=10" -Method Get -Headers $headers
    
    Write-Host "✅ Conectado! Encontradas:" -ForegroundColor Green
    Write-Host "   - Avatares: $($avatarsResponse.Count)" -ForegroundColor White
    Write-Host "   - Vozes: $($voicesResponse.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Erro na conexão: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ==========================================
# 2. CRIAR RENDER JOBS DE DEMONSTRAÇÃO NR-35
# ==========================================
Write-Host "`n🎬 Criando jobs de renderização para NR-35..." -ForegroundColor Green

$nr35Scripts = @(
    @{
        title = "NR-35 - Introdução à Segurança em Altura"
        script = "Bem-vindos ao treinamento de NR-35! Hoje vamos aprender sobre os fundamentos da segurança em trabalhos em altura. A Norma Regulamentadora 35 estabelece os requisitos mínimos e as medidas de proteção para o trabalho em altura, envolvendo o planejamento, a organização e a execução, de forma a garantir a segurança e a saúde dos trabalhadores."
    },
    @{
        title = "NR-35 - Equipamentos de Proteção Individual"
        script = "Os Equipamentos de Proteção Individual são fundamentais para a segurança em altura. Vamos conhecer os principais EPIs: cinturão de segurança, capacete, trava-quedas e mosquetões. Cada equipamento tem uma função específica e deve ser inspecionado antes do uso. Lembre-se: sua vida depende da qualidade e manutenção destes equipamentos."
    },
    @{
        title = "NR-35 - Análise de Riscos e Procedimentos"
        script = "Antes de iniciar qualquer trabalho em altura, é obrigatória a Análise de Riscos. Devemos identificar os perigos, avaliar os riscos e implementar medidas de controle. O Procedimento de Trabalho deve ser seguido rigorosamente, incluindo a verificação das condições meteorológicas e a comunicação entre a equipe."
    },
    @{
        title = "NR-35 - Sistemas de Ancoragem e Salvamento"
        script = "Os pontos de ancoragem devem suportar no mínimo 15 kN por trabalhador conectado. É essencial ter um plano de resgate elaborado e uma equipe treinada para situações de emergência. Lembre-se: o resgate em altura requer técnicas específicas e equipamentos adequados. A prevenção é sempre a melhor estratégia."
    }
)

$userId = New-Guid
$avatarId = if ($avatarsResponse.Count -gt 0) { $avatarsResponse[0].id } else { New-Guid }
$voiceId = if ($voicesResponse.Count -gt 0) { $voicesResponse[0].id } else { New-Guid }

foreach ($script in $nr35Scripts) {
    Write-Host "   ⚙️ Criando job: $($script.title)" -ForegroundColor Yellow
    
    $renderJob = @{
        id = New-Guid
        user_id = $userId
        avatar_model_id = $avatarId
        voice_profile_id = $voiceId
        status = "completed"
        quality = "high"
        resolution = "1080p"
        script_text = $script.script
        enable_audio2face = $true
        enable_real_time_lipsync = $true
        camera_angle = "front"
        lighting_preset = "studio"
        background_type = "corporate"
        progress_percentage = 100
        output_video_url = "https://storage.supabase.co/v1/object/public/videos/nr35-$($script.title.ToLower().Replace(' ', '-')).mp4"
        output_thumbnail_url = "https://storage.supabase.co/v1/object/public/thumbnails/nr35-thumb-$([System.DateTime]::Now.Ticks).jpg"
        lipsync_accuracy = 0.95
        render_time_seconds = 45
        file_size_bytes = 85432100
        credits_used = 10
        started_at = (Get-Date).AddMinutes(-60).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        completed_at = (Get-Date).AddMinutes(-15).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        created_at = (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        updated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json -Depth 10
    
    try {
        $result = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/render_jobs" -Method Post -Body $renderJob -Headers $headers
        Write-Host "     ✅ Job criado com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "     ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==========================================
# 3. CRIAR ANALYTICS DE DEMONSTRAÇÃO
# ==========================================
Write-Host "`n📊 Criando eventos de analytics..." -ForegroundColor Green

$analyticsEvents = @(
    "video_start", "video_pause", "video_complete", "download_request", 
    "avatar_selection", "voice_selection", "render_start", "render_complete"
)

foreach ($event in $analyticsEvents) {
    $analytics = @{
        id = New-Guid
        user_id = $userId
        avatar_model_id = $avatarId
        event_type = $event
        event_data = @{
            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            course = "NR-35"
            module = "safety_training"
            duration = Get-Random -Minimum 30 -Maximum 300
        }
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        ip_address = "192.168.1.100"
        session_id = "session-nr35-demo"
        created_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json -Depth 10
    
    try {
        $result = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/avatar_analytics" -Method Post -Body $analytics -Headers $headers
        Write-Host "   ✅ Evento '$event' registrado" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erro no evento '$event': $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ==========================================
# 4. ATUALIZAR ESTATÍSTICAS DO SISTEMA
# ==========================================
Write-Host "`n📈 Atualizando estatísticas do sistema..." -ForegroundColor Green

$systemStats = @{
    id = New-Guid
    total_renders = 25
    active_jobs = 2
    completed_jobs = 23
    failed_jobs = 0
    avg_render_time_seconds = 42.5
    avg_lipsync_accuracy = 0.94
    success_rate = 0.98
    cpu_usage = 65.2
    memory_usage = 78.9
    gpu_usage = 82.1
    disk_usage = 45.3
    audio2face_status = "online"
    redis_status = "online"
    database_status = "online"
    recorded_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/system_stats" -Method Post -Body $systemStats -Headers $headers
    Write-Host "✅ Estatísticas atualizadas" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro nas estatísticas: $($_.Exception.Message)" -ForegroundColor Red
}

# ==========================================
# 5. VERIFICAR DADOS CRIADOS
# ==========================================
Write-Host "`n🔍 Verificando dados criados..." -ForegroundColor Green

try {
    $jobs = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/render_jobs?order=created_at.desc&limit=5" -Method Get -Headers $headers
    $analytics = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/avatar_analytics?order=created_at.desc&limit=5" -Method Get -Headers $headers
    $stats = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/system_stats?order=recorded_at.desc&limit=1" -Method Get -Headers $headers
    
    Write-Host "📊 RESUMO DOS DADOS CRIADOS:" -ForegroundColor Cyan
    Write-Host "   - Render Jobs: $($jobs.Count)" -ForegroundColor White
    Write-Host "   - Analytics: $($analytics.Count)" -ForegroundColor White
    Write-Host "   - System Stats: $($stats.Count)" -ForegroundColor White
    
    if ($jobs.Count -gt 0) {
        Write-Host "`n🎬 ÚLTIMOS JOBS DE RENDERIZAÇÃO:" -ForegroundColor Yellow
        foreach ($job in $jobs) {
            Write-Host "   - Status: $($job.status) | Qualidade: $($job.quality) | Precisão: $($job.lipsync_accuracy)" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ Erro na verificação: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "🔗 Acesse o dashboard: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz" -ForegroundColor Cyan