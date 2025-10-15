
# 🚀 GO-LIVE CHECKLIST — Estúdio IA de Vídeos

**Sprint 30-31 — Production Deployment**  
**Data**: 2 de Outubro de 2025  
**Versão**: 4.0.0 (Production)

---

## 📋 PRÉ-DEPLOYMENT

### 1. Code Quality & Build
- [x] Build sem erros (`yarn build`)
- [x] TypeScript sem erros (`tsc --noEmit`)
- [x] ESLint aprovado (`yarn lint`)
- [x] Testes E2E passando (Playwright)
- [x] Code review completo

### 2. Security
- [x] Rate limiting implementado (60 req/min)
- [x] CORS configurado (origins permitidos)
- [x] CSRF protection habilitado
- [x] Security headers configurados (Helmet)
- [x] `yarn audit` sem vulnerabilidades críticas
- [x] Secrets não commitados (`.env` no `.gitignore`)

### 3. Infrastructure
- [x] Redis configurado e testado
- [x] Database migrations aplicadas
- [x] S3/Cloud storage configurado
- [x] CDN configurado (Cloudflare)
- [x] Domain DNS configurado
- [x] SSL/TLS certificates válidos

### 4. Observability
- [x] Sentry DSN configurado
- [x] Logging estruturado implementado
- [x] Health checks funcionando (`/api/health`)
- [x] Metrics endpoint ativo (`/api/metrics`)
- [x] Error tracking habilitado
- [x] Performance monitoring ativo

### 5. External Services
- [x] ElevenLabs API key válida e com créditos
- [x] Azure Speech API key válida
- [x] Google Cloud TTS configurado
- [x] AWS S3 credentials configuradas
- [x] Rate limits das APIs externas verificados

---

## 🚀 DEPLOYMENT

### 1. Environment Variables
```bash
# Production .env checklist
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://treinx.abacusai.app

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://treinx.abacusai.app
NEXTAUTH_SECRET=<strong-secret>

# Redis
REDIS_URL=redis://...
REDIS_PASSWORD=<password>

# Observability
SENTRY_DSN=https://...

# TTS Providers
AZURE_SPEECH_KEY=<key>
AZURE_SPEECH_REGION=<region>
ELEVENLABS_API_KEY=<key>
GOOGLE_CLOUD_API_KEY=<key>

# AWS
AWS_BUCKET_NAME=<bucket>
AWS_FOLDER_PREFIX=production/
AWS_REGION=us-east-1

# CDN
CDN_URL=https://cdn.treinx.abacusai.app
```

### 2. CI/CD Pipeline
- [x] GitHub Actions configurado
- [x] Staging environment deploy automático
- [x] Production deploy com aprovação manual
- [x] Healthcheck pós-deploy
- [x] Rollback automático em caso de falha

### 3. Monitoring Setup
- [x] Sentry project criado
- [x] Alerts configurados (critical errors)
- [x] Uptime monitoring ativo
- [x] Performance thresholds definidos

---

## ✅ PÓS-DEPLOYMENT

### 1. Smoke Tests
- [ ] Homepage carrega (< 3s)
- [ ] Login/signup funcionando
- [ ] Upload PPTX funciona
- [ ] Editor Canvas carrega
- [ ] TTS gera áudio
- [ ] Render de vídeo funciona
- [ ] Download funciona
- [ ] Analytics dashboard carrega

### 2. Performance Validation
- [ ] LCP < 2.5s (Core Web Vitals)
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] CDN HIT rate > 80%
- [ ] API response time < 500ms (p95)

### 3. Security Validation
- [ ] Rate limiting bloqueando após limite
- [ ] CORS bloqueando origens inválidas
- [ ] Security headers presentes (verificar headers)
- [ ] No console errors relacionados a segurança

### 4. Observability Validation
- [ ] Sentry recebendo eventos
- [ ] Logs estruturados sendo gerados
- [ ] Health check retornando 200
- [ ] Metrics endpoint funcional

### 5. Real-time Collaboration
- [ ] WebSocket conectando
- [ ] Presença de usuários funcionando
- [ ] Seleção de slides sincronizando
- [ ] Cursores remotos aparecendo

---

## 🚨 ROLLBACK PLAN

### Triggers para Rollback
1. Error rate > 5% por 5 minutos
2. Health check falhando
3. Response time p95 > 3s
4. Critical errors no Sentry (> 10/min)

### Procedimento de Rollback
```bash
# 1. Reverter deploy no CI/CD
git revert <commit-sha>
git push origin main

# 2. Ou voltar para última release estável
gh release list
gh release download <version>

# 3. Re-deploy
./deploy.sh --version <stable-version>

# 4. Validar
curl https://treinx.abacusai.app/api/health
```

---

## 📊 SUCCESS CRITERIA

### Métricas de Sucesso (Primeiras 24h)
- ✅ Uptime > 99.5%
- ✅ Error rate < 1%
- ✅ Average response time < 500ms
- ✅ No critical errors
- ✅ Zero security incidents
- ✅ Conversão upload→download > 60%

---

## 📞 ESCALATION

### Nível 1 (Warnings)
- Monitorar via Sentry dashboard
- Verificar logs estruturados

### Nível 2 (Errors)
- Alert automático via Sentry
- Investigar root cause
- Aplicar hotfix se necessário

### Nível 3 (Critical)
- Notification imediata (email/slack)
- Executar rollback se necessário
- Post-mortem obrigatório

---

## 📝 NOTES

- **Last Updated**: 2025-10-02
- **Responsible**: DevOps Team
- **Status**: ✅ READY FOR PRODUCTION
- **Next Review**: 2025-10-09 (Sprint 32)

---

**Aprovações Necessárias:**
- [ ] Tech Lead
- [ ] DevOps Lead
- [ ] Product Owner
- [ ] Security Team

---
