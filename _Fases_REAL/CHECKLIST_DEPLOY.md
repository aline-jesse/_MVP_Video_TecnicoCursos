# ✅ CHECKLIST DE DEPLOY - PRODUCTION

**Sistema**: Estúdio IA Vídeos  
**Status**: 100% Production-Ready  
**Data**: 09/10/2025

---

## 📋 CHECKLIST COMPLETO

### ✅ 1. PRÉ-DEPLOY

#### 1.1 Código
- [ ] Branch `main` atualizado
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` sem erros
- [ ] Todos os testes passando:
  - [ ] 19 testes unitários (`npm test`)
  - [ ] 45 testes E2E API (`npm run test:e2e`)
  - [ ] 47 testes UI (`npm run test:playwright`)

#### 1.2 Configuração
- [ ] `.env.production` criado
- [ ] Todas as variáveis de ambiente definidas
- [ ] Secrets não commitados no Git
- [ ] `next.config.js` otimizado para produção

---

### ✅ 2. INFRAESTRUTURA

#### 2.1 Database (PostgreSQL)
- [ ] Instância criada (Supabase/RDS/Railway)
- [ ] Conexão testada
- [ ] Migrations aplicadas (`npx prisma migrate deploy`)
- [ ] Backup automático configurado
- [ ] Connection pooling configurado

**Variáveis necessárias**:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

#### 2.2 Redis (Cache/Queue)
- [ ] Instância criada (Upstash/ElastiCache/Railway)
- [ ] Conexão testada
- [ ] Persistência configurada (se necessário)
- [ ] Password configurado

**Variáveis necessárias**:
```env
REDIS_HOST="..."
REDIS_PORT="6379"
REDIS_PASSWORD="..."
REDIS_TLS="true"
```

#### 2.3 S3 (Storage)
- [ ] Bucket criado
- [ ] CORS configurado
- [ ] IAM User criado com permissões
- [ ] Access keys gerados
- [ ] Lifecycle policies configuradas (opcional)

**Variáveis necessárias**:
```env
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
S3_BUCKET="seu-bucket"
```

#### 2.4 OpenAI
- [ ] API Key válida
- [ ] Billing configurado
- [ ] Rate limits adequados ao uso esperado

**Variáveis necessárias**:
```env
OPENAI_API_KEY="sk-..."
```

---

### ✅ 3. DEPLOY

#### 3.1 Vercel (se usando)
- [ ] Projeto criado no Vercel
- [ ] Repository conectado
- [ ] Variáveis de ambiente adicionadas no dashboard
- [ ] Build settings configurados
- [ ] Domain configurado
- [ ] SSL ativo

#### 3.2 Railway (se usando)
- [ ] Projeto criado
- [ ] Services configurados (App + Worker)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy executado
- [ ] Logs verificados

#### 3.3 Docker (se usando)
- [ ] Dockerfile testado localmente
- [ ] docker-compose.yml configurado
- [ ] Images buildadas
- [ ] Containers rodando
- [ ] Volumes montados corretamente

---

### ✅ 4. CONFIGURAÇÕES ADICIONAIS

#### 4.1 Domain & SSL
- [ ] Domain registrado
- [ ] DNS apontando para servidor
- [ ] SSL certificate instalado
- [ ] HTTPS funcionando
- [ ] Redirect HTTP → HTTPS ativo

#### 4.2 Monitoramento
- [ ] Sentry configurado
  - [ ] DSN adicionado
  - [ ] Source maps enviados
  - [ ] Alerts configurados
- [ ] Logs centralizados (Better Stack/Papertrail)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (Vercel Analytics)

#### 4.3 Email (se necessário)
- [ ] SMTP configurado (SendGrid/Mailgun)
- [ ] Templates criados
- [ ] Domínio verificado

---

### ✅ 5. SEGURANÇA

#### 5.1 Configurações
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] CSRF protection ativo
- [ ] Security headers configurados
- [ ] API routes protegidas

#### 5.2 Secrets
- [ ] Todas as secrets em variáveis de ambiente
- [ ] `.env` files não commitados
- [ ] `.gitignore` configurado corretamente
- [ ] Rotation policy para secrets (planejado)

#### 5.3 Backup
- [ ] Backup automático do banco configurado
- [ ] Teste de restore realizado
- [ ] S3 versioning ativado
- [ ] Disaster recovery plan documentado

---

### ✅ 6. PERFORMANCE

#### 6.1 Otimizações
- [ ] Images otimizadas (Next.js Image)
- [ ] Code splitting configurado
- [ ] Caching configurado
- [ ] CDN ativo (CloudFront/Vercel Edge)
- [ ] Compression ativa (gzip/brotli)

#### 6.2 Database
- [ ] Índices criados
- [ ] Queries otimizadas
- [ ] Connection pooling ativo
- [ ] Slow query log habilitado

---

### ✅ 7. TESTES PÓS-DEPLOY

#### 7.1 Health Checks
- [ ] `/api/health` retorna 200
- [ ] Database connection OK
- [ ] Redis connection OK
- [ ] S3 connection OK

#### 7.2 Smoke Tests
- [ ] Página inicial carrega (< 3s)
- [ ] Login funciona
- [ ] Upload PPTX funciona
- [ ] Render video funciona
- [ ] Analytics dashboard carrega
- [ ] Compliance validation funciona

#### 7.3 Cross-browser (manual)
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Desktop
- [ ] Chrome Mobile
- [ ] Safari Mobile

---

### ✅ 8. MONITORAMENTO PÓS-DEPLOY

#### 8.1 Primeiras 24h
- [ ] Verificar logs a cada hora
- [ ] Monitorar uso de CPU/RAM
- [ ] Verificar taxa de erro (< 1%)
- [ ] Verificar tempo de resposta (< 2s)
- [ ] Verificar uptime (> 99%)

#### 8.2 Alertas
- [ ] Alertas configurados para:
  - [ ] Erros críticos (Sentry)
  - [ ] Downtime (UptimeRobot)
  - [ ] CPU/RAM alto (Vercel/Railway)
  - [ ] Database slow queries
  - [ ] Queue backlog

---

### ✅ 9. DOCUMENTAÇÃO

#### 9.1 Interna
- [ ] Credenciais documentadas (1Password/Vault)
- [ ] Runbook criado
- [ ] Disaster recovery plan documentado
- [ ] Contatos de emergência listados

#### 9.2 Externa
- [ ] README atualizado
- [ ] CHANGELOG criado
- [ ] API docs atualizadas (se houver)
- [ ] User guides atualizados

---

### ✅ 10. ROLLBACK PLAN

#### 10.1 Preparação
- [ ] Backup pré-deploy criado
- [ ] Previous deployment URL anotada
- [ ] Rollback steps documentados

#### 10.2 Se necessário rollback
```bash
# Vercel
vercel rollback

