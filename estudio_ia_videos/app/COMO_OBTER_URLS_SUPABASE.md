# 🔧 Como Obter URLs Corretas do Supabase

## 📋 Passo a Passo

### 1️⃣ Acesse o Dashboard do Supabase
```
https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz
```

### 2️⃣ Vá para Configurações do Banco
- Clique em **Settings** (⚙️) no menu lateral
- Clique em **Database**

### 3️⃣ Copie as Connection Strings

#### 🔹 Connection Pooling (para DATABASE_URL)
Na seção **Connection pooling**, você verá:

```
Mode: Transaction
Connection string:
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Exemplo:**
```
postgresql://postgres.ofhzrdiadxigrvmrhaiz:Th@mires122@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

#### 🔹 Direct Connection (para DIRECT_DATABASE_URL)
Na seção **Connection string**, você verá:

```
Direct connection:
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Exemplo:**
```
postgresql://postgres.ofhzrdiadxigrvmrhaiz:Th@mires122@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### 4️⃣ Ajuste a Senha na URL

Se sua senha contém caracteres especiais, você precisa codificá-los:

| Caractere | Substitua por |
|-----------|---------------|
| @         | %40           |
| #         | %23           |
| %         | %25           |
| &         | %26           |
| =         | %3D           |
| +         | %2B           |
| espaço    | %20           |

**Exemplo:**
- Senha: `Th@mires122`
- Na URL: `Th%40mires122`

### 5️⃣ Verifique a Região

As regiões possíveis são:
- `us-east-1` (Virginia)
- `us-west-1` (N. California)
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `eu-central-1` (Frankfurt)
- `ap-southeast-1` (Singapore)
- `ap-northeast-1` (Tokyo)
- `ap-southeast-2` (Sydney)
- **`sa-east-1` (São Paulo)** ← Provavelmente esta!

### 6️⃣ Atualize o Arquivo .env

Abra o arquivo `.env` e atualize:

```env
DATABASE_URL="postgresql://postgres.ofhzrdiadxigrvmrhaiz:Th%40mires122@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_DATABASE_URL="postgresql://postgres.ofhzrdiadxigrvmrhaiz:Th%40mires122@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

### 7️⃣ Teste a Conexão

```powershell
npx prisma db push
```

Se conectar com sucesso, você verá:
```
✅ The database is now in sync with your Prisma schema.
```

## 🆘 Solução de Problemas

### ❌ "Tenant or user not found"
- ✅ Verifique se a região está correta
- ✅ Verifique se a senha está codificada corretamente
- ✅ Verifique se o PROJECT_ID está correto

### ❌ "SSL connection required"
Adicione `?sslmode=require` no final da URL:
```
DATABASE_URL="...postgres?pgbouncer=true&connection_limit=1&sslmode=require"
```

### ❌ "Too many connections"
Use connection pooling (porta 6543) ao invés de direct connection (porta 5432)

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique se o projeto Supabase está ativo
2. Tente resetar a senha do banco no painel
3. Verifique se não há restrições de IP/firewall

---

**✅ Próximo passo:** Depois de configurar, execute:
```powershell
.\scripts\production-check.ps1
```
