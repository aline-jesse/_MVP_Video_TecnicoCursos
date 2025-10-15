# 🔊 CONFIGURAR TTS (TEXT-TO-SPEECH) - GUIA RÁPIDO

**Data:** 13/10/2025
**Tempo:** 30 minutos - 2 horas (depende da opção)
**Custo:** Gratuito (Azure) ou $11/mês (ElevenLabs)

---

## 📊 COMPARAÇÃO DE OPÇÕES

| Provider | Custo | Qualidade | PT-BR | Setup | Recomendação |
|----------|-------|-----------|-------|-------|--------------|
| **Azure Speech** | **Gratuito** (500k chars) | ⭐⭐⭐⭐ | ✅ Nativo | Fácil | ⭐ **MELHOR PARA MVP** |
| **ElevenLabs** | $11/mês (30k chars) | ⭐⭐⭐⭐⭐ | ✅ Excelente | Muito fácil | ⭐ **MELHOR QUALIDADE** |
| **Google TTS** | Gratuito (4M chars) | ⭐⭐⭐⭐ | ✅ Bom | Médio | ⭐ ALTERNATIVA |

---

## 🚀 OPÇÃO A: AZURE SPEECH (RECOMENDADO - GRATUITO)

### Por que Azure?
- ✅ **500.000 caracteres/mês GRATUITOS**
- ✅ Qualidade profissional
- ✅ Vozes em português brasileiro (PT-BR)
- ✅ Suporte SSML avançado
- ✅ Baixa latência
- ✅ Confiável (Microsoft)

### Tempo: 30 minutos

---

### PASSO 1: Criar Conta Azure (5 min)

1. Acessar: https://azure.microsoft.com/free/
2. Clicar "Começar gratuitamente"
3. Fazer login com Microsoft Account (ou criar uma)
4. Preencher dados do cartão (não será cobrado)
5. ✅ Conta criada!

**Notas:**
- Você ganha $200 em créditos por 30 dias
- Serviços gratuitos por 12 meses
- Serviços sempre gratuitos (incluindo Speech)

---

### PASSO 2: Criar Recurso Speech Services (10 min)

1. **Ir para Portal Azure:**
   - https://portal.azure.com

2. **Criar Recurso:**
   - Clicar "+ Create a resource"
   - Buscar "Speech Services"
   - Clicar "Create"

3. **Configurar:**
   ```
   Subscription:        Sua assinatura
   Resource group:      Criar novo "treinx-resources"
   Region:              Brazil South (recomendado)
   Name:                treinx-speech-service
   Pricing tier:        Free F0 (500k chars/mês)
   ```

4. **Criar:**
   - Clicar "Review + create"
   - Aguardar validação
   - Clicar "Create"
   - Aguardar deployment (2-3 minutos)

5. ✅ **Recurso criado!**

---

### PASSO 3: Obter Chaves de API (5 min)

1. **Ir para o recurso criado:**
   - No portal, ir para "All resources"
   - Clicar em "treinx-speech-service"

2. **Obter chaves:**
   - No menu lateral, clicar "Keys and Endpoint"
   - Copiar:
     - **KEY 1** (ou KEY 2)
     - **LOCATION/REGION** (ex: brazilsouth)

3. ✅ **Chaves obtidas!**

---

### PASSO 4: Configurar no Projeto (5 min)

1. **Abrir arquivo `.env`:**
   ```
   c:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\.env
   ```

2. **Adicionar as chaves:**
   ```bash
   # ============================================
   # 🔊 AZURE SPEECH TTS
   # ============================================
   AZURE_SPEECH_KEY=sua-chave-key1-aqui
   AZURE_SPEECH_REGION=brazilsouth
   ```

3. **Salvar arquivo**

4. ✅ **Configurado!**

---

### PASSO 5: Testar (5 min)

1. **Reiniciar servidor:**
   ```powershell
   # Se estiver rodando, Ctrl+C para parar
   cd estudio_ia_videos
   npm run dev
   ```

2. **Testar no sistema:**
   - Abrir: http://localhost:3000
   - Criar/abrir projeto
   - Adicionar slide com texto
   - Gerar preview de áudio
   - ✅ Deve funcionar!

---

### Vozes Azure Recomendadas (PT-BR):

```typescript
// Femininas:
'pt-BR-FranciscaNeural'  // Formal, clara
'pt-BR-ThalitaNeural'    // Jovem, amigável
'pt-BR-BrendaNeural'     // Natural, conversacional

// Masculinas:
'pt-BR-AntonioNeural'    // Profissional, confiável
'pt-BR-DonatoNeural'     // Grave, autoritário
'pt-BR-FabioNeural'      // Natural, amigável
```

