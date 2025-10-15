# Script de Inicializacao do Estudio IA Videos
# Versao: 2.0

$PROJECT_ROOT = "c:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7"
$APP_DIR = "$PROJECT_ROOT\estudio_ia_videos"
$ENV_FILE = "$APP_DIR\.env"
$NEXT_PORT = 3000

function Write-Header {
    param([string]$Title, [string]$Color = "Cyan")
    
    $border = "=" * 80
    Write-Host "`n$border" -ForegroundColor $Color
    Write-Host "  $Title" -ForegroundColor $Color
    Write-Host "$border`n" -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Status) {
        "SUCCESS" { Write-Host "[$timestamp] OK $Message" -ForegroundColor Green }
        "ERROR"   { Write-Host "[$timestamp] ERRO $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "[$timestamp] AVISO $Message" -ForegroundColor Yellow }
        "INFO"    { Write-Host "[$timestamp] INFO $Message" -ForegroundColor Cyan }
        "PROGRESS" { Write-Host "[$timestamp] PROCESSANDO $Message" -ForegroundColor Blue }
    }
}

function Write-ServiceStatus {
    param([string]$Service, [bool]$IsRunning, [string]$Details = "")
    
    if ($IsRunning) {
        Write-Host "  [OK] $Service" -ForegroundColor Green -NoNewline
        if ($Details) { Write-Host " - $Details" -ForegroundColor Gray }
        else { Write-Host "" }
    } else {
        Write-Host "  [ERRO] $Service" -ForegroundColor Red -NoNewline
        if ($Details) { Write-Host " - $Details" -ForegroundColor Gray }
        else { Write-Host "" }
    }
}

function Test-Prerequisites {
    Write-Header "VERIFICACAO DE PRE-REQUISITOS"
    
    $allGood = $true
    
    # Verificar Node.js
    Write-Step "Verificando Node.js..." "PROGRESS"
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Step "Node.js encontrado: $nodeVersion" "SUCCESS"
        } else {
            Write-Step "Node.js nao encontrado! Instale Node.js 18+ antes de continuar." "ERROR"
            $allGood = $false
        }
    } catch {
        Write-Step "Erro ao verificar Node.js: $($_.Exception.Message)" "ERROR"
        $allGood = $false
    }
    
    # Verificar npm
    Write-Step "Verificando npm..." "PROGRESS"
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Step "npm encontrado: $npmVersion" "SUCCESS"
        } else {
            Write-Step "npm nao encontrado!" "ERROR"
            $allGood = $false
        }
    } catch {
        Write-Step "Erro ao verificar npm: $($_.Exception.Message)" "ERROR"
        $allGood = $false
    }
    
    # Verificar diretorios do projeto
    Write-Step "Verificando estrutura do projeto..." "PROGRESS"
    if (Test-Path $PROJECT_ROOT) {
        Write-Step "Diretorio raiz encontrado: $PROJECT_ROOT" "SUCCESS"
    } else {
        Write-Step "Diretorio raiz nao encontrado: $PROJECT_ROOT" "ERROR"
        $allGood = $false
    }
    
    if (Test-Path $APP_DIR) {
        Write-Step "Diretorio da aplicacao encontrado: $APP_DIR" "SUCCESS"
    } else {
        Write-Step "Diretorio da aplicacao nao encontrado: $APP_DIR" "ERROR"
        $allGood = $false
    }
    
    # Verificar arquivo .env
    if (Test-Path $ENV_FILE) {
        Write-Step "Arquivo .env encontrado" "SUCCESS"
    } else {
        Write-Step "Arquivo .env nao encontrado - algumas funcionalidades podem nao funcionar" "WARNING"
    }
    
    return $allGood
}

