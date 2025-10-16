
# ⚙️ CONFIGURAÇÃO DE PRODUÇÃO - GUIA RÁPIDO

## 🔴 AÇÕES URGENTES (Fazer ANTES do tráfego real)

### 1. CONFIGURAR REDIS (15 minutos)

#### Por que é urgente?
- Sessões de usuário persistentes
- Colaboração em tempo real funcional
- Cache de queries (economiza DB)
- Suporte a múltiplas instâncias (escalabilidade)

#### Como fazer (Upstash - GRÁTIS):

```bash
# PASSO 1: Criar conta
https://console.upstash.com/

# PASSO 2: Criar Redis Database
- Clique "Create Database"
- Name: estudio-ia-videos
- Type: Regional
- Region: US East (N. Virginia) - us-east-1
- Eviction: No Eviction
- Clique "Create"

# PASSO 3: Copiar credenciais
Na tela do database criado, copie:
- Endpoint: xxxxxx.upstash.io
- Password: AYxxxxxxxxxxxxxxxxxxxx

# PASSO 4: Montar REDIS_URL
Formato: rediss://default:[PASSWORD]@[ENDPOINT]:6379

Exemplo real:
rediss://default:AYxxAsdfG123xxxxxx@us1-fine-owl-12345.upstash.io:6379
```

#### Adicionar no projeto:

**Opção A - Via UI (Recomendado)**
```
1. Acesse: https://apps.abacusai.ai/chatllm/?appId=appllm_engineer
2. Vá em: App Settings > Environment Variables
3. Adicione:
   Key: REDIS_URL
   Value: rediss://default:[PASSWORD]@[ENDPOINT]:6379
4. Salve e faça redeploy
```

**Opção B - Via .env local**
```bash
cd /home/ubuntu/estudio_ia_videos/app
echo 'REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT]:6379' >> .env.production
# Depois fazer redeploy
```

#### Validar Redis:
```bash
# Após deploy com REDIS_URL configurado:
curl https://treinx.abacusai.app/api/admin/system | jq .redis

# Resultado esperado:
{
  "status": "connected",
  "type": "remote",
  "version": "7.x",
  "uptime": "5 days"
}
```

---

### 2. CONFIGURAR STRIPE (30 minutos)

#### Quando configurar?
- **AGORA**: Se já quer cobrar usuários
- **DEPOIS**: Se ainda está validando produto com free tier

#### Setup passo-a-passo:

##### A. Obter Chaves API (5min)
```bash
# 1. Login no Stripe
https://dashboard.stripe.com/

# 2. Ativar "Live Mode" (toggle superior direito - deve ficar AZUL)

# 3. Ir em: Developers > API Keys
https://dashboard.stripe.com/test/apikeys

# 4. Copiar duas chaves:
Publishable key: pk_live_EXAMPLE_KEY_REPLACE_WITH_REAL
Secret key: sk_live_EXAMPLE_KEY_REPLACE_WITH_REAL

# ⚠️ NUNCA compartilhe a Secret key!
```

##### B. Criar Produtos (10min)
```bash
# 1. Ir em: Products
https://dashboard.stripe.com/products

# 2. Criar 3 produtos:

# PRODUTO 1: Plano Free
- Name: Estúdio IA - Free
- Description: Ideal para testar a plataforma
- Price: R$ 0,00 / mês
- Recurring: Monthly
[Copiar Price ID gerado: price_xxxxxxxxxxxxx]

# PRODUTO 2: Plano Pro
- Name: Estúdio IA - Pro
- Description: Vídeos ilimitados + Avatares Premium
- Price: R$ 97,00 / mês
- Recurring: Monthly
[Copiar Price ID gerado: price_xxxxxxxxxxxxx]

# PRODUTO 3: Plano Enterprise
- Name: Estúdio IA - Enterprise
- Description: White-label + Suporte prioritário
- Price: R$ 497,00 / mês
- Recurring: Monthly
[Copiar Price ID gerado: price_xxxxxxxxxxxxx]
```

