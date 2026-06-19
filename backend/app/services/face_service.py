"""
Face service – handles encoding extraction and recognition.

Uses the `face_recognition` library (dlib-based) for:
  • extract_face_encoding()  – returns a 128-d list from an image file-like
  • find_best_match()        – compares an encoding against all DB rows
"""

import json
import io
import numpy as np
import face_recognition
from PIL import Image
from typing import Optional, Tuple, List


TOLERANCE = 0.50   # lower = stricter.  0.6 is the library default.


# ─────────────────────────────────────────────────────────────────────────────
# Encoding helpers
# ─────────────────────────────────────────────────────────────────────────────

def _load_rgb_array(image_bytes: bytes) -> np.ndarray:
    """Convert raw bytes → RGB numpy array that face_recognition accepts."""
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(pil_img)


def extract_face_and_eyes(image_bytes: bytes) -> Optional[Tuple[List[float], dict]]:
    """
    Return the 128-d face encoding and eye landmarks for the **first** face found in the image.
    Returns None when no face is detected.
    """
    rgb = _load_rgb_array(image_bytes)
    locations = face_recognition.face_locations(rgb, model="hog")
    if not locations:
        return None
    encodings = face_recognition.face_encodings(rgb, known_face_locations=locations)
    if not encodings:
        return None
        
    landmarks_list = face_recognition.face_landmarks(rgb, face_locations=locations)
    eye_data = {}
    if landmarks_list:
        landmarks = landmarks_list[0]
        eye_data = {
            "left_eye": landmarks.get("left_eye", []),
            "right_eye": landmarks.get("right_eye", [])
        }
        
    return encodings[0].tolist(), eye_data


def count_faces(image_bytes: bytes) -> int:
    """Return the number of faces detected in an image."""
    rgb = _load_rgb_array(image_bytes)
    locations = face_recognition.face_locations(rgb, model="hog")
    return len(locations)


# ─────────────────────────────────────────────────────────────────────────────
# Recognition helpers
# ─────────────────────────────────────────────────────────────────────────────

def find_best_match(
    query_encoding: List[float],
    db_users: list,          # list of ORM User objects with .face_encoding JSON field
) -> Tuple[Optional[object], float]:
    """
    Compare *query_encoding* against every user in *db_users*.

    Returns (best_user | None, distance).
    • distance < TOLERANCE  → recognised
    • distance >= TOLERANCE → not in DB
    """
    if not db_users:
        return None, 1.0

    query_arr = np.array(query_encoding)

    best_user = None
    best_dist = 1.0

    for user in db_users:
        try:
            stored = np.array(json.loads(user.face_encoding))
        except Exception:
            continue

        dist = float(np.linalg.norm(query_arr - stored))
        if dist < best_dist:
            best_dist = dist
            best_user = user

    if best_dist <= TOLERANCE:
        return best_user, best_dist

    return None, best_dist
