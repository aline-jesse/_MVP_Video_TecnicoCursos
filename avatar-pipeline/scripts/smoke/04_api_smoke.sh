
#!/usr/bin/env bash
set -e
JOB_ID=$(curl -s -X POST http://localhost:8000/api/avatars/render \
  -H "Content-Type: application/json" \
  -d '{"text":"Olá! Este é um teste de renderização de avatar.","language":"pt-BR","avatar_id":"metahuman_01"}' \
  | jq -r .job_id)
echo "JOB_ID=$JOB_ID"
for i in {1..30}; do
  curl -s "http://localhost:8000/api/avatars/status?job_id=$JOB_ID" | jq
  sleep 2
done
