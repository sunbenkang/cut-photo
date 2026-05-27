import uuid
from datetime import datetime, timedelta

from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.models.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    app_key = Column(String(256), unique=True, nullable=False, index=True)
    app_key_prefix = Column(String(16), nullable=False)
    created_at = Column(String(32), default=lambda: datetime.now().isoformat())
    last_active_at = Column(String(32), default=lambda: datetime.now().isoformat())

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    generations = relationship("Generation", back_populates="user", cascade="all, delete-orphan")
    works = relationship("Work", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_token = Column(String(512), unique=True, nullable=False, index=True)
    expires_at = Column(String(32), nullable=False)
    created_at = Column(String(32), default=lambda: datetime.now().isoformat())

    user = relationship("User", back_populates="sessions")


class Generation(Base):
    __tablename__ = "generations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(String(64), unique=True, nullable=False, default=gen_uuid)
    original_image_path = Column(Text, nullable=False)
    original_width = Column(Integer, nullable=True)
    original_height = Column(Integer, nullable=True)
    selected_face_bbox = Column(Text, nullable=True)  # JSON
    movie_id = Column(String(64), nullable=True)
    movie_title_cn = Column(Text, nullable=True)
    movie_title_en = Column(Text, nullable=True)
    character_name = Column(Text, nullable=True)
    aspect_ratio = Column(String(32), nullable=False)
    depth_of_field = Column(String(32), nullable=False)
    template_id = Column(Integer, nullable=True)
    template_name = Column(Text, nullable=True)
    base_prompt = Column(Text, nullable=True)
    user_prompt = Column(Text, nullable=True)
    final_prompt = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="pending")
    retry_count = Column(Integer, nullable=False, default=0)
    quality_results = Column(Text, nullable=True)  # JSON array of results
    error_message = Column(Text, nullable=True)
    cancel_flag = Column(Integer, nullable=False, default=0)
    started_at = Column(String(32), nullable=True)
    completed_at = Column(String(32), nullable=True)
    created_at = Column(String(32), default=lambda: datetime.now().isoformat())

    user = relationship("User", back_populates="generations")
    work = relationship("Work", back_populates="generation", uselist=False, cascade="all, delete-orphan")


class Work(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, autoincrement=True)
    generation_id = Column(Integer, ForeignKey("generations.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_path = Column(Text, nullable=False)
    original_width = Column(Integer, nullable=False)
    original_height = Column(Integer, nullable=False)
    file_size = Column(Integer, nullable=False)
    movie_title_cn = Column(Text, nullable=True)
    movie_title_en = Column(Text, nullable=True)
    character_name = Column(Text, nullable=True)
    aspect_ratio = Column(String(32), nullable=True)
    depth_of_field = Column(String(32), nullable=True)
    template_name = Column(Text, nullable=True)
    prompt_snapshot = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    created_at = Column(String(32), default=lambda: datetime.now().isoformat())

    user = relationship("User", back_populates="works")
    generation = relationship("Generation", back_populates="work")


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    prompt_template = Column(Text, nullable=False)
    depth_of_field = Column(String(32), nullable=True)
    aspect_ratio = Column(String(32), nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Integer, nullable=False, default=1)
    created_at = Column(String(32), default=lambda: datetime.now().isoformat())


class MovieCache(Base):
    __tablename__ = "movie_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    movie_id = Column(String(64), unique=True, nullable=False, index=True)
    title_cn = Column(Text, nullable=True)
    title_en = Column(Text, nullable=True)
    year = Column(Integer, nullable=True)
    director = Column(Text, nullable=True)
    poster_url = Column(Text, nullable=True)
    characters = Column(Text, nullable=True)  # JSON
    raw_data = Column(Text, nullable=True)
    cached_at = Column(String(32), default=lambda: datetime.now().isoformat())
    expires_at = Column(String(32), nullable=True)


Index("idx_works_user_created", Work.user_id, Work.created_at)
Index("idx_generations_user", Generation.user_id)
Index("idx_generations_status", Generation.status)
