
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid, json
import redis

app = FastAPI(title="Avatar Render API")
r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

class RenderRequest(BaseModel):
    text: str
    language: str = "pt-BR"
    voice_style: str = "neutral"
    avatar_id: str = "metahuman_01"
    camera_preset: str = "closeup_01"
    lighting_preset: str = "portrait_soft"
    output: dict = {"resolution": "1080p", "codec": "h264"}
    enable_fallback_tts: bool = False

@app.post("/api/avatars/render")
def create_render(req: RenderRequest):
    if not req.language.lower().startswith("pt"):
        raise HTTPException(status_code=400, detail="Somente pt-BR nesta fase.")
    if len(req.text) == 0 or len(req.text) > 800:
        raise HTTPException(status_code=400, detail="Texto vazio ou > 800 caracteres.")
    job_id = str(uuid.uuid4())
    job = {
        "job_id": job_id,
        "status": "QUEUED",
        "progress": 0,
        "steps": [],
        "params": req.model_dump()
    }
    r.set(f"job:{job_id}", json.dumps(job))
    r.lpush("jobs_queue", job_id)
    return {"job_id": job_id}

@app.get("/api/avatars/status")
def get_status(job_id: str):
    data = r.get(f"job:{job_id}")
    if not data:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return json.loads(data)
