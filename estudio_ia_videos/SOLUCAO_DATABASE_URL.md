# ⚠️ PROBLEMA IDENTIFICADO - DATABASE_URL

## 🔴 Erro Atual

```
Error: Schema engine error:
FATAL: Tenant or user not found
```

**Causa:** DATABASE_URL inválido ou vazio no arquivo `.env.local`

---

## ✅ SOLUÇÃO RÁPIDA (2 Opções)

### OPÇÃO 1: Usar PostgreSQL Local (RECOMENDADO para testes)

#### 1. Instalar PostgreSQL
```powershell
# Via Chocolatey
choco install postgresql

# OU baixar em: https://www.postgresql.org/download/windows/
```

#### 2. Configurar .env.local
```env
# Adicionar/atualizar no app/.env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/estudio_ia_videos?schema=public"
```

#### 3. Criar banco de dados
```powershell
# Abrir psql
psql -U postgres

# Criar banco
CREATE DATABASE estudio_ia_videos;

# Sair
\q
```

#### 4. Executar migração
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
npx prisma migrate dev --name init
```

---

### OPÇÃO 2: Usar Supabase (Cloud - RECOMENDADO para produção)

#### 1. Criar projeto no Supabase
1. Acesse: https://supabase.com
2. Crie uma conta/login
3. Clique em "New Project"
4. Configure:
   - **Name:** estudio-ia-videos
   - **Database Password:** [escolha uma senha forte]
   - **Region:** South America (São Paulo)
5. Aguarde ~2 minutos para provisionar

#### 2. Copiar Connection String
1. No dashboard do Supabase, vá em **Settings** → **Database**
2. Role até "Connection string" → **URI**
3. Copie a string (algo como):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```

#### 3. Configurar .env.local
```env
# Substituir [YOUR-PASSWORD] e [PROJECT-ID] pelos valores reais
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Adicionar também (para conexão direta - migrations)
DIRECT_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

#### 4. Executar migração
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
npx prisma migrate dev --name init
```

---

### OPÇÃO 3: Usar Docker + PostgreSQL (Intermediário)

#### 1. Criar docker-compose.yml
```yaml
# app/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: estudio_ia_videos
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 2. Iniciar container
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
docker-compose up -d
```

#### 3. Configurar .env.local
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/estudio_ia_videos?schema=public"
```

#### 4. Executar migração
```powershell
npx prisma migrate dev --name init
```

---

## 🎯 MINHA RECOMENDAÇÃO

### Para **DESENVOLVIMENTO/TESTES**:
✅ **OPÇÃO 1** (PostgreSQL Local) ou **OPÇÃO 3** (Docker)
- Mais rápido
- Sem custo
- Total controle

### Para **PRODUÇÃO**:
✅ **OPÇÃO 2** (Supabase)
- Backup automático
- Escalabilidade
- Monitoramento
- Free tier generoso

---

## 🚀 PRÓXIMOS PASSOS (Após Configurar DB)

### 1. Validar conexão
```powershell
cd app
npx prisma db push
```

### 2. Executar migração
```powershell
npx prisma migrate dev --name add_pptx_batch_models
```

### 3. Verificar no Prisma Studio
```powershell
npx prisma studio
```

### 4. Executar testes
```powershell
.\scripts\setup-and-test.ps1
```

---

## 📋 CHECKLIST

### Configuração do Banco
- [ ] PostgreSQL instalado/configurado
- [ ] DATABASE_URL adicionado ao .env.local
- [ ] Conexão validada (`npx prisma db push`)
- [ ] Migração executada
- [ ] Tabelas criadas (PPTXBatchJob, PPTXProcessingJob)

### Validação
- [ ] Prisma Studio abre
- [ ] Testes de integração passam
- [ ] API funciona

---

## 💡 DICA: Verificar Se Funciona

```powershell
# Testar conexão
cd app
npx prisma db push

# Se aparecer:
# "✔ Database now in sync with schema"
# = ✅ SUCESSO!

# Se aparecer erro:
# = ❌ DATABASE_URL ainda inválido
```

---

## 🆘 SUPORTE

### Erro: "Tenant or user not found"
- ✅ Verificar DATABASE_URL está correto
- ✅ Verificar senha não tem caracteres especiais (% @ #)
- ✅ Se Supabase: usar DIRECT_DATABASE_URL para migrations

### Erro: "Connection refused"
- ✅ PostgreSQL está rodando?
- ✅ Porta 5432 está livre?
- ✅ Firewall bloqueando?

### Erro: "Database does not exist"
```powershell
# Criar manualmente
createdb estudio_ia_videos -U postgres
```

---

**Após configurar o banco, execute novamente:**
```powershell
.\scripts\setup-and-test.ps1
```

**Mantido por:** Equipe de Desenvolvimento  
**Última Atualização:** 7 de Outubro de 2025
