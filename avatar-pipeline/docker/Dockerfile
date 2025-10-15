
FROM nvidia/cuda:12.1.0-devel-ubuntu22.04
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget git curl unzip build-essential ca-certificates jq locales \
    python3 python3-pip python3-venv redis-server \
    ffmpeg libsm6 libxext6 libgl1 && \
    rm -rf /var/lib/apt/lists/*
RUN locale-gen pt_BR.UTF-8 && update-locale LANG=pt_BR.UTF-8
ENV LANG=pt_BR.UTF-8 LC_ALL=pt_BR.UTF-8 PYTHONUNBUFFERED=1
RUN mkdir -p /app /data/in /data/out /data/tts_cache /data/a2f_out /proj
WORKDIR /app
COPY api /app/api
COPY worker /app/worker
COPY services /app/services
COPY ue /app/ue
COPY config /app/config
COPY scripts /app/scripts
RUN pip3 install --no-cache-dir -r /app/services/tts/requirements.txt
RUN pip3 install --no-cache-dir -r /app/services/a2f/requirements.txt
RUN pip3 install --no-cache-dir -r /app/api/requirements.txt
RUN pip3 install --no-cache-dir -r /app/worker/requirements.txt
RUN echo "Unreal Engine headless será configurado na Sprint 2 (README_UNREAL.md)."
CMD ["/bin/bash"]
