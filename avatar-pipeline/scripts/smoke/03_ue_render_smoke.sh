
#!/usr/bin/env bash
set -e
python3 /app/ue/ue_render.py \
  --project /proj/AvatarPipeline.uproject \
  --wav /data/tts_cache/REPLACE_ME.wav \
  --curves /data/a2f_out/REPLACE_ME.json \
  --avatar_id metahuman_01 \
  --camera_preset closeup_01 \
  --lighting_preset portrait_soft \
  --out_dir /data/out/smoke_ue
