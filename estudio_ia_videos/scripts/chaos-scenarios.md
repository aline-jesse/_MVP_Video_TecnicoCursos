
# Chaos Engineering Scenarios - Sprint 40
# Estúdio IA de Vídeos - Resilience Testing

## Objetivos
Validar resiliência do sistema através de injeção controlada de falhas. O sistema deve auto-recuperar em < 2 minutos sem perda de dados.

## Ferramentas
- **Chaos Mesh** (Kubernetes)
- **Gremlin** (Cloud platform)
- **Custom scripts** (manual injection)

## Princípios
1. **Hypothesis-driven**: Definir hipótese antes de cada experimento
2. **Minimize blast radius**: Começar com scope limitado
3. **Automated rollback**: Rollback automático se critérios não atendidos
4. **Real-time monitoring**: Observar métricas durante experimento

---

## Cenário 1: Worker Pod Failures

### Hipótese
"Sistema continua processando jobs mesmo com 20% dos workers indisponíveis"

### Ação
- Matar 2 de 10 worker pods randomicamente
- Duração: 5 minutos
- Recovery: Pods são recriados automaticamente

### Métricas a Observar
- Queue depth (não deve crescer exponencialmente)
- Job latency (pode aumentar mas < 2x baseline)
- Error rate (< 5%)
- Auto-scaling: novos pods devem subir em < 2 min

### Critérios de Sucesso
✅ Nenhum job perdido  
✅ Queue processada em < 5 min após recovery  
✅ Novos pods healthy em < 2 min  
✅ Usuários não percebem interrupção

### Implementação
```yaml
# chaos-worker-failure.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: worker-failure
spec:
  action: pod-kill
  mode: fixed-percent
  value: "20"
  selector:
    labelSelectors:
      app: render-worker
  scheduler:
    cron: "@every 5m"
```

---

## Cenário 2: Database Connection Loss

### Hipótese
"Sistema degrada gracefully quando conexão com DB é perdida e recupera automaticamente"

### Ação
- Simular perda de conexão do DB por 30 segundos
- Testar com connection pool saturado
- Recovery: Reconectar automaticamente

### Métricas a Observar
- API error rate (deve usar cache quando possível)
- Connection pool health
- Recovery time
- Data consistency após recovery

### Critérios de Sucesso
✅ Leituras servidas por cache  
✅ Escritas enfileiradas e processadas após recovery  
✅ Reconexão automática em < 10s  
✅ Zero data loss

### Implementação
```javascript
// chaos-db-disconnect.js
const chaos = require('./lib/chaos');

async function simulateDbDisconnect() {
  console.log('Simulating DB disconnect...');
  
  // Fechar todas as conexões
  await chaos.disconnectDatabase();
  
  // Aguardar 30s
  await sleep(30000);
  
  // Permitir reconexão
  console.log('Allowing reconnection...');
  await chaos.reconnectDatabase();
  
  // Validar recovery
  await chaos.validateRecovery();
}
```

---

## Cenário 3: Redis Cache Failure

### Hipótese
"Sistema continua operando sem cache, com degradação aceitável de performance"

### Ação
- Derrubar Redis por 2 minutos
- Testar leitura/escrita durante outage
- Recovery: Redis volta online automaticamente

### Métricas a Observar
- Cache hit rate (deve ir a 0%)
- Database load (deve aumentar)
- API latency (pode aumentar 2-3x)
- Error rate (deve permanecer < 5%)

### Critérios de Sucesso
✅ Nenhum 500 error  
✅ Fallback para DB funciona  
✅ Cache warm-up após recovery < 1 min  
✅ Performance volta ao normal em < 2 min

---

## Cenário 4: TTS Provider Outage

### Hipótese
"Sistema faz failover automático para provider secundário quando primário falha"

### Ação
- Simular ElevenLabs indisponível (503 errors)
- Duração: 3 minutos
- Observar failover para Azure TTS

### Métricas a Observar
- TTS success rate
- Provider switching time
- User-facing errors
- Queue backup

### Critérios de Sucesso
✅ Failover automático para Azure em < 10s  
✅ Jobs continuam processando  
✅ Taxa de sucesso > 95%  
✅ Usuários notificados de provider switch

### Implementação
```javascript
// chaos-tts-provider-failure.js
const { TTSProviderManager } = require('./lib/tts');

async function simulateProviderFailure() {
  // Mock ElevenLabs para retornar 503
  TTSProviderManager.mockProvider('elevenlabs', {
    status: 503,
    duration: 180000, // 3 min
  });
  
  // Disparar job de TTS
  const job = await TTSProviderManager.generateTTS({
    text: 'Test chaos engineering',
    provider: 'elevenlabs',
  });
  
  // Validar failover
  assert(job.actualProvider === 'azure');
  assert(job.success === true);
}
```

---

## Cenário 5: Network Partition

### Hipótese
"Componentes isolados por network partition continuam operando e reconciliam estado após recovery"

### Ação
- Particionar rede entre API e workers
- Duração: 1 minuto
- Recovery: Rede restaurada

### Métricas a Observar
- Job assignment (deve falhar gracefully)
- Retry behavior
- State reconciliation
- Split-brain scenarios

### Critérios de Sucesso
✅ Nenhum job duplicado  
✅ Estado consistente após recovery  
✅ Retry exponential backoff funciona  
✅ No split-brain

