
#!/usr/bin/env bash
set -e
docker build -f docker/Dockerfile -t avatar-gpu:base .
echo "OK: avatar-gpu:base"
