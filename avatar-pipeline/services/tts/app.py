
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import hashlib, json, time
import soundfile as sf
from TTS.api import TTS

app = FastAPI(title="TTS Local PT-BR")
DATA_DIR = Path("/data")
CACHE_DIR = DATA_DIR / "tts_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Selecionar um modelo PT-BR estável do Coqui TTS (ajuste se necessário)
# Se o modelo não suportar timestamps, retornaremos somente word-level aproximado.
MODEL_NAME = "tts_models/pt/cv/vits"  # substituível por outro PT-BR suportado

class TTSRequest(BaseModel):
    text: str
    language: str = "pt-BR"
    voice: str | None = None
    speed: float = 1.0
    pitch: float = 0.0

class TTSResponse(BaseModel):
    wav_path: str
    sample_rate: int
    words: list

def make_hash(payload: dict) -> str:
    return hashlib.sha1(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()

@app.post("/internal/tts", response_model=TTSResponse)
def synth(req: TTSRequest):
    if not req.language.lower().startswith("pt"):
        raise HTTPException(status_code=400, detail="Somente pt-BR suportado nesta fase.")
    if len(req.text.strip()) == 0 or len(req.text) > 800:
        raise HTTPException(status_code=400, detail="Texto vazio ou > 800 caracteres.")

    payload = req.model_dump()
    key = make_hash(payload)
    out_wav = CACHE_DIR / f"{key}.wav"
    out_json = CACHE_DIR / f"{key}.json"

    if out_wav.exists() and out_json.exists():
        meta = json.loads(out_json.read_text())
        return TTSResponse(wav_path=str(out_wav), sample_rate=meta["sample_rate"], words=meta["words"])

    tts = TTS(MODEL_NAME)
    # Coqui TTS gera áudio; não garante timestamps detalhados. Usaremos words=[] por enquanto.
    wav = tts.tts(req.text)
    sr = 22050
    sf.write(out_wav, wav, sr)

    meta = {"sample_rate": sr, "words": []}
    out_json.write_text(json.dumps(meta, ensure_ascii=False))
    return TTSResponse(wav_path=str(out_wav), sample_rate=sr, words=[])