##### C. Configurar Webhook (10min)
```bash
# 1. Ir em: Developers > Webhooks
https://dashboard.stripe.com/webhooks

# 2. Clicar "Add endpoint"

# 3. Preencher:
Endpoint URL: https://treinx.abacusai.app/api/webhooks/stripe

Events to send:
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ payment_intent.succeeded
✅ payment_intent.payment_failed

# 4. Clicar "Add endpoint"

# 5. Copiar "Signing secret" gerado:
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

##### D. Adicionar Variáveis de Ambiente (5min)
```bash
# Adicionar no projeto (via UI ou .env):

STRIPE_SECRET_KEY=sk_live_EXAMPLE_KEY_REPLACE_WITH_REAL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_EXAMPLE_KEY_REPLACE_WITH_REAL
STRIPE_WEBHOOK_SECRET=whsec_EXAMPLE_WEBHOOK_SECRET

# IDs dos planos criados:
STRIPE_PRICE_ID_FREE=price_xxxxxxxxxxxxx_free
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx_pro
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxxxxxxx_enterprise
```

##### E. Testar Pagamento Real
```bash
# 1. Fazer redeploy com variáveis configuradas

# 2. Acessar billing:
https://treinx.abacusai.app/billing

# 3. Clicar "Upgrade to Pro"

# 4. Usar cartão de TESTE (Stripe Test Mode):
Número: 4242 4242 4242 4242
Data: 12/34
CVC: 123
CEP: 12345

# 5. Confirmar pagamento

# 6. Verificar no Stripe Dashboard:
https://dashboard.stripe.com/payments
# Deve aparecer pagamento de R$ 97,00

# 7. Verificar no app:
# Plano deve mudar para "Pro" na tela de billing
```

---

### 3. CONFIGURAR SENTRY (10 minutos - OPCIONAL)

#### Por que Sentry?
- Rastreia erros em produção automaticamente
- Alerta quando algo quebra
- Stack traces completos
- Performance monitoring

#### Setup:

```bash
# 1. Criar conta grátis:
https://sentry.io/signup/

# 2. Criar novo projeto:
- Platform: Next.js
- Project name: estudio-ia-videos
- Alert frequency: On every new issue

# 3. Copiar DSN gerado:
https://abc123def456@o123456.ingest.sentry.io/789012

# 4. Adicionar no projeto:
NEXT_PUBLIC_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/789012

# 5. Fazer redeploy

# 6. Forçar erro de teste:
curl https://treinx.abacusai.app/api/test-sentry-error

# 7. Verificar no Sentry Dashboard:
# Deve aparecer erro capturado
```

---

## 🟡 CONFIGURAÇÕES RECOMENDADAS (Fazer nos próximos dias)

### 4. MONITORAMENTO UPTIME (5 minutos)

#### UptimeRobot (Grátis):
```bash
# 1. Criar conta:
https://uptimerobot.com/

# 2. Add New Monitor:
Monitor Type: HTTP(s)
Friendly Name: Estúdio IA - API Health
URL: https://treinx.abacusai.app/api/health
Monitoring Interval: 5 minutes

# 3. Adicionar contatos de alerta:
Alert Contacts: [seu-email@empresa.com]

# 4. Ativar monitor
```

**Resultado**: Você receberá email se o site cair.

---

### 5. GOOGLE ANALYTICS 4 (10 minutos)

```bash
# 1. Criar propriedade GA4:
https://analytics.google.com/

# 2. Configurar:
- Account: Estúdio IA
- Property: estudio-ia-videos
- Industry: Technology
- Business size: Small
- Timezone: (GMT-03:00) Brasília
- Currency: Brazilian Real (R$)

# 3. Criar Data Stream:
- Platform: Web
- Website URL: https://treinx.abacusai.app
- Stream name: Produção

# 4. Copiar Measurement ID:
G-XXXXXXXXXX

# 5. Adicionar no projeto:
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# 6. Redeploy

# 7. Testar:
# Acesse o site e veja em: Realtime > Overview
# Deve aparecer 1 usuário ativo (você)
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### Crítico (antes de tráfego)
- [ ] Redis configurado e conectado
- [ ] Stripe configurado (se monetizando)
- [ ] Deploy realizado com sucesso
- [ ] Health check 200 OK
- [ ] Login/Signup funcionando

