# 🚀 QUICK START - Sistema TTS

Guia rápido para começar a usar o sistema TTS Multi-Provider.

---

## ⚡ Setup Rápido (5 minutos)

### 1. Configurar Variáveis de Ambiente

```bash
# .env.local

# ElevenLabs (Primary Provider)
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

# Azure Speech (Fallback Provider)
AZURE_SPEECH_KEY=xxxxxxxxxxxxxxxxxxxxx
AZURE_SPEECH_REGION=brazilsouth

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxx
```

### 2. Obter API Keys

#### ElevenLabs (Gratuito - 10K chars/mês)

1. Acesse [elevenlabs.io](https://elevenlabs.io)
2. Crie uma conta gratuita
3. Vá em Profile → API Key
4. Copie a chave

#### Azure Speech (Gratuito - 500K chars/mês)

1. Acesse [Azure Portal](https://portal.azure.com)
2. Crie um recurso "Speech Services"
3. Escolha região "Brazil South"
4. Copie a chave em "Keys and Endpoint"

### 3. Aplicar Schema SQL

```sql
-- Execute no Supabase SQL Editor

-- Tabela de cache TTS
CREATE TABLE IF NOT EXISTS tts_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('elevenlabs', 'azure')),
  voice_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  characters INTEGER NOT NULL,
  duration NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tts_cache_key ON tts_cache(cache_key);
CREATE INDEX idx_tts_cache_provider ON tts_cache(provider);
CREATE INDEX idx_tts_cache_voice ON tts_cache(voice_id);

ALTER TABLE tts_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read TTS cache" ON tts_cache
  FOR SELECT USING (true);

-- Adicionar campos de créditos TTS
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS tts_credits_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tts_credits_limit INTEGER NOT NULL DEFAULT 10000;
```

### 4. Criar Bucket de Storage

```sql
-- No Supabase Dashboard > Storage > Create Bucket

Bucket name: audio
Public: Yes
```

### 5. Instalar Dependências

```bash
npm install undici microsoft-cognitiveservices-speech-sdk
```

---

## 💻 Uso Básico

### Exemplo 1: Componente React

```tsx
import { TTSGenerator } from '@/components/tts/tts-generator'

export default function MyPage() {
  const slideText = `
    Bem-vindo ao treinamento de NR-35.
    Hoje vamos aprender sobre trabalho em altura.
  `

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Gerar Narração
      </h1>
      
      <TTSGenerator
        text={slideText}
        projectId="project-123"
        slideId="slide-456"
        onAudioGenerated={(url, audioData) => {
          console.log('Audio generated:', url)
          // Usar áudio no pipeline de vídeo
        }}
      />
    </div>
  )
}
```

### Exemplo 2: API Direta

```typescript
// POST /api/tts/generate

const response = await fetch('/api/tts/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Texto para narração',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam (ElevenLabs)
    provider: 'elevenlabs',
    stability: 0.5,
    similarityBoost: 0.75,
    projectId: 'project-123',
    slideId: 'slide-456',
  }),
})

const data = await response.json()
console.log('Audio URL:', data.data.audioUrl)
console.log('Characters:', data.data.characters)
console.log('From cache:', data.data.fromCache)
```

### Exemplo 3: Listar Vozes

```typescript
// GET /api/tts/generate?provider=elevenlabs

const response = await fetch('/api/tts/generate?provider=elevenlabs')
const data = await response.json()

data.data.forEach(voice => {
  console.log(`${voice.name} (${voice.voiceId})`)
})
```

### Exemplo 4: Verificar Créditos

```typescript
// GET /api/tts/credits

const response = await fetch('/api/tts/credits')
const data = await response.json()

console.log('Used:', data.data.user.used)
console.log('Limit:', data.data.user.limit)
console.log('Remaining:', data.data.user.remaining)
```

---

## 🎙️ Vozes Recomendadas

### Português (ElevenLabs)

```typescript
import { RECOMMENDED_VOICES } from '@/lib/tts/providers/elevenlabs'

// Usar voz Adam (masculina, profunda)
const voiceId = RECOMMENDED_VOICES.adam
```

### Português (Azure)

```typescript
import { AZURE_RECOMMENDED_VOICES } from '@/lib/tts/providers/azure'

// Usar voz Francisca (feminina, clara)
const voiceId = AZURE_RECOMMENDED_VOICES.francisca
```

---

## 🔧 Configuração Avançada

### Personalizar Stability (ElevenLabs)

```typescript
const result = await fetch('/api/tts/generate', {
  method: 'POST',
  body: JSON.stringify({
    text: 'Texto',
    voiceId: 'voice-id',
    stability: 0.7,        // 0-1 (maior = mais consistente)
    similarityBoost: 0.8,  // 0-1 (maior = mais próximo original)
  }),
})
```

### Personalizar Rate/Pitch (Azure)

```typescript
const result = await fetch('/api/tts/generate', {
  method: 'POST',
  body: JSON.stringify({
    text: 'Texto',
    voiceId: 'pt-BR-FranciscaNeural',
    provider: 'azure',
    rate: '+10%',   // -50% a +50%
    pitch: '-5%',   // -50% a +50%
  }),
})
```

---

## 🧪 Testar Sistema

```bash
# Executar testes
npm test __tests__/lib/tts/tts.test.ts

# Output esperado:
# ✓ deve gerar áudio com sucesso
# ✓ deve retornar lista de vozes
# ✓ deve obter informações de assinatura
# ✓ deve validar API key
# ✓ deve dividir texto longo
# ... (15 testes total)
```

---

## 🐛 Troubleshooting

### Erro: "Unauthorized"

```bash
# Verificar autenticação Supabase
# Fazer login antes de chamar API
```

### Erro: "TTS credits limit reached"

```sql
-- Resetar créditos (admin)
UPDATE user_profiles 
SET tts_credits_used = 0 
WHERE id = 'user-id';
```

### Erro: "Failed to generate audio"

```bash
# 1. Verificar API keys
echo $ELEVENLABS_API_KEY
echo $AZURE_SPEECH_KEY

# 2. Testar conectividade
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $ELEVENLABS_API_KEY"

# 3. Verificar logs
# Console > Network > API calls
```

### Cache não funciona

```sql
-- Verificar tabela tts_cache
SELECT COUNT(*) FROM tts_cache;

-- Verificar bucket storage
-- Supabase Dashboard > Storage > audio
```

---

## 📊 Monitoramento

### Verificar Analytics

```sql
-- Eventos TTS gerados
SELECT 
  COUNT(*) as total_generations,
  SUM((event_data->>'characters')::int) as total_characters,
  AVG((event_data->>'duration')::numeric) as avg_duration
FROM analytics_events
WHERE event_type = 'tts_generated';
```

### Verificar Cache Hit Rate

```sql
-- Total de gerações
SELECT COUNT(*) FROM analytics_events 
WHERE event_type = 'tts_generated';

-- Total em cache
SELECT COUNT(*) FROM tts_cache;

-- Hit rate = cache / total
```

---

## 🎯 Casos de Uso

### 1. Narração de Slides PPTX

```typescript
// Após processar PPTX
const slides = await processPPTX(file)

for (const slide of slides) {
  const audio = await fetch('/api/tts/generate', {
    method: 'POST',
    body: JSON.stringify({
      text: slide.narrationScript,
      voiceId: 'selected-voice',
      slideId: slide.id,
    }),
  })
}
```

### 2. Preview de Voz

```typescript
<VoiceSelector
  provider="elevenlabs"
  selectedVoice={selectedVoice}
  onVoiceSelect={(voiceId) => {
    setSelectedVoice(voiceId)
    // Preview automático ao selecionar
  }}
/>
```

### 3. Batch Processing

```typescript
const texts = ['Slide 1', 'Slide 2', 'Slide 3']

const audios = await Promise.all(
  texts.map(text => 
    fetch('/api/tts/generate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        voiceId: 'voice-id',
      }),
    }).then(r => r.json())
  )
)
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- `TTS_SYSTEM_DOCUMENTATION.md` - Documentação técnica completa
- `SPRINT_TTS_EXECUTIVE_SUMMARY.md` - Resumo executivo
- `__tests__/lib/tts/tts.test.ts` - Exemplos de testes

---

## ✅ Checklist de Setup

- [ ] Criar conta ElevenLabs
- [ ] Criar recurso Azure Speech
- [ ] Adicionar API keys ao `.env.local`
- [ ] Executar SQL schema
- [ ] Criar bucket `audio`
- [ ] Instalar dependências
- [ ] Testar com `npm test`
- [ ] Gerar primeira narração

---

**Tempo estimado de setup**: 5-10 minutos  
**Dificuldade**: ⭐ Fácil

**Pronto!** Agora você pode gerar narrações profissionais para seus vídeos educacionais! 🎙️
