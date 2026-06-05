import os
import uuid
from pathlib import Path

from app.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def get_original_dir(user_id: int) -> Path:
    p = BASE_DIR / settings.upload_dir / str(user_id)
    p.mkdir(parents=True, exist_ok=True)
    return p


def get_works_dir(user_id: int) -> Path:
    p = BASE_DIR / settings.works_dir / str(user_id)
    p.mkdir(parents=True, exist_ok=True)
    return p


def generate_filename(ext: str = ".jpg") -> str:
    return f"{uuid.uuid4().hex}{ext}"


def get_relative_path(absolute_path: Path) -> str:
    try:
        return str(absolute_path.relative_to(BASE_DIR))
    except ValueError:
        return str(absolute_path)


def delete_file(path: str) -> bool:
    full = BASE_DIR / path
    try:
        if full.exists():
            full.unlink()
            return True
    except Exception:
        pass
    return False
