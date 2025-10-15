# 🚀 GUIA COMPLETO: CONFIGURAR SUPABASE

**Data:** 7 de Outubro de 2025  
**Tempo Estimado:** 10 minutos  
**Dificuldade:** ⭐ Fácil

---

## 📋 PASSO 1: Criar Projeto no Supabase

### 1.1 Acessar Supabase
1. Abra o navegador em: **https://supabase.com**
2. Clique em **"Start your project"** ou **"Sign In"**
3. Faça login com:
   - GitHub (recomendado)
   - Google
   - Email

### 1.2 Criar Novo Projeto
1. No dashboard, clique em **"New Project"**
2. Preencha os dados:
   ```
   Name: estudio-ia-videos
   Database Password: [GERE UMA SENHA FORTE]
   Region: South America (São Paulo)
   Pricing Plan: Free
   ```
3. Clique em **"Create new project"**
4. ⏳ Aguarde ~2 minutos (provisioning do banco)

---

## 📋 PASSO 2: Obter Connection String

### 2.1 Navegar para Settings
1. No projeto criado, clique em **⚙️ Settings** (canto inferior esquerdo)
2. Clique em **Database** no menu lateral

### 2.2 Copiar Connection String
1. Role até a seção **"Connection string"**
2. Clique na aba **"URI"**
3. Você verá algo como:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```
4. **IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 1.2

### 2.3 Copiar Direct URL (Para Migrations)
1. Na mesma página, encontre **"Connection pooling"**
2. Mude de **"Transaction"** para **"Session"**
3. Copie esta URL também (será usada para migrations)

---

## 📋 PASSO 3: Configurar .env.local

### 3.1 Abrir Arquivo
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
notepad .env.local
```

### 3.2 Adicionar/Atualizar Variáveis

**SUBSTITUA** as linhas DATABASE_URL existentes por:

```env
# ============================================
# 🗄️ SUPABASE DATABASE
# ============================================

# Connection Pooling (Para aplicação)
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-ID].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct Connection (Para migrations)
DIRECT_DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-ID].supabase.co:5432/postgres"

# Supabase API (Opcional - para futuro)
NEXT_PUBLIC_SUPABASE_URL="https://[SEU-PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[SUA-ANON-KEY]"
```

**EXEMPLO REAL** (com dados fictícios):
```env
DATABASE_URL="postgresql://postgres:MinhaSenh@123Forte@db.xyzabcdefghijk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

DIRECT_DATABASE_URL="postgresql://postgres:MinhaSenh@123Forte@db.xyzabcdefghijk.supabase.co:5432/postgres"
```

### 3.3 Salvar e Fechar
- Pressione `Ctrl+S` para salvar
- Feche o Notepad

---

## 📋 PASSO 4: Atualizar schema.prisma

### 4.1 Abrir schema.prisma
O arquivo já está aberto no VS Code: `app/prisma/schema.prisma`

### 4.2 Verificar Configuração
Certifique-se que tem estas linhas:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

---

## 📋 PASSO 5: Executar Migração

### 5.1 Validar Conexão
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

# Testar conexão
npx prisma db push
```

**Resultado esperado:**
```
✔ Database now in sync with schema
```

### 5.2 Criar Migração
```powershell
npx prisma migrate dev --name add_pptx_batch_models
```

**Resultado esperado:**
```
✔ Migration created successfully
✔ Migration applied: 20251007_add_pptx_batch_models
```

### 5.3 Gerar Cliente
```powershell
npx prisma generate
```

---

## 📋 PASSO 6: Verificar no Prisma Studio

### 6.1 Abrir Studio
```powershell
npx prisma studio
```

### 6.2 Validar Tabelas
1. O navegador abrirá em `http://localhost:5555`
2. Você deve ver:
   - ✅ **PPTXBatchJob**
   - ✅ **PPTXProcessingJob**
   - ✅ Outras tabelas do projeto

---

## 📋 PASSO 7: Executar Testes

### 7.1 Setup Completo
```powershell
.\scripts\setup-and-test.ps1
```

### 7.2 Testes de Integração
```powershell
npx tsx scripts/test-pptx-advanced.ts
```

