"""
ClipRadar AI / Vizard-style Cloud Backend Worker
Downloads YouTube streams using yt-dlp and slices clips with FFmpeg
"""

import os
import sys
import json
import subprocess
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ClipRadar Vizard Cloud Worker"})

@app.route("/api/clip-video", methods=["POST"])
def clip_video():
    data = request.json or {}
    url = data.get("url")
    start_sec = float(data.get("startSeconds", 0))
    end_sec = float(data.get("endSeconds", 30))
    aspect_ratio = data.get("aspectRatio", "9:16")  # 9:16, 1:1, 16:9
    clip_id = data.get("clipId", "clip_1")

    if not url:
        return jsonify({"error": "Missing video URL"}), 400

    duration = end_sec - start_sec
    raw_video_path = os.path.join(OUTPUT_DIR, f"raw_{clip_id}.mp4")
    clipped_output_path = os.path.join(OUTPUT_DIR, f"vizard_{clip_id}_9x16.mp4")

    # 1. Download segment using yt-dlp & FFmpeg
    try:
        # Download best MP4 stream
        ytdl_cmd = [
            "yt-dlp",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--external-downloader", "ffmpeg",
            "--external-downloader-args", f"ffmpeg_i:-ss {start_sec} -t {duration}",
            "-o", raw_video_path,
            url
        ]
        subprocess.run(ytdl_cmd, check=True)

        # 2. Reframe to 9:16 (Blurred Ambient Background like Vizard)
        if aspect_ratio == "9:16":
            # FFmpeg filter: Split into blurred background + centered 16:9 foreground
            ffmpeg_filter = (
                "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg];"
                "[0:v]scale=1080:-1[fg];"
                "[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]"
            )
            reframe_cmd = [
                "ffmpeg", "-y",
                "-i", raw_video_path,
                "-filter_complex", ffmpeg_filter,
                "-map", "[outv]",
                "-map", "0:a?",
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "20",
                "-c:a", "aac",
                "-b:a", "192k",
                clipped_output_path
            ]
            subprocess.run(reframe_cmd, check=True)
            return send_file(clipped_output_path, as_attachment=True, download_name=f"Vizard_{clip_id}.mp4")
        else:
            return send_file(raw_video_path, as_attachment=True, download_name=f"Vizard_{clip_id}.mp4")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"🚀 Vizard Worker running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port)
