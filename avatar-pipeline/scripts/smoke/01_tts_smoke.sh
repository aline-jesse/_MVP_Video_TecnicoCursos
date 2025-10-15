
#!/usr/bin/env bash
set -e
curl -s -X POST http://localhost:8001/internal/tts \
 -H "Content-Type: application/json" \
 -d '{"text":"Olá! Este é um teste de TTS em português do Brasil.","language":"pt-BR"}' | jq
