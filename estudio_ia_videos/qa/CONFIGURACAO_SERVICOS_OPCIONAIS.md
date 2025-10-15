
# ⚙️ CONFIGURAÇÃO DE SERVIÇOS OPCIONAIS

**Data**: 03/10/2025  
**Projeto**: Estúdio IA de Vídeos  
**Status**: Opcional (Sistema funciona sem eles)

---

## 📋 OVERVIEW

O sistema está **100% funcional** sem Redis e Stripe. Eles são **opcionais** e melhoram performance/funcionalidades específicas:

- **Redis**: Cache distribuído, rate limiting avançado, jobs queue
- **Stripe**: Billing, planos pagos (Free, Pro, Enterprise)

---

## 🔴 REDIS - Cache e Jobs Queue

### Quando Configurar?
- ✅ **Produção com alto tráfego** (> 1000 usuários/dia)
- ✅ **Rate limiting avançado** necessário
- ✅ **Background jobs** (rendering, exports)
- ❌ **Desenvolvimento** (não necessário)

### Como Configurar?

#### Opção 1: Redis Cloud (Grátis até 30MB)
1. Acesse: https://redis.com/try-free/
2. Crie conta e database
3. Copie a connection string
4. Adicione ao `.env`:
   ```bash
   REDIS_URL="redis://default:senha@redis-xxxxx.redis.cloud:12345"
   ```

#### Opção 2: Upstash (Serverless Redis)
1. Acesse: https://upstash.com/
2. Crie database Redis
3. Copie a connection string
4. Adicione ao `.env`:
   ```bash
   REDIS_URL="redis://default:senha@us1-xxxxx.upstash.io:12345"
   ```

#### Opção 3: AWS ElastiCache (Produção Enterprise)
1. No AWS Console, crie cluster ElastiCache Redis
2. Configure VPC e security groups
3. Copie o endpoint
4. Adicione ao `.env`:
   ```bash
   REDIS_URL="redis://seu-cluster.cache.amazonaws.com:6379"
   ```

### Validar Configuração
```bash
cd /home/ubuntu/estudio_ia_videos/app
node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.set('test', 'ok').then(() => redis.get('test')).then(console.log).then(() => redis.quit());"
```

**Resultado esperado**: `ok`

---

## 💳 STRIPE - Billing e Pagamentos

### Quando Configurar?
- ✅ **Planos pagos** (Pro, Enterprise)
- ✅ **Cobranças recorrentes**
- ✅ **Limite de recursos por plano**
- ❌ **MVP/Beta gratuito** (não necessário)

### Como Configurar?

#### Passo 1: Criar Conta Stripe
1. Acesse: https://dashboard.stripe.com/register
2. Crie conta e valide e-mail
3. Vá em **Developers → API Keys**

#### Passo 2: Obter Chaves
No dashboard Stripe:
- **Publishable Key**: `pk_live_xxxxx` ou `pk_test_xxxxx`
- **Secret Key**: `sk_live_xxxxx` ou `sk_test_xxxxx`
- **Webhook Secret**: `whsec_xxxxx`

#### Passo 3: Criar Produtos e Preços
1. No Stripe Dashboard → **Products**
2. Criar 3 produtos:
   - **Free Plan**: $0/mês
   - **Pro Plan**: $29/mês
   - **Enterprise Plan**: $99/mês
3. Copiar os **Price IDs**: `price_xxxxx`

#### Passo 4: Configurar Webhooks
1. No Stripe Dashboard → **Developers → Webhooks**
2. Adicionar endpoint:
   ```
   URL: https://treinx.abacusai.app/api/billing/webhook
   Events: customer.subscription.*, invoice.*, payment_intent.*
   ```
3. Copiar **Signing Secret**: `whsec_xxxxx`

#### Passo 5: Adicionar ao .env
```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Price IDs
STRIPE_PRICE_ID_FREE="price_free_xxxxx"
STRIPE_PRICE_ID_PRO="price_pro_xxxxx"
STRIPE_PRICE_ID_ENTERPRISE="price_ent_xxxxx"

# Stripe Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"
```

### Validar Configuração
```bash
cd /home/ubuntu/estudio_ia_videos/app
node -e "const Stripe = require('stripe'); const stripe = Stripe(process.env.STRIPE_SECRET_KEY); stripe.customers.list({ limit: 1 }).then(() => console.log('✅ Stripe OK')).catch(err => console.error('❌ Erro:', err.message));"
```

**Resultado esperado**: `✅ Stripe OK`

---

## 🧪 TESTAR CONFIGURAÇÕES

### Script de Validação Completa
Crie arquivo `test-services.js`:

```javascript
// test-services.js
const Redis = require('ioredis');
const Stripe = require('stripe');

async function testRedis() {
  if (!process.env.REDIS_URL) {
    console.log('⚠️  Redis not configured (optional)');
    return;
  }
  
  try {
    const redis = new Redis(process.env.REDIS_URL);
    await redis.set('test', Date.now());
    const value = await redis.get('test');
    await redis.quit();
    console.log('✅ Redis OK:', value);
  } catch (err) {
    console.error('❌ Redis Error:', err.message);
  }
}

async function testStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️  Stripe not configured (optional)');
    return;
  }
  
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const customers = await stripe.customers.list({ limit: 1 });
    console.log('✅ Stripe OK:', customers.data.length + ' customers');
  } catch (err) {
    console.error('❌ Stripe Error:', err.message);
  }
}

async function main() {
  console.log('🧪 Testing Optional Services...\n');
  await testRedis();
  await testStripe();
  console.log('\n✅ Tests complete!');
}

main();
```

Executar:
```bash
cd /home/ubuntu/estudio_ia_videos/app
node test-services.js
```

---

## 🚀 DECISÃO: CONFIGURAR AGORA OU DEPOIS?

### ✅ Configure AGORA se:
- Vai ter > 1000 usuários/dia
- Precisa de planos pagos (billing)
- Vai processar muitos jobs (rendering)
- Precisa de cache distribuído

### ⏳ Configure DEPOIS se:
- Está em fase MVP/Beta
- Tem < 100 usuários/dia
- Quer testar primeiro gratuitamente
- Não precisa de billing ainda

---

## 📝 RESUMO EXECUTIVO

| Serviço | Status | Impacto se NÃO configurado | Prioridade |
|---------|--------|---------------------------|------------|
| Redis | Opcional | Performance 10-20% menor | Média |
| Stripe | Opcional | Sem billing (apenas Free) | Baixa (MVP) / Alta (Produção) |

**Recomendação**:
- **MVP/Beta**: Não configurar agora
- **Produção**: Configurar Redis primeiro, depois Stripe se necessário

---

**Documentação**: Última atualização em 03/10/2025  
**Status**: Sistema funciona perfeitamente sem esses serviços  
**Autor**: DeepAgent QA Team

