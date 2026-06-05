from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import async_session
from app.models.db_models import Session, User
from app.services.auth_service import decode_session_token


async def auth_middleware(request: Request, call_next):
    """Middleware to protect routes that require authentication."""
    # Public paths
    public_paths = [
        "/api/auth/login",
        "/api/auth/verify",
        "/api/auth/models",
        "/docs",
        "/openapi.json",
        "/api/health",
        "/api/config",
        "/api/templates",
    ]
    path = request.url.path

    is_public_route = any(path.startswith(p) for p in public_paths)

    if request.method == "OPTIONS":
        return await call_next(request)

    if is_public_route:
        return await call_next(request)

    # API routes require auth
    if path.startswith("/api/"):
        session_token = request.cookies.get("session_token")
        if not session_token:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                session_token = auth_header[7:]

        if not session_token:
            return JSONResponse(
                status_code=401,
                content={"error": {"code": "UNAUTHORIZED", "message": "请先登录"}},
            )

        payload = decode_session_token(session_token)
        if not payload:
            return JSONResponse(
                status_code=401,
                content={"error": {"code": "SESSION_EXPIRED", "message": "会话已过期，请重新登录"}},
            )

        async with async_session() as db:
            result = await db.execute(
                select(Session).where(Session.session_token == session_token)
            )
            db_session = result.scalar_one_or_none()

            if not db_session:
                return JSONResponse(
                    status_code=401,
                    content={"error": {"code": "INVALID_SESSION", "message": "无效的会话"}},
                )

            result = await db.execute(select(User).where(User.id == db_session.user_id))
            user = result.scalar_one_or_none()

            if not user:
                return JSONResponse(
                    status_code=401,
                    content={"error": {"code": "USER_NOT_FOUND", "message": "用户不存在"}},
                )

            request.state.user = user
            request.state.db_session = db_session

    return await call_next(request)
