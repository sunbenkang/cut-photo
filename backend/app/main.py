from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.models.database import init_db
from app.services.seed_data import seed_templates
from app.middleware.auth_middleware import auth_middleware
from app.api import auth, upload, movies, generate, works, templates, config_route

# Rate limiter: 60 requests/minute per IP for general endpoints
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await seed_templates()
    yield
    # Shutdown


app = FastAPI(
    title="Cut Photo - AI 合影合成",
    description="基于 Qwen-Image 2.0 的 AI 电影片场合影生成器",
    version="1.0.0",
    lifespan=lifespan,
)

# Attach rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth middleware
app.middleware("http")(auth_middleware)

# Routes
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(movies.router)
app.include_router(generate.router)
app.include_router(works.router)
app.include_router(templates.router)
app.include_router(config_route.router)


@app.get("/api/health")
@limiter.limit("10/minute")
async def health(request: Request):
    return {"status": "ok", "app": settings.app_name}
