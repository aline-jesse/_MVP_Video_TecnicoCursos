# 🔧 CORREÇÃO DE ERROS - GUIA RÁPIDO

**Total de Erros**: 252  
**Principais Causas**: Dependências faltando e schema Prisma desatualizado

---

## 🚨 ERROS PRINCIPAIS

### 1. Dependências Faltando (Workers)

**Erro**: `Não é possível localizar o módulo 'canvas'`

**Solução**:
```powershell
cd estudio_ia_videos
npm install canvas axios @aws-sdk/client-s3
npm install -D @types/canvas
```

### 2. Schema Prisma Desatualizado

**Erro**: `A propriedade 'asset' não existe no tipo 'PrismaClient'`

**Causa**: O schema Prisma não está sincronizado com o código.

**Solução**:
```powershell
# Gerar client Prisma
npx prisma generate

# Se necessário, aplicar migrations
npx prisma migrate dev
```

### 3. Módulos NextAuth Não Encontrados

**Erro**: `Não é possível localizar o módulo '../auth/[...nextauth]'`

**Solução**: Criar arquivo de autenticação ou comentar imports temporariamente.

---

## ✅ PASSO A PASSO DE CORREÇÃO

### Passo 1: Instalar Dependências

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos

# Dependências principais
npm install

# Dependências da Fase 7A
npm install canvas axios @aws-sdk/client-s3

# Dependências de desenvolvimento
npm install -D @types/canvas
```

### Passo 2: Configurar Prisma

```powershell
# Gerar Prisma Client
npx prisma generate

# Verificar schema
npx prisma validate

# Ver status de migrations
npx prisma migrate status
```

### Passo 3: Verificar Erros

```powershell
# Verificar erros TypeScript
npx tsc --noEmit

# Ou executar linter
npm run lint
```

### Passo 4: Executar Aplicação

```powershell
# Se houver script dev no package.json
npm run dev

# Ou Next.js diretamente
npx next dev

# Ou build
npx next build
```

---

## 🎯 AÇÕES IMEDIATAS RECOMENDADAS

### Opção A: Instalar Apenas Dependências Críticas (Rápido - 2 min)

```powershell
npm install canvas axios @aws-sdk/client-s3
npx prisma generate
```

### Opção B: Correção Completa (Médio - 5-10 min)

```powershell
# 1. Limpar node_modules
rm -r node_modules
rm package-lock.json

# 2. Reinstalar tudo
npm install

# 3. Instalar Fase 7A
npm install canvas axios @aws-sdk/client-s3
npm install -D @types/canvas

# 4. Gerar Prisma
npx prisma generate

# 5. Verificar
npx tsc --noEmit
```

### Opção C: Comentar Workers Temporariamente (Muito Rápido - 30s)

Se você quiser apenas rodar a aplicação sem os workers:

```typescript
// Comentar temporariamente em workers/render-worker.ts
// import { createCanvas } from 'canvas'
// import axios from 'axios'
```

---

## 📝 NOTA IMPORTANTE

Os erros são **esperados** porque as dependências da Fase 7A ainda não foram instaladas.

**Escolha uma opção acima e eu executo para você!**

Qual você prefere?
1. **Opção A** - Rápida (só dependências)
2. **Opção B** - Completa (reinstalar tudo)
3. **Opção C** - Temporária (comentar código)

Digite o número da opção desejada.