### 7.3 Testes Unitários
```powershell
npm test __tests__/lib/pptx/pptx-advanced-features.test.ts
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Configuração
- [ ] Projeto criado no Supabase
- [ ] Connection strings copiadas
- [ ] .env.local atualizado
- [ ] Senha substituída (sem [YOUR-PASSWORD])

### Migração
- [ ] `npx prisma db push` executado com sucesso
- [ ] `npx prisma migrate dev` criou migração
- [ ] `npx prisma generate` gerou cliente

### Verificação
- [ ] Prisma Studio abre
- [ ] 2 tabelas PPTX aparecem
- [ ] Testes de integração passam

---

## 🎯 COMANDOS RÁPIDOS (Copiar e Colar)

### Setup Inicial
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

# 1. Validar conexão
npx prisma db push

# 2. Criar migração
npx prisma migrate dev --name add_pptx_batch_models

# 3. Gerar cliente
npx prisma generate

# 4. Abrir Studio
npx prisma studio
```

### Testes
```powershell
# Setup + Testes
.\scripts\setup-and-test.ps1

# Ou individual
npx tsx scripts/test-pptx-advanced.ts
```

---

## 🆘 TROUBLESHOOTING

### ❌ Erro: "FATAL: password authentication failed"
**Causa:** Senha incorreta no DATABASE_URL

**Solução:**
1. Volte ao Supabase → Settings → Database
2. Clique em **"Reset database password"**
3. Copie a nova senha
4. Atualize .env.local

### ❌ Erro: "database does not exist"
**Causa:** URL incorreta ou projeto não criado

**Solução:**
1. Verifique PROJECT_ID no Supabase (Settings → General)
2. Confirme que está no formato: `db.[PROJECT-ID].supabase.co`

### ❌ Erro: "connection limit exceeded"
**Causa:** Muitas conexões abertas

**Solução:**
1. Use `pgbouncer=true` no DATABASE_URL
2. Adicione `connection_limit=1`
3. Use DIRECT_DATABASE_URL para migrations

### ❌ Erro: "SSL required"
**Causa:** Supabase requer SSL

**Solução:**
Adicione ao final da URL:
```
?sslmode=require
```

---

## 📊 VERIFICAR NO SUPABASE DASHBOARD

### 1. Table Editor
1. No Supabase, clique em **🗂️ Table Editor**
2. Você deve ver:
   - `PPTXBatchJob`
   - `PPTXProcessingJob`

### 2. SQL Editor
Execute query para validar:
```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM "PPTXBatchJob") as batch_jobs,
  (SELECT COUNT(*) FROM "PPTXProcessingJob") as processing_jobs;
```

---

## 🎊 PRÓXIMOS PASSOS

Após configurar Supabase com sucesso:

1. ✅ **Testar com arquivos reais**
   ```powershell
   # Copiar arquivo de teste
   Copy-Item "..\..\NR 11 – SEGURANÇA NA OPERAÇÃO DE EMPILHADEIRAS.pptx" `
             ".\test-files\nr11.pptx" -Force
   
   # Testar API
   npx tsx scripts/test-api-pptx.ts
   ```

2. ✅ **Monitorar no dashboard**
   - Abra Supabase → Table Editor
   - Veja os jobs sendo criados em tempo real

3. ✅ **Configurar backup automático**
   - Supabase → Settings → Backups
   - Já está ativo no free tier! 🎉

---

## 💡 DICAS PRO

### 1. Extensão VS Code
Instale a extensão Prisma:
```powershell
code --install-extension Prisma.prisma
```

### 2. Supabase CLI (Opcional)
```powershell
# Instalar
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref [PROJECT-ID]
```

### 3. Monitoramento
No Supabase Dashboard:
- **Database** → Query Performance
- **Database** → Disk Usage
- **Reports** → Activity

---

## 📚 RECURSOS ÚTEIS

- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
- 📖 [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- 🎥 [Video Tutorial](https://www.youtube.com/watch?v=LkqNx9A00Kw)

---

## ✨ BENEFÍCIOS DO SUPABASE

✅ **Free Tier Generoso:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- Backup automático

✅ **Features:**
- PostgreSQL completo
- Row Level Security (RLS)
- Realtime subscriptions
- Edge Functions
- Storage de arquivos

✅ **Performance:**
- CDN global
- Connection pooling
- Auto-scaling

---

**🚀 Pronto para começar!**

Execute os comandos do **"PASSO 5"** e você terá o Supabase configurado em minutos!

---

**Mantido por:** Equipe de Desenvolvimento  
**Versão:** 1.0  
**Última Atualização:** 7 de Outubro de 2025
