# ClipRadar AI — FastAPI + FFmpeg Backend Service

Dedicated Python Backend Engine for **ClipRadar AI** (Vizard.ai / OpusClip Architecture).

---

## 🛠️ Tech Stack & Architecture

```
[ Next.js 14 Frontend (Port 3000) ]
              │
              ▼ (REST API)
[ FastAPI Backend (Port 8000) ]
       ├── yt-dlp        (YouTube Stream Ingestion)
       ├── FFmpeg        (9:16 Reframe, Ambient Blur & MP4 Render)
       └── Whisper AI    (Speech-to-Text with Timestamps)
```

---

## 🚀 How to Run the Backend Locally

### 1. Requirements:
- Python 3.9+
- [FFmpeg](https://ffmpeg.org/download.html) installed and added to system PATH.

### 2. Installation:
```bash
cd server
pip install -r requirements.txt
```

### 3. Start Server:
```bash
python main.py
```
Backend will be available at: `http://localhost:8000`  
API Docs (Swagger UI): `http://localhost:8000/docs`

---

## 📡 API Endpoints

- `GET /api/health` — Check server status, FFmpeg, and yt-dlp availability.
- `POST /api/clip-video` — Downloads a YouTube segment via `yt-dlp` and reframes it to 9:16 using `FFmpeg`.
