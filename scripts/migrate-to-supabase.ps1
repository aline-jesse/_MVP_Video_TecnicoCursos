#!/usr/bin/env pwsh

# ============================================
# SCRIPT DE MIGRAÇÃO / AUDITORIA SUPABASE
# Data: 7 de outubro de 2025
# Versão: v8.0 - Estúdio IA Vídeos
# ============================================

[CmdletBinding()]
param(
    [switch]$UseServiceKey,
    [string]$ServiceKey,
    [string]$ReportPath,
    [string]$MarkdownPath
)

$SUPABASE_URL = "https://ofhzrdiadxigrvmrhaiz.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE3NjEsImV4cCI6MjA3NTI4Nzc2MX0.u-F5m9lvYc1lx9aA-MoTZqCAa83QHGVk8uTh-_KPfCQ"

if ($UseServiceKey -and -not $ServiceKey) {
    throw "Quando -UseServiceKey for informado é obrigatório preencher -ServiceKey."
}

$ACTIVE_KEY = if ($UseServiceKey) { $ServiceKey } else { $ANON_KEY }

Write-Host "🚀 INICIANDO AUDITORIA / MIGRAÇÃO SUPABASE" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "🔑 Modo autenticado: $(if ($UseServiceKey) { 'SERVICE ROLE' } else { 'ANON (leitura)' })" -ForegroundColor Yellow

$report = [ordered]@{
    timestamp = (Get-Date).ToString('o')
    supabase_url = $SUPABASE_URL
    mode = if ($UseServiceKey) { 'service_role' } else { 'anon' }
    connection_ok = $false
    tables = @()
    resources = @{
        avatars = @()
        voices = @()
    }
    operations = @{}
}
$script:report = $report

function New-RequestHeaders {
    param([string]$Key)
    return @{
        "apikey" = $Key
        "Authorization" = "Bearer $Key"
        "Content-Type" = "application/json"
    }
}

$headers = New-RequestHeaders -Key $ACTIVE_KEY

function Invoke-Supabase {
    param(
        [Parameter(Mandatory)] [string]$Endpoint,
        [ValidateSet('GET','POST','PATCH','DELETE')] [string]$Method = 'GET',
        $Body = $null,
        [hashtable]$ExtraHeaders
    )

    $allHeaders = $headers.Clone()
    if ($ExtraHeaders) {
        foreach ($key in $ExtraHeaders.Keys) { $allHeaders[$key] = $ExtraHeaders[$key] }
    }

    $params = @{ Uri = "$SUPABASE_URL$Endpoint"; Method = $Method; Headers = $allHeaders }
    if ($Body) { $params.Body = ($Body -is [string]) ? $Body : ($Body | ConvertTo-Json -Depth 10) }

    return Invoke-RestMethod @params
}

function Test-Endpoint {
    param([string]$Path)
    try {
        Invoke-Supabase -Endpoint $Path -Method 'GET' | Out-Null
        return $true
    } catch {
        Write-Host "   ⚠️  Falha em ${Path}: $($_.Exception.Message)" -ForegroundColor DarkYellow
        return $false
    }
}

# ============================================
# 1. VERIFICAR CONEXÃO
# ============================================
Write-Host "`n📡 1. Testando conectividade..." -ForegroundColor Yellow

