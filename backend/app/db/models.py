from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=True)
    face_encoding = Column(Text, nullable=False)          # JSON-serialised float list
    image_path = Column(String(500), nullable=True)       # optional stored image path
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
