
#!/usr/bin/env bash
set -e
WAV_PATH=${1:-/data/tts_cache/REPLACE_ME.wav}
curl -s -X POST http://localhost:8002/internal/a2f \
 -H "Content-Type: application/json" \
 -d "{\"wav_path\":\"$WAV_PATH\",\"format\":\"json\"}" | jq
