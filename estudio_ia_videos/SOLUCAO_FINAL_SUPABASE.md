# 🆘 SOLUÇÃO FINAL - Configuração Supabase

## ❌ Problema Atual

Mesmo com:
- ✅ Access token configurado
- ✅ Projeto linkado via CLI
- ✅ Região identificada (us-east-2)
- ✅ Host identificado (db.ofhzrdiadxigrvmrhaiz.supabase.co)

Ainda recebemos: `FATAL: Tenant or user not found`

**Isso indica que:**
1. O formato do usuário pode estar incorreto
2. A senha pode estar diferente
3. Pode haver configuração especial de pooling

## ✅ SOLUÇÃO DEFINITIVA

### Passo 1: Obter Connection String do Painel

1. **Acesse:** https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/settings/database

2. **Role até** a seção "**Connection string**"

3. **Você verá um dropdown** com opções:
   - ✅ **Transaction mode** ← Selecione esta!
   - Session mode
   - URI

4. **A string será algo como:**
   ```
   postgresql://postgres.ofhzrdiadxigrvmrhaiz:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

5. **Substitua `[YOUR-PASSWORD]` pela senha:**
   - Se for `Tr1unf0@` → use `Tr1unf0%40`
   - O `@` deve virar `%40` em URLs

### Passo 2: Configurar Arquivo .env

Edite o arquivo:
```
C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\.env
```

Adicione as linhas (com a string que você copiou):

```env
# 🗄️ SUPABASE DATABASE
DATABASE_URL="postgresql://postgres.ofhzrdiadxigrvmrhaiz:SUA_SENHA_AQUI@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_DATABASE_URL="postgresql://postgres.ofhzrdiadxigrvmrhaiz:SUA_SENHA_AQUI@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
```

**⚠️ IMPORTANTE:**
- Use a MESMA senha nas duas URLs
- Lembre-se de codificar caracteres especiais:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `&` → `%26`

### Passo 3: Testar Conexão

Execute no terminal PowerShell:

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos
npx prisma db push --schema=app\prisma\schema.prisma
```

Se conectar, você verá:
```
✅ The database is now in sync with your Prisma schema.
```

### Passo 4: Verificar Tabelas Criadas

```powershell
npx prisma studio --schema=app\prisma\schema.prisma
```

Isso abrirá http://localhost:5555 onde você verá:
- `PPTXBatchJob`
- `PPTXProcessingJob`

## 🔍 Verificações Adicionais

### Se ainda não funcionar:

#### 1. Verifique se a senha está correta

No painel Supabase:
- Settings → Database
- Clique em "**Reset database password**"
- Crie uma senha SIMPLES (ex: `senha123`) sem caracteres especiais
- Atualize o `.env` com a nova senha

#### 2. Verifique modo de pooling

No dashboard, role até "**Connection pooling**":
- Certifique-se de que está **ENABLED**
- Mode: **Transaction**
- Pool size: pelo menos **15**

#### 3. Verifique Network Restrictions

Settings → Database → **Network Restrictions**:
- Deve estar marcado: ☑️ **Allow all IP addresses**
- Ou adicione seu IP específico

## 📞 Comando de Diagnóstico

Execute este comando para testar todas as combinações:

```powershell
# Teste direto (sem pooler)
$testUrl = "postgresql://postgres:SENHA_AQUI@db.ofhzrdiadxigrvmrhaiz.supabase.co:5432/postgres"
$env:DATABASE_URL = $testUrl
$env:DIRECT_DATABASE_URL = $testUrl
npx prisma db push --schema=app\prisma\schema.prisma --skip-generate
```

## ✅ Próximo Passo

Depois de configurar corretamente:

1. **Executar produção check:**
   ```powershell
   cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app
   .\scripts\production-check.ps1
   ```

2. **Iniciar aplicação:**
   ```powershell
   npm run dev
   ```

3. **Testar API:**
   - POST http://localhost:3000/api/v1/pptx/process-advanced
   - Com arquivo PPTX no body

---

**💡 Dica:** Se você tiver acesso ao painel Supabase aberto, procure na aba **Settings → Database** pela seção "Connection parameters" e copie a URL EXATA que aparece lá.
