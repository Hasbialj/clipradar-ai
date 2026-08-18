"""
ClipRadar AI — Production FastAPI Backend Server
Stack: FastAPI + Python + yt-dlp + FFmpeg + OpenAI Whisper / AI Viral Detection
"""

import os
import sys
import json
import shutil
import subprocess
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI(
    title="ClipRadar AI Backend",
    description="AI Video Clipper & Viral Momentum Detector API (Vizard/OpusClip Engine)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp_media")
os.makedirs(TEMP_DIR, exist_ok=True)


class AnalyzeRequest(BaseModel):
    url: Optional[str] = None
    fileName: Optional[str] = None
    durationSeconds: Optional[int] = 1800


class ClipVideoRequest(BaseModel):
    url: str
    startSeconds: float
    endSeconds: float
    aspectRatio: str = "9:16"  # "9:16", "1:1", "16:9"
    subtitleStyle: str = "hormozi"  # "hormozi", "mrbeast", "neon", "clean"
    layoutPreset: str = "blurred_fit"  # "blurred_fit", "center_crop", "split_screen"
    clipId: str = "clip_1"


@app.get("/api/health")
def health_check():
    has_ffmpeg = shutil.which("ffmpeg") is not None
    has_ytdlp = shutil.which("yt-dlp") is not None
    return {
        "status": "online",
        "service": "ClipRadar AI FastAPI Engine",
        "ffmpeg_installed": has_ffmpeg,
        "ytdlp_installed": has_ytdlp,
    }


@app.post("/api/clip-video")
async def clip_video(req: ClipVideoRequest, background_tasks: BackgroundTasks):
    """
    Downloads the YouTube video segment using yt-dlp and crops to 9:16 using FFmpeg.
    """
    if not shutil.which("yt-dlp"):
        raise HTTPException(
            status_code=500,
            detail="yt-dlp binary is not installed on the system. Install with: pip install yt-dlp",
        )

    duration = req.endSeconds - req.startSeconds
    raw_path = os.path.join(TEMP_DIR, f"raw_{req.clipId}.mp4")
    output_path = os.path.join(TEMP_DIR, f"clipradar_{req.clipId}_{req.aspectRatio.replace(':', 'x')}.mp4")

    # 1. Extract segment using yt-dlp with precise timestamp
    try:
        ytdl_cmd = [
            "yt-dlp",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--external-downloader", "ffmpeg",
            "--external-downloader-args", f"ffmpeg_i:-ss {req.startSeconds} -t {duration}",
            "-o", raw_path,
            "--force-overwrites",
            req.url,
        ]
        subprocess.run(ytdl_cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as err:
        raise HTTPException(status_code=500, detail=f"yt-dlp download failed: {err.stderr.decode('utf-8', errors='ignore')}")

    # 2. Reframe & Process via FFmpeg
    try:
        if req.aspectRatio == "9:16":
            # Vizard-style blurred ambient background filter
            if req.layoutPreset == "blurred_fit":
                filter_graph = (
                    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:5[bg];"
                    "[0:v]scale=1080:-1[fg];"
                    "[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]"
                )
            else:
                # Center crop to 9:16
                filter_graph = "[0:v]scale=-1:1920,crop=1080:1920[outv]"

            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", raw_path,
                "-filter_complex", filter_graph,
                "-map", "[outv]",
                "-map", "0:a?",
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "21",
                "-c:a", "aac",
                "-b:a", "192k",
                output_path,
            ]
        else:
            # Keep original aspect ratio
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", raw_path,
                "-c:v", "libx264",
                "-c:a", "aac",
                output_path,
            ]

        subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as err:
        raise HTTPException(status_code=500, detail=f"FFmpeg processing failed: {err.stderr.decode('utf-8', errors='ignore')}")

    # Clean up raw temp file after sending
    background_tasks.add_task(lambda: os.remove(raw_path) if os.path.exists(raw_path) else None)

    return FileResponse(
        path=output_path,
        media_type="video/mp4",
        filename=f"ClipRadar_{req.clipId}_{req.aspectRatio.replace(':', 'x')}.mp4",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
