@echo off
echo Iniciando servico Docker...
net start com.docker.service
if errorlevel 1 (
    echo Erro ao iniciar servico Docker. Tentando com PowerShell...
    powershell -Command "Start-Service -Name com.docker.service"
)
echo Aguardando inicializacao...
timeout /t 15 /nobreak >nul
echo Testando conexao Docker...
docker version
echo.
echo Status dos servicos Docker:
sc query com.docker.service
pause