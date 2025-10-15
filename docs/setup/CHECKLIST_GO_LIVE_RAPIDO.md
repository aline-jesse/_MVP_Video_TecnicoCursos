# ⚡ CHECKLIST RÁPIDO - GO-LIVE EM 2 HORAS

**Data:** 10/10/2025  
**Objetivo:** Sistema em produção HOJE

---

## 📋 LISTA DE AÇÕES (Marque conforme completa)

### 🔴 CRÍTICO - Fazer AGORA (4-8 min) ⚡ AUTOMATIZADO!

#### 🚀 **OPÇÃO A: Setup Automatizado (RECOMENDADO)** - 4-8 min

```powershell
# 1. Navegar para pasta scripts
cd c:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\scripts

# 2. Instalar dependências (apenas primeira vez)
npm install

# 3. Executar setup automatizado
npm run setup:supabase

# 4. Executar testes de integração
npm run test:supabase
```

**O que o script faz automaticamente:**
- ✅ Valida pré-requisitos
- ✅ Cria 7 tabelas (database-schema.sql)
- ✅ Aplica ~20 políticas RLS (database-rls-policies.sql)
- ✅ Popula 3 cursos NR (seed-nr-courses.sql)
- ✅ Cria 4 buckets de storage
- ✅ Executa 19 testes de validação
- ✅ Gera relatório completo

**Tempo Total:** 4-8 minutos (tudo automatizado!)

**Documentação:** Ver `scripts/README_SCRIPTS.md` para detalhes completos

**✅ CHECKPOINT:** Setup 100% automatizado - Vá direto para o DEPLOY!

---

#### 📋 **OPÇÃO B: Setup Manual (Se preferir)** - 40-50 min

<details>
<summary>Clique para ver passos manuais (não recomendado)</summary>

##### ⚠️ PASSO 1: Setup Supabase - Banco de Dados (15 min)
```
Status: ⏳ PENDENTE - BLOQUEADOR
```

