# 🚀 INICIAR SERVIÇOS - COMANDOS SIMPLES

Copie e execute os comandos abaixo, um por vez:

## OPÇÃO 1: COM DOCKER (Recomendado)

### Passo 1: Abrir Docker Desktop manualmente
```powershell
# Abrir Docker Desktop (interface gráfica)
# Procure "Docker Desktop" no menu Iniciar e clique duas vezes
# Aguarde até o ícone da baleia ficar verde na bandeja do sistema
```

### Passo 2: Aguardar Docker iniciar (30-60 segundos)
```powershell
# Aguardar Docker ficar pronto
Start-Sleep -Seconds 30

# Testar se Docker está funcionando
docker --version
docker ps
```

### Passo 3: Iniciar containers
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos

# Subir PostgreSQL, Redis, MinIO e Grafana
docker-compose up -d

# Ver containers rodando
docker ps
```

### Passo 4: Gerar Prisma Client
```powershell
# Gerar cliente Prisma
npx prisma generate
```

### Passo 5: Executar migrations
```powershell
# Criar/atualizar tabelas no banco
npx prisma migrate deploy

# Ou se for primeira vez:
npx prisma migrate dev --name init
```

### Passo 6: Iniciar aplicação
```powershell
# Iniciar Next.js em modo desenvolvimento
npx next dev
```

### Passo 7: Acessar aplicação
```
🌐 App: http://localhost:3000
📊 Health: http://localhost:3000/api/health
📈 Grafana: http://localhost:3001 (admin/admin123)
📦 MinIO: http://localhost:9000 (minioadmin/minioadmin123)
```

---

## OPÇÃO 2: SEM DOCKER (Via XAMPP)

Se você já tem o XAMPP rodando:

### Passo 1: Iniciar PostgreSQL no XAMPP
```powershell
# Abrir XAMPP Control Panel
# Clicar em "Start" para PostgreSQL
# Ou se não tiver PostgreSQL no XAMPP, use MySQL:
```

### Passo 2: Configurar .env para MySQL (se usar XAMPP)
```env
# Editar arquivo .env
DATABASE_URL="mysql://root@localhost:3306/estudio_ia_videos"
```

### Passo 3: Criar banco de dados
```powershell
# Acessar MySQL
mysql -u root

# Criar database
CREATE DATABASE estudio_ia_videos;
EXIT;
```

### Passo 4: Instalar Redis Windows
```powershell
# Download Redis para Windows
# https://github.com/microsoftarchive/redis/releases
# Instalar e iniciar o serviço
```

### Passo 5: Gerar Prisma e migrations
```powershell
npx prisma generate
npx prisma migrate dev --name init
```

### Passo 6: Iniciar app
```powershell
npx next dev
```

---

## OPÇÃO 3: MAIS RÁPIDO (Apenas Next.js, sem banco)

Para testar o app sem banco de dados (funcionalidade limitada):

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos

# Apenas iniciar Next.js
npx next dev
```

Acessar: http://localhost:3000

**Nota**: Algumas funcionalidades não funcionarão sem banco de dados.

---

## ⚡ COMANDO ÚNICO (Copie tudo de uma vez)

**COM DOCKER**:
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos; Write-Host "⏳ Aguarde Docker Desktop iniciar manualmente..." -ForegroundColor Yellow; Write-Host "💡 Abra Docker Desktop e aguarde ficar verde" -ForegroundColor Cyan; pause; docker-compose up -d; Start-Sleep -Seconds 15; npx prisma generate; npx prisma migrate deploy; Write-Host "`n✅ Serviços prontos! Iniciando app..." -ForegroundColor Green; npx next dev
```

**SEM DOCKER (apenas app)**:
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos; Write-Host "🚀 Iniciando aplicação..." -ForegroundColor Green; npx next dev
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Teste PostgreSQL (via Docker)
```powershell
docker-compose exec postgres psql -U estudio -d estudio_ia -c "SELECT version();"
```

### Teste Redis (via Docker)
```powershell
docker-compose exec redis redis-cli ping
# Deve retornar: PONG
```

### Teste Next.js
```powershell
# Acessar health check
curl http://localhost:3000/api/health

# Ou abrir no navegador
start http://localhost:3000
```

---

## 🛑 PARAR SERVIÇOS

### Parar app (Ctrl+C no terminal)

### Parar containers Docker
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos
docker-compose down
```

### Ver logs
```powershell
# Logs de todos os containers
docker-compose logs -f

# Logs apenas do PostgreSQL
docker-compose logs postgres

# Logs apenas do Redis
docker-compose logs redis
```

---

## ❓ PROBLEMAS COMUNS

### "Cannot connect to Docker daemon"
→ Abra Docker Desktop manualmente e aguarde iniciar

### "Port 3000 already in use"
→ Use porta diferente: `npx next dev -p 3001`

### "Cannot find module @prisma/client"
→ Execute: `npx prisma generate`

### "Database does not exist"
→ Execute: `npx prisma migrate dev --name init`

---

## 🎯 INÍCIO RÁPIDO (RECOMENDADO)

1. **Abra Docker Desktop** (ícone da baleia na bandeja)
2. **Aguarde ficar verde** (30-60 segundos)
3. **Execute este comando**:

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos && docker-compose up -d && timeout /t 15 && npx prisma generate && npx prisma migrate deploy && npx next dev
```

4. **Acesse**: http://localhost:3000

**Pronto! 🎉**