**Teste online:** https://speech.microsoft.com/portal/voicegallery

---

## 🎵 OPÇÃO B: ELEVENLABS (MELHOR QUALIDADE)

### Por que ElevenLabs?
- ✅ **Melhor qualidade do mercado**
- ✅ Vozes ultra-realistas
- ✅ Controle emocional
- ✅ Voice cloning (planos pagos)
- ✅ API simples
- ❌ Pago ($11/mês)

### Tempo: 30 minutos

---

### PASSO 1: Criar Conta (5 min)

1. Acessar: https://elevenlabs.io/
2. Clicar "Get Started Free"
3. Criar conta (email + senha)
4. Verificar email
5. ✅ Conta criada!

**Planos:**
- **Free:** 10k caracteres/mês (teste)
- **Starter:** $5/mês (30k chars) ⭐
- **Creator:** $22/mês (100k chars)
- **Pro:** $99/mês (500k chars)

---

### PASSO 2: Obter API Key (2 min)

1. **Ir para Profile:**
   - Clicar no avatar (canto superior direito)
   - Clicar "Profile"

2. **Copiar API Key:**
   - Na seção "API Key"
   - Clicar "Copy" ou revelar e copiar
   - ✅ Chave copiada!

---

### PASSO 3: Explorar Vozes (10 min)

1. **Ir para Voice Library:**
   - https://elevenlabs.io/voice-library

2. **Buscar vozes em português:**
   - Filtrar por idioma: "Portuguese"
   - Testar diferentes vozes
   - Anotar IDs das vozes favoritas

**Vozes recomendadas:**
- Masculinas: Professional, deep, confident
- Femininas: Clear, friendly, warm

---

### PASSO 4: Configurar no Projeto (3 min)

1. **Abrir `.env`:**
   ```bash
   # ============================================
   # 🔊 ELEVENLABS TTS
   # ============================================
   ELEVENLABS_API_KEY=sua-chave-aqui
   ```

2. **Salvar e reiniciar servidor**

3. ✅ **Configurado!**

---

### PASSO 5: Testar (5 min)

Mesmo processo do Azure acima.

---

## 🌐 OPÇÃO C: GOOGLE CLOUD TTS

### Por que Google?
- ✅ **4 milhões caracteres/mês GRATUITOS**
- ✅ Qualidade muito boa
- ✅ Muitas vozes PT-BR
- ❌ Setup mais complexo

### Tempo: 1-2 horas

---

### PASSO 1: Criar Conta Google Cloud (10 min)

1. Acessar: https://cloud.google.com/
2. Clicar "Get started for free"
3. Fazer login Google
4. Preencher dados cartão (sem cobrança no plano gratuito)
5. ✅ Conta criada ($300 em créditos)

---

### PASSO 2: Criar Projeto (5 min)

1. Ir para: https://console.cloud.google.com/
2. Clicar no seletor de projetos (topo)
3. Clicar "New Project"
4. Nome: "TreinX Videos"
5. Criar
6. ✅ Projeto criado!

---

### PASSO 3: Ativar API (5 min)

1. **No console, buscar:**
   - "Cloud Text-to-Speech API"

2. **Ativar:**
   - Clicar "Enable"
   - Aguardar ativação
   - ✅ API ativada!

---

### PASSO 4: Criar Credenciais (15 min)

1. **Ir para Credentials:**
   - https://console.cloud.google.com/apis/credentials

2. **Criar API Key:**
   - Clicar "+ CREATE CREDENTIALS"
   - Selecionar "API key"
   - Copiar a chave
   - ✅ Chave criada!

3. **Restringir (Recomendado):**
   - Clicar na chave criada
   - Em "API restrictions":
     - Selecionar "Restrict key"
     - Marcar apenas "Cloud Text-to-Speech API"
   - Salvar

---

### PASSO 5: Configurar no Projeto (3 min)

```bash
# ============================================
# 🔊 GOOGLE CLOUD TTS
# ============================================
GOOGLE_TTS_API_KEY=sua-chave-aqui
GOOGLE_PROJECT_ID=seu-project-id-aqui
```

---

## 🧪 TESTAR CONFIGURAÇÃO

### Script de Teste Manual:

