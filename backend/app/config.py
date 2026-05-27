from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "cut_photo"
    secret_key: str = "change-me-in-production-use-random-secret"
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


settings = Settings()
