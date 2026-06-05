from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, Request

from app.models.database import get_db
from app.models.db_models import User, Session
from app.models.schemas import LoginRequest, LoginResponse, VerifyResponse
from app.services.auth_service import verify_dashscope_api_key, create_session_token, fetch_available_models

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    app_key = body.app_key.strip()
    if not app_key or not app_key.startswith("sk-"):
        raise HTTPException(
            status_code=422,
            detail={"error": {"code": "INVALID_FORMAT", "message": "AppKey 格式不正确，应为 sk- 开头"}},
        )

    # Verify AppKey via DashScope API
    result = await verify_dashscope_api_key(app_key)
    if not result["valid"]:
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "INVALID_APPKEY", "message": result["detail"]}},
        )

    # Find or create user
    result_db = await db.execute(select(User).where(User.app_key == app_key))
    user = result_db.scalar_one_or_none()

    if not user:
        user = User(
            app_key=app_key,
            app_key_prefix=app_key[:8] + "***",
            created_at=datetime.now().isoformat(),
            last_active_at=datetime.now().isoformat(),
        )
        db.add(user)
        await db.flush()
    else:
        user.last_active_at = datetime.now().isoformat()

    # Determine model and create a single session token
    selected_model = getattr(body, "model", None) or "qwen-image-2.0"
    session_token = create_session_token(user.id, app_key, selected_model)

    # Create session with the same token that will be returned to client
    from datetime import timedelta, timezone
    db_session = Session(
        user_id=user.id,
        session_token=session_token,
        expires_at=(datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
        created_at=datetime.now().isoformat(),
    )
    db.add(db_session)
    await db.commit()

    return LoginResponse(
        session_token=session_token,
        user={"id": user.id, "app_key_prefix": user.app_key_prefix, "model": selected_model},
    )


@router.post("/models")
async def list_models(body: LoginRequest):
    app_key = body.app_key.strip()
    if not app_key or not app_key.startswith("sk-"):
        raise HTTPException(
            status_code=422,
            detail={"error": {"code": "INVALID_FORMAT", "message": "AppKey 格式不正确，应为 sk- 开头"}},
        )

    # Verify key first
    result = await verify_dashscope_api_key(app_key)
    if not result["valid"]:
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "INVALID_APPKEY", "message": result["detail"]}},
        )

    # Fetch available models
    models_data = await fetch_available_models(app_key)
    return models_data


@router.post("/verify", response_model=VerifyResponse)
async def verify(request: Request, db: AsyncSession = Depends(get_db)):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]

    if not session_token:
        return VerifyResponse(valid=False)

    result = await db.execute(select(Session).where(Session.session_token == session_token))
    db_session = result.scalar_one_or_none()

    if not db_session:
        return VerifyResponse(valid=False)

    result = await db.execute(select(User).where(User.id == db_session.user_id))
    user = result.scalar_one_or_none()

    if not user:
        return VerifyResponse(valid=False)

    return VerifyResponse(
        valid=True,
        user={"id": user.id, "app_key_prefix": user.app_key_prefix},
    )
