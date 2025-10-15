
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import time, json

app = FastAPI(title="Audio2Face Wrapper (Placeholder)")
DATA_DIR = Path("/data")
OUT_DIR = DATA_DIR / "a2f_out"
OUT_DIR.mkdir(parents=True, exist_ok=True)

class A2FRequest(BaseModel):
    wav_path: str
    format: str = "json"

class A2FResponse(BaseModel):
    curves_path: str
    format: str
    arkit_map: bool = True

@app.post("/internal/a2f", response_model=A2FResponse)
def a2f(req: A2FRequest):
    wav = Path(req.wav_path)
    if not wav.exists():
        raise HTTPException(status_code=400, detail="wav_path inexistente.")
    out_file = OUT_DIR / f"curves_{int(time.time())}.{req.format}"
    sample = {
        "rig": "arkit",
        "curves": {
            "jawOpen": [
                {"t_ms": 0, "w": 0.0},
                {"t_ms": 200, "w": 0.6},
                {"t_ms": 400, "w": 0.1}
            ],
            "mouthClose": [
                {"t_ms": 100, "w": 0.2},
                {"t_ms": 300, "w": 0.7}
            ]
        }
    }
    if req.format == "json":
        out_file.write_text(json.dumps(sample))
    else:
        lines = ["curve,t_ms,w"]
        for name, pts in sample["curves"].items():
            for p in pts:
                lines.append(f"{name},{p['t_ms']},{p['w']}")
        out_file.write_text("\n".join(lines))
    return A2FResponse(curves_path=str(out_file), format=req.format, arkit_map=True)
