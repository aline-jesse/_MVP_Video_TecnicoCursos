# 🚀 COMANDOS PARA INICIAR O APP - PASSO A PASSO

**Data**: 7 de Outubro de 2025  
**Objetivo**: Iniciar todos os serviços e acessar a aplicação

---

## ✅ PASSO 1: Abrir Docker Desktop (OPCIONAL mas recomendado)

### Opção A - Via Interface Gráfica
1. Pressione `Win` + `S`
2. Digite "Docker Desktop"
3. Clique duas vezes
4. Aguarde o ícone da baleia ficar verde (30-60 segundos)

### Opção B - Via PowerShell
```powershell
# Abrir Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Aguardar 30 segundos
Start-Sleep -Seconds 30
```

---

## ✅ PASSO 2: Iniciar Serviços Docker (PostgreSQL + Redis)

**Execute no PowerShell:**

```powershell
# Navegar para o diretório do projeto
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos

# Subir containers (PostgreSQL, Redis, MinIO, Grafana)
docker-compose up -d

# Aguardar containers iniciarem
Start-Sleep -Seconds 15

# Verificar se estão rodando
docker ps
```

**Containers esperados:**
- ✅ `postgres` - PostgreSQL (porta 5432)
- ✅ `redis` - Redis (porta 6379)
- ✅ `minio` - MinIO/S3 (porta 9000)
- ✅ `grafana` - Grafana (porta 3001)

---

## ✅ PASSO 3: Configurar Prisma

```powershell
# Navegar para a pasta do app
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

# Gerar Prisma Client
npx prisma generate

# Executar migrations (criar tabelas)
npx prisma migrate deploy
```

**Se der erro "Database does not exist":**
```powershell
# Criar banco manualmente
docker exec -it estudio_ia_videos-postgres-1 createdb -U estudio estudio_ia

# Tentar migrations novamente
npx prisma migrate deploy
```

---

## ✅ PASSO 4: Iniciar Aplicação Next.js

```powershell
# Certifique-se de estar na pasta app
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

# Iniciar em modo desenvolvimento
npx next dev
```

**Aguarde ver:**
```
✓ Starting...
✓ Ready in 3.2s
○ Local: http://localhost:3000
```

---

## ✅ PASSO 5: Acessar Aplicação

Abra no navegador:

- 🌐 **App Principal**: http://localhost:3000
- 📊 **Health Check**: http://localhost:3000/api/health  
- 📈 **Grafana**: http://localhost:3001 (admin/admin123)
- 📦 **MinIO Console**: http://localhost:9000 (minioadmin/minioadmin123)

---

## 🎯 COMANDO ÚNICO (Copie tudo e cole no PowerShell)

**COM Docker** (Recomendado):

```powershell
# IMPORTANTE: Antes de executar, abra o Docker Desktop manualmente e aguarde ficar verde!

cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos

Write-Host "`n⚡ Iniciando serviços Docker...`n" -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n⏳ Aguardando containers (15s)...`n" -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "`n📦 Verificando containers...`n" -ForegroundColor Cyan
docker ps

cd app

Write-Host "`n🔧 Gerando Prisma Client...`n" -ForegroundColor Yellow
npx prisma generate

Write-Host "`n📊 Executando migrations...`n" -ForegroundColor Yellow
npx prisma migrate deploy

Write-Host "`n🚀 Iniciando Next.js...`n" -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🛑 Para parar: Ctrl+C`n" -ForegroundColor Red

npx next dev
```

**SEM Docker** (Apenas Next.js - funcionalidade limitada):

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

