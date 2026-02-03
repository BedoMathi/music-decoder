from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os, shutil, threading, time, re
from separate import separate_audio

# ---------- helpers ----------
def safe_name(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", name)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------- app ----------
app = FastAPI()

# ✅ CORS FIX (THIS WAS BREAKING YOUR UPLOAD)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend ports change → allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- routes ----------
@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    if not file.filename.endswith(".mp3"):
        raise HTTPException(status_code=400, detail="Only MP3 allowed")

    raw_name = os.path.splitext(file.filename)[0]
    song_name = safe_name(raw_name)

    file_path = os.path.join(UPLOAD_DIR, f"{song_name}.mp3")

    # save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # run demucs in background
    threading.Thread(
        target=separate_audio,
        args=(file_path,),
        daemon=True
    ).start()

    return {"song": song_name}


@app.get("/audio/{song}/{stem}")
def get_audio(song: str, stem: str):
    path = os.path.join(OUTPUT_DIR, "htdemucs", song, f"{stem}.mp3")

    # wait up to 120 seconds for demucs
    for _ in range(120):
        if os.path.exists(path):
            return FileResponse(path, media_type="audio/mpeg")
        time.sleep(1)

    raise HTTPException(status_code=404, detail="Audio not ready yet")


@app.get("/download/{song}/{stem}")
def download_audio(song: str, stem: str):
    path = os.path.join(OUTPUT_DIR, "htdemucs", song, f"{stem}.mp3")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path, filename=f"{stem}.mp3")
