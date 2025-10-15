
# Avatar Pipeline PT-BR - Sprint 1 MVP

## 🎯 Visão Geral

Pipeline completo para geração de vídeos MP4 com avatares hiper-realistas falando em português brasileiro (pt-BR).

### Stack Tecnológico

- **TTS**: Coqui TTS (modelo PT-BR local)
- **Lip-sync**: NVIDIA Audio2Face (placeholder na Sprint 1)
- **Renderização**: Unreal Engine 5.3 + MetaHuman (placeholder na Sprint 1)
- **Composição**: FFmpeg
- **Orquestração**: Python + Redis + FastAPI
- **Container**: Docker + NVIDIA GPU

## 📁 Estrutura do Projeto

```
avatar-pipeline/
├── api/                    # REST API (FastAPI)
├── worker/                 # Worker de processamento (Redis queue)
├── services/
│   ├── tts/               # Serviço TTS local
│   └── a2f/               # Wrapper Audio2Face
├── ue/                    # Scripts Unreal Engine
├── config/                # Catálogo de avatares e presets
├── docker/                # Dockerfile GPU
└── scripts/               # Build e smoke tests
```

## 🚀 Quick Start

### 1. Build da Imagem Docker

```bash
bash scripts/build_image.sh
```

### 2. Executar Container com GPU

```bash
bash scripts/run_dev.sh
```

### 3. Iniciar Serviços (dentro do container)

```bash
# Terminal A - TTS
uvicorn services.tts.app:app --host 0.0.0.0 --port 8001

# Terminal B - Audio2Face
uvicorn services.a2f.app:app --host 0.0.0.0 --port 8002

# Terminal C - API + Worker
uvicorn api.app:app --host 0.0.0.0 --port 8000 &
python3 worker/worker.py
```

### 4. Smoke Tests

```bash
# Teste TTS
bash scripts/smoke/01_tts_smoke.sh

# Teste Audio2Face (use o wav_path retornado acima)
bash scripts/smoke/02_a2f_smoke.sh /data/tts_cache/<arquivo.wav>

# Teste render UE (dentro do container)
bash scripts/smoke/03_ue_render_smoke.sh

# Teste completo de API
bash scripts/smoke/04_api_smoke.sh
```

## 🔌 API Endpoints

### POST /api/avatars/render

Cria um job de renderização de avatar.

**Request:**
```json
{
  "text": "Olá! Bem-vindo ao treinamento de segurança do trabalho.",
  "language": "pt-BR",
  "avatar_id": "metahuman_01",
  "camera_preset": "closeup_01",
  "lighting_preset": "portrait_soft"
}
```

**Response:**
```json
{
  "job_id": "uuid-do-job"
}
```

### GET /api/avatars/status?job_id=<uuid>

Consulta o status de um job.

**Response:**
```json
{
  "job_id": "uuid",
  "status": "RUNNING",
  "progress": 50,
  "steps": [
    {"name": "TTS", "status": "DONE", "ms": 1234},
    {"name": "A2F", "status": "RUNNING"}
  ],
  "outputUrl": "file:///data/out/<job_id>/output.mp4"
}
```

## 📊 Pipeline de Processamento

1. **TTS** - Síntese de voz em PT-BR
2. **A2F** - Geração de curvas de animação facial (ARKit)
3. **UE Render** - Renderização 3D com MetaHuman
4. **FFmpeg** - Composição final de vídeo + áudio

## 🎨 Catálogo de Avatares

Veja `config/catalog.json` para:
- Lista de avatares disponíveis
- Presets de câmera
- Presets de iluminação

## 📈 Status Sprint 1 (MVP)

### ✅ Implementado

- [x] Dockerfile com CUDA + Python + FFmpeg
- [x] Serviço TTS local (Coqui TTS PT-BR)
- [x] API REST (FastAPI)
- [x] Worker de processamento (Redis)
- [x] Scripts de smoke test
- [x] Catálogo básico de avatares
- [x] Placeholder Audio2Face (curvas mock)
- [x] Placeholder UE render (vídeo preto + áudio)

### 🔜 Próxima Sprint

- [ ] Integração Audio2Face real
- [ ] Unreal Engine 5.3 headless
- [ ] MetaHuman import + animação ARKit
- [ ] Movie Render Queue automation
- [ ] Testes end-to-end completos

## 🐛 Troubleshooting

Veja `TROUBLESHOOTING.md` para:
- Verificação de GPU
- Debug de TTS
- Limitações conhecidas
- Soluções de problemas comuns

## 📚 Documentação Adicional

- `README_SETUP.md` - Guia detalhado de configuração
- `README_USAGE.md` - Guia de uso da API
- `ue/README_UNREAL.md` - Roadmap integração Unreal

## 🔐 Requisitos

- Docker >= 20.10
- NVIDIA GPU (CUDA 12.1+)
- nvidia-docker2
- 16GB+ RAM
- 50GB+ disco livre

## 📝 Notas

- Pipeline atual usa placeholders para A2F e UE render
- Vídeos de saída: `/data/out/<job_id>/output.mp4`
- Cache TTS: `/data/tts_cache/`
- Suporta apenas pt-BR nesta fase

## 🤝 Contribuindo

Este é um projeto interno MVP. Para melhorias, consulte o roadmap na documentação.

---

**Versão**: Sprint 1 MVP  
**Data**: Outubro 2025  
**Status**: ✅ Smoke Tests Passing