---

## Cenário 6: Resource Exhaustion

### Hipótese
"Sistema rejeita requisições gracefully quando recursos estão esgotados"

### Ação
- Saturar CPU a 95%
- Saturar memória a 90%
- Duração: 2 minutos

### Métricas a Observar
- Response codes (deve retornar 503 ao invés de crash)
- OOMKilled events
- Recovery time
- Rate limiting

### Critérios de Sucesso
✅ HTTP 503 retornado quando overloaded  
✅ Nenhum crash/restart  
✅ Rate limiting ativado  
✅ Recovery automático quando recursos liberados

### Implementação
```javascript
// chaos-resource-exhaustion.js
const chaos = require('./lib/chaos');

async function exhaustResources() {
  // CPU stress
  chaos.stressCPU(95, 120000); // 95% por 2 min
  
  // Memory stress
  chaos.stressMemory(90, 120000); // 90% por 2 min
  
  // Fazer requisições e validar
  const responses = await chaos.makeRequests(100);
  
  // Verificar rate limiting
  const rateLimited = responses.filter(r => r.status === 503);
  assert(rateLimited.length > 0);
}
```

---

## Cenário 7: Storage Failure (S3)

### Hipótese
"Sistema enfileira uploads quando S3 está indisponível e processa após recovery"

### Ação
- Simular S3 retornando 500 errors
- Tentar upload de PPTX
- Recovery: S3 volta após 1 min

### Métricas a Observar
- Upload success rate
- Queue depth
- Retry behavior
- User messaging

### Critérios de Sucesso
✅ Uploads enfileirados automaticamente  
✅ Processados após recovery  
✅ Usuário informado do status  
✅ Nenhum arquivo perdido

---

## Cenário 8: Cascading Failures

### Hipótese
"Circuit breakers previnem cascading failures quando serviços downstream falham"

### Ação
- Derrubar TTS provider
- Derrubar Redis
- Sobrecarga de DB
- Tudo simultaneamente por 30s

### Métricas a Observar
- Circuit breaker states (deve abrir)
- Error propagation
- Service isolation
- Recovery cascade

### Critérios de Sucesso
✅ Circuit breakers abrem em < 5s  
✅ Falhas não se propagam  
✅ Serviços independentes continuam operando  
✅ Recovery ordenado e controlado

---

## Cenário 9: Deployment Chaos

### Hipótese
"Rolling updates não causam downtime perceptível"

### Ação
- Deploy nova versão durante carga
- Matar pods antigos progressivamente
- Validar zero downtime

### Métricas a Observar
- Request error rate durante deploy
- Connection draining
- Pod readiness checks
- User impact

### Critérios de Sucesso
✅ Zero downtime  
✅ Error rate < 0.1% durante deploy  
✅ Rollback automático se error rate > 1%  
✅ Deploy completo em < 5 min

---

## Cenário 10: Multi-Region Failure

### Hipótese
"Sistema faz failover para região secundária quando região primária falha"

### Ação
- Simular falha de região inteira
- Testar DNS failover
- Validar data replication

### Métricas a Observar
- DNS TTL e propagação
- Failover time
- Data consistency
- User redirection

### Critérios de Sucesso
✅ Failover automático em < 2 min  
✅ Data loss < 5 min RPO  
✅ Usuários redirecionados automaticamente  
✅ Read-only mode durante failover

---

## Execução e Validação

### Checklist Pré-Experimento
- [ ] Monitoramento ativo (Grafana dashboards)
- [ ] Alertas configurados
- [ ] Rollback procedure documentado
- [ ] Stakeholders notificados
- [ ] Janela de manutenção (se necessário)

### Durante Experimento
- [ ] Observar métricas em tempo real
- [ ] Documentar comportamento observado
- [ ] Anotar desvios da hipótese
- [ ] Preparar rollback se necessário

### Pós-Experimento
- [ ] Validar critérios de sucesso
- [ ] Documentar lessons learned
- [ ] Criar tickets para issues encontrados
- [ ] Atualizar runbooks
- [ ] Compartilhar resultados com equipe

---

## Relatório de Chaos

Template para documentar cada experimento:

```markdown
# Chaos Experiment Report

**Experiment**: [Nome]
**Date**: [Data]
**Duration**: [Duração]
**Executed by**: [Nome]

## Hypothesis
[Hipótese testada]

## Actions Taken
[Descrição detalhada das ações]

## Results
[Métricas observadas]

## Validation
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério N

## Lessons Learned
[O que aprendemos]

## Action Items
1. [Issue #123] Fix circuit breaker timeout
2. [Issue #124] Improve retry logic
...

## Conclusion
[Conclusão: experimento passou/falhou]
```

---

## Próximos Passos

1. **Setup**
   - Instalar Chaos Mesh / Gremlin
   - Configurar monitoring
   - Criar ambiente de staging isolado

2. **Execution**
   - Executar cenários progressivamente
   - Começar com blast radius pequeno
   - Aumentar complexidade gradualmente

3. **Iteration**
   - Implementar fixes
   - Re-executar experimentos
   - Adicionar novos cenários baseados em learnings

4. **Automation**
   - Automatizar execução regular
   - Integrar com CI/CD
   - Game days mensais
