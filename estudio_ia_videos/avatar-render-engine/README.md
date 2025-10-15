
# 🎭 Avatar Render Engine - Pipeline Local PT-BR

Sistema de geração de vídeos com avatares 3D hiper-realistas 100% local.

## Stack Técnico

- **TTS Local**: Coqui TTS (PT-BR)
- **Lip Sync**: NVIDIA Audio2Face OSS (ARKit visemes)
- **Render 3D**: Unreal Engine 5 Headless + MetaHuman
- **Composição**: FFmpeg
- **GPU**: NVIDIA (nvidia-container-runtime)

## Sprint 1 MVP

### Entregáveis
1. Container GPU operacional
2. APIs REST funcionais
3. Worker orquestrador
4. 1 avatar + 2 presets
5. Smoke tests end-to-end

### Performance Target
- MP4 1080p30 em 6min para 10-20s áudio
- Lip-sync placeholder (curvas sintéticas)
- Status consultável em tempo real

## Arquitetura

```
POST /api/avatars/render
  ↓
[Worker Orchestrator]
  ↓
TTS Local (PT-BR) → audio.wav
  ↓
Audio2Face → visemes ARKit (placeholder Sprint 1)
  ↓
UE5 Headless → MetaHuman render → frames
  ↓
FFmpeg → MP4 1080p30
  ↓
GET /api/avatars/status/{job_id}
```

## Quick Start

```bash
# Build container
./scripts/setup.sh

# Start services
./scripts/start_services.sh

# Run smoke test
python tests/smoke_test.py
```
