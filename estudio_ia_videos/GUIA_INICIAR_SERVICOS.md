# 🚀 GUIA: COMO INICIAR TODOS OS SERVIÇOS

**Data**: 7 de Outubro de 2025  
**Objetivo**: Iniciar o Estúdio IA Vídeos e acessar a aplicação

---

## 📋 PRÉ-REQUISITOS

### Instalado ✅
- ✅ Node.js (verificado)
- ✅ npm/npx (verificado)
- ✅ Docker Desktop (instalado, mas parado)

### Necessário Instalar
- ⚠️ PostgreSQL (banco de dados)
- ⚠️ Redis (cache)

---

## 🎯 OPÇÕES PARA INICIAR

### **OPÇÃO A: Iniciar com Docker** (Recomendado - Mais Fácil)

Todos os serviços em containers isolados. **Nenhuma instalação manual necessária!**

#### Passo 1: Iniciar Docker Desktop

```powershell
# Iniciar serviço Docker
Start-Service com.docker.service

# Aguardar 10 segundos
Start-Sleep -Seconds 10

# Verificar se iniciou
docker --version
```

#### Passo 2: Iniciar todos os containers

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos

# Iniciar PostgreSQL + Redis + MinIO
docker-compose up -d

# Verificar containers rodando
docker ps
```

**Serviços que vão subir**:
- ✅ PostgreSQL → `localhost:5432`
- ✅ Redis → `localhost:6379`
- ✅ MinIO (S3) → `localhost:9000`
- ✅ Grafana (Monitoring) → `localhost:3001`

#### Passo 3: Configurar banco de dados

```powershell
# Executar migrations
npx prisma migrate deploy

# Ou criar do zero se necessário
npx prisma migrate dev --name init
```

#### Passo 4: Iniciar aplicação Next.js

```powershell
# Modo desenvolvimento
npx next dev

# Ou se tiver script
npm run dev
```

#### Passo 5: Acessar aplicação

- 🌐 **App**: http://localhost:3000
- 📊 **Grafana**: http://localhost:3001 (admin/admin123)
- 📦 **MinIO**: http://localhost:9000 (minioadmin/minioadmin123)

---

### **OPÇÃO B: Sem Docker** (Manual)

Requer instalar PostgreSQL e Redis manualmente no Windows.

#### Passo 1: Instalar PostgreSQL

1. Download: https://www.postgresql.org/download/windows/
2. Instalar com configurações:
   - Port: `5432`
   - Database: `estudio_ia`
   - User: `estudio`
   - Password: `estudio_2024`

#### Passo 2: Instalar Redis

**Opção 2a - Redis Windows (via MSI)**:
```powershell
# Download
# https://github.com/microsoftarchive/redis/releases

# Ou via Chocolatey
choco install redis-64
```

**Opção 2b - Redis via WSL2**:
```powershell
# No WSL2 Ubuntu
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### Passo 3: Atualizar .env

```env
# Database
DATABASE_URL="postgresql://estudio:estudio_2024@localhost:5432/estudio_ia"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_CONNECTION_STRING="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production-2024"
```

#### Passo 4: Iniciar aplicação

```powershell
# Migrations
npx prisma migrate dev

# App
npx next dev
```

---

## 🔧 CONFIGURAÇÃO RÁPIDA (.env)

Se ainda não tiver o `.env` configurado, copie do exemplo:

```powershell
# Copiar do exemplo
Copy-Item .env.example .env

# Ou criar manualmente
@"
# Database
DATABASE_URL="postgresql://estudio:estudio_2024@localhost:5432/estudio_ia"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_CONNECTION_STRING="redis://localhost:6379"

# Environment
NODE_ENV="development"
"@ | Out-File -FilePath .env -Encoding utf8
```

---

## 🐳 SCRIPTS ÚTEIS DOCKER

### Iniciar serviços

```powershell
# Iniciar tudo
docker-compose up -d

# Logs em tempo real
docker-compose logs -f

# Apenas PostgreSQL + Redis
docker-compose up -d postgres redis
```

### Parar serviços

```powershell
# Parar tudo
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### Verificar status

```powershell
# Ver containers rodando
docker ps

# Ver todos (inclusive parados)
docker ps -a

# Logs de um serviço específico
docker-compose logs postgres
docker-compose logs redis
```

### Executar comandos no banco

```powershell
# Conectar ao PostgreSQL
docker-compose exec postgres psql -U estudio -d estudio_ia

