@echo off
echo Ativando recursos WSL necessarios para Docker...
echo.
echo 1. Ativando Windows Subsystem for Linux...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
echo.
echo 2. Ativando Virtual Machine Platform...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
echo.
echo 3. Verificando status WSL...
wsl --status
echo.
echo 4. Atualizando WSL para versao 2...
wsl --update
echo.
echo 5. Definindo WSL 2 como padrao...
wsl --set-default-version 2
echo.
echo Reinicie o computador apos executar este script.
pause