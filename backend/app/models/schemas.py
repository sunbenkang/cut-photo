import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Auth ──

class LoginRequest(BaseModel):
    app_key: str = Field(..., description="DashScope API Key")
    model: Optional[str] = Field(None, description="Selected model ID")


class LoginResponse(BaseModel):
    session_token: str
    user: dict


class VerifyResponse(BaseModel):
    valid: bool
    user: Optional[dict] = None


# ── Upload ──

class ValidationLayer(BaseModel):
    name: str
    passed: bool
    detail: str


class FaceBox(BaseModel):
    x: int
    y: int
    w: int
    h: int


class UploadResponse(BaseModel):
    upload_id: str
    status: str  # "completed" | "failed"
    valid: bool
    layers: list[ValidationLayer] = []
    faces: list[FaceBox] = []
    preview_url: str = ""
    original_width: int = 0
    original_height: int = 0


# ── Movies ──

class MovieResult(BaseModel):
    id: str
    title_cn: str
    title_en: str = ""
    year: int = 0
    poster_url: str = ""
    director: str = ""


class MovieDetail(BaseModel):
    id: str
    title_cn: str
    title_en: str = ""
    year: int = 0
    poster_url: str = ""
    directors: list[str] = []
    characters: list[dict] = []
    overview: str = ""


class MovieSearchResponse(BaseModel):
    results: list[MovieResult]
    total: int


# ── Templates ──

class TemplateOut(BaseModel):
    id: int
    name: str
    description: str = ""
    prompt_template: str
    depth_of_field: Optional[str] = None
    aspect_ratio: Optional[str] = None
    thumbnail_url: str = ""
    sort_order: int = 0


# ── Generate ──

class GenerateRequest(BaseModel):
    upload_id: str
    face_index: int = 0
    movie_id: Optional[str] = None
    character_name: Optional[str] = None
    aspect_ratio: str = "720*1280"
    depth_of_field: str = "shallow"
    template_id: Optional[int] = None
    user_prompt: str = ""
    skip_character: bool = False


class GenerateResponse(BaseModel):
    task_id: str
    status: str = "queued"


class CancelResponse(BaseModel):
    status: str = "cancelled"


# ── Works ──

class WorkOut(BaseModel):
    id: int
    image_url: str
    movie_title_cn: Optional[str] = None
    movie_title_en: Optional[str] = None
    character_name: Optional[str] = None
    aspect_ratio: Optional[str] = None
    depth_of_field: Optional[str] = None
    template_name: Optional[str] = None
    file_size: int = 0
    width: int = 0
    height: int = 0
    created_at: str


class WorkListResponse(BaseModel):
    works: list[WorkOut]
    total: int
    page: int
    limit: int


class WorkDetail(WorkOut):
    prompt_snapshot: Optional[str] = None
    retry_count: int = 0


class ClearWorksResponse(BaseModel):
    status: str
    deleted_count: int