# Railway
railway rollback

# Docker
docker-compose down
docker-compose up -d --build previous-version
```

---

## 📊 CRITÉRIOS DE SUCESSO

### Métricas Aceitáveis (24h)

| Métrica | Target | Crítico |
|---------|--------|---------|
| **Uptime** | > 99% | < 95% |
| **Response Time** | < 2s | > 5s |
| **Error Rate** | < 1% | > 5% |
| **CPU Usage** | < 70% | > 90% |
| **Memory Usage** | < 80% | > 95% |
| **Database Queries** | < 100ms | > 500ms |

---

## 🚨 PLANO DE CONTINGÊNCIA

### Se algo der errado:

1. **Avaliar gravidade**
   - Crítico: Rollback imediato
   - Alto: Hotfix em 1h
   - Médio: Fix em 4h
   - Baixo: Fix em 24h

2. **Comunicação**
   - Notificar stakeholders
   - Atualizar status page
   - Documentar incidente

3. **Resolução**
   - Identificar causa raiz
   - Aplicar fix
   - Testar completamente
   - Re-deploy

4. **Post-mortem**
   - Documentar incidente
   - Identificar melhorias
   - Atualizar runbook

---

## ✅ SIGN-OFF

### Aprovações Necessárias

- [ ] **Tech Lead**: Código revisado
- [ ] **DevOps**: Infraestrutura validada
- [ ] **QA**: Testes completos
- [ ] **Product Owner**: Funcionalidades validadas
- [ ] **Security**: Audit de segurança

---

## 🎯 DEPLOY COMMANDS

```bash
# 1. Final tests
npm run test
npm run test:e2e
npm run test:playwright

# 2. Build
npm run build

# 3. Deploy (Vercel)
vercel --prod

# 4. Verificar
curl https://seudominio.com/api/health

# 5. Smoke tests
npm run test:smoke  # (criar este script)
```

---

## 📞 CONTATOS DE EMERGÊNCIA

| Papel | Nome | Contato |
|-------|------|---------|
| **Tech Lead** | [Nome] | [Email/Phone] |
| **DevOps** | [Nome] | [Email/Phone] |
| **On-Call** | [Nome] | [Email/Phone] |

---

## 🎉 CONCLUSÃO

Quando todos os checkboxes estiverem marcados:

✅ **SISTEMA PRONTO PARA DEPLOY EM PRODUÇÃO!** 🚀

---

**Data**: _________  
**Deployed by**: _________  
**Approved by**: _________  
**Production URL**: _________