- [ ] Abrir: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/sql
- [ ] Clicar "+ New query"
- [ ] Abrir arquivo `database-schema.sql` no VS Code
- [ ] Copiar TODO o conteúdo (Ctrl+A → Ctrl+C)
- [ ] Colar no SQL Editor do Supabase
- [ ] Clicar "RUN" ou Ctrl+Enter
- [ ] Aguardar confirmação "Success"
- [ ] Verificar: Executar query abaixo
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```
- [ ] Confirmar: 7 tabelas apareceram (users, projects, slides, render_jobs, analytics_events, nr_courses, nr_modules)

**✅ CHECKPOINT:** Banco de dados criado com sucesso

---

##### ⚠️ PASSO 2: Setup Supabase - Segurança RLS (10 min)
```
Status: ⏳ PENDENTE - BLOQUEADOR
```

- [ ] Mesmo SQL Editor
- [ ] Nova query (+ New query)
- [ ] Abrir arquivo `database-rls-policies.sql`
- [ ] Copiar TODO o conteúdo
- [ ] Colar no SQL Editor
- [ ] Clicar "RUN"
- [ ] Aguardar confirmação "Success"
- [ ] Verificar: Executar query abaixo
  ```sql
  SELECT COUNT(*) as total_policies FROM pg_policies;
  ```
- [ ] Confirmar: ~20 políticas criadas

**✅ CHECKPOINT:** Segurança RLS ativada

---

##### 🟡 PASSO 3: Setup Supabase - Dados Iniciais (5 min)
```
Status: ⏳ PENDENTE - Importante mas não bloqueador
```

- [ ] Nova query
- [ ] Abrir arquivo `seed-nr-courses.sql`
- [ ] Copiar TODO o conteúdo
- [ ] Colar e RUN
- [ ] Verificar:
  ```sql
  SELECT code, title FROM nr_courses;
  ```
- [ ] Confirmar: 3 cursos (NR12, NR33, NR35)

**✅ CHECKPOINT:** Cursos NR populados

---

##### 🟡 PASSO 4: Setup Supabase - Storage Buckets (10 min)
```
Status: ⏳ PENDENTE - Importante para uploads
```

- [ ] Abrir: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/storage/buckets
- [ ] Criar bucket "videos":
  - [ ] Nome: `videos`
  - [ ] Public: NO
  - [ ] File size limit: 500 MB
  - [ ] Clicar "Create bucket"
  
- [ ] Criar bucket "avatars":
  - [ ] Nome: `avatars`
  - [ ] Public: NO
  - [ ] File size limit: 50 MB
  - [ ] Clicar "Create bucket"
  
- [ ] Criar bucket "thumbnails":
  - [ ] Nome: `thumbnails`
  - [ ] Public: YES
  - [ ] File size limit: 10 MB
  - [ ] Clicar "Create bucket"
  
- [ ] Criar bucket "assets":
  - [ ] Nome: `assets`
  - [ ] Public: YES
  - [ ] File size limit: 20 MB
  - [ ] Clicar "Create bucket"

**✅ CHECKPOINT:** 4 buckets criados

---

##### ✅ PASSO 5: Testar Conexão Supabase (5 min)
```
Status: ⏳ PENDENTE - Validação importante
```

- [ ] Abrir PowerShell
- [ ] Navegar para pasta do projeto:
  ```powershell
  cd c:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7
  ```
- [ ] Executar script de teste:
  ```powershell
  .\test-supabase-connection.ps1
  ```
- [ ] Verificar saída:
  - [ ] ✅ Database connection: OK
  - [ ] ✅ Tables exist: 7/7
  - [ ] ✅ RLS enabled: OK
  - [ ] ✅ Storage buckets: 4/4

**✅ CHECKPOINT:** Supabase 100% configurado e testado

</details>

---

### 🚀 DEPLOY - Fazer DEPOIS do Supabase (15 min)

#### Escolha UMA das opções abaixo:

##### 🅰️ OPÇÃO A: Deploy no Vercel (Recomendado para MVP)

- [ ] Instalar Vercel CLI:
  ```powershell
  npm install -g vercel
  ```
- [ ] Login:
  ```powershell
  vercel login
  ```
- [ ] Navegar para pasta do app:
  ```powershell
  cd c:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
  ```
- [ ] Link projeto:
  ```powershell
  vercel link
  ```
- [ ] Adicionar variáveis de ambiente (uma por vez):
  ```powershell
  vercel env add DATABASE_URL
  vercel env add NEXTAUTH_SECRET
  vercel env add NEXTAUTH_URL
  ```
  - [ ] Copiar valores do arquivo `.env.production`
  
- [ ] Deploy:
  ```powershell
  vercel --prod
  ```
- [ ] Aguardar conclusão (~5 min)
- [ ] Copiar URL de produção fornecida

**✅ CHECKPOINT:** Deploy no Vercel concluído

---

##### 🅱️ OPÇÃO B: Deploy no Railway

- [ ] Acessar: https://railway.app
- [ ] Login com GitHub
- [ ] "New Project" → "Deploy from GitHub repo"
- [ ] Selecionar repositório
- [ ] Configurar variáveis de ambiente no dashboard
- [ ] Deploy automático inicia
- [ ] Aguardar conclusão

**✅ CHECKPOINT:** Deploy no Railway concluído

---

##### 🅲 OPÇÃO C: Deploy no Abacus AI (Se já configurado)

- [ ] Abrir painel Abacus AI
- [ ] Localizar botão "Deploy"
- [ ] Selecionar checkpoint: "GO LIVE - Deploy Produção Final"
- [ ] Confirmar deploy
- [ ] Aguardar 2-5 minutos
- [ ] URL: https://treinx.abacusai.app/

**✅ CHECKPOINT:** Deploy no Abacus concluído

---

### ✅ VALIDAÇÃO PÓS-DEPLOY (10 min)

#### 🧪 Smoke Tests Básicos

- [ ] **Health Check API:**
  ```bash
  curl https://seudominio.com/api/health
  ```
  - [ ] Retornou JSON com status "ok"
  
- [ ] **Homepage:**
  - [ ] Abrir no navegador
  - [ ] Página carrega (<3s)
  - [ ] Sem erros no console (F12)
  
- [ ] **Login:**
  - [ ] Clicar "Sign In"
  - [ ] Criar nova conta OU fazer login
  - [ ] Redirecionado para dashboard
  
- [ ] **Dashboard:**
  - [ ] Dashboard carrega
  - [ ] "New Project" visível
  - [ ] Sidebar funcional
  
- [ ] **Template Selection:**
  - [ ] Clicar "New Project"
  - [ ] Ver lista de templates
  - [ ] Templates NR aparecem (NR12, NR33, NR35)
  
- [ ] **Editor:**
  - [ ] Selecionar qualquer template
  - [ ] Editor Canvas carrega
  - [ ] Timeline aparece
  - [ ] Consegue clicar nos slides

**✅ CHECKPOINT:** Smoke tests passaram - Sistema LIVE! 🎉

---

## 📊 PROGRESSO GERAL

```
Setup Supabase:
[░░░░░░░░░░] 0% → Fase 2: Banco
[░░░░░░░░░░] 0% → Fase 3: RLS
[░░░░░░░░░░] 0% → Fase 4: Dados
[░░░░░░░░░░] 0% → Fase 5: Storage
[░░░░░░░░░░] 0% → Fase 6: Testes

