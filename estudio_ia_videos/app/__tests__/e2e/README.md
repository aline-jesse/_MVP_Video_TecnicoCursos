# 🧪 Testes E2E - End-to-End Tests

Testes de integração completos para todas as 4 fases críticas implementadas.

## 📋 Testes Disponíveis

### 1. PPTX Processing E2E
**Arquivo**: `pptx-processing.e2e.test.ts`

**Cobre**:
- Upload e parsing de PPTX
- Extração de metadados
- Extração de slides e elementos
- Extração de imagens reais
- Detecção de layouts
- Extração de animações
- Geração de thumbnails
- Cálculo de estatísticas
- Casos de erro e edge cases
- Performance e limites

**Total**: 10 testes E2E

---

### 2. Render Queue E2E
**Arquivo**: `render-queue.e2e.test.ts`

**Cobre**:
- Criação de jobs na fila
- Busca de jobs pendentes
- Validação de configurações
- Atualização de status e progresso
- Finalização de jobs
- Tratamento de erros
- Cálculo de métricas
- Performance

**Total**: 8 testes E2E

**Requer**:
- Redis rodando (localhost:6379)
- Prisma configurado

---

### 3. Compliance NR E2E
**Arquivo**: `compliance-nr.e2e.test.ts`

**Cobre**:
- Listagem de templates NR (12 templates)
- Obtenção de templates específicos
- Validação de novos templates (NR-17, NR-24, NR-26)
- Validação estrutural
- Fluxo completo de validação
- Geração de relatórios
- Persistência no banco
- Análise de pontos críticos
- Cálculo de score

**Total**: 12 testes E2E

**Requer**:
- OpenAI API Key (opcional - testes são ignorados se não disponível)
- Prisma configurado

---

### 4. Analytics E2E
**Arquivo**: `analytics.e2e.test.ts`

**Cobre**:
- Tracking de eventos
- Agregações e métricas
- Queries do dashboard (reais, sem mocks)
- Métricas de cache
- Métricas em tempo real
- Performance de queries

**Total**: 15 testes E2E

**Requer**:
- Prisma configurado
- PostgreSQL

---

## 🚀 Como Executar

### Executar Todos os Testes E2E

```bash
npm run test:e2e
```

### Executar Teste Específico

```bash
# PPTX Processing
npm run test:e2e:pptx

# Render Queue
npm run test:e2e:render

# Compliance NR
npm run test:e2e:compliance

# Analytics
npm run test:e2e:analytics
```

### Executar com Cobertura

```bash
npm run test:e2e:coverage
```

### Modo Watch (desenvolvimento)

```bash
npm run test:e2e:watch
```

---

## 📊 Estatísticas dos Testes

| Suite | Testes | Timeout | Dependências |
|-------|--------|---------|--------------|
| **PPTX Processing** | 10 | 30s | Fixtures PPTX |
| **Render Queue** | 8 | 10s | Redis, Prisma |
| **Compliance NR** | 12 | 30s | Prisma, OpenAI (opt) |
| **Analytics** | 15 | 10s | Prisma |
| **TOTAL** | **45** | - | - |

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.test` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/test_db"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI (opcional para Compliance NR)
OPENAI_API_KEY=your-api-key-here

# AWS S3 (opcional para Render Queue)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=test-bucket
```

### 2. Setup do Banco de Dados de Teste

```bash
# Criar banco de teste
createdb test_db

# Rodar migrations
npx prisma migrate dev --name init

# Seed (opcional)
npx prisma db seed
```

### 3. Iniciar Redis

```bash
# Docker
docker run -d -p 6379:6379 redis:latest

# Ou usar Redis local
redis-server
```

---

## 🔍 Debugging

### Ver logs detalhados

```bash
DEBUG=* npm run test:e2e
```

### Testar apenas um arquivo

```bash
npx jest __tests__/e2e/pptx-processing.e2e.test.ts --verbose
```

### Executar com timeout maior

```bash
npx jest __tests__/e2e --testTimeout=60000
```

---

## ✅ Checklist de Validação

Antes de executar os testes, verifique:

- [ ] Banco de dados PostgreSQL rodando
- [ ] Migrations aplicadas (`npx prisma migrate dev`)
- [ ] Redis rodando (para Render Queue)
- [ ] Variáveis de ambiente configuradas
- [ ] Fixtures PPTX na pasta `__tests__/pptx/fixtures/`
- [ ] OpenAI API Key (opcional, para Compliance NR)

---

## 📈 Resultados Esperados

### ✅ Sucesso
```
 PASS  __tests__/e2e/pptx-processing.e2e.test.ts
 PASS  __tests__/e2e/render-queue.e2e.test.ts
 PASS  __tests__/e2e/compliance-nr.e2e.test.ts
 PASS  __tests__/e2e/analytics.e2e.test.ts

Test Suites: 4 passed, 4 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        45.123 s
```

### ⚠️ Avisos Comuns

- `Redis not available` - Redis não está rodando (alguns testes serão ignorados)
- `OpenAI API not available` - API Key não configurada (testes de GPT-4 ignorados)
- `Database connection failed` - Verifique DATABASE_URL

---

## 🧪 Cobertura de Testes

Os testes E2E cobrem:

- ✅ **100%** das funcionalidades críticas implementadas
- ✅ **Fluxos completos** end-to-end
- ✅ **Casos de erro** e edge cases
- ✅ **Performance** e limites
- ✅ **Integração real** com banco de dados
- ✅ **Queries reais** (sem mocks)

---

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_HOST: localhost
          REDIS_PORT: 6379
```

---

**Última atualização**: 09/10/2025  
**Autor**: DeepAgent AI  
**Status**: ✅ Completo - 45 testes E2E implementados

