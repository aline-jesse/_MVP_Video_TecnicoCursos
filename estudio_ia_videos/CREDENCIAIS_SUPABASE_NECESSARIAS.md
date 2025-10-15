# 🔑 Credenciais Necessárias do Supabase

## 📋 O QUE VOCÊ PRECISA COPIAR DO PAINEL

### 1️⃣ **Connection String (Transaction Mode)** ⭐ PRINCIPAL

**Onde encontrar:**
- Acesse: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/settings/database
- Role até a seção "**Connection string**"
- No dropdown, selecione: **Transaction** (modo de pooling)
- Copie a string completa

**Formato esperado:**
```
postgresql://postgres.ofhzrdiadxigrvmrhaiz:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**⚠️ IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha REAL do banco!

---

### 2️⃣ **Database Password** (Senha do Banco)

**Onde encontrar:**
- É a senha que você criou quando configurou o projeto Supabase
- Se não lembra: Settings → Database → "**Reset database password**"

**Formato:**
- Pode conter letras, números e caracteres especiais
- Exemplo: `Tr1unf0@`, `MinhaSenha123!`, etc.

**⚠️ ATENÇÃO:** Ao usar na connection string, caracteres especiais devem ser codificados:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `espaço` → `%20`

---

### 3️⃣ **Anon Key (Público)** - OPCIONAL

**Onde encontrar:**
- Settings → API
- Procure por "**anon public**"

**Você já tem:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maH...
```

✅ Já está configurado no `.env`!

---

### 4️⃣ **Service Role Key** - OPCIONAL

**Onde encontrar:**
- Settings → API
- Procure por "**service_role secret**"

**Você já tem:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maH...
```

✅ Já está configurado no `.env`!

---

## ✅ RESUMO - O QUE REALMENTE PRECISA

### Opção A: **Connection String Completa** (MAIS FÁCIL) ⭐

Copie APENAS a connection string do painel:

```
postgresql://postgres.ofhzrdiadxigrvmrhaiz:SUA_SENHA_AQUI@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Como usar:**
1. Copie a string acima do painel
2. Substitua `[YOUR-PASSWORD]` pela senha real
3. Cole aqui no chat para eu configurar automaticamente

---

### Opção B: **Apenas a Senha** (SE JÁ SOUBER O FORMATO)

Se você souber que o formato padrão é:
```
postgresql://postgres.ofhzrdiadxigrvmrhaiz:SENHA@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

Então só precisa me informar:
- **Senha do banco:** `________`

E eu monto a connection string corretamente.

---

## 🎯 PASSO A PASSO SIMPLIFICADO

### MÉTODO 1: Copiar do Painel (Recomendado)

1. Abra: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/settings/database

2. Role até "**Connection string**"

3. Selecione "**Transaction**" no dropdown

4. Você verá algo assim:
   ```
   postgresql://postgres.ofhzrdiadxigrvmrhaiz:[YOUR-PASSWORD]@...
   ```

5. **Copie TUDO** e cole aqui (substituindo `[YOUR-PASSWORD]` pela senha)

---

### MÉTODO 2: Informar a Senha

Se você souber a senha do banco, me informe:

```
Senha: _____________
```

E eu configuro automaticamente com:
- Host: `aws-0-us-east-2.pooler.supabase.com`
- Porta pooling: `6543`
- Porta direta: `5432`
- Usuário: `postgres.ofhzrdiadxigrvmrhaiz`
- Database: `postgres`

---

## 📝 EXEMPLO REAL

**Se sua senha for:** `Tr1unf0@`

**A connection string será:**
```
postgresql://postgres.ofhzrdiadxigrvmrhaiz:Tr1unf0%40@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Note que `@` virou `%40`!

---

## 🔍 COMO TESTAR SE ESTÁ CORRETA

Depois de configurar, execute:

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos
npx prisma db push --schema=app\prisma\schema.prisma
```

**✅ Se funcionar, você verá:**
```
✅ The database is now in sync with your Prisma schema.
```

**❌ Se der erro:**
```
FATAL: Tenant or user not found
```
→ Senha ou formato incorreto, tente novamente!

---

## 💡 QUAL CREDENCIAL VOCÊ PREFERE ME PASSAR?

**Escolha uma das opções:**

### Opção 1: Connection String Completa
```
Cole aqui: postgresql://...
```

### Opção 2: Apenas a Senha
```
Senha do banco: _______
```

### Opção 3: Screenshot
- Tire um print da seção "Connection string" no painel
- Me descreva exatamente o que aparece

---

**Qual opção você prefere?** 🤔