Deploy:
[░░░░░░░░░░] 0% → Escolher plataforma
[░░░░░░░░░░] 0% → Executar deploy
[░░░░░░░░░░] 0% → Validação

TOTAL: [░░░░░░░░░░] 0% completo
```

**Atualize manualmente conforme avança!**

---

## ⏱️ TEMPO ESTIMADO

| Fase | Tempo | Status |
|------|-------|--------|
| **Supabase - Banco** | 15 min | ⏳ |
| **Supabase - RLS** | 10 min | ⏳ |
| **Supabase - Dados** | 5 min | ⏳ |
| **Supabase - Storage** | 10 min | ⏳ |
| **Testes Conexão** | 5 min | ⏳ |
| **Deploy** | 15 min | ⏳ |
| **Validação** | 10 min | ⏳ |
| **TOTAL** | **70 min** | |

**Previsão de conclusão:** ~1h10min se tudo correr bem

---

## 🚨 PROBLEMAS COMUNS

### ❌ "Error: relation 'users' does not exist"
**Solução:** Fase 2 (database-schema.sql) não foi executada  
**Ação:** Volte e execute o PASSO 1 novamente

### ❌ "Error: RLS enabled but no policies"
**Solução:** Fase 3 (database-rls-policies.sql) não foi executada  
**Ação:** Volte e execute o PASSO 2

### ❌ "Error: Bucket not found"
**Solução:** Storage buckets não foram criados  
**Ação:** Execute PASSO 4 para criar os 4 buckets

### ❌ Deploy falha com "Missing environment variables"
**Solução:** Variáveis .env não foram adicionadas na plataforma  
**Ação:** Verificar e adicionar TODAS as variáveis do `.env.production`

### ❌ "503 Service Unavailable" após deploy
**Solução:** Build está falhando  
**Ação:** Verificar logs de deploy na plataforma (Vercel/Railway/Abacus)

---

## 📞 AJUDA RÁPIDA

### Documentação Completa
```
📖 Análise completa: ANALISE_GO_LIVE_COMPLETO_10_OUT_2025.md
📖 Setup Supabase: SUPABASE_SETUP_PASSO_A_PASSO.md
📖 Deploy completo: _Fases_REAL/GUIA_DEPLOY_PRODUCAO.md
📖 Checklist deploy: _Fases_REAL/CHECKLIST_DEPLOY.md
```

### Links Úteis
```
🌐 Supabase SQL Editor:
https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/sql

📦 Supabase Storage:
https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/storage/buckets

📊 Supabase Tables:
https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/editor
```

---

## ✅ CONCLUSÃO

**Antes de começar, tenha em mãos:**
- ✅ Acesso ao Dashboard Supabase
- ✅ VS Code aberto com os arquivos .sql
- ✅ PowerShell aberto
- ✅ Conta na plataforma de deploy (Vercel/Railway/Abacus)

**Depois de completar todos os passos:**
- 🎉 Sistema estará 100% em produção
- 🎉 URL acessível publicamente
- 🎉 Banco de dados configurado
- 🎉 Todas as features funcionais

**COMECE AGORA!** ⚡

Abra o próximo arquivo: `SUPABASE_SETUP_PASSO_A_PASSO.md`

---

**Criado:** 10/10/2025  
**Versão:** 1.0 - Checklist Executivo  
**Próximo:** Execute Fase 2 do Supabase
