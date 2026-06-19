from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Registration ──────────────────────────────────────────────────────────────
class UserRegisterResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    created_at: datetime
    message: str

    class Config:
        from_attributes = True


# ── Recognition ───────────────────────────────────────────────────────────────
class RecognitionResult(BaseModel):
    recognized: bool
    name: Optional[str] = None
    user_id: Optional[int] = None
    confidence: Optional[float] = None
    message: str


# ── User list ─────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