```javascript
// Criar arquivo: test-tts.js
const { TTSMultiProvider } = require('./estudio_ia_videos/app/lib/tts/tts-multi-provider');

async function test() {
  const tts = TTSMultiProvider.getInstance();

  console.log('🧪 Testando TTS...');

  const result = await tts.synthesize({
    text: 'Olá! Este é um teste do sistema de narração em português brasileiro.',
    provider: 'auto', // Tenta todos os providers configurados
    voice: 'pt-BR-FranciscaNeural', // Azure
    language: 'pt-BR'
  });

  if (result.success) {
    console.log('✅ TTS funcionando!');
    console.log('   Provider usado:', result.provider);
    console.log('   Áudio URL:', result.audioUrl);
    console.log('   Duração:', result.duration, 'segundos');
  } else {
    console.log('❌ Erro:', result.error);
  }
}

test();
```

**Executar:**
```bash
node test-tts.js
```

---

## 🎯 RECOMENDAÇÃO FINAL

### Para MVP / Desenvolvimento:
**👉 Use AZURE SPEECH (Gratuito)**
- Setup mais rápido
- Qualidade profissional
- 500k chars/mês grátis

### Para Produção:
**👉 Use ELEVENLABS ($11/mês)**
- Melhor qualidade do mercado
- Vozes ultra-realistas
- Vale cada centavo

### Para Escala Grande:
**👉 Use GOOGLE CLOUD**
- 4M chars/mês grátis
- Depois: $4 por 1M chars

---

## 💡 DICAS IMPORTANTES

### 1. **Configuração Múltipla (Fallback):**
Configure todos os 3 providers no `.env`:
```bash
AZURE_SPEECH_KEY=...
ELEVENLABS_API_KEY=...
GOOGLE_TTS_API_KEY=...
```

O sistema tentará automaticamente:
1. ElevenLabs (melhor qualidade)
2. Azure (fallback)
3. Google (último recurso)

### 2. **Cache de Áudio:**
O sistema cacheia áudios gerados para economizar:
- Mesmo texto + mesma voz = reutiliza áudio
- Economiza tempo e custos

### 3. **Preview antes de gerar:**
Teste as vozes antes de gerar vídeos completos:
- Use botão "Preview Voice" no editor
- Experimente diferentes vozes
- Ajuste velocidade e tom

### 4. **SSML para controle avançado:**
```xml
<speak>
  <prosody rate="slow" pitch="+5%">
    Texto com velocidade lenta e tom mais agudo
  </prosody>
  <break time="500ms"/>
  <emphasis level="strong">Palavra enfatizada</emphasis>
</speak>
```

---

## 🔗 LINKS ÚTEIS

### Azure:
- **Portal:** https://portal.azure.com
- **Docs:** https://learn.microsoft.com/azure/cognitive-services/speech-service/
- **Voice Gallery:** https://speech.microsoft.com/portal/voicegallery
- **Pricing:** https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/

### ElevenLabs:
- **Dashboard:** https://elevenlabs.io/app
- **Voice Library:** https://elevenlabs.io/voice-library
- **Docs:** https://docs.elevenlabs.io/
- **Pricing:** https://elevenlabs.io/pricing

### Google Cloud:
- **Console:** https://console.cloud.google.com/
- **TTS Docs:** https://cloud.google.com/text-to-speech/docs
- **Voice List:** https://cloud.google.com/text-to-speech/docs/voices
- **Pricing:** https://cloud.google.com/text-to-speech/pricing

---

## ✅ CHECKLIST

- [ ] Escolher provider (Azure/ElevenLabs/Google)
- [ ] Criar conta no provider
- [ ] Obter API Key
- [ ] Adicionar no `.env`
- [ ] Reiniciar servidor
- [ ] Testar no sistema
- [ ] Testar diferentes vozes
- [ ] Validar qualidade do áudio
- [ ] ✅ TTS configurado e funcionando!

---

## 🆘 PROBLEMAS COMUNS

### "API Key inválida"
- Verificar se copiou a chave completa
- Verificar se não tem espaços extras
- Regenerar chave no dashboard

### "Voice not found"
- Verificar se o voice ID está correto
- Verificar se a voz existe no provider
- Usar voice ID padrão primeiro

### "Quota exceeded"
- Verificar uso no dashboard do provider
- Aguardar reset mensal
- Ou fazer upgrade do plano

### "Audio não toca"
- Verificar console do navegador
- Verificar formato de áudio suportado
- Verificar se URL está acessível

---

**Próximo passo:** Testar geração de vídeo completo com narração! 🎬

**Documentação relacionada:**
- [COMECE_AQUI_AGORA.md](COMECE_AQUI_AGORA.md)
- [O_QUE_FALTA_PARA_VIDEOS_REAIS.md](O_QUE_FALTA_PARA_VIDEOS_REAIS.md)
