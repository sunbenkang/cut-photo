import asyncio
import hashlib
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.config import settings


# ── Session Token (JWT) ──

def create_session_token(user_id: int, app_key: str, model: str = "qwen-image-2.0") -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.session_expire_days)
    payload = {
        "user_id": user_id,
        "app_key_hash": hashlib.sha256(app_key.encode()).hexdigest()[:16],
        "model": model,
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_session_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload
    except Exception:
        return None


# ── AppKey Verification via DashScope HTTP API ──

import httpx

DASHSCOPE_CHAT_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"


async def verify_dashscope_api_key(api_key: str) -> dict:
    """Verify a DashScope API key by making a minimal chat API call."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                DASHSCOPE_CHAT_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "qwen-turbo",
                    "messages": [{"role": "user", "content": "hi"}],
                    "max_tokens": 1,
                },
            )

            if resp.status_code == 200:
                return {"valid": True, "detail": "AppKey 验证通过"}

            # Parse error response
            try:
                err = resp.json()
                msg = err.get("message", "") or err.get("error", {}).get("message", "")
            except Exception:
                msg = resp.text[:300]

            if resp.status_code == 401 or resp.status_code == 403:
                return {"valid": False, "detail": f"AppKey 无效或已过期: {msg}"}
            else:
                return {"valid": False, "detail": f"验证失败 (HTTP {resp.status_code}): {msg}"}

    except httpx.TimeoutException:
        return {"valid": False, "detail": "验证超时，请检查网络连接后重试"}
    except httpx.ConnectError:
        return {"valid": False, "detail": "无法连接至 DashScope API，请检查网络"}
    except Exception as e:
        return {"valid": False, "detail": f"验证异常: {str(e)}"}


# ── Model List Fetching ──

DASHSCOPE_MODELS_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/models"

# Priority order for image generation models
IMAGE_MODEL_PRIORITY = [
    "qwen-image-2.0",
    "qwen-image-2.0-pro",
    "qwen-image-2.0-turbo",
    "qwen-image-plus",
    "qwen2.5-image",
    "qwen-image",
    "wan2.1-t2i",
    "wan2.1-i2v",
    "stable-diffusion-xl",
    "stable-diffusion-v1.5",
]

# Known image generation models
KNOWN_IMAGE_MODELS = {
    "qwen-image-2.0": "Qwen-Image 2.0（推荐）",
    "qwen-image-2.0-pro": "Qwen-Image 2.0 Pro",
    "qwen-image-2.0-turbo": "Qwen-Image 2.0 Turbo",
    "qwen-image-plus": "Qwen-Image Plus",
    "qwen2.5-image": "Qwen 2.5 Image",
    "qwen-image": "Qwen Image",
    "wan2.1-t2i": "WAN 2.1 文生图",
    "wan2.1-i2v": "WAN 2.1 图生视频",
}


async def fetch_available_models(api_key: str) -> dict:
    """Fetch available image-generation models for the given API key."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                DASHSCOPE_MODELS_URL,
                headers={"Authorization": f"Bearer {api_key}"},
            )

            if resp.status_code != 200:
                # Fallback: return known models with default selection
                return {
                    "models": [
                        {"id": m, "name": n}
                        for m, n in KNOWN_IMAGE_MODELS.items()
                    ],
                    "default": "qwen-image-2.0",
                    "source": "builtin",
                }

            data = resp.json()
            model_list = data.get("data", [])

            # Filter for image-related models
            image_models = []
            seen = set()

            for m in model_list:
                model_id = m.get("id", "")
                if any(kw in model_id.lower() for kw in ("image", "wan", "sd", "stable", "flux", "dall")):
                    if model_id not in seen:
                        seen.add(model_id)
                        label = KNOWN_IMAGE_MODELS.get(model_id, model_id)
                        image_models.append({"id": model_id, "name": label})

            # Sort by priority
            def sort_key(m):
                try:
                    return IMAGE_MODEL_PRIORITY.index(m["id"])
                except ValueError:
                    return 999

            image_models.sort(key=sort_key)

            if not image_models:
                # No image models found in API, use builtin list
                image_models = [
                    {"id": m, "name": n}
                    for m, n in KNOWN_IMAGE_MODELS.items()
                ]

            # Determine default
            default = "qwen-image-2.0" if any(m["id"] == "qwen-image-2.0" for m in image_models) else image_models[0]["id"]

            return {
                "models": image_models,
                "default": default,
                "source": "api",
            }

    except Exception:
        # On any error, return builtin list
        return {
            "models": [
                {"id": m, "name": n}
                for m, n in KNOWN_IMAGE_MODELS.items()
            ],
            "default": "qwen-image-2.0",
            "source": "builtin",
        }
