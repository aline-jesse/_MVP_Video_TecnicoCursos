# 🔧 CORRIGINDO CONEXÃO COM BANCO DE DADOS

## ❌ Problema Identificado

```
Error querying the database: FATAL: Tenant or user not found
```

O banco de dados PostgreSQL (Supabase) **não está acessível**. Este é o erro que causa o **500** no upload de PPTX.

---

## 🎯 SOLUÇÕES POSSÍVEIS

### OPÇÃO 1: Usar SQLite Local (RECOMENDADO PARA DESENVOLVIMENTO) ✅

**Mais rápido e sem dependência de internet:**

1. **Abra o arquivo `.env`** e substitua a linha `DATABASE_URL`:

```env
# ANTES (PostgreSQL Supabase - não funciona)
DATABASE_URL="postgresql://postgres.ofhzrdiadxigrvmrhaiz:uoIaV5GO7P8VkZZs@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# DEPOIS (SQLite local - funciona sempre)
DATABASE_URL="file:./dev.db"
```

2. **Execute os comandos:**

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
npx prisma generate
npx prisma migrate dev --name init
```

3. **Reinicie o servidor** (na janela PowerShell onde está rodando):
   - Pressione `Ctrl+C`
   - Digite: `npm run dev`

---

### OPÇÃO 2: Corrigir Conexão Supabase

Se você precisa usar o Supabase:

1. **Acesse o painel do Supabase:**
   - URL: https://supabase.com/dashboard
   - Projeto: `ofhzrdiadxigrvmrhaiz`

2. **Verifique se o projeto está pausado:**
   - Settings → General
   - Se estiver pausado, clique em "Resume Project"

3. **Obtenha nova connection string:**
   - Settings → Database
   - Connection String → URI
   - Copie a nova string

4. **Atualize o `.env`:**
```env
DATABASE_URL="nova-connection-string-do-supabase"
```

5. **Execute:**
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
npx prisma generate
npx prisma db push
```

---

## 🚀 OPÇÃO RÁPIDA: Script Automático

Execute este script para mudar automaticamente para SQLite:

```powershell
# Navegue para o diretório
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

# Backup do .env
Copy-Item .env .env.backup-database-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')

# Substituir DATABASE_URL
$envContent = Get-Content .env
$newContent = $envContent -replace 'DATABASE_URL="postgresql:.*"', 'DATABASE_URL="file:./dev.db"'
$newContent | Set-Content .env

Write-Host "✅ DATABASE_URL alterado para SQLite" -ForegroundColor Green

# Gerar cliente e criar banco
npx prisma generate
npx prisma migrate dev --name init

Write-Host "`n🎉 BANCO DE DADOS CONFIGURADO!" -ForegroundColor Green
Write-Host "Agora reinicie o servidor (Ctrl+C e depois 'npm run dev')" -ForegroundColor Cyan
```

---

## ✅ Após Aplicar a Solução

1. **Execute o teste novamente:**
```powershell
npx tsx test-upload-api.ts
```

2. **Deve mostrar:**
```
✅ Variáveis de Ambiente     OK
✅ Banco de Dados            OK  ← ESTE AGORA DEVE ESTAR OK
✅ Parser PPTX               OK
✅ Sistema de Arquivos       OK

🎉 TODOS OS TESTES PASSARAM!
```

3. **Teste o upload de PPTX novamente**

---

## 💡 Por Que Isso Aconteceu?

O projeto Supabase pode ter:
- **Pausado por inatividade** (plano gratuito pausa após 7 dias sem uso)
- **Credenciais expiradas** (senha alterada)
- **Projeto deletado/migrado**

SQLite é **perfeito para desenvolvimento** porque:
- ✅ Sem dependência de internet
- ✅ Sem custos
- ✅ Rápido e simples
- ✅ Arquivo local (`dev.db`)

Para **produção**, use PostgreSQL/Supabase com credenciais válidas.
