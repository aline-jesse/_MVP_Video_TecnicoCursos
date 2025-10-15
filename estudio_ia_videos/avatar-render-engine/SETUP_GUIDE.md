
# 🚀 Setup Guide - Avatar Render Engine

Guia completo de configuração e execução do sistema.

## Pré-requisitos

### Hardware
- ✅ GPU NVIDIA (mínimo: GTX 1060 6GB, recomendado: RTX 3060+)
- ✅ 16GB RAM (recomendado: 32GB)
- ✅ 50GB espaço em disco

### Software
- ✅ Ubuntu 22.04 LTS (ou superior)
- ✅ Docker 24.0+ com nvidia-container-runtime
- ✅ Docker Compose 2.0+
- ✅ NVIDIA Driver 525+ (CUDA 12.1)

## Instalação

### 1. Verificar GPU

```bash
nvidia-smi
```

Deve mostrar informações da GPU e driver CUDA.

### 2. Instalar Docker + NVIDIA Container Runtime

```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# NVIDIA Container Runtime
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# Testar
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi
```

### 3. Clonar/Acessar Projeto

```bash
cd /home/ubuntu/estudio_ia_videos/avatar-render-engine
```

### 4. Executar Setup

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

O script irá:
- ✅ Verificar Docker e GPU
- ✅ Criar estrutura de diretórios
- ✅ Build da imagem Docker (~5-10 minutos)

### 5. Iniciar Serviços

```bash
chmod +x scripts/start_services.sh
./scripts/start_services.sh
```

Aguarde ~30-60 segundos para o modelo TTS carregar.

### 6. Executar Smoke Test

```bash
# Dentro do container
docker exec -it avatar-render-engine python3 /app/tests/smoke_test.py

# OU localmente (requer requests, loguru)
cd tests
python smoke_test.py
```

## Uso da API

### Health Check

```bash
curl http://localhost:8765/health
```

### Criar Renderização

```bash
curl -X POST http://localhost:8765/api/avatars/render \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bem-vindo ao treinamento de segurança.",
    "avatar_id": "metahuman_01",
    "preset": "default",
    "resolution": "1920x1080",
    "fps": 30
  }'
```

Resposta:
```json
{
  "success": true,
  "job_id": "abc123...",
  "message": "Job criado e em processamento",
  "status": "queued"
}
```

### Consultar Status

```bash
curl http://localhost:8765/api/avatars/status/{job_id}
```

### Download do Vídeo

```bash
# Quando status = "completed"
curl -O http://localhost:8765/output/videos/{filename}
```

## Estrutura de Arquivos

```
avatar-render-engine/
├── docker/
│   ├── Dockerfile.gpu          # Container com GPU
│   ├── docker-compose.yml      # Orquestração
│   └── requirements.txt        # Dependências Python
├── services/
│   ├── tts_service.py          # TTS local PT-BR
│   ├── audio2face_service.py   # Lip sync placeholder
│   ├── ue_render_service.py    # UE5 render placeholder
│   └── ffmpeg_service.py       # Composição final
├── worker/
│   └── render_worker.py        # Orquestrador pipeline
├── api/
│   ├── render_api.py           # FastAPI endpoints
│   └── models.py               # Pydantic schemas
├── config/
│   ├── avatars.yaml            # Catálogo de avatares
│   └── presets.yaml            # Presets de render
├── tests/
│   └── smoke_test.py           # Testes end-to-end
├── output/
│   ├── videos/                 # MPs gerados
│   ├── cache/                  # Arquivos temporários
│   └── logs/                   # Logs da aplicação
└── scripts/
    ├── setup.sh                # Setup inicial
    └── start_services.sh       # Iniciar serviços
```

## Troubleshooting

### GPU não detectada

```bash
# Verificar driver
nvidia-smi

# Verificar runtime Docker
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi

# Reiniciar Docker
sudo systemctl restart docker
```

### TTS não carrega

O modelo TTS PT-BR (~500MB) é baixado no primeiro uso. Aguarde 1-2 minutos.

```bash
# Ver logs
docker-compose logs -f avatar-render-engine
```

### Erro de memória GPU

Reduzir batch size ou usar modelo menor:

```bash
# Editar docker-compose.yml
environment:
  - TTS_MODEL=tts_models/pt/cv/vits  # Modelo menor
```

### Porta 8765 ocupada

```bash
# Verificar processo
sudo lsof -i :8765

# Mudar porta em docker-compose.yml
ports:
  - "8766:8765"
```

## Performance

### Sprint 1 (Placeholder)
- ⏱️ 10-20s áudio → MP4 1080p30 em ~2-4 minutos
- 📊 Breakdown:
  - TTS: 5-10s
  - Visemes: 2-5s
  - Render placeholder: 20-40s
  - FFmpeg: 10-20s

### Sprint 2 (UE5 Real)
- ⏱️ Estimativa: 4-6 minutos para 20s áudio
- 🎬 Render real com MetaHuman será mais lento mas hiper-realista

## Próximos Passos

1. ✅ Sprint 1: Smoke tests passando
2. 🔄 Sprint 2: Integrar Audio2Face real
3. 🔄 Sprint 3: Integrar UE5 headless + MetaHuman
4. 🔄 Sprint 4: Otimizações de performance
5. 🔄 Sprint 5: Sistema de cache inteligente

## Suporte

- 📖 Documentação: `README.md`
- 🧪 Testes: `tests/smoke_test.py`
- 📊 API Docs: http://localhost:8765/docs (Swagger)
- 📝 Logs: `output/logs/`
