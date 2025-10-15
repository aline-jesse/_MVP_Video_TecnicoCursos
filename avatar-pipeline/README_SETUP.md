
Passos:
1) Build da imagem:
   bash scripts/build_image.sh
2) Rodar container com GPU:
   bash scripts/run_dev.sh
3) Dentro do container, iniciar serviços:
   # Terminal A (TTS)
   uvicorn services.tts.app:app --host 0.0.0.0 --port 8001
   # Terminal B (A2F)
   uvicorn services.a2f.app:app --host 0.0.0.0 --port 8002
   # Terminal C (API + Worker)
   uvicorn api.app:app --host 0.0.0.0 --port 8000 &
   python3 worker/worker.py
4) Testes de fumaça:
   No host (fora do container):
   bash scripts/smoke/01_tts_smoke.sh
   Use o wav_path retornado no 01 para rodar:
   bash scripts/smoke/02_a2f_smoke.sh /data/tts_cache/<arquivo.wav>
   Dentro do container:
   bash scripts/smoke/03_ue_render_smoke.sh
   No host:
   bash scripts/smoke/04_api_smoke.sh
Saída: vídeos em /data/out
