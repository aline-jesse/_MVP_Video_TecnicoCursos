
#!/usr/bin/env bash
set -e
docker run --gpus all -it --rm \
  -p 8000:8000 -p 8001:8001 -p 8002:8002 \
  -v $(pwd)/data:/data \
  -v $(pwd)/config:/app/config \
  avatar-gpu:base bash