### Recomendado (primeiros dias)
- [ ] Sentry ativo e capturando erros
- [ ] UptimeRobot monitorando
- [ ] Google Analytics rastreando
- [ ] Backup automático DB configurado

### Opcional (melhorias futuras)
- [ ] CDN para assets estáticos (Cloudflare)
- [ ] Email transacional (SendGrid/Resend)
- [ ] SMS notifications (Twilio)
- [ ] A/B testing (Posthog/Mixpanel)

---

## 🚨 TROUBLESHOOTING

### Redis não conecta
```bash
# Erro: ECONNREFUSED ou ETIMEDOUT

# Soluções:
1. Verificar se REDIS_URL está correto
2. Checar se começa com rediss:// (com SSL)
3. Validar password sem espaços/quebras
4. Testar conexão manual:
   redis-cli -u "rediss://default:[PASSWORD]@[ENDPOINT]:6379" PING
   # Deve retornar: PONG
```

### Stripe webhook não recebe eventos
```bash
# Sintoma: Pagamentos não atualizam plano do usuário

# Soluções:
1. Verificar Webhook URL: https://treinx.abacusai.app/api/webhooks/stripe
2. Checar eventos selecionados (ver lista acima)
3. Ver logs no Stripe Dashboard > Webhooks > [seu endpoint] > Recent deliveries
4. Testar manualmente:
   curl -X POST https://treinx.abacusai.app/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type":"checkout.session.completed"}'
```

### Sentry não captura erros
```bash
# Sintoma: Dashboard vazio

# Soluções:
1. Verificar se NEXT_PUBLIC_SENTRY_DSN está no .env
2. Checar se DSN está correto (copiar novamente)
3. Forçar erro manualmente:
   throw new Error("Teste Sentry");
4. Ver se erro aparece em: Sentry > Issues
```

---

## 💡 DICAS PRO

### Ambiente Staging
```bash
# Criar ambiente de testes antes de produção:

# 1. Duplicar deploy atual
# 2. Usar diferentes credenciais:
REDIS_URL=[redis-staging]
STRIPE_SECRET_KEY=sk_test_xxxxx  # Test mode!
NEXT_PUBLIC_SENTRY_DSN=[sentry-staging]

# 3. Testar mudanças em staging primeiro
# 4. Promover para produção se OK
```

### Backup Automático
```bash
# Configurar backup diário do PostgreSQL:

# 1. No dashboard do banco de dados
# 2. Ativar "Automated Backups"
# 3. Retention: 7 days
# 4. Time: 02:00 AM UTC (23:00 Brasília)
```

### Performance Monitoring
```bash
# Monitorar performance real:

# Adicionar no projeto:
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# Ou usar Web Vitals customizado:
https://treinx.abacusai.app/api/analytics/web-vitals

# Métricas importantes:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
```

---

## ✅ VALIDAÇÃO FINAL

Após configurar tudo, execute:

```bash
# 1. Health check completo
curl https://treinx.abacusai.app/api/admin/system | jq

# Deve retornar:
{
  "status": "healthy",
  "redis": { "status": "connected" },
  "database": { "status": "connected" },
  "stripe": { "configured": true },
  "sentry": { "configured": true }
}

# 2. Teste de carga simples
ab -n 100 -c 10 https://treinx.abacusai.app/api/health

# Deve ter 100% success rate

# 3. Verificar logs em tempo real
# (via Sentry ou logs da plataforma)
```

**Se todos os testes passarem: 🎉 SISTEMA 100% CONFIGURADO!**

---

## 📞 SUPORTE

**Dúvidas sobre configuração?**
- Consulte: `/home/ubuntu/estudio_ia_videos/docs/`
- Leia: `GO_LIVE_READOUT_FINAL.md`
- Verifique: `DEVELOPER_GUIDE.md`

**Encontrou bug?**
- Documente em: `HOTFIX_PROD.md`
- Classifique severidade (P0/P1/P2/P3)
- Abra issue no repositório

---

**Última atualização**: 03/10/2025  
**Versão**: v1.0.0 - Production Ready