function Test-SupabaseConnection {
    Write-Header "VERIFICACAO DE CONEXAO COM SUPABASE"
    
    if (-not (Test-Path $ENV_FILE)) {
        Write-Step "Arquivo .env nao encontrado - pulando teste Supabase" "WARNING"
        return $false
    }
    
    try {
        $envContent = Get-Content $ENV_FILE -Raw
        
        if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=(.+)") {
            $supabaseUrl = $matches[1].Trim()
            Write-Step "URL do Supabase encontrada: $supabaseUrl" "INFO"
        } else {
            Write-Step "URL do Supabase nao encontrada no .env" "WARNING"
            return $false
        }
        
        if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)") {
            $supabaseKey = $matches[1].Trim()
            Write-Step "Chave do Supabase encontrada" "INFO"
        } else {
            Write-Step "Chave do Supabase nao encontrada no .env" "WARNING"
            return $false
        }
        
        Write-Step "Testando conexao com Supabase..." "PROGRESS"
        $headers = @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
        }
        
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/" -Method GET -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Step "Conexao com Supabase estabelecida com sucesso!" "SUCCESS"
        return $true
    } catch {
        Write-Step "Erro ao conectar com Supabase: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Test-PortAvailability {
    param([int]$Port)
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return -not $connection
    } catch {
        return $true
    }
}

function Install-Dependencies {
    Write-Header "INSTALACAO DE DEPENDENCIAS"
    
    if (-not (Test-Path $APP_DIR)) {
        Write-Step "Diretorio da aplicacao nao encontrado!" "ERROR"
        return $false
    }
    
    Set-Location $APP_DIR
    
    # Verificar se package.json existe
    if (-not (Test-Path "package.json")) {
        Write-Step "package.json nao encontrado!" "ERROR"
        return $false
    }
    
    # Verificar se node_modules existe e esta atualizado
    $needsInstall = $false
    if (-not (Test-Path "node_modules")) {
        Write-Step "node_modules nao encontrado - instalacao necessaria" "INFO"
        $needsInstall = $true
    } else {
        $packageTime = (Get-Item "package.json").LastWriteTime
        $nodeModulesTime = (Get-Item "node_modules").LastWriteTime
        if ($packageTime -gt $nodeModulesTime) {
            Write-Step "package.json foi modificado - reinstalacao necessaria" "INFO"
            $needsInstall = $true
        }
    }
    
    if ($needsInstall) {
        Write-Step "Executando npm install..." "PROGRESS"
        try {
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Step "Dependencias instaladas com sucesso!" "SUCCESS"
                return $true
            } else {
                Write-Step "Erro durante npm install (codigo: $LASTEXITCODE)" "ERROR"
                return $false
            }
        } catch {
            Write-Step "Erro ao executar npm install: $($_.Exception.Message)" "ERROR"
            return $false
        }
    } else {
        Write-Step "Dependencias ja estao atualizadas" "SUCCESS"
        return $true
    }
}

