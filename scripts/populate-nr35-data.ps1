# ==========================================
# POPULAÇÃO AVANÇADA DE DADOS NR-35 - SUPABASE
# Sistema Completo de Treinamento de Segurança
# ==========================================

param(
    [string]$ServiceKey = "",
    [switch]$UseServiceKey = $false
)

# Configuração da API
$supabaseUrl = "https://ofhzrdiadxigrvmrhaiz.supabase.co"
$supabaseKey = if ($UseServiceKey -and $ServiceKey) { 
    $ServiceKey 
} else { 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE3NjEsImV4cCI6MjA3NTI4Nzc2MX0.u-F5m9lvYc1lx9aA-MoTZqCAa83QHGVk8uTh-_KPfCQ"
}

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Prefer" = "return=minimal"
}

Write-Host "🎓 SISTEMA AVANÇADO NR-35 - POPULAÇÃO DE DADOS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Chave utilizada: $(if ($UseServiceKey) { 'SERVICE ROLE' } else { 'ANON KEY' })" -ForegroundColor Yellow
Write-Host ""

# ==========================================
# FUNÇÃO PARA GERAR DADOS REALISTAS
# ==========================================
function New-Guid { return [System.Guid]::NewGuid().ToString() }
function Get-RandomDate { 
    $start = (Get-Date).AddDays(-30)
    $end = Get-Date
    $randomTicks = Get-Random -Minimum $start.Ticks -Maximum $end.Ticks
    return [DateTime]::new($randomTicks)
}

# ==========================================
# DADOS ESTRUTURADOS DO CURSO NR-35
# ==========================================

$nr35Course = @{
    modules = @(
        @{
            id = 1
            name = "Fundamentos da NR-35"
            description = "Conceitos básicos e legislação sobre trabalho em altura"
            slides = @(
                @{ title = "Introdução à NR-35"; content = "A Norma Regulamentadora 35 estabelece os requisitos mínimos e as medidas de proteção para o trabalho em altura, envolvendo o planejamento, a organização e a execução." },
                @{ title = "Definições Importantes"; content = "Trabalho em altura: toda atividade executada acima de 2,00 m (dois metros) do nível inferior, onde há risco de queda." },
                @{ title = "Responsabilidades"; content = "O empregador deve implementar medidas de proteção coletiva e individual, garantir treinamento adequado e manter os EPIs em perfeitas condições." }
            )
        },
        @{
            id = 2
            name = "Equipamentos de Proteção"
            description = "EPIs e EPCs para trabalho em altura"
            slides = @(
                @{ title = "Cinturão de Segurança"; content = "O cinturão de segurança tipo paraquedista é o EPI fundamental para trabalho em altura, distribuindo as forças de impacto por todo o corpo." },
                @{ title = "Capacete de Segurança"; content = "Proteção obrigatória contra impactos e quedas de objetos. Deve possuir jugular para evitar que se desloque durante quedas." },
                @{ title = "Trava-quedas"; content = "Dispositivo que trava automaticamente em caso de queda, limitando a distância de queda e reduzindo as forças de impacto." }
            )
        },
        @{
            id = 3
            name = "Análise de Riscos"
            description = "Identificação e avaliação de perigos"
            slides = @(
                @{ title = "Metodologia de Análise"; content = "Toda atividade em altura deve ser precedida de Análise de Risco, identificando perigos e implementando medidas de controle." },
                @{ title = "Fatores de Risco"; content = "Condições meteorológicas adversas, superfícies instáveis, equipamentos inadequados e falta de treinamento são principais fatores de risco." },
                @{ title = "Medidas de Controle"; content = "Hierarquia: eliminação do risco, proteção coletiva, medidas administrativas e, por último, equipamentos de proteção individual." }
            )
        },
        @{
            id = 4
            name = "Procedimentos de Emergência"
            description = "Resgate e primeiros socorros em altura"
            slides = @(
                @{ title = "Plano de Emergência"; content = "Toda empresa deve ter um plano de emergência específico para trabalhos em altura, incluindo procedimentos de resgate." },
                @{ title = "Síndrome do Suspensor"; content = "Trabalhador suspenso por mais de 5 minutos pode desenvolver síndrome do suspensor. Resgate imediato é fundamental." },
                @{ title = "Equipe de Resgate"; content = "Deve haver sempre uma equipe treinada em resgate disponível durante trabalhos em altura complexos." }
            )
        }
    )
}

