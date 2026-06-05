import os
import secrets
from pydantic_settings import BaseSettings

_DEFAULT_SECRET = "change-me-in-production-use-random-secret"


class Settings(BaseSettings):
    app_name: str = "cut_photo"
    secret_key: str = _DEFAULT_SECRET
    session_expire_days: int = 365
    database_url: str = "sqlite+aiosqlite:///data/db.sqlite3"
    upload_dir: str = "data/originals"
    works_dir: str = "data/works"
    cors_origins: list[str] = ["http://localhost:3000"]

    # DashScope / Bailian
    dashscope_api_base: str = "https://dashscope.aliyuncs.com"

    # Movie API
    tmdb_api_key: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def is_secret_key_default(self) -> bool:
        """Check if the secret key is still the insecure default value."""
        return self.secret_key == _DEFAULT_SECRET


settings = Settings()

# Auto-generate a random key if running with the insecure default
# (only in non-production environments — production must set SECRET_KEY explicitly)
if settings.is_secret_key_default:
    auto_key = secrets.token_urlsafe(32)
    settings.secret_key = auto_key
    print(
        f"[WARNING] SECRET_KEY is using the insecure default value. "
        f"A random key has been auto-generated for this session. "
        f"Set SECRET_KEY in your .env file for production use."
    )
