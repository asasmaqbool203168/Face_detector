"""
API Routes for Face Detection & Recognition
"""

import json
import os
import uuid
import aiofiles

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.schemas.schemas import RecognitionResult, UserOut, UserRegisterResponse
from app.services.face_service import extract_face_encoding, find_best_match, count_faces

router = APIRouter()

UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True) # No longer saving images to disk


# ─────────────────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {"status": "ok", "message": "Face Recognition API is running"}


# ─────────────────────────────────────────────────────────────────────────────
# REGISTER  –  POST /api/register
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserRegisterResponse)
async def register_user(
    name: str = Form(...),
    email: str = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1. Read image bytes
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    # 2. Validate image type
    allowed = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
    if image.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {image.content_type}. Use JPEG or PNG.",
        )

    # 3. Extract face encoding
    encoding = extract_face_encoding(image_bytes)
    if encoding is None:
        raise HTTPException(
            status_code=422,
            detail="No face detected in the provided image. Please upload a clear face photo.",
        )

    # 3.5 Check if face already registered
    all_users = db.query(User).all()
    matched_user, _ = find_best_match(encoding, all_users)
    if matched_user:
        raise HTTPException(
            status_code=409,
            detail=f"User is already registered with this face (matches '{matched_user.name}')."
        )

    # 4. Check duplicate email
    if email:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"A user with email '{email}' is already registered.",
            )

    # 5. Skip saving image to disk as per user request
    # Image is not captured/stored, only the encoding is kept

    # 6. Persist user to DB (without image_path)
    user = User(
        name=name.strip(),
        email=email.strip() if email else None,
        face_encoding=json.dumps(encoding),
        image_path=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserRegisterResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        created_at=user.created_at,
        message=f"User '{user.name}' registered successfully!",
    )


# ─────────────────────────────────────────────────────────────────────────────
# RECOGNIZE  –  POST /api/recognize
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/recognize", response_model=RecognitionResult)
async def recognize_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1. Read image bytes
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    # 2. Count faces for better UX feedback
    face_count = count_faces(image_bytes)
    if face_count == 0:
        raise HTTPException(
            status_code=422,
            detail="No face detected in the image. Please provide a clear face photo.",
        )

    # 3. Extract encoding of first face
    encoding = extract_face_encoding(image_bytes)
    if encoding is None:
        raise HTTPException(
            status_code=422,
            detail="Could not extract face features. Try a better-lit, front-facing photo.",
        )

    # 4. Load all registered users
    all_users = db.query(User).all()
    if not all_users:
        return RecognitionResult(
            recognized=False,
            message="No users registered in the database yet.",
        )

    # 5. Find best match
    matched_user, distance = find_best_match(encoding, all_users)

    if matched_user:
        confidence = round((1 - distance) * 100, 2)
        return RecognitionResult(
            recognized=True,
            name=matched_user.name,
            user_id=matched_user.id,
            confidence=confidence,
            message=f"Welcome, {matched_user.name}! (Confidence: {confidence}%)",
        )

    return RecognitionResult(
        recognized=False,
        message="User does not exist.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# DETECT (face count only)  –  POST /api/detect
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/detect")
async def detect_faces(image: UploadFile = File(...)):
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    count = count_faces(image_bytes)
    return {
        "faces_detected": count,
        "message": f"{count} face(s) detected in the image.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# LIST USERS  –  GET /api/users
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserOut])
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


# ─────────────────────────────────────────────────────────────────────────────
# DELETE USER  –  DELETE /api/users/{user_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Image is no longer stored on disk, so we don't need to delete it.
    # if user.image_path and os.path.exists(user.image_path):
    #     os.remove(user.image_path)

    db.delete(user)
    db.commit()
    return {"message": f"User '{user.name}' deleted successfully"}