# ==========================================
# CRIAR ESTATÍSTICAS DETALHADAS DO SISTEMA
# ==========================================
Write-Host "📊 Criando estatísticas detalhadas do sistema..." -ForegroundColor Green

for ($i = 0; $i -lt 7; $i++) {
    $date = (Get-Date).AddDays(-$i)
    $baseRenders = 15 + (Get-Random -Minimum -5 -Maximum 10)
    
    $systemStats = @{
        id = New-Guid
        total_renders = $baseRenders + ($i * 3)
        active_jobs = Get-Random -Minimum 0 -Maximum 5
        completed_jobs = $baseRenders + (Get-Random -Minimum -2 -Maximum 3)
        failed_jobs = Get-Random -Minimum 0 -Maximum 2
        avg_render_time_seconds = 35 + (Get-Random -Minimum -10 -Maximum 20)
        avg_lipsync_accuracy = [Math]::Round((0.85 + (Get-Random -Minimum 0 -Maximum 15) / 100), 2)
        success_rate = [Math]::Round((0.92 + (Get-Random -Minimum 0 -Maximum 8) / 100), 2)
        cpu_usage = [Math]::Round((45 + (Get-Random -Minimum 0 -Maximum 40)), 1)
        memory_usage = [Math]::Round((60 + (Get-Random -Minimum 0 -Maximum 30)), 1)
        gpu_usage = [Math]::Round((70 + (Get-Random -Minimum 0 -Maximum 25)), 1)
        disk_usage = [Math]::Round((35 + (Get-Random -Minimum 0 -Maximum 20)), 1)
        audio2face_status = if (Get-Random -Minimum 0 -Maximum 10 -gt 8) { "maintenance" } else { "online" }
        redis_status = "online"
        database_status = "online"
        recorded_at = $date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json -Depth 10
    
    try {
        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/system_stats" -Method Post -Body $systemStats -Headers $headers | Out-Null
        Write-Host "   ✅ Stats do dia $(${date}.ToString('dd/MM')) criadas" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Stats $(${date}.ToString('dd/MM')): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# ==========================================
# POPULAR JOBS DE RENDERIZAÇÃO (se possível)
# ==========================================
Write-Host "`n🎬 Tentando criar jobs de renderização NR-35..." -ForegroundColor Green

$userId = New-Guid
$demoUser = @{
    id = $userId
    name = "Sistema Demo NR-35"
    email = "demo@nr35.com.br"
    role = "instructor"
}

# Obter avatares e vozes existentes
try {
    $avatars = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/avatar_models?limit=5" -Method Get -Headers $headers
    $voices = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/voice_profiles?limit=5" -Method Get -Headers $headers
    
    Write-Host "   📋 Encontrados: $($avatars.Count) avatares, $($voices.Count) vozes" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erro ao obter recursos: $($_.Exception.Message)" -ForegroundColor Red
    $avatars = @(@{ id = New-Guid })
    $voices = @(@{ id = New-Guid })
}

# Criar jobs para cada módulo
$jobCount = 0
foreach ($module in $nr35Course.modules) {
    foreach ($slide in $module.slides) {
        $avatarId = ($avatars | Get-Random).id
        $voiceId = ($voices | Get-Random).id
        $createdAt = Get-RandomDate
        
        $renderJob = @{
            id = New-Guid
            user_id = $userId
            avatar_model_id = $avatarId
            voice_profile_id = $voiceId
            status = @("completed", "completed", "completed", "processing", "failed") | Get-Random
            quality = @("standard", "high", "high", "ultra") | Get-Random
            resolution = @("720p", "1080p", "1080p", "1440p") | Get-Random
            script_text = "$($slide.title): $($slide.content)"
            enable_audio2face = $true
            enable_real_time_lipsync = $true
            enable_ray_tracing = (Get-Random -Minimum 0 -Maximum 2) -eq 1
            camera_angle = @("front", "front_left", "front_right") | Get-Random
            lighting_preset = @("studio", "natural", "dramatic") | Get-Random
            background_type = @("corporate", "green_screen", "classroom") | Get-Random
            progress_percentage = if ($renderJob.status -eq "completed") { 100 } elseif ($renderJob.status -eq "processing") { Get-Random -Minimum 10 -Maximum 90 } else { Get-Random -Minimum 0 -Maximum 100 }
            output_video_url = if ($renderJob.status -eq "completed") { "https://storage.supabase.co/v1/object/public/videos/nr35-module-$($module.id)-$(Get-Random).mp4" } else { $null }
            output_thumbnail_url = "https://storage.supabase.co/v1/object/public/thumbnails/nr35-thumb-$($module.id)-$(Get-Random).jpg"
            lipsync_accuracy = if ($renderJob.status -eq "completed") { [Math]::Round((0.88 + (Get-Random -Minimum 0 -Maximum 10) / 100), 2) } else { $null }
            render_time_seconds = if ($renderJob.status -eq "completed") { 30 + (Get-Random -Minimum 0 -Maximum 40) } else { $null }
            file_size_bytes = if ($renderJob.status -eq "completed") { 45000000 + (Get-Random -Minimum 0 -Maximum 50000000) } else { $null }
            credits_used = @(5, 8, 10, 12, 15) | Get-Random
            started_at = $createdAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            completed_at = if ($renderJob.status -eq "completed") { $createdAt.AddMinutes((Get-Random -Minimum 2 -Maximum 8)).ToString("yyyy-MM-ddTHH:mm:ss.fffZ") } else { $null }
            created_at = $createdAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            updated_at = $createdAt.AddMinutes(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        } | ConvertTo-Json -Depth 10
        
        try {
            Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/render_jobs" -Method Post -Body $renderJob -Headers $headers | Out-Null
            $jobCount++
            Write-Host "   ✅ Job criado: $($slide.title)" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️ Job $($slide.title): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n📊 Resumo dos Jobs: $jobCount criados com sucesso" -ForegroundColor Cyan

# ==========================================
# CRIAR EVENTOS DE ANALYTICS REALISTAS
# ==========================================
Write-Host "`n📈 Criando eventos de analytics..." -ForegroundColor Green

$eventTypes = @(
    @{ name = "course_start"; weight = 10 },
    @{ name = "module_start"; weight = 15 },
    @{ name = "video_play"; weight = 20 },
    @{ name = "video_pause"; weight = 8 },
    @{ name = "video_complete"; weight = 12 },
    @{ name = "quiz_start"; weight = 5 },
    @{ name = "quiz_complete"; weight = 4 },
    @{ name = "certificate_download"; weight = 3 },
    @{ name = "avatar_selection"; weight = 6 },
    @{ name = "voice_selection"; weight = 6 }
)

$analyticsCount = 0
for ($day = 0; $day -lt 14; $day++) {
    $eventsPerDay = Get-Random -Minimum 15 -Maximum 45
    
    for ($event = 0; $event -lt $eventsPerDay; $event++) {
        $selectedEvent = $eventTypes | Get-Random
        $eventTime = (Get-Date).AddDays(-$day).AddHours(-(Get-Random -Minimum 0 -Maximum 24)).AddMinutes(-(Get-Random -Minimum 0 -Maximum 60))
        
        $analyticsEvent = @{
            id = New-Guid
            user_id = $userId
            avatar_model_id = if ($avatars.Count -gt 0) { ($avatars | Get-Random).id } else { New-Guid }
            event_type = $selectedEvent.name
            event_data = @{
                timestamp = $eventTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                course = "NR-35"
                module_id = Get-Random -Minimum 1 -Maximum 5
                duration_seconds = Get-Random -Minimum 30 -Maximum 1200
                completion_rate = [Math]::Round((Get-Random -Minimum 65 -Maximum 100) / 100.0, 2)
                device_type = @("desktop", "mobile", "tablet") | Get-Random
                browser = @("chrome", "firefox", "safari", "edge") | Get-Random
                ip_country = "BR"
                session_duration = Get-Random -Minimum 300 -Maximum 7200
            }
            user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ip_address = "192.168.1.$( Get-Random -Minimum 100 -Maximum 200 )"
            session_id = "nr35-session-$( Get-Random -Minimum 1000 -Maximum 9999 )"
            created_at = $eventTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        } | ConvertTo-Json -Depth 10
        
        try {
            Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/avatar_analytics" -Method Post -Body $analyticsEvent -Headers $headers | Out-Null
            $analyticsCount++
            
            if ($analyticsCount % 10 -eq 0) {
                Write-Host "   📊 $analyticsCount eventos criados..." -ForegroundColor White
            }
        } catch {
            Write-Host "   ⚠️ Evento analytics: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n📊 Total de eventos analytics: $analyticsCount" -ForegroundColor Cyan

# ==========================================
# CRIAR SESSÕES AUDIO2FACE (se possível)
# ==========================================
Write-Host "`n🎙️ Criando sessões Audio2Face..." -ForegroundColor Green

$sessionCount = 0
for ($i = 0; $i -lt 20; $i++) {
    $sessionData = @{
        id = New-Guid
        render_job_id = New-Guid # Referência a job existente
        session_id = "a2f-session-$( Get-Random -Minimum 10000 -Maximum 99999 )"
        model_name = @("claire", "mark", "sophia", "james") | Get-Random
        sample_rate = @(22050, 44100, 48000) | Get-Random
        audio_file_path = "/tmp/audio/nr35-audio-$i.wav"
        blend_shapes_file_path = "/tmp/blendshapes/nr35-bs-$i.json"
        arkit_curves_url = "https://storage.supabase.co/v1/object/public/arkit/curves-$i.json"
        processing_time_seconds = Get-Random -Minimum 15 -Maximum 120
        accuracy_score = [Math]::Round((0.85 + (Get-Random -Minimum 0 -Maximum 15) / 100), 2)
        status = @("completed", "completed", "completed", "failed") | Get-Random
        started_at = (Get-RandomDate).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        completed_at = (Get-RandomDate).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        created_at = (Get-RandomDate).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        updated_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json -Depth 10
    
    try {
        Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/audio2face_sessions" -Method Post -Body $sessionData -Headers $headers | Out-Null
        $sessionCount++
        Write-Host "   ✅ Sessão A2F criada: $($sessionData.model_name)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Sessão A2F: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# ==========================================
# RELATÓRIO FINAL
# ==========================================
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 POPULAÇÃO DE DADOS CONCLUÍDA!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n📊 RESUMO DOS DADOS CRIADOS:" -ForegroundColor Yellow
Write-Host "   📈 Estatísticas do Sistema: 7 registros diários" -ForegroundColor White
Write-Host "   🎬 Jobs de Renderização: $jobCount jobs NR-35" -ForegroundColor White
Write-Host "   📊 Eventos Analytics: $analyticsCount eventos" -ForegroundColor White
Write-Host "   🎙️ Sessões Audio2Face: $sessionCount sessões" -ForegroundColor White

Write-Host "`n🔗 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. Abrir dashboard-supabase.html no navegador" -ForegroundColor White
Write-Host "   2. Verificar dados no painel Supabase" -ForegroundColor White
Write-Host "   3. Configurar permissões adicionais se necessário" -ForegroundColor White

Write-Host "`n🌐 ACESSO AO DASHBOARD:" -ForegroundColor Cyan
Write-Host "   Local: file:///C:/xampp/htdocs/_MVP_Video_TecnicoCursos_v7/dashboard-supabase.html" -ForegroundColor Green
Write-Host "   Supabase: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz" -ForegroundColor Green

Write-Host "`n✨ SISTEMA PRONTO PARA USO!" -ForegroundColor Green