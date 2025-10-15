# 🎯 QUICK START: SUPABASE EM 5 MINUTOS

**Escolha um dos 2 métodos:**

---

## 🚀 MÉTODO 1: SCRIPT AUTOMATIZADO (Recomendado)

### Passo Único:
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
.\scripts\configure-supabase.ps1
```

**O script vai:**
1. ✅ Pedir PROJECT ID e senha
2. ✅ Criar .env.local automaticamente
3. ✅ Validar conexão
4. ✅ Executar migração
5. ✅ Pronto para usar!

---

## 📝 MÉTODO 2: MANUAL (Passo-a-passo)

### 1. Criar Projeto Supabase
```
1. Acesse: https://supabase.com
2. Login com GitHub
3. New Project:
   - Name: estudio-ia-videos
   - Password: [senha forte]
   - Region: South America
```

### 2. Copiar Credenciais
```
Supabase → Settings → Database

Copie:
- Connection string (URI)
- Substitua [YOUR-PASSWORD] pela senha real
```

### 3. Configurar .env.local
```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
notepad .env.local
```

**Cole:**
```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[PROJECT-ID].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

DIRECT_DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

### 4. Executar Migração
```powershell
# Validar
npx prisma db push

# Migrar
npx prisma migrate dev --name add_pptx_batch_models

# Gerar cliente
npx prisma generate
```

### 5. Verificar
```powershell
# Abrir Studio
npx prisma studio

# Executar testes
.\scripts\setup-and-test.ps1
```

---

## ✅ VALIDAÇÃO

### Você deve ver:
- ✅ Prisma Studio abre em http://localhost:5555
- ✅ Tabelas: `PPTXBatchJob` e `PPTXProcessingJob`
- ✅ Testes passam: 27/27

### Se algo der errado:
📖 Veja: [GUIA_SUPABASE_SETUP.md](./GUIA_SUPABASE_SETUP.md)

---

## 🎊 PRONTO!

Agora você pode usar o sistema completo:

```powershell
# Testar API
npx tsx scripts/test-api-pptx.ts

# Iniciar aplicação
npm run dev
```

---

**Tempo total:** 5-10 minutos  
**Dificuldade:** ⭐ Fácil  
**Suporte:** GUIA_SUPABASE_SETUP.md