# Ou
docker exec -it estudio_ia_videos-postgres-1 psql -U estudio -d estudio_ia
```

### Executar comandos no Redis

```powershell
# Conectar ao Redis CLI
docker-compose exec redis redis-cli

# Testar conexão
docker-compose exec redis redis-cli ping
# Deve retornar: PONG
```

---

## 📊 VERIFICAR SE ESTÁ TUDO FUNCIONANDO

### 1. PostgreSQL

```powershell
# Teste de conexão
npx prisma db pull

# Ou via psql
psql -h localhost -U estudio -d estudio_ia -c "SELECT version();"
```

### 2. Redis

```powershell
# Testar via Redis CLI
redis-cli ping
# Deve retornar: PONG

# Ou via Docker
docker-compose exec redis redis-cli ping
```

### 3. Next.js

```powershell
# Build test
npx next build

# Dev server
npx next dev
# Deve abrir em http://localhost:3000
```

### 4. Health Check API

Após iniciar o app:

```powershell
# Testar endpoint de saúde
curl http://localhost:3000/api/health

# Ou no navegador
start http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-07T...",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

---

## 🚨 TROUBLESHOOTING

### Erro: "Cannot find module '@prisma/client'"

```powershell
# Regenerar Prisma Client
npx prisma generate
```

### Erro: "ECONNREFUSED" (PostgreSQL/Redis)

```powershell
# Verificar se containers estão rodando
docker ps

# Se não estão, iniciar
docker-compose up -d postgres redis
```

### Erro: "Port 3000 already in use"

```powershell
# Ver processo usando porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua PID)
taskkill /PID <PID> /F

# Ou use outra porta
npx next dev -p 3001
```

### Erro: "Database does not exist"

```powershell
# Criar database manualmente
docker-compose exec postgres createdb -U estudio estudio_ia

# Depois executar migrations
npx prisma migrate deploy
```

### Docker não inicia

```powershell
# Reiniciar serviço
Stop-Service com.docker.service
Start-Service com.docker.service

# Ou abrir Docker Desktop manualmente
start "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

---

## 🎯 SCRIPT AUTOMÁTICO DE INICIALIZAÇÃO

Crie um arquivo `start-services.ps1`:

```powershell
# start-services.ps1
Write-Host "🚀 Iniciando Estúdio IA Vídeos..." -ForegroundColor Green

# Verificar se Docker está rodando
$dockerService = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue

if ($dockerService -and $dockerService.Status -ne "Running") {
    Write-Host "⚡ Iniciando Docker..." -ForegroundColor Yellow
    Start-Service com.docker.service
    Start-Sleep -Seconds 15
}

# Iniciar containers
Write-Host "🐳 Iniciando containers..." -ForegroundColor Cyan
docker-compose up -d

# Aguardar containers iniciarem
Write-Host "⏳ Aguardando serviços (15s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar saúde dos containers
Write-Host "`n📊 Status dos containers:" -ForegroundColor Cyan
docker-compose ps

# Gerar Prisma Client
Write-Host "`n🔧 Gerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Executar migrations (se necessário)
Write-Host "`n📦 Verificando migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

# Iniciar aplicação
Write-Host "`n🚀 Iniciando aplicação Next.js..." -ForegroundColor Green
Write-Host "   Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""

npx next dev
```

Para executar:

```powershell
# Dar permissão (apenas primeira vez)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Executar script
.\start-services.ps1
```

---

## 📝 CHECKLIST DE INICIALIZAÇÃO

Antes de iniciar o app, verifique:

- [ ] Docker Desktop está rodando (ou PostgreSQL/Redis instalados)
- [ ] Arquivo `.env` está configurado
- [ ] `node_modules` instalado (`npm install`)
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Migrations executadas (`npx prisma migrate deploy`)
- [ ] Porta 3000 está livre
- [ ] PostgreSQL acessível (porta 5432)
- [ ] Redis acessível (porta 6379)

---

## 🎊 PRONTO PARA COMEÇAR!

Agora escolha uma opção:

**Rápido (Docker)**:
```powershell
# 1. Iniciar Docker
Start-Service com.docker.service

# 2. Subir containers
docker-compose up -d

# 3. Aguardar 15s e iniciar app
npx next dev
```

**Manual (Sem Docker)**:
```powershell
# 1. Garantir PostgreSQL rodando (porta 5432)
# 2. Garantir Redis rodando (porta 6379)
# 3. Iniciar app
npx next dev
```

---

**🌐 Após iniciar, acesse**: http://localhost:3000

**📊 Dashboard de saúde**: http://localhost:3000/api/health

**Boa sorte! 🚀**
