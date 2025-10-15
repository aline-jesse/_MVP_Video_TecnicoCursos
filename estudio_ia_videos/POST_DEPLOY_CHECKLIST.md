# ✅ POST-DEPLOY CHECKLIST

**Execute esta checklist imediatamente após o deploy**

---

## 🔍 VALIDAÇÃO IMEDIATA (5 min)

### 1. Health Check
```bash
curl https://treinx.abacusai.app/api/health
```
**Esperado**: `{"status":"ok","timestamp":"..."}`

### 2. Homepage
```bash
# Abrir no browser:
https://treinx.abacusai.app
```
**Esperado**: Página carrega normalmente

### 3. Core Routes
- [ ] https://treinx.abacusai.app/dashboard
- [ ] https://treinx.abacusai.app/projects
- [ ] https://treinx.abacusai.app/templates
- [ ] https://treinx.abacusai.app/editor

### 4. Autenticação
- [ ] Criar nova conta
- [ ] Fazer login
- [ ] Acessar dashboard

---

## 🧪 TESTE FUNCIONAL (10 min)

### Fluxo Completo
1. [ ] Login com sucesso
2. [ ] Criar novo projeto
3. [ ] Selecionar template NR
4. [ ] Editar slides no editor
5. [ ] Adicionar áudio TTS
6. [ ] Preview do vídeo
7. [ ] Export/download

### Features Enterprise
- [ ] Multi-org: Criar organização
- [ ] White-label: Testar branding
- [ ] Colaboração: Adicionar comentário
- [ ] Analytics: Visualizar dashboard

---

## 📊 MONITORAMENTO (Ongoing)

### Dashboards
```bash
# Admin panel
https://treinx.abacusai.app/admin

# Analytics
https://treinx.abacusai.app/dashboard/analytics

# System health
https://treinx.abacusai.app/api/health
```

### Logs
- [ ] Acessar painel Abacus
- [ ] Verificar logs de errors
- [ ] Monitorar performance
- [ ] Validar uptime

### Métricas Críticas
- [ ] Response time < 1s
- [ ] Error rate < 1%
- [ ] Uptime > 99%
- [ ] Memory usage OK

---

## ⚙️ CONFIGURAÇÃO OPCIONAL (30 min)

### Redis (Recomendado)
1. [ ] Criar conta: https://upstash.com
2. [ ] Criar database Redis
3. [ ] Copiar REDIS_URL
4. [ ] Adicionar no painel Abacus → Env Vars
5. [ ] Redeploy (opcional)
6. [ ] Testar: `curl /api/health` → `"redis":"connected"`

### Stripe (Quando necessário)
1. [ ] Criar conta: https://stripe.com
2. [ ] Dashboard → Developers → API keys
3. [ ] Copiar STRIPE_SECRET_KEY e STRIPE_PUBLIC_KEY
4. [ ] Configurar webhook: `https://treinx.abacusai.app/api/webhooks/stripe`
5. [ ] Adicionar keys no painel Abacus
6. [ ] Redeploy (opcional)
7. [ ] Testar: Criar subscription de teste

---

## 🚨 TROUBLESHOOTING

### App não carrega
1. Verificar URL: https://treinx.abacusai.app
2. Verificar logs no painel Abacus
3. Testar health: `/api/health`
4. Verificar DNS e SSL

### Health check falha
1. Aguardar 2-3 minutos (deploy finalizando)
2. Verificar logs de erro
3. Tentar redeploy se necessário

### Features não funcionam
1. Verificar console do browser (F12)
2. Verificar network tab
3. Reportar erro específico
4. Incluir logs e screenshots

---

## 📞 SUPORTE

### Emergência (P0)
- Sistema completamente fora do ar
- Perda de dados
- Vulnerabilidade crítica

**Ação**: Reportar imediatamente com logs completos

### Bugs (P1/P2)
- Features não funcionam como esperado
- Problemas de performance
- Issues de UX

**Ação**: Criar issue detalhado para próximo sprint

### Dúvidas
- Configuração Redis/Stripe
- Uso de features
- Documentação

**Ação**: Consultar `/qa/GO_LIVE_INDEX.md` ou support@treinx.com

---

## ✅ CHECKLIST COMPLETO

Marque quando completar:

**Validação Imediata**
- [ ] Health check OK
- [ ] Homepage carregando
- [ ] Core routes acessíveis
- [ ] Login funciona

**Teste Funcional**
- [ ] Fluxo completo testado
- [ ] Features enterprise OK
- [ ] Nenhum erro crítico

**Monitoramento**
- [ ] Dashboards acessíveis
- [ ] Logs monitorados
- [ ] Métricas normais

**Configuração (Opcional)**
- [ ] Redis configurado (ou não necessário agora)
- [ ] Stripe configurado (ou não necessário agora)

---

## 🎉 DEPLOY COMPLETO!

Quando todos os itens acima estiverem OK:

✅ **Sistema em produção e funcionando perfeitamente!**

---

**Data**: ___/___/___  
**Validado por**: _______________  
**Status**: 🟢 PRODUÇÃO ATIVA
