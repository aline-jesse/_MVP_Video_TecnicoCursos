
# 🎬 Avatar Pipeline - Engines Reais

Pipeline profissional de renderização de avatares hiper-realistas com **NVIDIA Audio2Face OSS** e **Unreal Engine 5.3**.

---

## 🎯 Visão Geral

Este módulo implementa um pipeline completo para geração de vídeos com avatares 3D hiper-realistas falando em português brasileiro, com lip-sync perfeito e qualidade fotorrealista.

### Pipeline

```
Texto (PT-BR)
    ↓
[TTS Service] → Áudio (WAV)
    ↓
[NVIDIA Audio2Face] → Curvas ARKit (lip-sync)
    ↓
[Unreal Engine 5.3] → Vídeo renderizado (MP4)
    ↓
[FFmpeg] → Composição final
    ↓
[AWS S3] → Upload e CDN
```

### Tecnologias

- **NVIDIA Audio2Face OSS**: Geração de curvas ARKit para lip-sync profissional
- **Unreal Engine 5.3**: Renderização fotorrealista com MetaHuman
- **Movie Render Queue**: Renderização batch headless
- **FFmpeg**: Composição e encoding de vídeo
- **Docker + GPU**: Containerização com suporte NVIDIA

---

## 📋 Pré-requisitos

### Hardware

- GPU NVIDIA com CUDA 11.8+ (mínimo: RTX 3060, recomendado: RTX 4090 ou A100)
- 16GB+ VRAM (para 4K)
- 32GB+ RAM
- 100GB+ disco SSD

### Software

- Ubuntu 22.04 LTS
- NVIDIA Driver 535+
- Docker 24.0+
- nvidia-docker runtime
- Unreal Engine 5.3 (licença Epic Games)

---

## 🚀 Setup

### 1. Instalar Dependências

