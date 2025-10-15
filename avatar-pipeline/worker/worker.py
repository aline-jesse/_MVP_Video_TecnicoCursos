
import os, time, json, subprocess
import requests, redis
from pathlib import Path

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
r = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

DATA_DIR = Path("/data")
OUT_DIR = DATA_DIR / "out"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def save(job):
    r.set(f"job:{job['job_id']}", json.dumps(job))

def step(job, name, status, ms=None, error=None, progress=None):
    s = {"name": name, "status": status}
    if ms is not None: s["ms"] = ms
    if error is not None: s["error"] = error
    job["steps"].append(s)
    if progress is not None: job["progress"] = progress
    save(job)

def run():
    # iniciar redis dentro do container (para ambiente dev simples)
    try:
        subprocess.Popen(["/usr/bin/redis-server"])
        time.sleep(0.8)
    except Exception:
        pass

    while True:
        job_id = r.rpop("jobs_queue")
        if not job_id:
            time.sleep(1); continue
        job = json.loads(r.get(f"job:{job_id}"))
        job["status"] = "RUNNING"; job["progress"] = 1; save(job)

        try:
            t0 = time.time()
            tts = requests.post("http://localhost:8001/internal/tts", json={
                "text": job["params"]["text"],
                "language": "pt-BR",
                "speed": 1.0, "pitch": 0.0
            }).json()
            step(job, "TTS", "DONE", ms=int((time.time()-t0)*1000), progress=25)

            t1 = time.time()
            a2f = requests.post("http://localhost:8002/internal/a2f", json={
                "wav_path": tts["wav_path"], "format": "json"
            }).json()
            step(job, "A2F", "DONE", ms=int((time.time()-t1)*1000), progress=50)

            t2 = time.time()
            job_dir = OUT_DIR / job_id
            job_dir.mkdir(parents=True, exist_ok=True)
            cmd = [
              "python3", "/app/ue/ue_render.py",
              "--project", "/proj/AvatarPipeline.uproject",
              "--wav", tts["wav_path"],
              "--curves", a2f["curves_path"],
              "--avatar_id", job["params"]["avatar_id"],
              "--camera_preset", job["params"]["camera_preset"],
              "--lighting_preset", job["params"]["lighting_preset"],
              "--out_dir", str(job_dir)
            ]
            subprocess.check_call(cmd)
            step(job, "UNREAL_RENDER", "DONE", ms=int((time.time()-t2)*1000), progress=85)

            out_mp4 = job_dir / "output.mp4"
            job["status"] = "DONE"; job["progress"] = 100
            job["outputUrl"] = f"file://{out_mp4}"
            save(job)

        except Exception as e:
            job["status"] = "FAILED"; job["error"] = str(e)
            save(job)

if __name__ == "__main__":
    run()
