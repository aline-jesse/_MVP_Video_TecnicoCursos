
import sys, json, argparse, subprocess
from pathlib import Path

def run_ffmpeg(audio_path: str, out_mov: str, out_mp4: str):
    cmd = [
        "ffmpeg", "-y",
        "-i", out_mov, "-i", audio_path,
        "-c:v", "libx264", "-crf", "18", "-preset", "medium",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest", out_mp4
    ]
    subprocess.check_call(cmd)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--wav", required=True)
    ap.add_argument("--curves", required=True)
    ap.add_argument("--avatar_id", default="metahuman_01")
    ap.add_argument("--camera_preset", default="closeup_01")
    ap.add_argument("--lighting_preset", default="portrait_soft")
    ap.add_argument("--out_dir", required=True)
    args = ap.parse_args()

    out_dir = Path(args.out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    out_mov = out_dir / "render.mov"
    # Placeholder: cria vídeo preto 3s para smoke
    subprocess.check_call(["ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=black:s=1920x1080:r=30:d=3", str(out_mov)])
    out_mp4 = out_dir / "output.mp4"
    run_ffmpeg(args.wav, str(out_mov), str(out_mp4))
    print(json.dumps({"output_mp4": str(out_mp4)}))

if __name__ == "__main__":
    main()
