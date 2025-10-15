# 🚀 GUIA DE SETUP RÁPIDO - Implementações Reais

Este guia ajuda você a configurar e executar as novas implementações reais rapidamente.

---

## 📋 PRÉ-REQUISITOS

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Redis instalado e rodando
- Git configurado

---

## ⚡ SETUP EM 5 MINUTOS

### 1. Instalar Dependências

```bash
cd estudio_ia_videos
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env.local
```

Edite `.env.local` e configure as variáveis essenciais:

```env
# Database (obrigatório)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/estudio_ia"

# Redis (obrigatório para render queue)
REDIS_URL="redis://localhost:6379"

# NextAuth (obrigatório)
NEXTAUTH_SECRET="sua-chave-secreta-aleatoria"
NEXTAUTH_URL="http://localhost:3000"

# Opcional: Assets APIs
UNSPLASH_ACCESS_KEY="sua-chave-unsplash"
PEXELS_API_KEY="sua-chave-pexels"

# Opcional: Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
GA4_API_SECRET="seu-secret-ga4"
```

### 3. Inicializar Database

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate dev

# (Opcional) Seed de dados de exemplo
npx prisma db seed
```

### 4. Iniciar Serviços

Você precisa de 3 terminais:

**Terminal 1 - PostgreSQL**
```bash
# Se instalado localmente
sudo service postgresql start

# Ou com Docker
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
```

**Terminal 2 - Redis**
```bash
# Se instalado localmente
sudo service redis-server start

# Ou com Docker
docker run -p 6379:6379 redis:alpine
```

**Terminal 3 - Next.js**
```bash
npm run dev
```

### 5. Acessar a Aplicação

Abra no navegador: http://localhost:3000

---

## 🧪 TESTAR AS IMPLEMENTAÇÕES

### Assets Manager

1. Acesse: http://localhost:3000/assets
2. Busque por "safety" ou "training"
3. Veja resultados de Unsplash/Pexels (se configurado)

### Render Queue

```bash
# Via API
curl -X POST http://localhost:3000/api/render/create \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "seu-projeto-id",
    "type": "video",
    "settings": { "quality": "hd" }
  }'
```

### Collaboration

1. Abra 2 navegadores
2. Entre no mesmo projeto
3. Adicione comentários
4. Veja atualização em tempo real

### Analytics

```bash
# Via API
curl http://localhost:3000/api/analytics/metrics?period=daily
```

---

## 🐳 SETUP COM DOCKER (RECOMENDADO)

Se preferir usar Docker Compose:

### 1. Criar docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: estudio_ia
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/estudio_ia
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### 2. Iniciar Todos os Serviços

```bash
docker-compose up -d
```

### 3. Executar Migrations

```bash
docker-compose exec app npx prisma migrate dev
```

---

## 🔑 OBTER CHAVES DE API

### Unsplash (Gratuito)

1. Acesse: https://unsplash.com/developers
2. Crie uma aplicação
3. Copie o "Access Key"
4. Cole em `UNSPLASH_ACCESS_KEY`

**Limite gratuito**: 50 requisições/hora

### Pexels (Gratuito)

1. Acesse: https://www.pexels.com/api/
2. Cadastre-se
3. Copie a API Key
4. Cole em `PEXELS_API_KEY`

**Limite gratuito**: 200 requisições/hora

### Google Analytics 4 (Opcional)

1. Acesse: https://analytics.google.com/
2. Crie uma propriedade GA4
3. Em Admin > Data Streams > Web > Measurement ID
4. Em Admin > Data Streams > Measurement Protocol API secrets
5. Cole em `NEXT_PUBLIC_GA4_MEASUREMENT_ID` e `GA4_API_SECRET`

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Checklist de Validação

```bash
# 1. PostgreSQL está rodando?
psql -U postgres -c "SELECT version();"

# 2. Redis está rodando?
redis-cli ping
# Deve retornar: PONG

# 3. Next.js está rodando?
curl http://localhost:3000/api/health

# 4. Database tem as tabelas?
npx prisma studio
# Abrir no navegador e verificar tabelas

# 5. Redis está acessível?
redis-cli
> GET test
> SET test "hello"
> GET test
```

---

## 🛠️ TROUBLESHOOTING

### Erro: "Cannot connect to database"

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Verificar connection string
echo $DATABASE_URL
```

### Erro: "Redis connection refused"

**Solução:**
```bash
# Verificar se Redis está rodando
redis-cli ping

# Ou iniciar Redis
sudo service redis-server start
```

### Erro: "Prisma Client not generated"

**Solução:**
```bash
npx prisma generate
```

### Erro: "Module not found: bull"

**Solução:**
```bash
npm install bull socket.io formidable
npm install -D @types/bull @types/formidable
```

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Matar processo na porta 3000
npx kill-port 3000

# Ou usar outra porta
PORT=3001 npm run dev
```

---

## 📚 PRÓXIMOS PASSOS

Após configurar tudo:

1. **Explore a Documentação**
   - Leia `IMPLEMENTACOES_REAIS_OUTUBRO_2025.md`
   - Veja exemplos de código

2. **Execute os Testes**
   - `npm test` (quando implementados)
   - `npm run test:e2e`

3. **Desenvolva Features**
   - Use os sistemas implementados
   - Adicione novas funcionalidades

4. **Deploy em Produção**
   - Configure variáveis de ambiente
   - Use Vercel, Railway ou similar
   - Configure Redis na nuvem (Upstash, Redis Cloud)

---

## 💡 DICAS ÚTEIS

### Desenvolvimento Local

```bash
# Ver logs do Redis em tempo real
redis-cli MONITOR

# Ver logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-15-main.log

# Resetar database (CUIDADO!)
npx prisma migrate reset
```

### Depuração

```bash
# Modo debug do Next.js
NODE_OPTIONS='--inspect' npm run dev

# Ver queries do Prisma
DATABASE_URL="...?log=query" npm run dev
```

### Performance

```bash
# Análise de bundle
npm run build
npm run analyze

# Ver conexões Redis
redis-cli CLIENT LIST
```

---

## 🆘 SUPORTE

Se encontrar problemas:

1. Verifique os logs: `console.log` e terminal
2. Consulte a documentação oficial das ferramentas
3. Abra uma issue no repositório
4. Contate o time de desenvolvimento

---

## ✅ CHECKLIST FINAL

Antes de começar a desenvolver, certifique-se que:

- [ ] PostgreSQL está rodando
- [ ] Redis está rodando
- [ ] Next.js iniciou sem erros
- [ ] Database foi migrado
- [ ] Variáveis de ambiente configuradas
- [ ] APIs de assets (opcional) configuradas
- [ ] Consegue fazer login
- [ ] Pode criar um projeto
- [ ] WebSocket conecta (F12 > Network > WS)

---

**Pronto! Agora você está com tudo configurado para desenvolver! 🚀**

**Tempo estimado de setup**: 5-10 minutos  
**Dificuldade**: Iniciante/Intermediário
