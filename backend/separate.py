import subprocess
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

def separate_audio(file_path):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    command = [
        "demucs",
        "-n", "htdemucs",
        "--mp3",
        "-o", OUTPUT_DIR,
        file_path
    ]

    subprocess.run(command, check=True)