try {
    Invoke-Supabase -Endpoint "/rest/v1/" -Method 'GET' | Out-Null
    Write-Host "   ✅ Conexão estabelecida com sucesso" -ForegroundColor Green
    $report.connection_ok = $true
} catch {
    Write-Host "   ❌ Erro na conexão: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. INVENTÁRIO DE TABELAS
# ============================================
Write-Host "`n📊 2. Inventário do schema público..." -ForegroundColor Yellow

$tables = @()
try {
    $swagger = Invoke-Supabase -Endpoint "/rest/v1/" -Method 'GET'
    $paths = $swagger.paths.Keys | Where-Object { $_ -notmatch '^/rpc' -and $_ -ne '/' }

    foreach ($path in $paths) {
        $tableName = $path.Trim('/')
        if ($tableName -eq '') { continue }
        $tables += $tableName
    }

    $tables = $tables | Sort-Object -Unique
    $report.tables = $tables
    foreach ($table in $tables) {
        Write-Host "   • $table" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Não foi possível listar tabelas: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ============================================
# 3. LEITURA DE DADOS-CHAVE
# ============================================
Write-Host "`n🎭 3. Avatares e vozes disponíveis" -ForegroundColor Yellow

try {
    $avatars = Invoke-Supabase -Endpoint "/rest/v1/avatar_models?select=id,display_name,gender,avatar_type,is_active&limit=10"
    Write-Host "   ✅ Avatares: $($avatars.Count)" -ForegroundColor Green
    $report.resources.avatars = $avatars | ForEach-Object {
        [ordered]@{
            id = $_.id
            display_name = $_.display_name
            gender = $_.gender
            avatar_type = $_.avatar_type
            is_active = $_.is_active
        }
    }
    foreach ($avatar in $avatars) {
        Write-Host "      - $($avatar.display_name) ($($avatar.gender), $($avatar.avatar_type))" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Erro ao ler avatar_models: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $voices = Invoke-Supabase -Endpoint "/rest/v1/voice_profiles?select=id,display_name,language,gender,is_active&limit=10"
    Write-Host "   ✅ Perfis de voz: $($voices.Count)" -ForegroundColor Green
    $report.resources.voices = $voices | ForEach-Object {
        [ordered]@{
            id = $_.id
            display_name = $_.display_name
            language = $_.language
            gender = $_.gender
            is_active = $_.is_active
        }
    }
    foreach ($voice in $voices) {
        Write-Host "      - $($voice.display_name) [$($voice.language)]" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Erro ao ler voice_profiles: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# 4. OPERAÇÕES DE ESCRITA (OPCIONAIS)
# ============================================
if (-not $UseServiceKey) {
    Write-Host "`n✋ 4. Operações de escrita serão ignoradas (necessária service role key)." -ForegroundColor DarkYellow
} else {
    Write-Host "`n🛠️ 4. Executando operações de escrita (modo service role)..." -ForegroundColor Yellow

    $orgPayload = @{
        id = "00000000-0000-0000-0000-000000000001"
        name = "Estúdio IA Vídeos"
        slug = "estudio-ia-videos"
        description = "Organização principal do sistema"
    }

    try {
        Invoke-Supabase -Endpoint "/rest/v1/organizations" -Method 'POST' -Body $orgPayload -ExtraHeaders @{ Prefer = "resolution=ignore-duplicates" } | Out-Null
        Write-Host "   ✅ Organização 'Estúdio IA Vídeos' garantida" -ForegroundColor Green
        $report.operations.organizations = @{ status = 'ensured'; id = $orgPayload.id }
    } catch {
        Write-Host "   ⚠️  Organização: $($_.Exception.Message)" -ForegroundColor Yellow
        $report.operations.organizations = @{ status = 'error'; message = $_.Exception.Message }
    }

    $projectPayload = @{
        title = "Projeto Demo - NR-35 Segurança"
        description = "Projeto de demonstração para treinamentos de trabalho em altura"
        organization_id = $orgPayload.id
        status = "active"
        settings = @{ theme = "corporate"; quality = "high" }
    }

    try {
        $project = Invoke-Supabase -Endpoint "/rest/v1/projects" -Method 'POST' -Body $projectPayload -ExtraHeaders @{ Prefer = "return=representation,resolution=ignore-duplicates" }
        Write-Host "   ✅ Projeto demo disponível (ID: $($project.id))" -ForegroundColor Green
        $report.operations.projects = @{ status = 'ensured'; id = $project.id }
    } catch {
        Write-Host "   ⚠️  Projeto demo: $($_.Exception.Message)" -ForegroundColor Yellow
        $report.operations.projects = @{ status = 'error'; message = $_.Exception.Message }
    }

    $statsPayload = @{
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
    }

    try {
        Invoke-Supabase -Endpoint "/rest/v1/system_stats" -Method 'POST' -Body $statsPayload -ExtraHeaders @{ Prefer = "return=minimal" } | Out-Null
        Write-Host "   ✅ Estatísticas do sistema registradas" -ForegroundColor Green
        $report.operations.system_stats = @{ status = 'inserted'; payload = $statsPayload }
    } catch {
        Write-Host "   ⚠️  system_stats: $($_.Exception.Message)" -ForegroundColor Yellow
        $report.operations.system_stats = @{ status = 'error'; message = $_.Exception.Message }
    }
}

# ============================================
# 5. RESUMO GERAL
# ============================================
Write-Host "`n📈 5. Resumo dos últimos registros" -ForegroundColor Yellow

function Show-Latest {
    param(
        [string]$Table,
        [string]$Select = "*",
        [int]$Limit = 3
    )

    try {
        $data = Invoke-Supabase -Endpoint "/rest/v1/$Table?select=$Select&order=created_at.desc&limit=$Limit"
        Write-Host "   ✅ $Table : $($data.Count) registros retornados" -ForegroundColor Green
        $script:report.operations[$Table] = @{ status = 'ok'; count = $data.Count }
    } catch {
        Write-Host "   ⚠️  $Table : acesso restrito ou inexistente ($($_.Exception.Message))" -ForegroundColor DarkYellow
        $script:report.operations[$Table] = @{ status = 'restricted'; message = $_.Exception.Message }
    }
}

Show-Latest -Table "render_jobs" -Select "id,status,quality,created_at"
Show-Latest -Table "avatar_analytics" -Select "id,event_type,created_at"
Show-Latest -Table "system_stats" -Select "id,total_renders,success_rate,recorded_at"

function Convert-ReportToMarkdown {
    param([hashtable]$Report)

    $lines = @()
    $lines += "# Relatório de Auditoria Supabase"
    $lines += ""
    $lines += "*Gerado em: $($Report.timestamp)*"
    $lines += "*Instância: $($Report.supabase_url)*"
    $lines += "*Modo: $($Report.mode)*"
    $lines += ""
    $lines += "## Conectividade"
    $lines += (if ($Report.connection_ok) { "- ✅ Conexão estabelecida" } else { "- ❌ Falha na conexão" })
    $lines += ""

    $tables = @()
    if ($Report.tables) { $tables = @($Report.tables) }
    $lines += "## Tabelas inventariadas ($($tables.Count))"
    if ($tables.Count -gt 0) {
        foreach ($table in $tables) {
            $lines += "- $table"
        }
    } else {
        $lines += "- Nenhuma tabela retornada com a credencial atual."
    }

    $lines += ""
    $lines += "## Recursos principais"

    $avatars = @()
    if ($Report.resources -and $Report.resources.avatars) { $avatars = @($Report.resources.avatars) }
    if ($avatars.Count -gt 0) {
        $lines += "### Avatares"
        $lines += "| ID | Nome | Gênero | Tipo | Ativo |"
        $lines += "| --- | --- | --- | --- | --- |"
        foreach ($avatar in $avatars) {
            $ativo = if ($avatar.is_active) { "Sim" } else { "Não" }
            $lines += "| $($avatar.id) | $($avatar.display_name) | $($avatar.gender) | $($avatar.avatar_type) | $ativo |"
        }
    } else {
        $lines += "- Nenhum avatar acessível com a credencial atual."
    }

    $lines += ""
    $voices = @()
    if ($Report.resources -and $Report.resources.voices) { $voices = @($Report.resources.voices) }
    if ($voices.Count -gt 0) {
        $lines += "### Perfis de voz"
        $lines += "| ID | Nome | Idioma | Gênero | Ativo |"
        $lines += "| --- | --- | --- | --- | --- |"
        foreach ($voice in $voices) {
            $ativo = if ($voice.is_active) { "Sim" } else { "Não" }
            $lines += "| $($voice.id) | $($voice.display_name) | $($voice.language) | $($voice.gender) | $ativo |"
        }
    } else {
        $lines += "- Nenhum perfil de voz acessível com a credencial atual."
    }

    $lines += ""
    $lines += "## Operações verificadas"
    $operationsKeys = @()
    if ($Report.operations) { $operationsKeys = @($Report.operations.Keys) }
    if ($operationsKeys.Count -gt 0) {
        foreach ($key in ($operationsKeys | Sort-Object)) {
            $entryRaw = $Report.operations[$key]
            $entry = @{}
            if ($entryRaw -is [System.Collections.IDictionary]) {
                foreach ($k in $entryRaw.Keys) { $entry[$k] = $entryRaw[$k] }
            } elseif ($entryRaw -is [psobject]) {
                foreach ($prop in $entryRaw.PSObject.Properties) { $entry[$prop.Name] = $prop.Value }
            } else {
                $entry['valor'] = $entryRaw
            }

            $status = if ($entry.ContainsKey('status')) { $entry['status'] } else { 'n/d' }
            $details = @()
            if ($entry.ContainsKey('count')) { $details += "registros: $($entry['count'])" }
            if ($entry.ContainsKey('id')) { $details += "id: $($entry['id'])" }
            if ($entry.ContainsKey('message')) { $details += "mensagem: $($entry['message'])" }
            if ($entry.ContainsKey('payload')) {
                $payloadPreview = ($entry['payload'] | ConvertTo-Json -Depth 4 -Compress)
                $details += "payload: $payloadPreview"
            }
            if ($entry.ContainsKey('valor')) { $details += "valor: $($entry['valor'])" }

            $detailText = if ($details.Count -gt 0) { " — " + ($details -join '; ') } else { "" }
            $lines += "- **$key**: $status$detailText"
        }
    } else {
        $lines += "- Nenhuma operação registrada no relatório."
    }

    $lines += ""
    $lines += "---"
    $lines += "Relatório gerado automaticamente pelo script `migrate-to-supabase.ps1`."

    return [string]::Join("`n", $lines)
}

# ============================================
# 6. RELATÓRIO FINAL
# ============================================
Write-Host "`n🎉 AUDITORIA/MIGRAÇÃO FINALIZADA" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "📍 URL do Supabase: $SUPABASE_URL" -ForegroundColor White
Write-Host "🔑 Modo atual: $(if ($UseServiceKey) { 'SERVICE ROLE (escrita liberada)' } else { 'ANON KEY (somente leitura)' })" -ForegroundColor Cyan
Write-Host "📊 Dashboard: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz" -ForegroundColor Cyan
Write-Host "📚 API: $SUPABASE_URL/rest/v1/" -ForegroundColor Cyan

if (-not $UseServiceKey) {
    Write-Host "`n💡 Dica: execute o script com -UseServiceKey -ServiceKey 'SUA_CHAVE' para habilitar as etapas de escrita." -ForegroundColor Yellow
}

if ($ReportPath) {
    try {
        $directory = Split-Path -Path $ReportPath -ErrorAction SilentlyContinue
        if ($directory -and -not (Test-Path -Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force | Out-Null
        }
        $script:report | ConvertTo-Json -Depth 8 | Set-Content -Path $ReportPath -Encoding UTF8
        Write-Host "`n📝 Relatório salvo em: $ReportPath" -ForegroundColor Green
    } catch {
        Write-Host "`n⚠️  Não foi possível salvar relatório em $ReportPath : $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}

if ($MarkdownPath) {
    try {
        $directory = Split-Path -Path $MarkdownPath -ErrorAction SilentlyContinue
        if ($directory -and -not (Test-Path -Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force | Out-Null
        }
        $markdown = Convert-ReportToMarkdown -Report $script:report
        Set-Content -Path $MarkdownPath -Encoding UTF8 -Value $markdown
        Write-Host "`n🗒️  Sumário Markdown salvo em: $MarkdownPath" -ForegroundColor Green
    } catch {
        Write-Host "`n⚠️  Não foi possível gerar Markdown em $MarkdownPath : $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
}

Write-Host "`n🚀 Pronto! Sistema verificado." -ForegroundColor Green