function Start-NextJSServer {
    Write-Header "INICIALIZACAO DO SERVIDOR NEXT.JS"
    
    # Verificar se a porta esta disponivel
    Write-Step "Verificando disponibilidade da porta $NEXT_PORT..." "PROGRESS"
    if (-not (Test-PortAvailability -Port $NEXT_PORT)) {
        Write-Step "Porta $NEXT_PORT ja esta em uso!" "ERROR"
        Write-Step "Tentando finalizar processo existente..." "WARNING"
        
        try {
            $processes = Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*next*" }
            foreach ($proc in $processes) {
                $connections = netstat -ano | Select-String ":$NEXT_PORT "
                if ($connections) {
                    Write-Step "Finalizando processo $($proc.ProcessName) (PID: $($proc.Id))" "INFO"
                    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                }
            }
            Start-Sleep -Seconds 2
        } catch {
            Write-Step "Erro ao finalizar processos: $($_.Exception.Message)" "WARNING"
        }
    }
    
    if (-not (Test-Path $APP_DIR)) {
        Write-Step "Diretorio da aplicacao nao encontrado!" "ERROR"
        return $false
    }
    
    Set-Location $APP_DIR
    
    # Iniciar servidor
    Write-Step "Iniciando servidor Next.js na porta $NEXT_PORT..." "PROGRESS"
    Write-Step "Acesse o aplicativo em: http://localhost:$NEXT_PORT" "INFO"
    Write-Step "Pressione Ctrl+C para parar o servidor" "INFO"
    
    try {
        # Iniciar em modo desenvolvimento
        npm run dev
    } catch {
        Write-Step "Erro ao iniciar servidor: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Show-SystemStatus {
    Write-Header "STATUS DOS SERVICOS"
    
    # Verificar Node.js
    $nodeRunning = $false
    try {
        $nodeVersion = node --version 2>$null
        $nodeRunning = $nodeVersion -ne $null
    } catch { }
    Write-ServiceStatus "Node.js" $nodeRunning $nodeVersion
    
    # Verificar npm
    $npmRunning = $false
    try {
        $npmVersion = npm --version 2>$null
        $npmRunning = $npmVersion -ne $null
    } catch { }
    Write-ServiceStatus "npm" $npmRunning $npmVersion
    
    # Verificar porta Next.js
    $nextRunning = -not (Test-PortAvailability -Port $NEXT_PORT)
    Write-ServiceStatus "Next.js Server" $nextRunning "Porta $NEXT_PORT"
    
    # Verificar Supabase
    $supabaseConnected = $false
    if (Test-Path $ENV_FILE) {
        $envContent = Get-Content $ENV_FILE -Raw
        if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=(.+)") {
            $supabaseUrl = $matches[1].Trim()
            if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)") {
                try {
                    $supabaseKey = $matches[1].Trim()
                    $headers = @{
                        "apikey" = $supabaseKey
                        "Authorization" = "Bearer $supabaseKey"
                    }
                    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/" -Method GET -Headers $headers -TimeoutSec 5 -ErrorAction Stop
                    $supabaseConnected = $true
                } catch { }
            }
        }
    }
    Write-ServiceStatus "Supabase Connection" $supabaseConnected
    
    # Verificar arquivos importantes
    $envExists = Test-Path $ENV_FILE
    Write-ServiceStatus "Arquivo .env" $envExists
    
    $packageExists = Test-Path "$APP_DIR\package.json"
    Write-ServiceStatus "package.json" $packageExists
    
    $nodeModulesExists = Test-Path "$APP_DIR\node_modules"
    Write-ServiceStatus "node_modules" $nodeModulesExists
    
    Write-Host ""
    if ($nextRunning) {
        Write-Host "Aplicativo disponivel em: " -NoNewline -ForegroundColor Green
        Write-Host "http://localhost:$NEXT_PORT" -ForegroundColor Cyan
    } else {
        Write-Host "Aplicativo nao esta rodando" -ForegroundColor Yellow
    }
}

function Start-AllServices {
    Write-Header "ESTUDIO IA VIDEOS - INICIALIZACAO COMPLETA" "Magenta"
    
    Write-Host "Iniciando verificacao e configuracao de todos os servicos..." -ForegroundColor Gray
    Write-Host "Este processo pode levar alguns minutos na primeira execucao.`n" -ForegroundColor Gray
    
    # Etapa 1: Verificar pre-requisitos
    if (-not (Test-Prerequisites)) {
        Write-Step "Pre-requisitos nao atendidos. Corrija os problemas e tente novamente." "ERROR"
        return $false
    }
    
    # Etapa 2: Testar Supabase (nao critico)
    Test-SupabaseConnection | Out-Null
    
    # Etapa 3: Instalar dependencias
    if (-not (Install-Dependencies)) {
        Write-Step "Falha na instalacao das dependencias." "ERROR"
        return $false
    }
    
    # Etapa 4: Mostrar status antes de iniciar
    Show-SystemStatus
    
    # Etapa 5: Iniciar servidor Next.js
    Write-Header "INICIANDO APLICATIVO"
    Write-Step "Todos os pre-requisitos verificados com sucesso!" "SUCCESS"
    Write-Step "Iniciando servidor Next.js..." "PROGRESS"
    
    Start-NextJSServer
}

# Execucao principal
if ($MyInvocation.InvocationName -ne '.') {
    try {
        Start-AllServices
    } catch {
        Write-Step "Erro critico durante a inicializacao: $($_.Exception.Message)" "ERROR"
        Write-Host "`nPressione qualquer tecla para sair..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}