```bash
# NVIDIA Driver
sudo apt update
sudo apt install nvidia-driver-535 nvidia-utils-535

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# nvidia-docker
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
    sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

### 2. Verificar GPU

```bash
nvidia-smi
docker run --rm --gpus all nvidia/cuda:11.8.0-base nvidia-smi
```

### 3. Build Images

```bash
cd avatar-pipeline
chmod +x scripts/*.sh
./scripts/build.sh
```

### 4. Deploy Services

```bash
./scripts/deploy-gpu.sh
```

Serviços disponíveis:
- **Audio2Face API**: http://localhost:5001
- **Unreal Engine API**: http://localhost:5002
- **Redis**: localhost:6379

---

## 🧪 Testes

```bash
# Testar Audio2Face
python3 tests/test_a2f.py

# Testar Unreal Engine
python3 tests/test_ue5.py

# Testar pipeline completo
python3 tests/test_pipeline.py

# Ou rodar todos de uma vez
./scripts/test-all.sh
```

---

## 📖 Uso

### Via API

#### 1. Gerar Curvas ARKit (Audio2Face)

```bash
curl -X POST http://localhost:5001/a2f/generate \
  -F "audio_file=@audio.wav" \
  -F "format=json" \
  -F "smoothing=0.3" \
  -F "intensity=1.0"

# Response:
# {
#   "job_id": "abc123...",
#   "status": "queued"
# }
```

#### 2. Consultar Status

```bash
curl http://localhost:5001/a2f/status/abc123...

# Response:
# {
#   "job_id": "abc123...",
#   "status": "completed",
#   "progress": 1.0,
#   "arkit_path": "/data/a2f_output/abc123.json"
# }
```

#### 3. Renderizar Avatar (Unreal Engine)

```bash
curl -X POST http://localhost:5002/ue/render \
  -H "Content-Type: application/json" \
  -d '{
    "arkit_job_id": "abc123...",
    "metahuman": "metahuman_01",
    "camera_preset": "closeup_01",
    "light_preset": "portrait_soft",
    "resolution": "HD",
    "fps": 30
  }'

# Response:
# {
#   "job_id": "xyz789...",
#   "status": "queued"
# }
```

#### 4. Download Vídeo

```bash
curl -O http://localhost:5002/ue/download/xyz789...
```

### Via Python

```python
import requests

# 1. Upload áudio para Audio2Face
with open("audio.wav", "rb") as f:
    response = requests.post(
        "http://localhost:5001/a2f/generate",
        files={"audio_file": f},
        params={"format": "json", "smoothing": 0.3}
    )

a2f_job_id = response.json()["job_id"]

# 2. Aguardar processamento
import time
while True:
    status = requests.get(f"http://localhost:5001/a2f/status/{a2f_job_id}").json()
    if status["status"] == "completed":
        break
    time.sleep(2)

# 3. Renderizar avatar
render_response = requests.post(
    "http://localhost:5002/ue/render",
    json={
        "arkit_job_id": a2f_job_id,
        "metahuman": "metahuman_01",
        "camera_preset": "closeup_01",
        "resolution": "HD"
    }
)

ue_job_id = render_response.json()["job_id"]

# 4. Aguardar renderização
while True:
    status = requests.get(f"http://localhost:5002/ue/status/{ue_job_id}").json()
    if status["status"] == "completed":
        break
    time.sleep(5)

# 5. Download vídeo
video = requests.get(f"http://localhost:5002/ue/download/{ue_job_id}")
with open("avatar_video.mp4", "wb") as f:
    f.write(video.content)
```

---

## 🎨 Assets

### MetaHumans

3 MetaHumans disponíveis:

1. **metahuman_01**: Executivo Brasileiro (masculino, 45 anos)
2. **metahuman_02**: Engenheira de Segurança (feminino, 35 anos)
3. **metahuman_03**: Instrutor de Treinamento (masculino, 50 anos)

Ver `assets/metahumans/README.md` para instruções de importação.

### Presets de Câmera

- `closeup_01`: Close-up frontal (FOV 35°)
- `mid_01`: Plano médio (FOV 50°)
- `wide_01`: Plano aberto (FOV 70°)

### Presets de Iluminação

- `portrait_soft`: Iluminação 3-point suave
- `key_fill_rim`: Iluminação cinematográfica
- `studio_bright`: Estúdio brilhante (high-key)

---

## 📊 Performance

### Benchmarks (RTX 4090)

| Resolução | Duração | Renderização | Total |
|-----------|---------|--------------|-------|
| HD (720p) | 10s     | 2-3 min      | 3 min |
| FHD (1080p) | 10s   | 4-5 min      | 5 min |
| 4K (2160p) | 10s    | 8-12 min     | 12 min |

### Critérios de Sucesso (Sprint 2)

- ✅ p95 < 6 min para vídeo de 10-20s (HD)
- ✅ Drift de lip-sync < 100 ms
- ✅ Taxa de erro < 5%

---

## 🔧 Troubleshooting

### GPU não detectada

```bash
# Verificar driver
nvidia-smi

# Reinstalar nvidia-docker
sudo apt-get purge nvidia-docker2
sudo apt-get install nvidia-docker2
sudo systemctl restart docker
```

### Unreal Engine não renderiza

```bash
# Verificar Xvfb (virtual display)
ps aux | grep Xvfb

# Logs do container
docker logs avatar-ue5
```

### Memória VRAM insuficiente

- Reduzir resolução (HD em vez de 4K)
- Reduzir samples de anti-aliasing
- Usar LOD mais baixo para MetaHuman

---

## 📚 Documentação Adicional

- [NVIDIA Audio2Face Docs](https://docs.omniverse.nvidia.com/app_audio2face/)
- [Unreal Engine MetaHuman](https://docs.unrealengine.com/5.3/en-US/metahuman-creator/)
- [ARKit Blendshapes](https://arkit-face-blendshapes.com/)
- [Movie Render Queue](https://docs.unrealengine.com/5.3/en-US/render-cinematics-in-unreal-engine/)

---

## 📄 Licença

Este código é proprietário do **Estúdio IA de Vídeos**.

Dependências externas seguem suas respectivas licenças:
- NVIDIA Audio2Face: [NVIDIA License](https://www.nvidia.com/en-us/drivers/nvidia-license/)
- Unreal Engine: [Epic Games EULA](https://www.unrealengine.com/eula)
- MetaHuman: [Epic Games License](https://www.unrealengine.com/marketplace-guidelines)

---

**Desenvolvido com ❤️ para segurança do trabalho no Brasil**