Write-Host "`n🚀 Iniciando Next.js...`n" -ForegroundColor Green
Write-Host "⚠️  Rodando sem banco de dados - funcionalidade limitada" -ForegroundColor Yellow
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🛑 Para parar: Ctrl+C`n" -ForegroundColor Red

npx next dev
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Teste 1: Containers Docker
```powershell
docker ps
```
**Esperado**: Deve listar 4 containers (postgres, redis, minio, grafana)

### Teste 2: PostgreSQL
```powershell
docker exec -it estudio_ia_videos-postgres-1 psql -U estudio -d estudio_ia -c "SELECT version();"
```
**Esperado**: Versão do PostgreSQL

### Teste 3: Redis
```powershell
docker exec -it estudio_ia_videos-redis-1 redis-cli ping
```
**Esperado**: `PONG`

### Teste 4: Next.js
Abra: http://localhost:3000/api/health

**Esperado**:
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

## 🛑 PARAR SERVIÇOS

### Parar Next.js
No terminal onde está rodando, pressione: `Ctrl + C`

### Parar Containers Docker
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos
docker-compose down
```

### Parar e Remover Dados (CUIDADO!)
```powershell
# Isso vai APAGAR todos os dados do banco!
docker-compose down -v
```

---

## 📊 MONITORAMENTO

### Ver Logs do Next.js
Os logs aparecem no terminal onde você executou `npx next dev`

### Ver Logs dos Containers
```powershell
# Todos os containers
docker-compose logs -f

# Apenas PostgreSQL
docker-compose logs -f postgres

# Apenas Redis
docker-compose logs -f redis
```

### Ver Métricas no Grafana
1. Acesse: http://localhost:3001
2. Login: `admin` / `admin123`
3. Dashboards → Browse

---

## ⚠️ PROBLEMAS COMUNS

### Erro: "Cannot connect to Docker daemon"
**Solução**: Abra o Docker Desktop manualmente e aguarde iniciar

### Erro: "Port 3000 already in use"
**Solução**: Use porta diferente:
```powershell
npx next dev -p 3001
```

### Erro: "Cannot find module '@prisma/client'"
**Solução**:
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
npx prisma generate
```

### Erro: "Database does not exist"
**Solução**:
```powershell
docker exec -it estudio_ia_videos-postgres-1 createdb -U estudio estudio_ia
npx prisma migrate deploy
```

### Erro: "ECONNREFUSED localhost:5432"
**Solução**: PostgreSQL não está rodando:
```powershell
docker-compose up -d postgres
Start-Sleep -Seconds 10
npx prisma migrate deploy
```

### Erro: "ECONNREFUSED localhost:6379"
**Solução**: Redis não está rodando:
```powershell
docker-compose up -d redis
```

### Next.js demora muito para iniciar
**Solução**: Primeira inicialização pode demorar 2-5 minutos (compilação)

---

## 📋 CHECKLIST ANTES DE INICIAR

- [ ] Docker Desktop está instalado
- [ ] Docker Desktop está rodando (ícone verde)
- [ ] Você está no diretório correto (`estudio_ia_videos`)
- [ ] Arquivo `.env` existe (ou copiar de `.env.example`)
- [ ] Executou `docker-compose up -d`
- [ ] Aguardou 15 segundos para containers iniciarem
- [ ] Verificou containers com `docker ps`
- [ ] Navegou para pasta `app`: `cd app`
- [ ] Executou `npx prisma generate`
- [ ] Executou `npx prisma migrate deploy`
- [ ] Porta 3000 está livre

---

## 🎊 TUDO PRONTO!

Após seguir os passos, você terá:

✅ PostgreSQL rodando (porta 5432)  
✅ Redis rodando (porta 6379)  
✅ MinIO rodando (porta 9000)  
✅ Grafana rodando (porta 3001)  
✅ Next.js rodando (porta 3000)  

**Acesse a aplicação**: http://localhost:3000

**Bom trabalho! 🚀**

---

## 📞 PRÓXIMOS PASSOS

Após o app estar rodando, você pode:

1. **Criar sua conta** em http://localhost:3000/register
2. **Fazer login** em http://localhost:3000/login
3. **Criar um projeto** no dashboard
4. **Explorar as funcionalidades**

Quando estiver pronto, podemos **implementar a IA Revolution**! 🤖✨
