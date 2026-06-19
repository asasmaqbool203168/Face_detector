from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import Base, engine
from app.routes import router

# ── Create all DB tables on startup ──────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Ensure upload directory exists ───────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Face Detection & Recognition API",
    description="Register faces and recognize them using FastAPI + face_recognition",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS – allow React dev server ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving (uploaded images) ────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Register all API routes under /api ───────────────────────────────────────
app.include_router(router, prefix="/api", tags=["Face Recognition"])


@app.get("/")
async def root():
    return {
        "message": "Face Detection & Recognition API",
        "docs": "/docs",
        "health": "/api/health",
    }
